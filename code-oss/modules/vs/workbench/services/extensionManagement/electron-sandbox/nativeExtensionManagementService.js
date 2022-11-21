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
import { ExtensionManagementChannelClient } from 'vs/platform/extensionManagement/common/extensionManagementIpc';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { Emitter, Event } from 'vs/base/common/event';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { delta } from 'vs/base/common/arrays';
import { compare } from 'vs/base/common/strings';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
import { joinPath } from 'vs/base/common/resources';
import { IExtensionsProfileScannerService } from 'vs/platform/extensionManagement/common/extensionsProfileScannerService';
import { Schemas } from 'vs/base/common/network';
import { ILogService } from 'vs/platform/log/common/log';
import { IDownloadService } from 'vs/platform/download/common/download';
import { IFileService } from 'vs/platform/files/common/files';
import { generateUuid } from 'vs/base/common/uuid';
import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
let NativeExtensionManagementService = class NativeExtensionManagementService extends ExtensionManagementChannelClient {
    userDataProfileService;
    extensionsProfileScannerService;
    uriIdentityService;
    fileService;
    downloadService;
    nativeEnvironmentService;
    logService;
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
    constructor(channel, userDataProfileService, extensionsProfileScannerService, uriIdentityService, fileService, downloadService, nativeEnvironmentService, logService) {
        super(channel);
        this.userDataProfileService = userDataProfileService;
        this.extensionsProfileScannerService = extensionsProfileScannerService;
        this.uriIdentityService = uriIdentityService;
        this.fileService = fileService;
        this.downloadService = downloadService;
        this.nativeEnvironmentService = nativeEnvironmentService;
        this.logService = logService;
        this._register(userDataProfileService.onDidChangeCurrentProfile(e => e.join(this.whenProfileChanged(e))));
    }
    filterEvent({ profileLocation, applicationScoped }) {
        return applicationScoped || this.uriIdentityService.extUri.isEqual(this.userDataProfileService.currentProfile.extensionsResource, profileLocation);
    }
    async install(vsix, options) {
        const { location, cleanup } = await this.downloadVsix(vsix);
        try {
            options = options?.profileLocation ? options : { ...options, profileLocation: this.userDataProfileService.currentProfile.extensionsResource };
            return await super.install(location, options);
        }
        finally {
            await cleanup();
        }
    }
    installFromGallery(extension, installOptions) {
        installOptions = installOptions?.profileLocation ? installOptions : { ...installOptions, profileLocation: this.userDataProfileService.currentProfile.extensionsResource };
        return super.installFromGallery(extension, installOptions);
    }
    uninstall(extension, options) {
        options = options?.profileLocation ? options : { ...options, profileLocation: this.userDataProfileService.currentProfile.extensionsResource };
        return super.uninstall(extension, options);
    }
    getInstalled(type = null, profileLocation = this.userDataProfileService.currentProfile.extensionsResource) {
        return super.getInstalled(type, profileLocation);
    }
    async downloadVsix(vsix) {
        if (vsix.scheme === Schemas.file) {
            return { location: vsix, async cleanup() { } };
        }
        this.logService.trace('Downloading extension from', vsix.toString());
        const location = joinPath(this.nativeEnvironmentService.extensionsDownloadLocation, generateUuid());
        await this.downloadService.download(vsix, location);
        this.logService.info('Downloaded extension to', location.toString());
        const cleanup = async () => {
            try {
                await this.fileService.del(location);
            }
            catch (error) {
                this.logService.error(error);
            }
        };
        return { location, cleanup };
    }
    async whenProfileChanged(e) {
        const oldExtensions = await super.getInstalled(1 /* ExtensionType.User */, e.previous.extensionsResource);
        if (e.preserveData) {
            const extensions = await Promise.all(oldExtensions
                .filter(e => !e.isApplicationScoped) /* remove application scoped extensions */
                .map(async (e) => ([e, await this.getMetadata(e)])));
            await this.extensionsProfileScannerService.addExtensionsToProfile(extensions, e.profile.extensionsResource);
        }
        else {
            const newExtensions = await this.getInstalled(1 /* ExtensionType.User */);
            const { added, removed } = delta(oldExtensions, newExtensions, (a, b) => compare(`${ExtensionIdentifier.toKey(a.identifier.id)}@${a.manifest.version}`, `${ExtensionIdentifier.toKey(b.identifier.id)}@${b.manifest.version}`));
            if (added.length || removed.length) {
                this._onDidChangeProfile.fire({ added, removed });
            }
        }
    }
};
NativeExtensionManagementService = __decorate([
    __param(1, IUserDataProfileService),
    __param(2, IExtensionsProfileScannerService),
    __param(3, IUriIdentityService),
    __param(4, IFileService),
    __param(5, IDownloadService),
    __param(6, INativeEnvironmentService),
    __param(7, ILogService)
], NativeExtensionManagementService);
export { NativeExtensionManagementService };
