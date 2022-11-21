/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { Schemas } from 'vs/base/common/network';
import { withNullAsUndefined } from 'vs/base/common/types';
import { localize } from 'vs/nls';
import { Severity } from 'vs/platform/notification/common/notification';
export class BaseTerminalBackend extends Disposable {
    _logService;
    _workspaceContextService;
    _isPtyHostUnresponsive = false;
    _onPtyHostRestart = this._register(new Emitter());
    onPtyHostRestart = this._onPtyHostRestart.event;
    _onPtyHostUnresponsive = this._register(new Emitter());
    onPtyHostUnresponsive = this._onPtyHostUnresponsive.event;
    _onPtyHostResponsive = this._register(new Emitter());
    onPtyHostResponsive = this._onPtyHostResponsive.event;
    constructor(eventSource, _logService, notificationService, historyService, configurationResolverService, _workspaceContextService) {
        super();
        this._logService = _logService;
        this._workspaceContextService = _workspaceContextService;
        // Attach pty host listeners
        if (eventSource.onPtyHostExit) {
            this._register(eventSource.onPtyHostExit(() => {
                this._logService.error(`The terminal's pty host process exited, the connection to all terminal processes was lost`);
            }));
        }
        let unresponsiveNotification;
        if (eventSource.onPtyHostStart) {
            this._register(eventSource.onPtyHostStart(() => {
                this._logService.info(`ptyHost restarted`);
                this._onPtyHostRestart.fire();
                unresponsiveNotification?.close();
                unresponsiveNotification = undefined;
                this._isPtyHostUnresponsive = false;
            }));
        }
        if (eventSource.onPtyHostUnresponsive) {
            this._register(eventSource.onPtyHostUnresponsive(() => {
                const choices = [{
                        label: localize('restartPtyHost', "Restart pty host"),
                        run: () => eventSource.restartPtyHost()
                    }];
                unresponsiveNotification = notificationService.prompt(Severity.Error, localize('nonResponsivePtyHost', "The connection to the terminal's pty host process is unresponsive, the terminals may stop working."), choices);
                this._isPtyHostUnresponsive = true;
                this._onPtyHostUnresponsive.fire();
            }));
        }
        if (eventSource.onPtyHostResponsive) {
            this._register(eventSource.onPtyHostResponsive(() => {
                if (!this._isPtyHostUnresponsive) {
                    return;
                }
                this._logService.info('The pty host became responsive again');
                unresponsiveNotification?.close();
                unresponsiveNotification = undefined;
                this._isPtyHostUnresponsive = false;
                this._onPtyHostResponsive.fire();
            }));
        }
        if (eventSource.onPtyHostRequestResolveVariables) {
            this._register(eventSource.onPtyHostRequestResolveVariables(async (e) => {
                // Only answer requests for this workspace
                if (e.workspaceId !== this._workspaceContextService.getWorkspace().id) {
                    return;
                }
                const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot(Schemas.file);
                const lastActiveWorkspaceRoot = activeWorkspaceRootUri ? withNullAsUndefined(this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri)) : undefined;
                const resolveCalls = e.originalText.map(t => {
                    return configurationResolverService.resolveAsync(lastActiveWorkspaceRoot, t);
                });
                const result = await Promise.all(resolveCalls);
                eventSource.acceptPtyHostResolvedVariables?.(e.requestId, result);
            }));
        }
    }
    _deserializeTerminalState(serializedState) {
        if (serializedState === undefined) {
            return undefined;
        }
        const parsedUnknown = JSON.parse(serializedState);
        if (!('version' in parsedUnknown) || !('state' in parsedUnknown) || !Array.isArray(parsedUnknown.state)) {
            this._logService.warn('Could not revive serialized processes, wrong format', parsedUnknown);
            return undefined;
        }
        const parsedCrossVersion = parsedUnknown;
        if (parsedCrossVersion.version !== 1) {
            this._logService.warn(`Could not revive serialized processes, wrong version "${parsedCrossVersion.version}"`, parsedCrossVersion);
            return undefined;
        }
        return parsedCrossVersion.state;
    }
}
