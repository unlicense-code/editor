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
import { IStorageService } from 'vs/platform/storage/common/storage';
import { AbstractExtensionsInitializer } from 'vs/platform/userDataSync/common/extensionsSync';
import { GlobalStateInitializer, UserDataSyncStoreTypeSynchronizer } from 'vs/platform/userDataSync/common/globalStateSync';
import { KeybindingsInitializer } from 'vs/platform/userDataSync/common/keybindingsSync';
import { SettingsInitializer } from 'vs/platform/userDataSync/common/settingsSync';
import { SnippetsInitializer } from 'vs/platform/userDataSync/common/snippetsSync';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IFileService } from 'vs/platform/files/common/files';
import { createDecorator, IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { UserDataSyncStoreClient } from 'vs/platform/userDataSync/common/userDataSyncStoreService';
import { IProductService } from 'vs/platform/product/common/productService';
import { IRequestService } from 'vs/platform/request/common/request';
import { IUserDataSyncLogService, IUserDataSyncStoreManagementService } from 'vs/platform/userDataSync/common/userDataSync';
import { getCurrentAuthenticationSessionInfo } from 'vs/workbench/services/authentication/browser/authenticationService';
import { getSyncAreaLabel } from 'vs/workbench/services/userDataSync/common/userDataSync';
import { Extensions } from 'vs/workbench/common/contributions';
import { Registry } from 'vs/platform/registry/common/platform';
import { isWeb } from 'vs/base/common/platform';
import { Barrier, Promises } from 'vs/base/common/async';
import { IExtensionGalleryService, IExtensionManagementService, IGlobalExtensionEnablementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IExtensionService, toExtensionDescription } from 'vs/workbench/services/extensions/common/extensions';
import { areSameExtensions } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { mark } from 'vs/base/common/performance';
import { IIgnoredExtensionsManagementService } from 'vs/platform/userDataSync/common/ignoredExtensions';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { isEqual } from 'vs/base/common/resources';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IExtensionStorageService } from 'vs/platform/extensionManagement/common/extensionStorage';
import { ICredentialsService } from 'vs/platform/credentials/common/credentials';
import { TasksInitializer } from 'vs/platform/userDataSync/common/tasksSync';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
export const IUserDataInitializationService = createDecorator('IUserDataInitializationService');
let UserDataInitializationService = class UserDataInitializationService {
    environmentService;
    credentialsService;
    userDataSyncStoreManagementService;
    fileService;
    userDataProfilesService;
    storageService;
    productService;
    requestService;
    logService;
    uriIdentityService;
    _serviceBrand;
    initialized = [];
    initializationFinished = new Barrier();
    globalStateUserData = null;
    constructor(environmentService, credentialsService, userDataSyncStoreManagementService, fileService, userDataProfilesService, storageService, productService, requestService, logService, uriIdentityService) {
        this.environmentService = environmentService;
        this.credentialsService = credentialsService;
        this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
        this.fileService = fileService;
        this.userDataProfilesService = userDataProfilesService;
        this.storageService = storageService;
        this.productService = productService;
        this.requestService = requestService;
        this.logService = logService;
        this.uriIdentityService = uriIdentityService;
        this.createUserDataSyncStoreClient().then(userDataSyncStoreClient => {
            if (!userDataSyncStoreClient) {
                this.initializationFinished.open();
            }
        });
    }
    _userDataSyncStoreClientPromise;
    createUserDataSyncStoreClient() {
        if (!this._userDataSyncStoreClientPromise) {
            this._userDataSyncStoreClientPromise = (async () => {
                try {
                    if (!isWeb) {
                        this.logService.trace(`Skipping initializing user data in desktop`);
                        return;
                    }
                    if (!this.storageService.isNew(-1 /* StorageScope.APPLICATION */)) {
                        this.logService.trace(`Skipping initializing user data as application was opened before`);
                        return;
                    }
                    if (!this.storageService.isNew(1 /* StorageScope.WORKSPACE */)) {
                        this.logService.trace(`Skipping initializing user data as workspace was opened before`);
                        return;
                    }
                    let authenticationSession;
                    try {
                        authenticationSession = await getCurrentAuthenticationSessionInfo(this.credentialsService, this.productService);
                    }
                    catch (error) {
                        this.logService.error(error);
                    }
                    if (!authenticationSession) {
                        this.logService.trace(`Skipping initializing user data as authentication session is not set`);
                        return;
                    }
                    await this.initializeUserDataSyncStore(authenticationSession);
                    const userDataSyncStore = this.userDataSyncStoreManagementService.userDataSyncStore;
                    if (!userDataSyncStore) {
                        this.logService.trace(`Skipping initializing user data as sync service is not provided`);
                        return;
                    }
                    const userDataSyncStoreClient = new UserDataSyncStoreClient(userDataSyncStore.url, this.productService, this.requestService, this.logService, this.environmentService, this.fileService, this.storageService);
                    userDataSyncStoreClient.setAuthToken(authenticationSession.accessToken, authenticationSession.providerId);
                    const manifest = await userDataSyncStoreClient.manifest(null);
                    if (manifest === null) {
                        userDataSyncStoreClient.dispose();
                        this.logService.trace(`Skipping initializing user data as there is no data`);
                        return;
                    }
                    this.logService.info(`Using settings sync service ${userDataSyncStore.url.toString()} for initialization`);
                    return userDataSyncStoreClient;
                }
                catch (error) {
                    this.logService.error(error);
                    return;
                }
            })();
        }
        return this._userDataSyncStoreClientPromise;
    }
    async initializeUserDataSyncStore(authenticationSession) {
        const userDataSyncStore = this.userDataSyncStoreManagementService.userDataSyncStore;
        if (!userDataSyncStore?.canSwitch) {
            return;
        }
        const disposables = new DisposableStore();
        try {
            const userDataSyncStoreClient = disposables.add(new UserDataSyncStoreClient(userDataSyncStore.url, this.productService, this.requestService, this.logService, this.environmentService, this.fileService, this.storageService));
            userDataSyncStoreClient.setAuthToken(authenticationSession.accessToken, authenticationSession.providerId);
            // Cache global state data for global state initialization
            this.globalStateUserData = await userDataSyncStoreClient.readResource("globalState" /* SyncResource.GlobalState */, null);
            if (this.globalStateUserData) {
                const userDataSyncStoreType = new UserDataSyncStoreTypeSynchronizer(userDataSyncStoreClient, this.storageService, this.environmentService, this.fileService, this.logService).getSyncStoreType(this.globalStateUserData);
                if (userDataSyncStoreType) {
                    await this.userDataSyncStoreManagementService.switch(userDataSyncStoreType);
                    // Unset cached global state data if urls are changed
                    if (!isEqual(userDataSyncStore.url, this.userDataSyncStoreManagementService.userDataSyncStore?.url)) {
                        this.logService.info('Switched settings sync store');
                        this.globalStateUserData = null;
                    }
                }
            }
        }
        finally {
            disposables.dispose();
        }
    }
    async whenInitializationFinished() {
        await this.initializationFinished.wait();
    }
    async requiresInitialization() {
        this.logService.trace(`UserDataInitializationService#requiresInitialization`);
        const userDataSyncStoreClient = await this.createUserDataSyncStoreClient();
        return !!userDataSyncStoreClient;
    }
    async initializeRequiredResources() {
        this.logService.trace(`UserDataInitializationService#initializeRequiredResources`);
        return this.initialize(["settings" /* SyncResource.Settings */, "globalState" /* SyncResource.GlobalState */]);
    }
    async initializeOtherResources(instantiationService) {
        try {
            this.logService.trace(`UserDataInitializationService#initializeOtherResources`);
            await Promise.allSettled([this.initialize(["keybindings" /* SyncResource.Keybindings */, "snippets" /* SyncResource.Snippets */, "tasks" /* SyncResource.Tasks */]), this.initializeExtensions(instantiationService)]);
        }
        finally {
            this.initializationFinished.open();
        }
    }
    async initializeExtensions(instantiationService) {
        try {
            await Promise.all([this.initializeInstalledExtensions(instantiationService), this.initializeNewExtensions(instantiationService)]);
        }
        finally {
            this.initialized.push("extensions" /* SyncResource.Extensions */);
        }
    }
    initializeInstalledExtensionsPromise;
    async initializeInstalledExtensions(instantiationService) {
        if (!this.initializeInstalledExtensionsPromise) {
            this.initializeInstalledExtensionsPromise = (async () => {
                this.logService.trace(`UserDataInitializationService#initializeInstalledExtensions`);
                const extensionsPreviewInitializer = await this.getExtensionsPreviewInitializer(instantiationService);
                if (extensionsPreviewInitializer) {
                    await instantiationService.createInstance(InstalledExtensionsInitializer, extensionsPreviewInitializer).initialize();
                }
            })();
        }
        return this.initializeInstalledExtensionsPromise;
    }
    initializeNewExtensionsPromise;
    async initializeNewExtensions(instantiationService) {
        if (!this.initializeNewExtensionsPromise) {
            this.initializeNewExtensionsPromise = (async () => {
                this.logService.trace(`UserDataInitializationService#initializeNewExtensions`);
                const extensionsPreviewInitializer = await this.getExtensionsPreviewInitializer(instantiationService);
                if (extensionsPreviewInitializer) {
                    await instantiationService.createInstance(NewExtensionsInitializer, extensionsPreviewInitializer).initialize();
                }
            })();
        }
        return this.initializeNewExtensionsPromise;
    }
    extensionsPreviewInitializerPromise;
    getExtensionsPreviewInitializer(instantiationService) {
        if (!this.extensionsPreviewInitializerPromise) {
            this.extensionsPreviewInitializerPromise = (async () => {
                const userDataSyncStoreClient = await this.createUserDataSyncStoreClient();
                if (!userDataSyncStoreClient) {
                    return null;
                }
                const userData = await userDataSyncStoreClient.readResource("extensions" /* SyncResource.Extensions */, null);
                return instantiationService.createInstance(ExtensionsPreviewInitializer, userData);
            })();
        }
        return this.extensionsPreviewInitializerPromise;
    }
    async initialize(syncResources) {
        const userDataSyncStoreClient = await this.createUserDataSyncStoreClient();
        if (!userDataSyncStoreClient) {
            return;
        }
        await Promises.settled(syncResources.map(async (syncResource) => {
            try {
                if (this.initialized.includes(syncResource)) {
                    this.logService.info(`${getSyncAreaLabel(syncResource)} initialized already.`);
                    return;
                }
                this.initialized.push(syncResource);
                this.logService.trace(`Initializing ${getSyncAreaLabel(syncResource)}`);
                const initializer = this.createSyncResourceInitializer(syncResource);
                const userData = await userDataSyncStoreClient.readResource(syncResource, syncResource === "globalState" /* SyncResource.GlobalState */ ? this.globalStateUserData : null);
                await initializer.initialize(userData);
                this.logService.info(`Initialized ${getSyncAreaLabel(syncResource)}`);
            }
            catch (error) {
                this.logService.info(`Error while initializing ${getSyncAreaLabel(syncResource)}`);
                this.logService.error(error);
            }
        }));
    }
    createSyncResourceInitializer(syncResource) {
        switch (syncResource) {
            case "settings" /* SyncResource.Settings */: return new SettingsInitializer(this.fileService, this.userDataProfilesService, this.environmentService, this.logService, this.storageService, this.uriIdentityService);
            case "keybindings" /* SyncResource.Keybindings */: return new KeybindingsInitializer(this.fileService, this.userDataProfilesService, this.environmentService, this.logService, this.storageService, this.uriIdentityService);
            case "tasks" /* SyncResource.Tasks */: return new TasksInitializer(this.fileService, this.userDataProfilesService, this.environmentService, this.logService, this.storageService, this.uriIdentityService);
            case "snippets" /* SyncResource.Snippets */: return new SnippetsInitializer(this.fileService, this.userDataProfilesService, this.environmentService, this.logService, this.storageService, this.uriIdentityService);
            case "globalState" /* SyncResource.GlobalState */: return new GlobalStateInitializer(this.storageService, this.fileService, this.userDataProfilesService, this.environmentService, this.logService, this.uriIdentityService);
        }
        throw new Error(`Cannot create initializer for ${syncResource}`);
    }
};
UserDataInitializationService = __decorate([
    __param(0, IWorkbenchEnvironmentService),
    __param(1, ICredentialsService),
    __param(2, IUserDataSyncStoreManagementService),
    __param(3, IFileService),
    __param(4, IUserDataProfilesService),
    __param(5, IStorageService),
    __param(6, IProductService),
    __param(7, IRequestService),
    __param(8, ILogService),
    __param(9, IUriIdentityService)
], UserDataInitializationService);
export { UserDataInitializationService };
let ExtensionsPreviewInitializer = class ExtensionsPreviewInitializer extends AbstractExtensionsInitializer {
    extensionsData;
    previewPromise;
    preview = null;
    constructor(extensionsData, extensionManagementService, ignoredExtensionsManagementService, fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
        super(extensionManagementService, ignoredExtensionsManagementService, fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService);
        this.extensionsData = extensionsData;
    }
    getPreview() {
        if (!this.previewPromise) {
            this.previewPromise = super.initialize(this.extensionsData).then(() => this.preview);
        }
        return this.previewPromise;
    }
    initialize() {
        throw new Error('should not be called directly');
    }
    async doInitialize(remoteUserData) {
        const remoteExtensions = await this.parseExtensions(remoteUserData);
        if (!remoteExtensions) {
            this.logService.info('Skipping initializing extensions because remote extensions does not exist.');
            return;
        }
        const installedExtensions = await this.extensionManagementService.getInstalled();
        this.preview = this.generatePreview(remoteExtensions, installedExtensions);
    }
};
ExtensionsPreviewInitializer = __decorate([
    __param(1, IExtensionManagementService),
    __param(2, IIgnoredExtensionsManagementService),
    __param(3, IFileService),
    __param(4, IUserDataProfilesService),
    __param(5, IEnvironmentService),
    __param(6, IUserDataSyncLogService),
    __param(7, IStorageService),
    __param(8, IUriIdentityService)
], ExtensionsPreviewInitializer);
let InstalledExtensionsInitializer = class InstalledExtensionsInitializer {
    extensionsPreviewInitializer;
    extensionEnablementService;
    extensionStorageService;
    logService;
    constructor(extensionsPreviewInitializer, extensionEnablementService, extensionStorageService, logService) {
        this.extensionsPreviewInitializer = extensionsPreviewInitializer;
        this.extensionEnablementService = extensionEnablementService;
        this.extensionStorageService = extensionStorageService;
        this.logService = logService;
    }
    async initialize() {
        const preview = await this.extensionsPreviewInitializer.getPreview();
        if (!preview) {
            return;
        }
        // 1. Initialise already installed extensions state
        for (const installedExtension of preview.installedExtensions) {
            const syncExtension = preview.remoteExtensions.find(({ identifier }) => areSameExtensions(identifier, installedExtension.identifier));
            if (syncExtension?.state) {
                const extensionState = this.extensionStorageService.getExtensionState(installedExtension, true) || {};
                Object.keys(syncExtension.state).forEach(key => extensionState[key] = syncExtension.state[key]);
                this.extensionStorageService.setExtensionState(installedExtension, extensionState, true);
            }
        }
        // 2. Initialise extensions enablement
        if (preview.disabledExtensions.length) {
            for (const identifier of preview.disabledExtensions) {
                this.logService.trace(`Disabling extension...`, identifier.id);
                await this.extensionEnablementService.disableExtension(identifier);
                this.logService.info(`Disabling extension`, identifier.id);
            }
        }
    }
};
InstalledExtensionsInitializer = __decorate([
    __param(1, IGlobalExtensionEnablementService),
    __param(2, IExtensionStorageService),
    __param(3, IUserDataSyncLogService)
], InstalledExtensionsInitializer);
let NewExtensionsInitializer = class NewExtensionsInitializer {
    extensionsPreviewInitializer;
    extensionService;
    extensionStorageService;
    galleryService;
    extensionManagementService;
    logService;
    constructor(extensionsPreviewInitializer, extensionService, extensionStorageService, galleryService, extensionManagementService, logService) {
        this.extensionsPreviewInitializer = extensionsPreviewInitializer;
        this.extensionService = extensionService;
        this.extensionStorageService = extensionStorageService;
        this.galleryService = galleryService;
        this.extensionManagementService = extensionManagementService;
        this.logService = logService;
    }
    async initialize() {
        const preview = await this.extensionsPreviewInitializer.getPreview();
        if (!preview) {
            return;
        }
        const newlyEnabledExtensions = [];
        const targetPlatform = await this.extensionManagementService.getTargetPlatform();
        const galleryExtensions = await this.galleryService.getExtensions(preview.newExtensions, { targetPlatform, compatible: true }, CancellationToken.None);
        for (const galleryExtension of galleryExtensions) {
            try {
                const extensionToSync = preview.remoteExtensions.find(({ identifier }) => areSameExtensions(identifier, galleryExtension.identifier));
                if (!extensionToSync) {
                    continue;
                }
                if (extensionToSync.state) {
                    this.extensionStorageService.setExtensionState(galleryExtension, extensionToSync.state, true);
                }
                this.logService.trace(`Installing extension...`, galleryExtension.identifier.id);
                const local = await this.extensionManagementService.installFromGallery(galleryExtension, { isMachineScoped: false, donotIncludePackAndDependencies: true, installPreReleaseVersion: extensionToSync.preRelease } /* set isMachineScoped to prevent install and sync dialog in web */);
                if (!preview.disabledExtensions.some(identifier => areSameExtensions(identifier, galleryExtension.identifier))) {
                    newlyEnabledExtensions.push(local);
                }
                this.logService.info(`Installed extension.`, galleryExtension.identifier.id);
            }
            catch (error) {
                this.logService.error(error);
            }
        }
        const canEnabledExtensions = newlyEnabledExtensions.filter(e => this.extensionService.canAddExtension(toExtensionDescription(e)));
        if (!(await this.areExtensionsRunning(canEnabledExtensions))) {
            await new Promise((c, e) => {
                const disposable = this.extensionService.onDidChangeExtensions(async () => {
                    try {
                        if (await this.areExtensionsRunning(canEnabledExtensions)) {
                            disposable.dispose();
                            c();
                        }
                    }
                    catch (error) {
                        e(error);
                    }
                });
            });
        }
    }
    async areExtensionsRunning(extensions) {
        await this.extensionService.whenInstalledExtensionsRegistered();
        const runningExtensions = this.extensionService.extensions;
        return extensions.every(e => runningExtensions.some(r => areSameExtensions({ id: r.identifier.value }, e.identifier)));
    }
};
NewExtensionsInitializer = __decorate([
    __param(1, IExtensionService),
    __param(2, IExtensionStorageService),
    __param(3, IExtensionGalleryService),
    __param(4, IExtensionManagementService),
    __param(5, IUserDataSyncLogService)
], NewExtensionsInitializer);
let InitializeOtherResourcesContribution = class InitializeOtherResourcesContribution {
    constructor(userDataInitializeService, instantiationService, extensionService) {
        extensionService.whenInstalledExtensionsRegistered().then(() => this.initializeOtherResource(userDataInitializeService, instantiationService));
    }
    async initializeOtherResource(userDataInitializeService, instantiationService) {
        if (await userDataInitializeService.requiresInitialization()) {
            mark('code/willInitOtherUserData');
            await userDataInitializeService.initializeOtherResources(instantiationService);
            mark('code/didInitOtherUserData');
        }
    }
};
InitializeOtherResourcesContribution = __decorate([
    __param(0, IUserDataInitializationService),
    __param(1, IInstantiationService),
    __param(2, IExtensionService)
], InitializeOtherResourcesContribution);
if (isWeb) {
    const workbenchRegistry = Registry.as(Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(InitializeOtherResourcesContribution, 3 /* LifecyclePhase.Restored */);
}
