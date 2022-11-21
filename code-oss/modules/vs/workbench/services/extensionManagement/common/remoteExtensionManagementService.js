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
import { ExtensionManagementChannelClient } from 'vs/platform/extensionManagement/common/extensionManagementIpc';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
let RemoteExtensionManagementService = class RemoteExtensionManagementService extends ExtensionManagementChannelClient {
    userDataProfileService;
    uriIdentityService;
    onDidChangeProfile = Event.None;
    get onProfileAwareInstallExtension() { return super.onInstallExtension; }
    get onProfileAwareDidInstallExtensions() { return super.onDidInstallExtensions; }
    get onProfileAwareUninstallExtension() { return super.onUninstallExtension; }
    get onProfileAwareDidUninstallExtension() { return super.onDidUninstallExtension; }
    constructor(channel, userDataProfileService, uriIdentityService) {
        super(channel);
        this.userDataProfileService = userDataProfileService;
        this.uriIdentityService = uriIdentityService;
    }
    getInstalled(type = null, profileLocation) {
        this.validateProfileLocation({ profileLocation });
        return super.getInstalled(type);
    }
    uninstall(extension, options) {
        options = this.validateProfileLocation(options);
        return super.uninstall(extension, options);
    }
    async install(vsix, options) {
        options = this.validateProfileLocation(options);
        return super.install(vsix, options);
    }
    async installFromGallery(extension, options) {
        options = this.validateProfileLocation(options);
        return super.installFromGallery(extension, options);
    }
    validateProfileLocation(options) {
        if (options?.profileLocation) {
            if (!this.uriIdentityService.extUri.isEqual(options?.profileLocation, this.userDataProfileService.defaultProfile.extensionsResource)) {
                throw new Error('This opertaion is not supported in remote scenario');
            }
            options = { ...options, profileLocation: undefined };
        }
        return options;
    }
};
RemoteExtensionManagementService = __decorate([
    __param(1, IUserDataProfilesService),
    __param(2, IUriIdentityService)
], RemoteExtensionManagementService);
export { RemoteExtensionManagementService };
