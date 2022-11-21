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
import * as nls from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { URI } from 'vs/base/common/uri';
import { MenuId, MenuRegistry } from 'vs/platform/actions/common/actions';
import { ITerminalGroupService, ITerminalService as IIntegratedTerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { ResourceContextKey } from 'vs/workbench/common/contextkeys';
import { IFileService } from 'vs/platform/files/common/files';
import { IListService } from 'vs/platform/list/browser/listService';
import { getMultiSelectedResources, IExplorerService } from 'vs/workbench/contrib/files/browser/files';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { Schemas } from 'vs/base/common/network';
import { distinct } from 'vs/base/common/arrays';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { Disposable } from 'vs/base/common/lifecycle';
import { isWeb, isWindows } from 'vs/base/common/platform';
import { dirname, basename } from 'vs/base/common/path';
import { Registry } from 'vs/platform/registry/common/platform';
import { IExternalTerminalService } from 'vs/platform/externalTerminal/common/externalTerminal';
import { TerminalLocation } from 'vs/platform/terminal/common/terminal';
const OPEN_IN_TERMINAL_COMMAND_ID = 'openInTerminal';
CommandsRegistry.registerCommand({
    id: OPEN_IN_TERMINAL_COMMAND_ID,
    handler: async (accessor, resource) => {
        const configurationService = accessor.get(IConfigurationService);
        const editorService = accessor.get(IEditorService);
        const fileService = accessor.get(IFileService);
        const integratedTerminalService = accessor.get(IIntegratedTerminalService);
        const remoteAgentService = accessor.get(IRemoteAgentService);
        const terminalGroupService = accessor.get(ITerminalGroupService);
        let externalTerminalService = undefined;
        try {
            externalTerminalService = accessor.get(IExternalTerminalService);
        }
        catch {
        }
        const resources = getMultiSelectedResources(resource, accessor.get(IListService), editorService, accessor.get(IExplorerService));
        return fileService.resolveAll(resources.map(r => ({ resource: r }))).then(async (stats) => {
            const targets = distinct(stats.filter(data => data.success));
            // Always use integrated terminal when using a remote
            const config = configurationService.getValue();
            const useIntegratedTerminal = remoteAgentService.getConnection() || config.terminal.explorerKind === 'integrated';
            if (useIntegratedTerminal) {
                // TODO: Use uri for cwd in createterminal
                const opened = {};
                const cwds = targets.map(({ stat }) => {
                    const resource = stat.resource;
                    if (stat.isDirectory) {
                        return resource;
                    }
                    return URI.from({
                        scheme: resource.scheme,
                        authority: resource.authority,
                        fragment: resource.fragment,
                        query: resource.query,
                        path: dirname(resource.path)
                    });
                });
                for (const cwd of cwds) {
                    if (opened[cwd.path]) {
                        return;
                    }
                    opened[cwd.path] = true;
                    const instance = await integratedTerminalService.createTerminal({ config: { cwd } });
                    if (instance && instance.target !== TerminalLocation.Editor && (resources.length === 1 || !resource || cwd.path === resource.path || cwd.path === dirname(resource.path))) {
                        integratedTerminalService.setActiveInstance(instance);
                        terminalGroupService.showPanel(true);
                    }
                }
            }
            else if (externalTerminalService) {
                distinct(targets.map(({ stat }) => stat.isDirectory ? stat.resource.fsPath : dirname(stat.resource.fsPath))).forEach(cwd => {
                    externalTerminalService.openTerminal(config.terminal.external, cwd);
                });
            }
        });
    }
});
let ExternalTerminalContribution = class ExternalTerminalContribution extends Disposable {
    _configurationService;
    _openInTerminalMenuItem;
    constructor(_configurationService) {
        super();
        this._configurationService = _configurationService;
        this._openInTerminalMenuItem = {
            group: 'navigation',
            order: 30,
            command: {
                id: OPEN_IN_TERMINAL_COMMAND_ID,
                title: nls.localize('scopedConsoleAction', "Open in Terminal")
            },
            when: ContextKeyExpr.or(ResourceContextKey.Scheme.isEqualTo(Schemas.file), ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeRemote))
        };
        MenuRegistry.appendMenuItem(MenuId.OpenEditorsContext, this._openInTerminalMenuItem);
        MenuRegistry.appendMenuItem(MenuId.ExplorerContext, this._openInTerminalMenuItem);
        this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('terminal.explorerKind') || e.affectsConfiguration('terminal.external')) {
                this._refreshOpenInTerminalMenuItemTitle();
            }
        });
        this._refreshOpenInTerminalMenuItemTitle();
    }
    _refreshOpenInTerminalMenuItemTitle() {
        if (isWeb) {
            this._openInTerminalMenuItem.command.title = nls.localize('scopedConsoleAction.integrated', "Open in Integrated Terminal");
            return;
        }
        const config = this._configurationService.getValue().terminal;
        if (config.explorerKind === 'integrated') {
            this._openInTerminalMenuItem.command.title = nls.localize('scopedConsoleAction.integrated', "Open in Integrated Terminal");
            return;
        }
        if (isWindows && config.external?.windowsExec) {
            const file = basename(config.external.windowsExec);
            if (file === 'wt' || file === 'wt.exe') {
                this._openInTerminalMenuItem.command.title = nls.localize('scopedConsoleAction.wt', "Open in Windows Terminal");
                return;
            }
        }
        this._openInTerminalMenuItem.command.title = nls.localize('scopedConsoleAction.external', "Open in External Terminal");
    }
};
ExternalTerminalContribution = __decorate([
    __param(0, IConfigurationService)
], ExternalTerminalContribution);
export { ExternalTerminalContribution };
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(ExternalTerminalContribution, 3 /* LifecyclePhase.Restored */);
