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
import { localize } from 'vs/nls';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { hasWorkspaceFileExtension, IWorkspaceContextService, WORKSPACE_SUFFIX } from 'vs/platform/workspace/common/workspace';
import { Disposable } from 'vs/base/common/lifecycle';
import { IFileService } from 'vs/platform/files/common/files';
import { INotificationService, NeverShowAgainScope, Severity } from 'vs/platform/notification/common/notification';
import { isEqual, joinPath } from 'vs/base/common/resources';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { isVirtualWorkspace } from 'vs/platform/workspace/common/virtualWorkspace';
import { Action2, MenuId, registerAction2 } from 'vs/platform/actions/common/actions';
import { ActiveEditorContext, ResourceContextKey, TemporaryWorkspaceContext } from 'vs/workbench/common/contextkeys';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { TEXT_FILE_EDITOR_ID } from 'vs/workbench/contrib/files/common/files';
/**
 * A workbench contribution that will look for `.code-workspace` files in the root of the
 * workspace folder and open a notification to suggest to open one of the workspaces.
 */
let WorkspacesFinderContribution = class WorkspacesFinderContribution extends Disposable {
    contextService;
    notificationService;
    fileService;
    quickInputService;
    hostService;
    storageService;
    constructor(contextService, notificationService, fileService, quickInputService, hostService, storageService) {
        super();
        this.contextService = contextService;
        this.notificationService = notificationService;
        this.fileService = fileService;
        this.quickInputService = quickInputService;
        this.hostService = hostService;
        this.storageService = storageService;
        this.findWorkspaces();
    }
    async findWorkspaces() {
        const folder = this.contextService.getWorkspace().folders[0];
        if (!folder || this.contextService.getWorkbenchState() !== 2 /* WorkbenchState.FOLDER */ || isVirtualWorkspace(this.contextService.getWorkspace())) {
            return; // require a single (non virtual) root folder
        }
        const rootFileNames = (await this.fileService.resolve(folder.uri)).children?.map(child => child.name);
        if (Array.isArray(rootFileNames)) {
            const workspaceFiles = rootFileNames.filter(hasWorkspaceFileExtension);
            if (workspaceFiles.length > 0) {
                this.doHandleWorkspaceFiles(folder.uri, workspaceFiles);
            }
        }
    }
    doHandleWorkspaceFiles(folder, workspaces) {
        const neverShowAgain = { id: 'workspaces.dontPromptToOpen', scope: NeverShowAgainScope.WORKSPACE, isSecondary: true };
        // Prompt to open one workspace
        if (workspaces.length === 1) {
            const workspaceFile = workspaces[0];
            this.notificationService.prompt(Severity.Info, localize('workspaceFound', "This folder contains a workspace file '{0}'. Do you want to open it? [Learn more]({1}) about workspace files.", workspaceFile, 'https://go.microsoft.com/fwlink/?linkid=2025315'), [{
                    label: localize('openWorkspace', "Open Workspace"),
                    run: () => this.hostService.openWindow([{ workspaceUri: joinPath(folder, workspaceFile) }])
                }], {
                neverShowAgain,
                silent: !this.storageService.isNew(1 /* StorageScope.WORKSPACE */) // https://github.com/microsoft/vscode/issues/125315
            });
        }
        // Prompt to select a workspace from many
        else if (workspaces.length > 1) {
            this.notificationService.prompt(Severity.Info, localize('workspacesFound', "This folder contains multiple workspace files. Do you want to open one? [Learn more]({0}) about workspace files.", 'https://go.microsoft.com/fwlink/?linkid=2025315'), [{
                    label: localize('selectWorkspace', "Select Workspace"),
                    run: () => {
                        this.quickInputService.pick(workspaces.map(workspace => ({ label: workspace })), { placeHolder: localize('selectToOpen', "Select a workspace to open") }).then(pick => {
                            if (pick) {
                                this.hostService.openWindow([{ workspaceUri: joinPath(folder, pick.label) }]);
                            }
                        });
                    }
                }], {
                neverShowAgain,
                silent: !this.storageService.isNew(1 /* StorageScope.WORKSPACE */) // https://github.com/microsoft/vscode/issues/125315
            });
        }
    }
};
WorkspacesFinderContribution = __decorate([
    __param(0, IWorkspaceContextService),
    __param(1, INotificationService),
    __param(2, IFileService),
    __param(3, IQuickInputService),
    __param(4, IHostService),
    __param(5, IStorageService)
], WorkspacesFinderContribution);
export { WorkspacesFinderContribution };
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(WorkspacesFinderContribution, 4 /* LifecyclePhase.Eventually */);
// Render "Open Workspace" button in *.code-workspace files
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.openWorkspaceFromEditor',
            title: { original: 'Open Workspace', value: localize('openWorkspace', "Open Workspace") },
            f1: false,
            menu: {
                id: MenuId.EditorContent,
                when: ContextKeyExpr.and(ResourceContextKey.Extension.isEqualTo(WORKSPACE_SUFFIX), ActiveEditorContext.isEqualTo(TEXT_FILE_EDITOR_ID), TemporaryWorkspaceContext.toNegated())
            }
        });
    }
    async run(accessor, uri) {
        const hostService = accessor.get(IHostService);
        const contextService = accessor.get(IWorkspaceContextService);
        const notificationService = accessor.get(INotificationService);
        if (contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
            const workspaceConfiguration = contextService.getWorkspace().configuration;
            if (workspaceConfiguration && isEqual(workspaceConfiguration, uri)) {
                notificationService.info(localize('alreadyOpen', "This workspace is already open."));
                return; // workspace already opened
            }
        }
        return hostService.openWindow([{ workspaceUri: uri }]);
    }
});
