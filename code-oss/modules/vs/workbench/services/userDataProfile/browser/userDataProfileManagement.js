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
import { Disposable } from 'vs/base/common/lifecycle';
import { localize } from 'vs/nls';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IUserDataProfileManagementService, IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
let UserDataProfileManagementService = class UserDataProfileManagementService extends Disposable {
    userDataProfilesService;
    userDataProfileService;
    hostService;
    dialogService;
    workspaceContextService;
    extensionService;
    environmentService;
    _serviceBrand;
    constructor(userDataProfilesService, userDataProfileService, hostService, dialogService, workspaceContextService, extensionService, environmentService) {
        super();
        this.userDataProfilesService = userDataProfilesService;
        this.userDataProfileService = userDataProfileService;
        this.hostService = hostService;
        this.dialogService = dialogService;
        this.workspaceContextService = workspaceContextService;
        this.extensionService = extensionService;
        this.environmentService = environmentService;
        this._register(userDataProfilesService.onDidChangeProfiles(e => this.onDidChangeProfiles(e)));
        this._register(userDataProfilesService.onDidResetWorkspaces(() => this.onDidResetWorkspaces()));
        this._register(userDataProfileService.onDidChangeCurrentProfile(e => this.onDidChangeCurrentProfile(e)));
    }
    onDidChangeProfiles(e) {
        if (e.removed.some(profile => profile.id === this.userDataProfileService.currentProfile.id)) {
            this.enterProfile(this.userDataProfilesService.defaultProfile, false, localize('reload message when removed', "The current profile has been removed. Please reload to switch back to default profile"));
            return;
        }
    }
    onDidResetWorkspaces() {
        if (!this.userDataProfileService.currentProfile.isDefault) {
            this.enterProfile(this.userDataProfilesService.defaultProfile, false, localize('reload message when removed', "The current profile has been removed. Please reload to switch back to default profile"));
            return;
        }
    }
    async onDidChangeCurrentProfile(e) {
        if (e.previous.isTransient) {
            await this.userDataProfilesService.cleanUpTransientProfiles();
        }
    }
    async createAndEnterProfile(name, options, fromExisting) {
        const profile = await this.userDataProfilesService.createNamedProfile(name, options, this.getWorkspaceIdentifier());
        await this.enterProfile(profile, !!fromExisting);
        return profile;
    }
    async createAndEnterTransientProfile() {
        const profile = await this.userDataProfilesService.createTransientProfile(this.getWorkspaceIdentifier());
        await this.enterProfile(profile, false);
        return profile;
    }
    async updateProfile(profile, updateOptions) {
        if (!this.userDataProfilesService.profiles.some(p => p.id === profile.id)) {
            throw new Error(`Profile ${profile.name} does not exist`);
        }
        if (profile.isDefault) {
            throw new Error(localize('cannotRenameDefaultProfile', "Cannot rename the default profile"));
        }
        await this.userDataProfilesService.updateProfile(profile, updateOptions);
    }
    async removeProfile(profile) {
        if (!this.userDataProfilesService.profiles.some(p => p.id === profile.id)) {
            throw new Error(`Profile ${profile.name} does not exist`);
        }
        if (profile.isDefault) {
            throw new Error(localize('cannotDeleteDefaultProfile', "Cannot delete the default profile"));
        }
        await this.userDataProfilesService.removeProfile(profile);
    }
    async switchProfile(profile) {
        const workspaceIdentifier = this.getWorkspaceIdentifier();
        if (!this.userDataProfilesService.profiles.some(p => p.id === profile.id)) {
            throw new Error(`Profile ${profile.name} does not exist`);
        }
        if (this.userDataProfileService.currentProfile.id === profile.id) {
            return;
        }
        await this.userDataProfilesService.setProfileForWorkspace(workspaceIdentifier, profile);
        await this.enterProfile(profile, false);
    }
    getWorkspaceIdentifier() {
        const workspace = this.workspaceContextService.getWorkspace();
        switch (this.workspaceContextService.getWorkbenchState()) {
            case 2 /* WorkbenchState.FOLDER */:
                return { uri: workspace.folders[0].uri, id: workspace.id };
            case 3 /* WorkbenchState.WORKSPACE */:
                return { configPath: workspace.configuration, id: workspace.id };
        }
        return 'empty-window';
    }
    async enterProfile(profile, preserveData, reloadMessage) {
        const isRemoteWindow = !!this.environmentService.remoteAuthority;
        if (!isRemoteWindow) {
            this.extensionService.stopExtensionHosts();
        }
        // In a remote window update current profile before reloading so that data is preserved from current profile if asked to preserve
        await this.userDataProfileService.updateCurrentProfile(profile, preserveData);
        if (isRemoteWindow) {
            const result = await this.dialogService.confirm({
                type: 'info',
                message: reloadMessage ?? localize('reload message', "Switching a profile requires reloading VS Code."),
                primaryButton: localize('reload button', "&&Reload"),
            });
            if (result.confirmed) {
                await this.hostService.reload();
            }
        }
        else {
            await this.extensionService.startExtensionHosts();
        }
    }
};
UserDataProfileManagementService = __decorate([
    __param(0, IUserDataProfilesService),
    __param(1, IUserDataProfileService),
    __param(2, IHostService),
    __param(3, IDialogService),
    __param(4, IWorkspaceContextService),
    __param(5, IExtensionService),
    __param(6, IWorkbenchEnvironmentService)
], UserDataProfileManagementService);
export { UserDataProfileManagementService };
registerSingleton(IUserDataProfileManagementService, UserDataProfileManagementService, 0 /* InstantiationType.Eager */);
