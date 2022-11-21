/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { combinedDisposable, Disposable, DisposableMap } from 'vs/base/common/lifecycle';
import { ResourceSet } from 'vs/base/common/map';
import { getIdAndVersion } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
export class ExtensionsWatcher extends Disposable {
    extensionManagementService;
    userDataProfilesService;
    extensionsProfileScannerService;
    uriIdentityService;
    fileService;
    logService;
    _onDidChangeExtensionsByAnotherSource = this._register(new Emitter());
    onDidChangeExtensionsByAnotherSource = this._onDidChangeExtensionsByAnotherSource.event;
    allExtensions = new Map;
    extensionsProfileWatchDisposables = this._register(new DisposableMap());
    constructor(extensionManagementService, userDataProfilesService, extensionsProfileScannerService, uriIdentityService, fileService, logService) {
        super();
        this.extensionManagementService = extensionManagementService;
        this.userDataProfilesService = userDataProfilesService;
        this.extensionsProfileScannerService = extensionsProfileScannerService;
        this.uriIdentityService = uriIdentityService;
        this.fileService = fileService;
        this.logService = logService;
        this.initialize().then(null, error => logService.error(error));
    }
    async initialize() {
        await this.extensionManagementService.migrateDefaultProfileExtensions();
        await this.onDidChangeProfiles(this.userDataProfilesService.profiles, []);
        this.registerListeners();
        await this.uninstallExtensionsNotInProfiles();
    }
    registerListeners() {
        this._register(this.userDataProfilesService.onDidChangeProfiles(e => this.onDidChangeProfiles(e.added, e.removed)));
        this._register(this.extensionsProfileScannerService.onAddExtensions(e => this.onAddExtensions(e)));
        this._register(this.extensionsProfileScannerService.onDidAddExtensions(e => this.onDidAddExtensions(e)));
        this._register(this.extensionsProfileScannerService.onRemoveExtensions(e => this.onRemoveExtensions(e)));
        this._register(this.extensionsProfileScannerService.onDidRemoveExtensions(e => this.onDidRemoveExtensions(e)));
        this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
    }
    async onDidChangeProfiles(added, removed) {
        try {
            await Promise.all(removed.map(profile => {
                this.extensionsProfileWatchDisposables.deleteAndDispose(profile.id);
                return this.removeExtensionsFromProfile(profile.extensionsResource);
            }));
        }
        catch (error) {
            this.logService.error(error);
        }
        try {
            if (added.length) {
                await Promise.all(added.map(profile => {
                    this.extensionsProfileWatchDisposables.set(profile.id, combinedDisposable(this.fileService.watch(this.uriIdentityService.extUri.dirname(profile.extensionsResource)), 
                    // Also listen to the resource incase the resource is a symlink - https://github.com/microsoft/vscode/issues/118134
                    this.fileService.watch(profile.extensionsResource)));
                    return this.populateExtensionsFromProfile(profile.extensionsResource);
                }));
            }
        }
        catch (error) {
            this.logService.error(error);
        }
    }
    async onAddExtensions(e) {
        for (const extension of e.extensions) {
            this.addExtensionWithKey(this.getKey(extension.identifier, extension.version), e.profileLocation);
        }
    }
    async onDidAddExtensions(e) {
        for (const extension of e.extensions) {
            const key = this.getKey(extension.identifier, extension.version);
            if (e.error) {
                this.removeExtensionWithKey(key, e.profileLocation);
            }
            else {
                this.addExtensionWithKey(key, e.profileLocation);
            }
        }
    }
    async onRemoveExtensions(e) {
        for (const extension of e.extensions) {
            this.removeExtensionWithKey(this.getKey(extension.identifier, extension.version), e.profileLocation);
        }
    }
    async onDidRemoveExtensions(e) {
        let hasToUninstallExtensions = false;
        for (const extension of e.extensions) {
            const key = this.getKey(extension.identifier, extension.version);
            if (e.error) {
                this.addExtensionWithKey(key, e.profileLocation);
            }
            else {
                this.removeExtensionWithKey(key, e.profileLocation);
                hasToUninstallExtensions = hasToUninstallExtensions || !this.allExtensions.has(key);
            }
        }
        if (hasToUninstallExtensions) {
            await this.uninstallExtensionsNotInProfiles();
        }
    }
    onDidFilesChange(e) {
        for (const profile of this.userDataProfilesService.profiles) {
            if (e.contains(profile.extensionsResource, 0 /* FileChangeType.UPDATED */, 1 /* FileChangeType.ADDED */)) {
                this.onDidExtensionsProfileChange(profile.extensionsResource);
            }
        }
    }
    async onDidExtensionsProfileChange(profileLocation) {
        const added = [], removed = [];
        const extensions = await this.extensionsProfileScannerService.scanProfileExtensions(profileLocation);
        const extensionKeys = new Set();
        const cached = new Set();
        for (const [key, profiles] of this.allExtensions) {
            if (profiles.has(profileLocation)) {
                cached.add(key);
            }
        }
        for (const extension of extensions) {
            const key = this.getKey(extension.identifier, extension.version);
            extensionKeys.add(key);
            if (!cached.has(key)) {
                added.push(extension.identifier);
                this.addExtensionWithKey(key, profileLocation);
            }
        }
        for (const key of cached) {
            if (!extensionKeys.has(key)) {
                const extension = this.fromKey(key);
                if (extension) {
                    removed.push(extension.identifier);
                    this.removeExtensionWithKey(key, profileLocation);
                }
            }
        }
        if (added.length || removed.length) {
            this._onDidChangeExtensionsByAnotherSource.fire({ added: added.length ? { extensions: added, profileLocation } : undefined, removed: removed.length ? { extensions: removed, profileLocation } : undefined });
        }
    }
    async populateExtensionsFromProfile(extensionsProfileLocation) {
        const extensions = await this.extensionsProfileScannerService.scanProfileExtensions(extensionsProfileLocation);
        for (const extension of extensions) {
            this.addExtensionWithKey(this.getKey(extension.identifier, extension.version), extensionsProfileLocation);
        }
    }
    async removeExtensionsFromProfile(removedProfile) {
        for (const key of [...this.allExtensions.keys()]) {
            this.removeExtensionWithKey(key, removedProfile);
        }
        await this.uninstallExtensionsNotInProfiles();
    }
    async uninstallExtensionsNotInProfiles() {
        const installed = await this.extensionManagementService.getAllUserInstalled();
        const toUninstall = installed.filter(installedExtension => !this.allExtensions.has(this.getKey(installedExtension.identifier, installedExtension.manifest.version)));
        if (toUninstall.length) {
            await this.extensionManagementService.markAsUninstalled(...toUninstall);
        }
    }
    addExtensionWithKey(key, extensionsProfileLocation) {
        let profiles = this.allExtensions.get(key);
        if (!profiles) {
            this.allExtensions.set(key, profiles = new ResourceSet((uri) => this.uriIdentityService.extUri.getComparisonKey(uri)));
        }
        profiles.add(extensionsProfileLocation);
    }
    removeExtensionWithKey(key, profileLocation) {
        const profiles = this.allExtensions.get(key);
        if (profiles) {
            profiles.delete(profileLocation);
        }
        if (!profiles?.size) {
            this.allExtensions.delete(key);
        }
    }
    getKey(identifier, version) {
        return `${ExtensionIdentifier.toKey(identifier.id)}@${version}`;
    }
    fromKey(key) {
        const [id, version] = getIdAndVersion(key);
        return version ? { identifier: { id }, version } : undefined;
    }
}
