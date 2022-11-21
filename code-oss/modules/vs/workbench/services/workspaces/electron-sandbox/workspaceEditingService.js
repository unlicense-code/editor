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
import { IWorkspaceEditingService } from 'vs/workbench/services/workspaces/common/workspaceEditing';
import { URI } from 'vs/base/common/uri';
import { hasWorkspaceFileExtension, isUntitledWorkspace, isWorkspaceIdentifier, IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IJSONEditingService } from 'vs/workbench/services/configuration/common/jsonEditing';
import { IWorkspacesService } from 'vs/platform/workspaces/common/workspaces';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { basename } from 'vs/base/common/resources';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { IFileService } from 'vs/platform/files/common/files';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IFileDialogService, IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ILabelService } from 'vs/platform/label/common/label';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { AbstractWorkspaceEditingService } from 'vs/workbench/services/workspaces/browser/abstractWorkspaceEditingService';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { isMacintosh } from 'vs/base/common/platform';
import { mnemonicButtonLabel } from 'vs/base/common/labels';
import { WorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackupService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
import { IWorkbenchConfigurationService } from 'vs/workbench/services/configuration/common/configuration';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
let NativeWorkspaceEditingService = class NativeWorkspaceEditingService extends AbstractWorkspaceEditingService {
    nativeHostService;
    storageService;
    extensionService;
    workingCopyBackupService;
    lifecycleService;
    labelService;
    constructor(jsonEditingService, contextService, nativeHostService, configurationService, storageService, extensionService, workingCopyBackupService, notificationService, commandService, fileService, textFileService, workspacesService, environmentService, fileDialogService, dialogService, lifecycleService, labelService, hostService, uriIdentityService, workspaceTrustManagementService, userDataProfilesService, userDataProfileService) {
        super(jsonEditingService, contextService, configurationService, notificationService, commandService, fileService, textFileService, workspacesService, environmentService, fileDialogService, dialogService, hostService, uriIdentityService, workspaceTrustManagementService, userDataProfilesService, userDataProfileService);
        this.nativeHostService = nativeHostService;
        this.storageService = storageService;
        this.extensionService = extensionService;
        this.workingCopyBackupService = workingCopyBackupService;
        this.lifecycleService = lifecycleService;
        this.labelService = labelService;
        this.registerListeners();
    }
    registerListeners() {
        this.lifecycleService.onBeforeShutdown(e => {
            const saveOperation = this.saveUntitledBeforeShutdown(e.reason);
            e.veto(saveOperation, 'veto.untitledWorkspace');
        });
    }
    async saveUntitledBeforeShutdown(reason) {
        if (reason !== 4 /* ShutdownReason.LOAD */ && reason !== 1 /* ShutdownReason.CLOSE */) {
            return false; // only interested when window is closing or loading
        }
        const workspaceIdentifier = this.getCurrentWorkspaceIdentifier();
        if (!workspaceIdentifier || !isUntitledWorkspace(workspaceIdentifier.configPath, this.environmentService)) {
            return false; // only care about untitled workspaces to ask for saving
        }
        const windowCount = await this.nativeHostService.getWindowCount();
        if (reason === 1 /* ShutdownReason.CLOSE */ && !isMacintosh && windowCount === 1) {
            return false; // Windows/Linux: quits when last window is closed, so do not ask then
        }
        let ConfirmResult;
        (function (ConfirmResult) {
            ConfirmResult[ConfirmResult["SAVE"] = 0] = "SAVE";
            ConfirmResult[ConfirmResult["DONT_SAVE"] = 1] = "DONT_SAVE";
            ConfirmResult[ConfirmResult["CANCEL"] = 2] = "CANCEL";
        })(ConfirmResult || (ConfirmResult = {}));
        const buttons = [
            { label: mnemonicButtonLabel(localize('save', "Save")), result: ConfirmResult.SAVE },
            { label: mnemonicButtonLabel(localize('doNotSave', "Don't Save")), result: ConfirmResult.DONT_SAVE },
            { label: localize('cancel', "Cancel"), result: ConfirmResult.CANCEL }
        ];
        const message = localize('saveWorkspaceMessage', "Do you want to save your workspace configuration as a file?");
        const detail = localize('saveWorkspaceDetail', "Save your workspace if you plan to open it again.");
        const { choice } = await this.dialogService.show(Severity.Warning, message, buttons.map(button => button.label), { detail, cancelId: 2 });
        switch (buttons[choice].result) {
            // Cancel: veto unload
            case ConfirmResult.CANCEL:
                return true;
            // Don't Save: delete workspace
            case ConfirmResult.DONT_SAVE:
                await this.workspacesService.deleteUntitledWorkspace(workspaceIdentifier);
                return false;
            // Save: save workspace, but do not veto unload if path provided
            case ConfirmResult.SAVE: {
                const newWorkspacePath = await this.pickNewWorkspacePath();
                if (!newWorkspacePath || !hasWorkspaceFileExtension(newWorkspacePath)) {
                    return true; // keep veto if no target was provided
                }
                try {
                    await this.saveWorkspaceAs(workspaceIdentifier, newWorkspacePath);
                    // Make sure to add the new workspace to the history to find it again
                    const newWorkspaceIdentifier = await this.workspacesService.getWorkspaceIdentifier(newWorkspacePath);
                    await this.workspacesService.addRecentlyOpened([{
                            label: this.labelService.getWorkspaceLabel(newWorkspaceIdentifier, { verbose: true }),
                            workspace: newWorkspaceIdentifier,
                            remoteAuthority: this.environmentService.remoteAuthority // remember whether this was a remote window
                        }]);
                    // Delete the untitled one
                    await this.workspacesService.deleteUntitledWorkspace(workspaceIdentifier);
                }
                catch (error) {
                    // ignore
                }
                return false;
            }
        }
    }
    async isValidTargetWorkspacePath(workspaceUri) {
        const windows = await this.nativeHostService.getWindows();
        // Prevent overwriting a workspace that is currently opened in another window
        if (windows.some(window => isWorkspaceIdentifier(window.workspace) && this.uriIdentityService.extUri.isEqual(window.workspace.configPath, workspaceUri))) {
            await this.dialogService.show(Severity.Info, localize('workspaceOpenedMessage', "Unable to save workspace '{0}'", basename(workspaceUri)), undefined, {
                detail: localize('workspaceOpenedDetail', "The workspace is already opened in another window. Please close that window first and then try again.")
            });
            return false;
        }
        return true; // OK
    }
    async enterWorkspace(workspaceUri) {
        const result = await this.doEnterWorkspace(workspaceUri);
        if (result) {
            // Migrate storage to new workspace
            await this.storageService.switch(result.workspace, true /* preserve data */);
            // Reinitialize backup service
            if (this.workingCopyBackupService instanceof WorkingCopyBackupService) {
                const newBackupWorkspaceHome = result.backupPath ? URI.file(result.backupPath).with({ scheme: this.environmentService.userRoamingDataHome.scheme }) : undefined;
                this.workingCopyBackupService.reinitialize(newBackupWorkspaceHome);
            }
        }
        // TODO@aeschli: workaround until restarting works
        if (this.environmentService.remoteAuthority) {
            this.hostService.reload();
        }
        // Restart the extension host: entering a workspace means a new location for
        // storage and potentially a change in the workspace.rootPath property.
        else {
            this.extensionService.restartExtensionHost();
        }
    }
};
NativeWorkspaceEditingService = __decorate([
    __param(0, IJSONEditingService),
    __param(1, IWorkspaceContextService),
    __param(2, INativeHostService),
    __param(3, IWorkbenchConfigurationService),
    __param(4, IStorageService),
    __param(5, IExtensionService),
    __param(6, IWorkingCopyBackupService),
    __param(7, INotificationService),
    __param(8, ICommandService),
    __param(9, IFileService),
    __param(10, ITextFileService),
    __param(11, IWorkspacesService),
    __param(12, INativeWorkbenchEnvironmentService),
    __param(13, IFileDialogService),
    __param(14, IDialogService),
    __param(15, ILifecycleService),
    __param(16, ILabelService),
    __param(17, IHostService),
    __param(18, IUriIdentityService),
    __param(19, IWorkspaceTrustManagementService),
    __param(20, IUserDataProfilesService),
    __param(21, IUserDataProfileService)
], NativeWorkspaceEditingService);
export { NativeWorkspaceEditingService };
registerSingleton(IWorkspaceEditingService, NativeWorkspaceEditingService, 1 /* InstantiationType.Delayed */);
