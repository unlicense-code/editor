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
import { Event } from 'vs/base/common/event';
import { IExtensionGalleryService, ExtensionManagementError, ExtensionManagementErrorCode } from 'vs/platform/extensionManagement/common/extensionManagement';
import { areSameExtensions } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { ILogService } from 'vs/platform/log/common/log';
import { toErrorMessage } from 'vs/base/common/errorMessage';
import { isNonEmptyArray } from 'vs/base/common/arrays';
import { CancellationToken } from 'vs/base/common/cancellation';
import { localize } from 'vs/nls';
import { IProductService } from 'vs/platform/product/common/productService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Promises } from 'vs/base/common/async';
import { IExtensionManifestPropertiesService } from 'vs/workbench/services/extensions/common/extensionManifestPropertiesService';
import { ExtensionManagementChannelClient } from 'vs/platform/extensionManagement/common/extensionManagementIpc';
import { IFileService } from 'vs/platform/files/common/files';
let NativeRemoteExtensionManagementService = class NativeRemoteExtensionManagementService extends ExtensionManagementChannelClient {
    localExtensionManagementServer;
    logService;
    galleryService;
    configurationService;
    productService;
    fileService;
    extensionManifestPropertiesService;
    onDidChangeProfile = Event.None;
    get onProfileAwareInstallExtension() { return super.onInstallExtension; }
    get onProfileAwareDidInstallExtensions() { return super.onDidInstallExtensions; }
    get onProfileAwareUninstallExtension() { return super.onUninstallExtension; }
    get onProfileAwareDidUninstallExtension() { return super.onDidUninstallExtension; }
    constructor(channel, localExtensionManagementServer, logService, galleryService, configurationService, productService, fileService, extensionManifestPropertiesService) {
        super(channel);
        this.localExtensionManagementServer = localExtensionManagementServer;
        this.logService = logService;
        this.galleryService = galleryService;
        this.configurationService = configurationService;
        this.productService = productService;
        this.fileService = fileService;
        this.extensionManifestPropertiesService = extensionManifestPropertiesService;
    }
    getInstalled(type = null, profileLocation) {
        if (profileLocation) {
            throw new Error('Installing extensions to a specific profile is not supported in remote scenario');
        }
        return super.getInstalled(type);
    }
    uninstall(extension, options) {
        if (options?.profileLocation) {
            throw new Error('Installing extensions to a specific profile is not supported in remote scenario');
        }
        return super.uninstall(extension, options);
    }
    async install(vsix, options) {
        if (options?.profileLocation) {
            throw new Error('Installing extensions to a specific profile is not supported in remote scenario');
        }
        const local = await super.install(vsix, options);
        await this.installUIDependenciesAndPackedExtensions(local);
        return local;
    }
    async installFromGallery(extension, installOptions) {
        if (installOptions?.profileLocation) {
            throw new Error('Installing extensions to a specific profile is not supported in remote scenario');
        }
        const local = await this.doInstallFromGallery(extension, installOptions);
        await this.installUIDependenciesAndPackedExtensions(local);
        return local;
    }
    async doInstallFromGallery(extension, installOptions) {
        if (this.configurationService.getValue('remote.downloadExtensionsLocally')) {
            return this.downloadAndInstall(extension, installOptions || {});
        }
        try {
            return await super.installFromGallery(extension, installOptions);
        }
        catch (error) {
            switch (error.name) {
                case ExtensionManagementErrorCode.Download:
                case ExtensionManagementErrorCode.Internal:
                    try {
                        this.logService.error(`Error while installing '${extension.identifier.id}' extension in the remote server.`, toErrorMessage(error));
                        return await this.downloadAndInstall(extension, installOptions || {});
                    }
                    catch (e) {
                        this.logService.error(e);
                        throw e;
                    }
                default:
                    this.logService.debug('Remote Install Error Name', error.name);
                    throw error;
            }
        }
    }
    async downloadAndInstall(extension, installOptions) {
        this.logService.info(`Downloading the '${extension.identifier.id}' extension locally and install`);
        const compatible = await this.checkAndGetCompatible(extension, !!installOptions.installPreReleaseVersion);
        installOptions = { ...installOptions, donotIncludePackAndDependencies: true };
        const installed = await this.getInstalled(1 /* ExtensionType.User */);
        const workspaceExtensions = await this.getAllWorkspaceDependenciesAndPackedExtensions(compatible, CancellationToken.None);
        if (workspaceExtensions.length) {
            this.logService.info(`Downloading the workspace dependencies and packed extensions of '${compatible.identifier.id}' locally and install`);
            for (const workspaceExtension of workspaceExtensions) {
                await this.downloadCompatibleAndInstall(workspaceExtension, installed, installOptions);
            }
        }
        return await this.downloadCompatibleAndInstall(compatible, installed, installOptions);
    }
    async downloadCompatibleAndInstall(extension, installed, installOptions) {
        const compatible = await this.checkAndGetCompatible(extension, !!installOptions.installPreReleaseVersion);
        this.logService.trace('Downloading extension:', compatible.identifier.id);
        const location = await this.localExtensionManagementServer.extensionManagementService.download(compatible, installed.filter(i => areSameExtensions(i.identifier, compatible.identifier))[0] ? 3 /* InstallOperation.Update */ : 2 /* InstallOperation.Install */);
        this.logService.info('Downloaded extension:', compatible.identifier.id, location.path);
        try {
            const local = await super.install(location, installOptions);
            this.logService.info(`Successfully installed '${compatible.identifier.id}' extension`);
            return local;
        }
        finally {
            try {
                await this.fileService.del(location);
            }
            catch (error) {
                this.logService.error(error);
            }
        }
    }
    async checkAndGetCompatible(extension, includePreRelease) {
        const targetPlatform = await this.getTargetPlatform();
        let compatibleExtension = null;
        if (extension.hasPreReleaseVersion && extension.properties.isPreReleaseVersion !== includePreRelease) {
            compatibleExtension = (await this.galleryService.getExtensions([{ ...extension.identifier, preRelease: includePreRelease }], { targetPlatform, compatible: true }, CancellationToken.None))[0] || null;
        }
        if (!compatibleExtension && await this.galleryService.isExtensionCompatible(extension, includePreRelease, targetPlatform)) {
            compatibleExtension = extension;
        }
        if (!compatibleExtension) {
            compatibleExtension = await this.galleryService.getCompatibleExtension(extension, includePreRelease, targetPlatform);
        }
        if (compatibleExtension) {
            if (includePreRelease && !compatibleExtension.properties.isPreReleaseVersion && extension.hasPreReleaseVersion) {
                throw new ExtensionManagementError(localize('notFoundCompatiblePrereleaseDependency', "Can't install pre-release version of '{0}' extension because it is not compatible with the current version of {1} (version {2}).", extension.identifier.id, this.productService.nameLong, this.productService.version), ExtensionManagementErrorCode.IncompatiblePreRelease);
            }
        }
        else {
            /** If no compatible release version is found, check if the extension has a release version or not and throw relevant error */
            if (!includePreRelease && extension.properties.isPreReleaseVersion && (await this.galleryService.getExtensions([extension.identifier], CancellationToken.None))[0]) {
                throw new ExtensionManagementError(localize('notFoundReleaseExtension', "Can't install release version of '{0}' extension because it has no release version.", extension.identifier.id), ExtensionManagementErrorCode.ReleaseVersionNotFound);
            }
            throw new ExtensionManagementError(localize('notFoundCompatibleDependency', "Can't install '{0}' extension because it is not compatible with the current version of {1} (version {2}).", extension.identifier.id, this.productService.nameLong, this.productService.version), ExtensionManagementErrorCode.Incompatible);
        }
        return compatibleExtension;
    }
    async installUIDependenciesAndPackedExtensions(local) {
        const uiExtensions = await this.getAllUIDependenciesAndPackedExtensions(local.manifest, CancellationToken.None);
        const installed = await this.localExtensionManagementServer.extensionManagementService.getInstalled();
        const toInstall = uiExtensions.filter(e => installed.every(i => !areSameExtensions(i.identifier, e.identifier)));
        if (toInstall.length) {
            this.logService.info(`Installing UI dependencies and packed extensions of '${local.identifier.id}' locally`);
            await Promises.settled(toInstall.map(d => this.localExtensionManagementServer.extensionManagementService.installFromGallery(d)));
        }
    }
    async getAllUIDependenciesAndPackedExtensions(manifest, token) {
        const result = new Map();
        const extensions = [...(manifest.extensionPack || []), ...(manifest.extensionDependencies || [])];
        await this.getDependenciesAndPackedExtensionsRecursively(extensions, result, true, token);
        return [...result.values()];
    }
    async getAllWorkspaceDependenciesAndPackedExtensions(extension, token) {
        const result = new Map();
        result.set(extension.identifier.id.toLowerCase(), extension);
        const manifest = await this.galleryService.getManifest(extension, token);
        if (manifest) {
            const extensions = [...(manifest.extensionPack || []), ...(manifest.extensionDependencies || [])];
            await this.getDependenciesAndPackedExtensionsRecursively(extensions, result, false, token);
        }
        result.delete(extension.identifier.id);
        return [...result.values()];
    }
    async getDependenciesAndPackedExtensionsRecursively(toGet, result, uiExtension, token) {
        if (toGet.length === 0) {
            return Promise.resolve();
        }
        const extensions = await this.galleryService.getExtensions(toGet.map(id => ({ id })), token);
        const manifests = await Promise.all(extensions.map(e => this.galleryService.getManifest(e, token)));
        const extensionsManifests = [];
        for (let idx = 0; idx < extensions.length; idx++) {
            const extension = extensions[idx];
            const manifest = manifests[idx];
            if (manifest && this.extensionManifestPropertiesService.prefersExecuteOnUI(manifest) === uiExtension) {
                result.set(extension.identifier.id.toLowerCase(), extension);
                extensionsManifests.push(manifest);
            }
        }
        toGet = [];
        for (const extensionManifest of extensionsManifests) {
            if (isNonEmptyArray(extensionManifest.extensionDependencies)) {
                for (const id of extensionManifest.extensionDependencies) {
                    if (!result.has(id.toLowerCase())) {
                        toGet.push(id);
                    }
                }
            }
            if (isNonEmptyArray(extensionManifest.extensionPack)) {
                for (const id of extensionManifest.extensionPack) {
                    if (!result.has(id.toLowerCase())) {
                        toGet.push(id);
                    }
                }
            }
        }
        return this.getDependenciesAndPackedExtensionsRecursively(toGet, result, uiExtension, token);
    }
};
NativeRemoteExtensionManagementService = __decorate([
    __param(2, ILogService),
    __param(3, IExtensionGalleryService),
    __param(4, IConfigurationService),
    __param(5, IProductService),
    __param(6, IFileService),
    __param(7, IExtensionManifestPropertiesService)
], NativeRemoteExtensionManagementService);
export { NativeRemoteExtensionManagementService };
