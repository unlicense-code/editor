/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { withNullAsUndefined } from 'vs/base/common/types';
import { IWorkbenchConfigurationService } from 'vs/workbench/services/configuration/common/configuration';
import { ILogService } from 'vs/platform/log/common/log';
import { IRemoteAuthorityResolverService } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { serializeEnvironmentVariableCollection } from 'vs/workbench/contrib/terminal/common/environmentVariableShared';
import { IConfigurationResolverService } from 'vs/workbench/services/configurationResolver/common/configurationResolver';
import { SideBySideEditor, EditorResourceAccessor } from 'vs/workbench/common/editor';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { Schemas } from 'vs/base/common/network';
import { ILabelService } from 'vs/platform/label/common/label';
import { IEnvironmentVariableService } from 'vs/workbench/contrib/terminal/common/environmentVariable';
export const REMOTE_TERMINAL_CHANNEL_NAME = 'remoteterminal';
let RemoteTerminalChannelClient = class RemoteTerminalChannelClient {
    _remoteAuthority;
    _channel;
    _configurationService;
    _workspaceContextService;
    _resolverService;
    _environmentVariableService;
    _remoteAuthorityResolverService;
    _logService;
    _editorService;
    _labelService;
    get onPtyHostExit() {
        return this._channel.listen('$onPtyHostExitEvent');
    }
    get onPtyHostStart() {
        return this._channel.listen('$onPtyHostStartEvent');
    }
    get onPtyHostUnresponsive() {
        return this._channel.listen('$onPtyHostUnresponsiveEvent');
    }
    get onPtyHostResponsive() {
        return this._channel.listen('$onPtyHostResponsiveEvent');
    }
    get onPtyHostRequestResolveVariables() {
        return this._channel.listen('$onPtyHostRequestResolveVariablesEvent');
    }
    get onProcessData() {
        return this._channel.listen('$onProcessDataEvent');
    }
    get onProcessExit() {
        return this._channel.listen('$onProcessExitEvent');
    }
    get onProcessReady() {
        return this._channel.listen('$onProcessReadyEvent');
    }
    get onProcessReplay() {
        return this._channel.listen('$onProcessReplayEvent');
    }
    get onProcessOrphanQuestion() {
        return this._channel.listen('$onProcessOrphanQuestion');
    }
    get onExecuteCommand() {
        return this._channel.listen('$onExecuteCommand');
    }
    get onDidRequestDetach() {
        return this._channel.listen('$onDidRequestDetach');
    }
    get onDidChangeProperty() {
        return this._channel.listen('$onDidChangeProperty');
    }
    constructor(_remoteAuthority, _channel, _configurationService, _workspaceContextService, _resolverService, _environmentVariableService, _remoteAuthorityResolverService, _logService, _editorService, _labelService) {
        this._remoteAuthority = _remoteAuthority;
        this._channel = _channel;
        this._configurationService = _configurationService;
        this._workspaceContextService = _workspaceContextService;
        this._resolverService = _resolverService;
        this._environmentVariableService = _environmentVariableService;
        this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
        this._logService = _logService;
        this._editorService = _editorService;
        this._labelService = _labelService;
    }
    restartPtyHost() {
        return this._channel.call('$restartPtyHost', []);
    }
    async createProcess(shellLaunchConfig, configuration, activeWorkspaceRootUri, options, shouldPersistTerminal, cols, rows, unicodeVersion) {
        // Be sure to first wait for the remote configuration
        await this._configurationService.whenRemoteConfigurationLoaded();
        // We will use the resolver service to resolve all the variables in the config / launch config
        // But then we will keep only some variables, since the rest need to be resolved on the remote side
        const resolvedVariables = Object.create(null);
        const lastActiveWorkspace = activeWorkspaceRootUri ? withNullAsUndefined(this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri)) : undefined;
        let allResolvedVariables = undefined;
        try {
            allResolvedVariables = (await this._resolverService.resolveAnyMap(lastActiveWorkspace, {
                shellLaunchConfig,
                configuration
            })).resolvedVariables;
        }
        catch (err) {
            this._logService.error(err);
        }
        if (allResolvedVariables) {
            for (const [name, value] of allResolvedVariables.entries()) {
                if (/^config:/.test(name) || name === 'selectedText' || name === 'lineNumber') {
                    resolvedVariables[name] = value;
                }
            }
        }
        const envVariableCollections = [];
        for (const [k, v] of this._environmentVariableService.collections.entries()) {
            envVariableCollections.push([k, serializeEnvironmentVariableCollection(v.map)]);
        }
        const resolverResult = await this._remoteAuthorityResolverService.resolveAuthority(this._remoteAuthority);
        const resolverEnv = resolverResult.options && resolverResult.options.extensionHostEnv;
        const workspace = this._workspaceContextService.getWorkspace();
        const workspaceFolders = workspace.folders;
        const activeWorkspaceFolder = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) : null;
        const activeFileResource = EditorResourceAccessor.getOriginalUri(this._editorService.activeEditor, {
            supportSideBySide: SideBySideEditor.PRIMARY,
            filterByScheme: [Schemas.file, Schemas.vscodeUserData, Schemas.vscodeRemote]
        });
        const args = {
            configuration,
            resolvedVariables,
            envVariableCollections,
            shellLaunchConfig,
            workspaceId: workspace.id,
            workspaceName: this._labelService.getWorkspaceLabel(workspace),
            workspaceFolders,
            activeWorkspaceFolder,
            activeFileResource,
            shouldPersistTerminal,
            options,
            cols,
            rows,
            unicodeVersion,
            resolverEnv
        };
        return await this._channel.call('$createProcess', args);
    }
    requestDetachInstance(workspaceId, instanceId) {
        return this._channel.call('$requestDetachInstance', [workspaceId, instanceId]);
    }
    acceptDetachInstanceReply(requestId, persistentProcessId) {
        return this._channel.call('$acceptDetachInstanceReply', [requestId, persistentProcessId]);
    }
    attachToProcess(id) {
        return this._channel.call('$attachToProcess', [id]);
    }
    detachFromProcess(id, forcePersist) {
        return this._channel.call('$detachFromProcess', [id, forcePersist]);
    }
    listProcesses() {
        return this._channel.call('$listProcesses');
    }
    reduceConnectionGraceTime() {
        return this._channel.call('$reduceConnectionGraceTime');
    }
    processBinary(id, data) {
        return this._channel.call('$processBinary', [id, data]);
    }
    start(id) {
        return this._channel.call('$start', [id]);
    }
    input(id, data) {
        return this._channel.call('$input', [id, data]);
    }
    acknowledgeDataEvent(id, charCount) {
        return this._channel.call('$acknowledgeDataEvent', [id, charCount]);
    }
    setUnicodeVersion(id, version) {
        return this._channel.call('$setUnicodeVersion', [id, version]);
    }
    shutdown(id, immediate) {
        return this._channel.call('$shutdown', [id, immediate]);
    }
    resize(id, cols, rows) {
        return this._channel.call('$resize', [id, cols, rows]);
    }
    getInitialCwd(id) {
        return this._channel.call('$getInitialCwd', [id]);
    }
    getCwd(id) {
        return this._channel.call('$getCwd', [id]);
    }
    orphanQuestionReply(id) {
        return this._channel.call('$orphanQuestionReply', [id]);
    }
    sendCommandResult(reqId, isError, payload) {
        return this._channel.call('$sendCommandResult', [reqId, isError, payload]);
    }
    freePortKillProcess(port) {
        return this._channel.call('$freePortKillProcess', [port]);
    }
    installAutoReply(match, reply) {
        return this._channel.call('$installAutoReply', [match, reply]);
    }
    uninstallAllAutoReplies() {
        return this._channel.call('$uninstallAllAutoReplies', []);
    }
    getDefaultSystemShell(osOverride) {
        return this._channel.call('$getDefaultSystemShell', [osOverride]);
    }
    getProfiles(profiles, defaultProfile, includeDetectedProfiles) {
        return this._channel.call('$getProfiles', [this._workspaceContextService.getWorkspace().id, profiles, defaultProfile, includeDetectedProfiles]);
    }
    acceptPtyHostResolvedVariables(requestId, resolved) {
        return this._channel.call('$acceptPtyHostResolvedVariables', [requestId, resolved]);
    }
    getEnvironment() {
        return this._channel.call('$getEnvironment');
    }
    getWslPath(original) {
        return this._channel.call('$getWslPath', [original]);
    }
    setTerminalLayoutInfo(layout) {
        const workspace = this._workspaceContextService.getWorkspace();
        const args = {
            workspaceId: workspace.id,
            tabs: layout ? layout.tabs : []
        };
        return this._channel.call('$setTerminalLayoutInfo', args);
    }
    updateTitle(id, title, titleSource) {
        return this._channel.call('$updateTitle', [id, title, titleSource]);
    }
    updateIcon(id, userInitiated, icon, color) {
        return this._channel.call('$updateIcon', [id, userInitiated, icon, color]);
    }
    refreshProperty(id, property) {
        return this._channel.call('$refreshProperty', [id, property]);
    }
    updateProperty(id, property, value) {
        return this._channel.call('$updateProperty', [id, property, value]);
    }
    getTerminalLayoutInfo() {
        const workspace = this._workspaceContextService.getWorkspace();
        const args = {
            workspaceId: workspace.id,
        };
        return this._channel.call('$getTerminalLayoutInfo', args);
    }
    reviveTerminalProcesses(state, dateTimeFormatLocate) {
        return this._channel.call('$reviveTerminalProcesses', [state, dateTimeFormatLocate]);
    }
    getRevivedPtyNewId(id) {
        return this._channel.call('$getRevivedPtyNewId', [id]);
    }
    serializeTerminalState(ids) {
        return this._channel.call('$serializeTerminalState', [ids]);
    }
};
RemoteTerminalChannelClient = __decorate([
    __param(2, IWorkbenchConfigurationService),
    __param(3, IWorkspaceContextService),
    __param(4, IConfigurationResolverService),
    __param(5, IEnvironmentVariableService),
    __param(6, IRemoteAuthorityResolverService),
    __param(7, ILogService),
    __param(8, IEditorService),
    __param(9, ILabelService)
], RemoteTerminalChannelClient);
export { RemoteTerminalChannelClient };
