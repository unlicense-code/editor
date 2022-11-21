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
import { URI } from 'vs/base/common/uri';
import { once } from 'vs/base/common/functional';
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { ILifecycleMainService } from 'vs/platform/lifecycle/electron-main/lifecycleMainService';
import { ILogService } from 'vs/platform/log/common/log';
import { AbstractStorageService, isProfileUsingDefaultStorage } from 'vs/platform/storage/common/storage';
import { ApplicationStorageMain, ProfileStorageMain, InMemoryStorageMain, WorkspaceStorageMain } from 'vs/platform/storage/electron-main/storageMain';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IUserDataProfilesMainService } from 'vs/platform/userDataProfile/electron-main/userDataProfile';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
//#region Storage Main Service (intent: make application, profile and workspace storage accessible to windows from main process)
export const IStorageMainService = createDecorator('storageMainService');
let StorageMainService = class StorageMainService extends Disposable {
    logService;
    environmentService;
    userDataProfilesService;
    lifecycleMainService;
    fileService;
    uriIdentityService;
    shutdownReason = undefined;
    _onDidChangeProfileStorage = this._register(new Emitter());
    onDidChangeProfileStorage = this._onDidChangeProfileStorage.event;
    constructor(logService, environmentService, userDataProfilesService, lifecycleMainService, fileService, uriIdentityService) {
        super();
        this.logService = logService;
        this.environmentService = environmentService;
        this.userDataProfilesService = userDataProfilesService;
        this.lifecycleMainService = lifecycleMainService;
        this.fileService = fileService;
        this.uriIdentityService = uriIdentityService;
        this.registerListeners();
    }
    getStorageOptions() {
        return {
            useInMemoryStorage: !!this.environmentService.extensionTestsLocationURI // no storage during extension tests!
        };
    }
    registerListeners() {
        // Application Storage: Warmup when any window opens
        (async () => {
            await this.lifecycleMainService.when(3 /* LifecycleMainPhase.AfterWindowOpen */);
            this.applicationStorage.init();
        })();
        this._register(this.lifecycleMainService.onWillLoadWindow(e => {
            // Profile Storage: Warmup when related window with profile loads
            if (e.window.profile) {
                this.profileStorage(e.window.profile).init();
            }
            // Workspace Storage: Warmup when related window with workspace loads
            if (e.workspace) {
                this.workspaceStorage(e.workspace).init();
            }
        }));
        // All Storage: Close when shutting down
        this._register(this.lifecycleMainService.onWillShutdown(e => {
            this.logService.trace('storageMainService#onWillShutdown()');
            // Remember shutdown reason
            this.shutdownReason = e.reason;
            // Application Storage
            e.join(this.applicationStorage.close());
            // Profile Storage(s)
            for (const [, profileStorage] of this.mapProfileToStorage) {
                e.join(profileStorage.close());
            }
            // Workspace Storage(s)
            for (const [, workspaceStorage] of this.mapWorkspaceToStorage) {
                e.join(workspaceStorage.close());
            }
        }));
        // Prepare storage location as needed
        this._register(this.userDataProfilesService.onWillCreateProfile(e => {
            e.join((async () => {
                if (!(await this.fileService.exists(e.profile.globalStorageHome))) {
                    await this.fileService.createFolder(e.profile.globalStorageHome);
                }
            })());
        }));
        // Close the storage of the profile that is being removed
        this._register(this.userDataProfilesService.onWillRemoveProfile(e => {
            const storage = this.mapProfileToStorage.get(e.profile.id);
            if (storage) {
                e.join(storage.close());
            }
        }));
    }
    //#region Application Storage
    applicationStorage = this.createApplicationStorage();
    createApplicationStorage() {
        this.logService.trace(`StorageMainService: creating application storage`);
        const applicationStorage = new ApplicationStorageMain(this.getStorageOptions(), this.userDataProfilesService, this.logService, this.fileService);
        once(applicationStorage.onDidCloseStorage)(() => {
            this.logService.trace(`StorageMainService: closed application storage`);
        });
        return applicationStorage;
    }
    //#endregion
    //#region Profile Storage
    mapProfileToStorage = new Map();
    profileStorage(profile) {
        if (isProfileUsingDefaultStorage(profile)) {
            return this.applicationStorage; // for profiles using default storage, use application storage
        }
        let profileStorage = this.mapProfileToStorage.get(profile.id);
        if (!profileStorage) {
            this.logService.trace(`StorageMainService: creating profile storage (${profile.name})`);
            profileStorage = this.createProfileStorage(profile);
            this.mapProfileToStorage.set(profile.id, profileStorage);
            const listener = this._register(profileStorage.onDidChangeStorage(e => this._onDidChangeProfileStorage.fire({
                ...e,
                storage: profileStorage,
                profile
            })));
            once(profileStorage.onDidCloseStorage)(() => {
                this.logService.trace(`StorageMainService: closed profile storage (${profile.name})`);
                this.mapProfileToStorage.delete(profile.id);
                listener.dispose();
            });
        }
        return profileStorage;
    }
    createProfileStorage(profile) {
        if (this.shutdownReason === 2 /* ShutdownReason.KILL */) {
            // Workaround for native crashes that we see when
            // SQLite DBs are being created even after shutdown
            // https://github.com/microsoft/vscode/issues/143186
            return new InMemoryStorageMain(this.logService, this.fileService);
        }
        return new ProfileStorageMain(profile, this.getStorageOptions(), this.logService, this.fileService);
    }
    //#endregion
    //#region Workspace Storage
    mapWorkspaceToStorage = new Map();
    workspaceStorage(workspace) {
        let workspaceStorage = this.mapWorkspaceToStorage.get(workspace.id);
        if (!workspaceStorage) {
            this.logService.trace(`StorageMainService: creating workspace storage (${workspace.id})`);
            workspaceStorage = this.createWorkspaceStorage(workspace);
            this.mapWorkspaceToStorage.set(workspace.id, workspaceStorage);
            once(workspaceStorage.onDidCloseStorage)(() => {
                this.logService.trace(`StorageMainService: closed workspace storage (${workspace.id})`);
                this.mapWorkspaceToStorage.delete(workspace.id);
            });
        }
        return workspaceStorage;
    }
    createWorkspaceStorage(workspace) {
        if (this.shutdownReason === 2 /* ShutdownReason.KILL */) {
            // Workaround for native crashes that we see when
            // SQLite DBs are being created even after shutdown
            // https://github.com/microsoft/vscode/issues/143186
            return new InMemoryStorageMain(this.logService, this.fileService);
        }
        return new WorkspaceStorageMain(workspace, this.getStorageOptions(), this.logService, this.environmentService, this.fileService);
    }
    //#endregion
    isUsed(path) {
        const pathUri = URI.file(path);
        for (const storage of [this.applicationStorage, ...this.mapProfileToStorage.values(), ...this.mapWorkspaceToStorage.values()]) {
            if (!storage.path) {
                continue;
            }
            if (this.uriIdentityService.extUri.isEqualOrParent(URI.file(storage.path), pathUri)) {
                return true;
            }
        }
        return false;
    }
};
StorageMainService = __decorate([
    __param(0, ILogService),
    __param(1, IEnvironmentService),
    __param(2, IUserDataProfilesMainService),
    __param(3, ILifecycleMainService),
    __param(4, IFileService),
    __param(5, IUriIdentityService)
], StorageMainService);
export { StorageMainService };
//#endregion
//#region Application Main Storage Service (intent: use application storage from main process)
export const IApplicationStorageMainService = createDecorator('applicationStorageMainService');
let ApplicationStorageMainService = class ApplicationStorageMainService extends AbstractStorageService {
    userDataProfilesService;
    storageMainService;
    whenReady = this.storageMainService.applicationStorage.whenInit;
    constructor(userDataProfilesService, storageMainService) {
        super();
        this.userDataProfilesService = userDataProfilesService;
        this.storageMainService = storageMainService;
    }
    doInitialize() {
        // application storage is being initialized as part
        // of the first window opening, so we do not trigger
        // it here but can join it
        return this.storageMainService.applicationStorage.whenInit;
    }
    getStorage(scope) {
        if (scope === -1 /* StorageScope.APPLICATION */) {
            return this.storageMainService.applicationStorage.storage;
        }
        return undefined; // any other scope is unsupported from main process
    }
    getLogDetails(scope) {
        if (scope === -1 /* StorageScope.APPLICATION */) {
            return this.userDataProfilesService.defaultProfile.globalStorageHome.fsPath;
        }
        return undefined; // any other scope is unsupported from main process
    }
    shouldFlushWhenIdle() {
        return false; // not needed here, will be triggered from any window that is opened
    }
    switch() {
        throw new Error('Migrating storage is unsupported from main process');
    }
    switchToProfile() {
        throw new Error('Switching storage profile is unsupported from main process');
    }
    switchToWorkspace() {
        throw new Error('Switching storage workspace is unsupported from main process');
    }
    hasScope() {
        throw new Error('Main process is never profile or workspace scoped');
    }
};
ApplicationStorageMainService = __decorate([
    __param(0, IUserDataProfilesService),
    __param(1, IStorageMainService)
], ApplicationStorageMainService);
export { ApplicationStorageMainService };
