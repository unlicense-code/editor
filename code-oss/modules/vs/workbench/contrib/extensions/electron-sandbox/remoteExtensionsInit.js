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
import { CancellationToken } from 'vs/base/common/cancellation';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IExtensionGalleryService, IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { areSameExtensions } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { ILogService } from 'vs/platform/log/common/log';
import { IRemoteAuthorityResolverService } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { IStorageService, IS_NEW_KEY } from 'vs/platform/storage/common/storage';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { AbstractExtensionsInitializer } from 'vs/platform/userDataSync/common/extensionsSync';
import { IIgnoredExtensionsManagementService } from 'vs/platform/userDataSync/common/ignoredExtensions';
import { IUserDataSyncStoreManagementService } from 'vs/platform/userDataSync/common/userDataSync';
import { UserDataSyncStoreClient } from 'vs/platform/userDataSync/common/userDataSyncStoreService';
import { IAuthenticationService } from 'vs/workbench/services/authentication/common/authentication';
import { IExtensionManagementServerService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IExtensionManifestPropertiesService } from 'vs/workbench/services/extensions/common/extensionManifestPropertiesService';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
let RemoteExtensionsInitializerContribution = class RemoteExtensionsInitializerContribution {
    extensionManagementServerService;
    storageService;
    remoteAgentService;
    userDataSyncStoreManagementService;
    instantiationService;
    logService;
    authenticationService;
    remoteAuthorityResolverService;
    constructor(extensionManagementServerService, storageService, remoteAgentService, userDataSyncStoreManagementService, instantiationService, logService, authenticationService, remoteAuthorityResolverService) {
        this.extensionManagementServerService = extensionManagementServerService;
        this.storageService = storageService;
        this.remoteAgentService = remoteAgentService;
        this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
        this.instantiationService = instantiationService;
        this.logService = logService;
        this.authenticationService = authenticationService;
        this.remoteAuthorityResolverService = remoteAuthorityResolverService;
        this.initializeRemoteExtensions();
    }
    async initializeRemoteExtensions() {
        const connection = this.remoteAgentService.getConnection();
        const localExtensionManagementServer = this.extensionManagementServerService.localExtensionManagementServer;
        const remoteExtensionManagementServer = this.extensionManagementServerService.remoteExtensionManagementServer;
        // Skip: Not a remote window
        if (!connection || !remoteExtensionManagementServer) {
            return;
        }
        // Skip: Not a native window
        if (!localExtensionManagementServer) {
            return;
        }
        // Skip: No UserdataSyncStore is configured
        if (!this.userDataSyncStoreManagementService.userDataSyncStore) {
            return;
        }
        const newRemoteConnectionKey = `${IS_NEW_KEY}.${connection.remoteAuthority}`;
        // Skip: Not a new remote connection
        if (!this.storageService.getBoolean(newRemoteConnectionKey, -1 /* StorageScope.APPLICATION */, true)) {
            this.logService.trace(`Skipping initializing remote extensions because the window with this remote authority was opened before.`);
            return;
        }
        this.storageService.store(newRemoteConnectionKey, false, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        // Skip: Not a new workspace
        if (!this.storageService.isNew(1 /* StorageScope.WORKSPACE */)) {
            this.logService.trace(`Skipping initializing remote extensions because this workspace was opened before.`);
            return;
        }
        // Skip: No account is provided to initialize
        const resolvedAuthority = await this.remoteAuthorityResolverService.resolveAuthority(connection.remoteAuthority);
        if (!resolvedAuthority.options?.authenticationSession) {
            return;
        }
        const sessions = await this.authenticationService.getSessions(resolvedAuthority.options?.authenticationSession.providerId);
        const session = sessions.find(s => s.id === resolvedAuthority.options?.authenticationSession?.id);
        // Skip: Session is not found
        if (!session) {
            this.logService.info('Skipping initializing remote extensions because the account with given session id is not found', resolvedAuthority.options.authenticationSession.id);
            return;
        }
        const userDataSyncStoreClient = this.instantiationService.createInstance(UserDataSyncStoreClient, this.userDataSyncStoreManagementService.userDataSyncStore.url);
        userDataSyncStoreClient.setAuthToken(session.accessToken, resolvedAuthority.options.authenticationSession.providerId);
        const userData = await userDataSyncStoreClient.readResource("extensions" /* SyncResource.Extensions */, null);
        const serviceCollection = new ServiceCollection();
        serviceCollection.set(IExtensionManagementService, remoteExtensionManagementServer.extensionManagementService);
        const instantiationService = this.instantiationService.createChild(serviceCollection);
        const extensionsToInstallInitializer = instantiationService.createInstance(RemoteExtensionsInitializer);
        await extensionsToInstallInitializer.initialize(userData);
    }
};
RemoteExtensionsInitializerContribution = __decorate([
    __param(0, IExtensionManagementServerService),
    __param(1, IStorageService),
    __param(2, IRemoteAgentService),
    __param(3, IUserDataSyncStoreManagementService),
    __param(4, IInstantiationService),
    __param(5, ILogService),
    __param(6, IAuthenticationService),
    __param(7, IRemoteAuthorityResolverService)
], RemoteExtensionsInitializerContribution);
export { RemoteExtensionsInitializerContribution };
let RemoteExtensionsInitializer = class RemoteExtensionsInitializer extends AbstractExtensionsInitializer {
    extensionGalleryService;
    extensionManifestPropertiesService;
    constructor(extensionManagementService, ignoredExtensionsManagementService, fileService, userDataProfilesService, environmentService, logService, uriIdentityService, extensionGalleryService, storageService, extensionManifestPropertiesService) {
        super(extensionManagementService, ignoredExtensionsManagementService, fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService);
        this.extensionGalleryService = extensionGalleryService;
        this.extensionManifestPropertiesService = extensionManifestPropertiesService;
    }
    async doInitialize(remoteUserData) {
        const remoteExtensions = await this.parseExtensions(remoteUserData);
        if (!remoteExtensions) {
            this.logService.info('No synced extensions exist while initializing remote extensions.');
            return;
        }
        const installedExtensions = await this.extensionManagementService.getInstalled();
        const { newExtensions } = this.generatePreview(remoteExtensions, installedExtensions);
        if (!newExtensions.length) {
            this.logService.trace('No new remote extensions to install.');
            return;
        }
        const targetPlatform = await this.extensionManagementService.getTargetPlatform();
        const extensionsToInstall = await this.extensionGalleryService.getExtensions(newExtensions, { targetPlatform, compatible: true }, CancellationToken.None);
        if (extensionsToInstall.length) {
            await Promise.allSettled(extensionsToInstall.map(async (e) => {
                const manifest = await this.extensionGalleryService.getManifest(e, CancellationToken.None);
                if (manifest && this.extensionManifestPropertiesService.canExecuteOnWorkspace(manifest)) {
                    const syncedExtension = remoteExtensions.find(e => areSameExtensions(e.identifier, e.identifier));
                    await this.extensionManagementService.installFromGallery(e, { installPreReleaseVersion: syncedExtension?.preRelease, donotIncludePackAndDependencies: true });
                }
            }));
        }
    }
};
RemoteExtensionsInitializer = __decorate([
    __param(0, IExtensionManagementService),
    __param(1, IIgnoredExtensionsManagementService),
    __param(2, IFileService),
    __param(3, IUserDataProfilesService),
    __param(4, IEnvironmentService),
    __param(5, ILogService),
    __param(6, IUriIdentityService),
    __param(7, IExtensionGalleryService),
    __param(8, IStorageService),
    __param(9, IExtensionManifestPropertiesService)
], RemoteExtensionsInitializer);
