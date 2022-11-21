/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Promises } from 'vs/base/common/async';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { joinPath } from 'vs/base/common/resources';
import { Storage } from 'vs/base/parts/storage/common/storage';
import { AbstractStorageService, isProfileUsingDefaultStorage, WillSaveStateReason } from 'vs/platform/storage/common/storage';
import { ApplicationStorageDatabaseClient, ProfileStorageDatabaseClient, WorkspaceStorageDatabaseClient } from 'vs/platform/storage/common/storageIpc';
import { isUserDataProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
export class NativeStorageService extends AbstractStorageService {
    initialWorkspace;
    initialProfiles;
    mainProcessService;
    environmentService;
    applicationStorageProfile = this.initialProfiles.defaultProfile;
    applicationStorage = this.createApplicationStorage();
    profileStorageProfile = this.initialProfiles.currentProfile;
    profileStorageDisposables = this._register(new DisposableStore());
    profileStorage = this.createProfileStorage(this.profileStorageProfile);
    workspaceStorageId = this.initialWorkspace?.id;
    workspaceStorageDisposables = this._register(new DisposableStore());
    workspaceStorage = this.createWorkspaceStorage(this.initialWorkspace);
    constructor(initialWorkspace, initialProfiles, mainProcessService, environmentService) {
        super();
        this.initialWorkspace = initialWorkspace;
        this.initialProfiles = initialProfiles;
        this.mainProcessService = mainProcessService;
        this.environmentService = environmentService;
    }
    createApplicationStorage() {
        const storageDataBaseClient = this._register(new ApplicationStorageDatabaseClient(this.mainProcessService.getChannel('storage')));
        const applicationStorage = this._register(new Storage(storageDataBaseClient));
        this._register(applicationStorage.onDidChangeStorage(key => this.emitDidChangeValue(-1 /* StorageScope.APPLICATION */, key)));
        return applicationStorage;
    }
    createProfileStorage(profile) {
        // First clear any previously associated disposables
        this.profileStorageDisposables.clear();
        // Remember profile associated to profile storage
        this.profileStorageProfile = profile;
        let profileStorage;
        if (isProfileUsingDefaultStorage(profile)) {
            // If we are using default profile storage, the profile storage is
            // actually the same as application storage. As such we
            // avoid creating the storage library a second time on
            // the same DB.
            profileStorage = this.applicationStorage;
        }
        else {
            const storageDataBaseClient = this.profileStorageDisposables.add(new ProfileStorageDatabaseClient(this.mainProcessService.getChannel('storage'), profile));
            profileStorage = this.profileStorageDisposables.add(new Storage(storageDataBaseClient));
        }
        this.profileStorageDisposables.add(profileStorage.onDidChangeStorage(key => this.emitDidChangeValue(0 /* StorageScope.PROFILE */, key)));
        return profileStorage;
    }
    createWorkspaceStorage(workspace) {
        // First clear any previously associated disposables
        this.workspaceStorageDisposables.clear();
        // Remember workspace ID for logging later
        this.workspaceStorageId = workspace?.id;
        let workspaceStorage = undefined;
        if (workspace) {
            const storageDataBaseClient = this.workspaceStorageDisposables.add(new WorkspaceStorageDatabaseClient(this.mainProcessService.getChannel('storage'), workspace));
            workspaceStorage = this.workspaceStorageDisposables.add(new Storage(storageDataBaseClient));
            this.workspaceStorageDisposables.add(workspaceStorage.onDidChangeStorage(key => this.emitDidChangeValue(1 /* StorageScope.WORKSPACE */, key)));
        }
        return workspaceStorage;
    }
    async doInitialize() {
        // Init all storage locations
        await Promises.settled([
            this.applicationStorage.init(),
            this.profileStorage.init(),
            this.workspaceStorage?.init() ?? Promise.resolve()
        ]);
    }
    getStorage(scope) {
        switch (scope) {
            case -1 /* StorageScope.APPLICATION */:
                return this.applicationStorage;
            case 0 /* StorageScope.PROFILE */:
                return this.profileStorage;
            default:
                return this.workspaceStorage;
        }
    }
    getLogDetails(scope) {
        switch (scope) {
            case -1 /* StorageScope.APPLICATION */:
                return this.applicationStorageProfile.globalStorageHome.fsPath;
            case 0 /* StorageScope.PROFILE */:
                return this.profileStorageProfile?.globalStorageHome.fsPath;
            default:
                return this.workspaceStorageId ? `${joinPath(this.environmentService.workspaceStorageHome, this.workspaceStorageId, 'state.vscdb').fsPath}` : undefined;
        }
    }
    async close() {
        // Stop periodic scheduler and idle runner as we now collect state normally
        this.stopFlushWhenIdle();
        // Signal as event so that clients can still store data
        this.emitWillSaveState(WillSaveStateReason.SHUTDOWN);
        // Do it
        await Promises.settled([
            this.applicationStorage.close(),
            this.profileStorage.close(),
            this.workspaceStorage?.close() ?? Promise.resolve()
        ]);
    }
    async switchToProfile(toProfile, preserveData) {
        if (!this.canSwitchProfile(this.profileStorageProfile, toProfile)) {
            return;
        }
        const oldProfileStorage = this.profileStorage;
        const oldItems = oldProfileStorage.items;
        // Close old profile storage but only if this is
        // different from application storage!
        if (oldProfileStorage !== this.applicationStorage) {
            await oldProfileStorage.close();
        }
        // Create new profile storage & init
        this.profileStorage = this.createProfileStorage(toProfile);
        await this.profileStorage.init();
        // Handle data switch and eventing
        this.switchData(oldItems, this.profileStorage, 0 /* StorageScope.PROFILE */, preserveData);
    }
    async switchToWorkspace(toWorkspace, preserveData) {
        const oldWorkspaceStorage = this.workspaceStorage;
        const oldItems = oldWorkspaceStorage?.items ?? new Map();
        // Close old workspace storage
        await oldWorkspaceStorage?.close();
        // Create new workspace storage & init
        this.workspaceStorage = this.createWorkspaceStorage(toWorkspace);
        await this.workspaceStorage.init();
        // Handle data switch and eventing
        this.switchData(oldItems, this.workspaceStorage, 1 /* StorageScope.WORKSPACE */, preserveData);
    }
    hasScope(scope) {
        if (isUserDataProfile(scope)) {
            return this.profileStorageProfile.id === scope.id;
        }
        return this.workspaceStorageId === scope.id;
    }
}
