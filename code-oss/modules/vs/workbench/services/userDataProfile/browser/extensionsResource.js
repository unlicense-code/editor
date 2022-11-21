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
import { DisposableStore } from 'vs/base/common/lifecycle';
import { localize } from 'vs/nls';
import { GlobalExtensionEnablementService } from 'vs/platform/extensionManagement/common/extensionEnablementService';
import { IExtensionGalleryService, IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { areSameExtensions } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { ILogService } from 'vs/platform/log/common/log';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IUserDataProfileStorageService } from 'vs/platform/userDataProfile/common/userDataProfileStorageService';
import { TreeItemCollapsibleState } from 'vs/workbench/common/views';
let ExtensionsResource = class ExtensionsResource {
    extensionManagementService;
    extensionGalleryService;
    userDataProfileStorageService;
    instantiationService;
    logService;
    constructor(extensionManagementService, extensionGalleryService, userDataProfileStorageService, instantiationService, logService) {
        this.extensionManagementService = extensionManagementService;
        this.extensionGalleryService = extensionGalleryService;
        this.userDataProfileStorageService = userDataProfileStorageService;
        this.instantiationService = instantiationService;
        this.logService = logService;
    }
    async getContent(profile, exclude) {
        const extensions = await this.getLocalExtensions(profile);
        return JSON.stringify(exclude?.length ? extensions.filter(e => !exclude.includes(e.identifier.id.toLowerCase())) : extensions);
    }
    async apply(content, profile) {
        return this.withProfileScopedServices(profile, async (extensionEnablementService) => {
            const profileExtensions = await this.getProfileExtensions(content);
            const installedExtensions = await this.extensionManagementService.getInstalled(undefined, profile.extensionsResource);
            const extensionsToEnableOrDisable = [];
            const extensionsToInstall = [];
            for (const e of profileExtensions) {
                const isDisabled = extensionEnablementService.getDisabledExtensions().some(disabledExtension => areSameExtensions(disabledExtension, e.identifier));
                const installedExtension = installedExtensions.find(installed => areSameExtensions(installed.identifier, e.identifier));
                if (!installedExtension || installedExtension.preRelease !== e.preRelease) {
                    extensionsToInstall.push(e);
                }
                if (installedExtension && isDisabled !== !!e.disabled) {
                    extensionsToEnableOrDisable.push({ extension: installedExtension, enable: !!e.disabled });
                }
            }
            const extensionsToUninstall = installedExtensions.filter(extension => extension.type === 1 /* ExtensionType.User */ && !profileExtensions.some(({ identifier }) => areSameExtensions(identifier, extension.identifier)));
            for (const { extension, enable } of extensionsToEnableOrDisable) {
                if (enable) {
                    await extensionEnablementService.enableExtension(extension.identifier);
                }
                else {
                    await extensionEnablementService.disableExtension(extension.identifier);
                }
            }
            if (extensionsToInstall.length) {
                const galleryExtensions = await this.extensionGalleryService.getExtensions(extensionsToInstall.map(e => ({ ...e.identifier, hasPreRelease: e.preRelease })), CancellationToken.None);
                await Promise.all(extensionsToInstall.map(async (e) => {
                    const extension = galleryExtensions.find(galleryExtension => areSameExtensions(galleryExtension.identifier, e.identifier));
                    if (!extension) {
                        return;
                    }
                    if (await this.extensionManagementService.canInstall(extension)) {
                        await this.extensionManagementService.installFromGallery(extension, { isMachineScoped: false, donotIncludePackAndDependencies: true, installPreReleaseVersion: e.preRelease, profileLocation: profile.extensionsResource } /* set isMachineScoped value to prevent install and sync dialog in web */);
                    }
                    else {
                        this.logService.info(`Profile: Skipped installing extension because it cannot be installed.`, extension.displayName || extension.identifier.id);
                    }
                }));
            }
            if (extensionsToUninstall.length) {
                await Promise.all(extensionsToUninstall.map(e => this.extensionManagementService.uninstall(e)));
            }
        });
    }
    async getLocalExtensions(profile) {
        return this.withProfileScopedServices(profile, async (extensionEnablementService) => {
            const result = [];
            const installedExtensions = await this.extensionManagementService.getInstalled(undefined, profile.extensionsResource);
            const disabledExtensions = extensionEnablementService.getDisabledExtensions();
            for (const extension of installedExtensions) {
                const { identifier, preRelease } = extension;
                const disabled = disabledExtensions.some(disabledExtension => areSameExtensions(disabledExtension, identifier));
                if (extension.type === 0 /* ExtensionType.System */ && !disabled) {
                    // skip enabled system extensions
                    continue;
                }
                if (extension.type === 1 /* ExtensionType.User */) {
                    if (!extension.identifier.uuid) {
                        // skip user extensions without uuid
                        continue;
                    }
                    if (disabled && !extension.isBuiltin) {
                        // skip user disabled extensions
                        continue;
                    }
                }
                const profileExtension = { identifier, displayName: extension.manifest.displayName };
                if (disabled) {
                    profileExtension.disabled = true;
                }
                if (preRelease) {
                    profileExtension.preRelease = true;
                }
                result.push(profileExtension);
            }
            return result;
        });
    }
    async getProfileExtensions(content) {
        return JSON.parse(content);
    }
    async withProfileScopedServices(profile, fn) {
        return this.userDataProfileStorageService.withProfileScopedStorageService(profile, async (storageService) => {
            const disposables = new DisposableStore();
            const instantiationService = this.instantiationService.createChild(new ServiceCollection([IStorageService, storageService]));
            const extensionEnablementService = disposables.add(instantiationService.createInstance(GlobalExtensionEnablementService));
            try {
                return await fn(extensionEnablementService);
            }
            finally {
                disposables.dispose();
            }
        });
    }
};
ExtensionsResource = __decorate([
    __param(0, IExtensionManagementService),
    __param(1, IExtensionGalleryService),
    __param(2, IUserDataProfileStorageService),
    __param(3, IInstantiationService),
    __param(4, ILogService)
], ExtensionsResource);
export { ExtensionsResource };
let ExtensionsResourceExportTreeItem = class ExtensionsResourceExportTreeItem {
    profile;
    instantiationService;
    handle = this.profile.extensionsResource.toString();
    label = { label: localize('extensions', "Extensions") };
    collapsibleState = TreeItemCollapsibleState.Expanded;
    checkbox = { isChecked: true };
    excludedExtensions = new Set();
    constructor(profile, instantiationService) {
        this.profile = profile;
        this.instantiationService = instantiationService;
    }
    async getChildren() {
        const extensions = await this.instantiationService.createInstance(ExtensionsResource).getLocalExtensions(this.profile);
        const that = this;
        return extensions.map(e => ({
            handle: e.identifier.id.toLowerCase(),
            parent: this,
            label: { label: e.displayName || e.identifier.id },
            description: e.disabled ? localize('disabled', "Disabled") : undefined,
            collapsibleState: TreeItemCollapsibleState.None,
            checkbox: {
                get isChecked() { return !that.excludedExtensions.has(e.identifier.id.toLowerCase()); },
                set isChecked(value) {
                    if (value) {
                        that.excludedExtensions.delete(e.identifier.id.toLowerCase());
                    }
                    else {
                        that.excludedExtensions.add(e.identifier.id.toLowerCase());
                    }
                }
            },
            command: {
                id: 'extension.open',
                title: '',
                arguments: [e.identifier.id]
            }
        }));
    }
    async hasContent() {
        const extensions = await this.instantiationService.createInstance(ExtensionsResource).getLocalExtensions(this.profile);
        return extensions.length > 0;
    }
    async getContent() {
        return this.instantiationService.createInstance(ExtensionsResource).getContent(this.profile, [...this.excludedExtensions.values()]);
    }
};
ExtensionsResourceExportTreeItem = __decorate([
    __param(1, IInstantiationService)
], ExtensionsResourceExportTreeItem);
export { ExtensionsResourceExportTreeItem };
let ExtensionsResourceImportTreeItem = class ExtensionsResourceImportTreeItem {
    content;
    instantiationService;
    handle = 'extensions';
    label = { label: localize('extensions', "Extensions") };
    collapsibleState = TreeItemCollapsibleState.Expanded;
    constructor(content, instantiationService) {
        this.content = content;
        this.instantiationService = instantiationService;
    }
    async getChildren() {
        const extensions = await this.instantiationService.createInstance(ExtensionsResource).getProfileExtensions(this.content);
        return extensions.map(e => ({
            handle: e.identifier.id.toLowerCase(),
            parent: this,
            label: { label: e.displayName || e.identifier.id },
            description: e.disabled ? localize('disabled', "Disabled") : undefined,
            collapsibleState: TreeItemCollapsibleState.None,
            command: {
                id: 'extension.open',
                title: '',
                arguments: [e.identifier.id]
            }
        }));
    }
};
ExtensionsResourceImportTreeItem = __decorate([
    __param(1, IInstantiationService)
], ExtensionsResourceImportTreeItem);
export { ExtensionsResourceImportTreeItem };
