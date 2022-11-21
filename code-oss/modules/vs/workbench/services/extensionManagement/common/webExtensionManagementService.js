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
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { IExtensionGalleryService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { URI } from 'vs/base/common/uri';
import { Emitter, Event } from 'vs/base/common/event';
import { areSameExtensions, getGalleryExtensionId } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { IWebExtensionsScannerService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { ILogService } from 'vs/platform/log/common/log';
import { AbstractExtensionManagementService, AbstractExtensionTask } from 'vs/platform/extensionManagement/common/abstractExtensionManagementService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IExtensionManifestPropertiesService } from 'vs/workbench/services/extensions/common/extensionManifestPropertiesService';
import { IProductService } from 'vs/platform/product/common/productService';
import { isBoolean, isUndefined } from 'vs/base/common/types';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
import { delta } from 'vs/base/common/arrays';
import { compare } from 'vs/base/common/strings';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { DisposableStore } from 'vs/base/common/lifecycle';
let WebExtensionManagementService = class WebExtensionManagementService extends AbstractExtensionManagementService {
    webExtensionsScannerService;
    extensionManifestPropertiesService;
    userDataProfileService;
    uriIdentityService;
    disposables = this._register(new DisposableStore());
    get onProfileAwareInstallExtension() { return super.onInstallExtension; }
    get onInstallExtension() { return Event.filter(this.onProfileAwareInstallExtension, e => this.filterEvent(e), this.disposables); }
    get onProfileAwareDidInstallExtensions() { return super.onDidInstallExtensions; }
    get onDidInstallExtensions() {
        return Event.filter(Event.map(this.onProfileAwareDidInstallExtensions, results => results.filter(e => this.filterEvent(e)), this.disposables), results => results.length > 0, this.disposables);
    }
    get onProfileAwareUninstallExtension() { return super.onUninstallExtension; }
    get onUninstallExtension() { return Event.filter(this.onProfileAwareUninstallExtension, e => this.filterEvent(e), this.disposables); }
    get onProfileAwareDidUninstallExtension() { return super.onDidUninstallExtension; }
    get onDidUninstallExtension() { return Event.filter(this.onProfileAwareDidUninstallExtension, e => this.filterEvent(e), this.disposables); }
    _onDidChangeProfile = this._register(new Emitter());
    onDidChangeProfile = this._onDidChangeProfile.event;
    constructor(extensionGalleryService, telemetryService, logService, webExtensionsScannerService, extensionManifestPropertiesService, userDataProfileService, productService, userDataProfilesService, uriIdentityService) {
        super(extensionGalleryService, telemetryService, logService, productService, userDataProfilesService);
        this.webExtensionsScannerService = webExtensionsScannerService;
        this.extensionManifestPropertiesService = extensionManifestPropertiesService;
        this.userDataProfileService = userDataProfileService;
        this.uriIdentityService = uriIdentityService;
        this._register(userDataProfileService.onDidChangeCurrentProfile(e => e.join(this.whenProfileChanged(e))));
    }
    filterEvent({ profileLocation, applicationScoped }) {
        profileLocation = profileLocation ?? this.userDataProfileService.currentProfile.extensionsResource;
        return applicationScoped || this.uriIdentityService.extUri.isEqual(this.userDataProfileService.currentProfile.extensionsResource, profileLocation);
    }
    async getTargetPlatform() {
        return "web" /* TargetPlatform.WEB */;
    }
    async canInstall(gallery) {
        if (await super.canInstall(gallery)) {
            return true;
        }
        if (this.isConfiguredToExecuteOnWeb(gallery)) {
            return true;
        }
        return false;
    }
    async getInstalled(type, profileLocation) {
        const extensions = [];
        if (type === undefined || type === 0 /* ExtensionType.System */) {
            const systemExtensions = await this.webExtensionsScannerService.scanSystemExtensions();
            extensions.push(...systemExtensions);
        }
        if (type === undefined || type === 1 /* ExtensionType.User */) {
            const userExtensions = await this.webExtensionsScannerService.scanUserExtensions(profileLocation ?? this.userDataProfileService.currentProfile.extensionsResource);
            extensions.push(...userExtensions);
        }
        return extensions.map(e => toLocalExtension(e));
    }
    async install(location, options = {}) {
        this.logService.trace('ExtensionManagementService#install', location.toString());
        const manifest = await this.webExtensionsScannerService.scanExtensionManifest(location);
        if (!manifest) {
            throw new Error(`Cannot find packageJSON from the location ${location.toString()}`);
        }
        return this.installExtension(manifest, location, options);
    }
    getMetadata(extension) {
        return this.webExtensionsScannerService.scanMetadata(extension.location, this.userDataProfileService.currentProfile.extensionsResource);
    }
    async getCompatibleVersion(extension, sameVersion, includePreRelease) {
        const compatibleExtension = await super.getCompatibleVersion(extension, sameVersion, includePreRelease);
        if (compatibleExtension) {
            return compatibleExtension;
        }
        if (this.isConfiguredToExecuteOnWeb(extension)) {
            return extension;
        }
        return null;
    }
    isConfiguredToExecuteOnWeb(gallery) {
        const configuredExtensionKind = this.extensionManifestPropertiesService.getUserConfiguredExtensionKind(gallery.identifier);
        return !!configuredExtensionKind && configuredExtensionKind.includes('web');
    }
    async updateMetadata(local, metadata) {
        return local;
    }
    getCurrentExtensionsManifestLocation() {
        return this.userDataProfileService.currentProfile.extensionsResource;
    }
    createInstallExtensionTask(manifest, extension, options) {
        return new InstallExtensionTask(manifest, extension, options, this.webExtensionsScannerService);
    }
    createUninstallExtensionTask(extension, options) {
        return new UninstallExtensionTask(extension, options, this.webExtensionsScannerService);
    }
    zip(extension) { throw new Error('unsupported'); }
    unzip(zipLocation) { throw new Error('unsupported'); }
    getManifest(vsix) { throw new Error('unsupported'); }
    updateExtensionScope() { throw new Error('unsupported'); }
    download() { throw new Error('unsupported'); }
    reinstallFromGallery() { throw new Error('unsupported'); }
    async whenProfileChanged(e) {
        const previousProfileLocation = e.previous.extensionsResource;
        const currentProfileLocation = e.profile.extensionsResource;
        if (!previousProfileLocation || !currentProfileLocation) {
            throw new Error('This should not happen');
        }
        if (e.preserveData) {
            await this.webExtensionsScannerService.copyExtensions(previousProfileLocation, currentProfileLocation, e => !e.metadata?.isApplicationScoped);
        }
        else {
            const oldExtensions = await this.webExtensionsScannerService.scanUserExtensions(previousProfileLocation);
            const newExtensions = await this.webExtensionsScannerService.scanUserExtensions(currentProfileLocation);
            const { added, removed } = delta(oldExtensions, newExtensions, (a, b) => compare(`${ExtensionIdentifier.toKey(a.identifier.id)}@${a.manifest.version}`, `${ExtensionIdentifier.toKey(b.identifier.id)}@${b.manifest.version}`));
            if (added.length || removed.length) {
                this._onDidChangeProfile.fire({ added: added.map(e => toLocalExtension(e)), removed: removed.map(e => toLocalExtension(e)) });
            }
        }
    }
};
WebExtensionManagementService = __decorate([
    __param(0, IExtensionGalleryService),
    __param(1, ITelemetryService),
    __param(2, ILogService),
    __param(3, IWebExtensionsScannerService),
    __param(4, IExtensionManifestPropertiesService),
    __param(5, IUserDataProfileService),
    __param(6, IProductService),
    __param(7, IUserDataProfilesService),
    __param(8, IUriIdentityService)
], WebExtensionManagementService);
export { WebExtensionManagementService };
function toLocalExtension(extension) {
    const metadata = getMetadata(undefined, extension);
    return {
        ...extension,
        identifier: { id: extension.identifier.id, uuid: metadata.id ?? extension.identifier.uuid },
        isMachineScoped: !!metadata.isMachineScoped,
        isApplicationScoped: !!metadata.isApplicationScoped,
        publisherId: metadata.publisherId || null,
        publisherDisplayName: metadata.publisherDisplayName || null,
        installedTimestamp: metadata.installedTimestamp,
        isPreReleaseVersion: !!metadata.isPreReleaseVersion,
        preRelease: !!metadata.preRelease,
        targetPlatform: "web" /* TargetPlatform.WEB */,
        updated: !!metadata.updated
    };
}
function getMetadata(options, existingExtension) {
    const metadata = { ...(existingExtension?.metadata || {}) };
    metadata.isMachineScoped = options?.isMachineScoped || metadata.isMachineScoped;
    return metadata;
}
class InstallExtensionTask extends AbstractExtensionTask {
    extension;
    options;
    webExtensionsScannerService;
    identifier;
    source;
    _operation = 2 /* InstallOperation.Install */;
    get operation() { return isUndefined(this.options.operation) ? this._operation : this.options.operation; }
    constructor(manifest, extension, options, webExtensionsScannerService) {
        super();
        this.extension = extension;
        this.options = options;
        this.webExtensionsScannerService = webExtensionsScannerService;
        this.identifier = URI.isUri(extension) ? { id: getGalleryExtensionId(manifest.publisher, manifest.name) } : extension.identifier;
        this.source = extension;
    }
    async doRun(token) {
        const userExtensions = await this.webExtensionsScannerService.scanUserExtensions(this.options.profileLocation);
        const existingExtension = userExtensions.find(e => areSameExtensions(e.identifier, this.identifier));
        if (existingExtension) {
            this._operation = 3 /* InstallOperation.Update */;
        }
        const metadata = getMetadata(this.options, existingExtension);
        if (!URI.isUri(this.extension)) {
            metadata.id = this.extension.identifier.uuid;
            metadata.publisherDisplayName = this.extension.publisherDisplayName;
            metadata.publisherId = this.extension.publisherId;
            metadata.installedTimestamp = Date.now();
            metadata.isPreReleaseVersion = this.extension.properties.isPreReleaseVersion;
            metadata.isBuiltin = this.options.isBuiltin || existingExtension?.isBuiltin;
            metadata.isSystem = existingExtension?.type === 0 /* ExtensionType.System */ ? true : undefined;
            metadata.updated = !!existingExtension;
            metadata.preRelease = this.extension.properties.isPreReleaseVersion ||
                (isBoolean(this.options.installPreReleaseVersion)
                    ? this.options.installPreReleaseVersion /* Respect the passed flag */
                    : metadata?.preRelease /* Respect the existing pre-release flag if it was set */);
        }
        const scannedExtension = URI.isUri(this.extension) ? await this.webExtensionsScannerService.addExtension(this.extension, metadata, this.options.profileLocation)
            : await this.webExtensionsScannerService.addExtensionFromGallery(this.extension, metadata, this.options.profileLocation);
        return { local: toLocalExtension(scannedExtension), metadata };
    }
}
class UninstallExtensionTask extends AbstractExtensionTask {
    extension;
    options;
    webExtensionsScannerService;
    constructor(extension, options, webExtensionsScannerService) {
        super();
        this.extension = extension;
        this.options = options;
        this.webExtensionsScannerService = webExtensionsScannerService;
    }
    doRun(token) {
        return this.webExtensionsScannerService.removeExtension(this.extension, this.options.profileLocation);
    }
}
