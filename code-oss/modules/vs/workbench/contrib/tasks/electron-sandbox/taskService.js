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
import * as semver from 'vs/base/common/semver/semver';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ExecutionEngine } from 'vs/workbench/contrib/tasks/common/tasks';
import { AbstractTaskService } from 'vs/workbench/contrib/tasks/browser/abstractTaskService';
import { ITaskService } from 'vs/workbench/contrib/tasks/common/taskService';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { TerminalTaskSystem } from 'vs/workbench/contrib/tasks/browser/terminalTaskSystem';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IModelService } from 'vs/editor/common/services/model';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { IMarkerService } from 'vs/platform/markers/common/markers';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IViewsService, IViewDescriptorService } from 'vs/workbench/common/views';
import { IOutputService } from 'vs/workbench/services/output/common/output';
import { ITerminalGroupService, ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { IConfigurationResolverService } from 'vs/workbench/services/configurationResolver/common/configurationResolver';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from 'vs/platform/workspace/common/workspaceTrust';
import { ITerminalProfileResolverService } from 'vs/workbench/contrib/terminal/common/terminal';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { IAudioCueService } from 'vs/platform/audioCues/browser/audioCueService';
let TaskService = class TaskService extends AbstractTaskService {
    constructor(configurationService, markerService, outputService, paneCompositeService, viewsService, commandService, editorService, fileService, contextService, telemetryService, textFileService, lifecycleService, modelService, extensionService, quickInputService, configurationResolverService, terminalService, terminalGroupService, storageService, progressService, openerService, dialogService, notificationService, contextKeyService, environmentService, terminalProfileResolverService, pathService, textModelResolverService, preferencesService, viewDescriptorService, workspaceTrustRequestService, workspaceTrustManagementService, logService, themeService, instantiationService, remoteAgentService, audioCueService) {
        super(configurationService, markerService, outputService, paneCompositeService, viewsService, commandService, editorService, fileService, contextService, telemetryService, textFileService, modelService, extensionService, quickInputService, configurationResolverService, terminalService, terminalGroupService, storageService, progressService, openerService, dialogService, notificationService, contextKeyService, environmentService, terminalProfileResolverService, pathService, textModelResolverService, preferencesService, viewDescriptorService, workspaceTrustRequestService, workspaceTrustManagementService, logService, themeService, lifecycleService, remoteAgentService, instantiationService);
        this._register(lifecycleService.onBeforeShutdown(event => event.veto(this.beforeShutdown(), 'veto.tasks')));
    }
    _getTaskSystem() {
        if (this._taskSystem) {
            return this._taskSystem;
        }
        const taskSystem = this._createTerminalTaskSystem();
        this._taskSystem = taskSystem;
        this._taskSystemListeners =
            [
                this._taskSystem.onDidStateChange((event) => {
                    this._taskRunningState.set(this._taskSystem.isActiveSync());
                    this._onDidStateChange.fire(event);
                })
            ];
        return this._taskSystem;
    }
    _computeLegacyConfiguration(workspaceFolder) {
        const { config, hasParseErrors } = this._getConfiguration(workspaceFolder);
        if (hasParseErrors) {
            return Promise.resolve({ workspaceFolder: workspaceFolder, hasErrors: true, config: undefined });
        }
        if (config) {
            return Promise.resolve({ workspaceFolder, config, hasErrors: false });
        }
        else {
            return Promise.resolve({ workspaceFolder: workspaceFolder, hasErrors: true, config: undefined });
        }
    }
    _versionAndEngineCompatible(filter) {
        const range = filter && filter.version ? filter.version : undefined;
        const engine = this.executionEngine;
        return (range === undefined) || ((semver.satisfies('0.1.0', range) && engine === ExecutionEngine.Process) || (semver.satisfies('2.0.0', range) && engine === ExecutionEngine.Terminal));
    }
    beforeShutdown() {
        if (!this._taskSystem) {
            return false;
        }
        if (!this._taskSystem.isActiveSync()) {
            return false;
        }
        // The terminal service kills all terminal on shutdown. So there
        // is nothing we can do to prevent this here.
        if (this._taskSystem instanceof TerminalTaskSystem) {
            return false;
        }
        let terminatePromise;
        if (this._taskSystem.canAutoTerminate()) {
            terminatePromise = Promise.resolve({ confirmed: true });
        }
        else {
            terminatePromise = this._dialogService.confirm({
                message: nls.localize('TaskSystem.runningTask', 'There is a task running. Do you want to terminate it?'),
                primaryButton: nls.localize({ key: 'TaskSystem.terminateTask', comment: ['&& denotes a mnemonic'] }, "&&Terminate Task"),
                type: 'question'
            });
        }
        return terminatePromise.then(res => {
            if (res.confirmed) {
                return this._taskSystem.terminateAll().then((responses) => {
                    let success = true;
                    let code = undefined;
                    for (const response of responses) {
                        success = success && response.success;
                        // We only have a code in the old output runner which only has one task
                        // So we can use the first code.
                        if (code === undefined && response.code !== undefined) {
                            code = response.code;
                        }
                    }
                    if (success) {
                        this._taskSystem = undefined;
                        this._disposeTaskSystemListeners();
                        return false; // no veto
                    }
                    else if (code && code === 3 /* TerminateResponseCode.ProcessNotFound */) {
                        return this._dialogService.confirm({
                            message: nls.localize('TaskSystem.noProcess', 'The launched task doesn\'t exist anymore. If the task spawned background processes exiting VS Code might result in orphaned processes. To avoid this start the last background process with a wait flag.'),
                            primaryButton: nls.localize({ key: 'TaskSystem.exitAnyways', comment: ['&& denotes a mnemonic'] }, "&&Exit Anyways"),
                            type: 'info'
                        }).then(res => !res.confirmed);
                    }
                    return true; // veto
                }, (err) => {
                    return true; // veto
                });
            }
            return true; // veto
        });
    }
};
TaskService = __decorate([
    __param(0, IConfigurationService),
    __param(1, IMarkerService),
    __param(2, IOutputService),
    __param(3, IPaneCompositePartService),
    __param(4, IViewsService),
    __param(5, ICommandService),
    __param(6, IEditorService),
    __param(7, IFileService),
    __param(8, IWorkspaceContextService),
    __param(9, ITelemetryService),
    __param(10, ITextFileService),
    __param(11, ILifecycleService),
    __param(12, IModelService),
    __param(13, IExtensionService),
    __param(14, IQuickInputService),
    __param(15, IConfigurationResolverService),
    __param(16, ITerminalService),
    __param(17, ITerminalGroupService),
    __param(18, IStorageService),
    __param(19, IProgressService),
    __param(20, IOpenerService),
    __param(21, IDialogService),
    __param(22, INotificationService),
    __param(23, IContextKeyService),
    __param(24, IWorkbenchEnvironmentService),
    __param(25, ITerminalProfileResolverService),
    __param(26, IPathService),
    __param(27, ITextModelService),
    __param(28, IPreferencesService),
    __param(29, IViewDescriptorService),
    __param(30, IWorkspaceTrustRequestService),
    __param(31, IWorkspaceTrustManagementService),
    __param(32, ILogService),
    __param(33, IThemeService),
    __param(34, IInstantiationService),
    __param(35, IRemoteAgentService),
    __param(36, IAudioCueService)
], TaskService);
export { TaskService };
registerSingleton(ITaskService, TaskService, 1 /* InstantiationType.Delayed */);
