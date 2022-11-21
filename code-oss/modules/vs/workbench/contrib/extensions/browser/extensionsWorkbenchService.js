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
import * as nls from 'vs/nls';
import * as semver from 'vs/base/common/semver/semver';
import { Event, Emitter } from 'vs/base/common/event';
import { index, distinct } from 'vs/base/common/arrays';
import { Promises, ThrottledDelayer } from 'vs/base/common/async';
import { CancellationError, isCancellationError } from 'vs/base/common/errors';
import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import { singlePagePager } from 'vs/base/common/paging';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IExtensionGalleryService, WEB_EXTENSION_TAG } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IWorkbenchExtensionEnablementService, IExtensionManagementServerService, IWorkbenchExtensionManagementService, DefaultIconPath } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { getGalleryExtensionTelemetryData, getLocalExtensionTelemetryData, areSameExtensions, groupByExtension, ExtensionKey, getGalleryExtensionId } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { URI } from 'vs/base/common/uri';
import { AutoUpdateConfigurationKey, AutoCheckUpdatesConfigurationKey, HasOutdatedExtensionsContext } from 'vs/workbench/contrib/extensions/common/extensions';
import { IEditorService, SIDE_GROUP, ACTIVE_GROUP } from 'vs/workbench/services/editor/common/editorService';
import { IURLService } from 'vs/platform/url/common/url';
import { ExtensionsInput } from 'vs/workbench/contrib/extensions/common/extensionsInput';
import { ILogService } from 'vs/platform/log/common/log';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import * as resources from 'vs/base/common/resources';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IFileService } from 'vs/platform/files/common/files';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IProductService } from 'vs/platform/product/common/productService';
import { FileAccess } from 'vs/base/common/network';
import { IIgnoredExtensionsManagementService } from 'vs/platform/userDataSync/common/ignoredExtensions';
import { IUserDataAutoSyncService } from 'vs/platform/userDataSync/common/userDataSync';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { isBoolean, isUndefined } from 'vs/base/common/types';
import { IExtensionManifestPropertiesService } from 'vs/workbench/services/extensions/common/extensionManifestPropertiesService';
import { IExtensionService, toExtension, toExtensionDescription } from 'vs/workbench/services/extensions/common/extensions';
import { ExtensionEditor } from 'vs/workbench/contrib/extensions/browser/extensionEditor';
import { isWeb, language } from 'vs/base/common/platform';
import { ILanguagePackService } from 'vs/platform/languagePacks/common/languagePacks';
import { ILocaleService } from 'vs/workbench/contrib/localization/common/locale';
let Extension = class Extension {
    stateProvider;
    runtimeStateProvider;
    server;
    local;
    gallery;
    galleryService;
    telemetryService;
    logService;
    fileService;
    productService;
    enablementState = 8 /* EnablementState.EnabledGlobally */;
    constructor(stateProvider, runtimeStateProvider, server, local, gallery, galleryService, telemetryService, logService, fileService, productService) {
        this.stateProvider = stateProvider;
        this.runtimeStateProvider = runtimeStateProvider;
        this.server = server;
        this.local = local;
        this.gallery = gallery;
        this.galleryService = galleryService;
        this.telemetryService = telemetryService;
        this.logService = logService;
        this.fileService = fileService;
        this.productService = productService;
    }
    get type() {
        return this.local ? this.local.type : 1 /* ExtensionType.User */;
    }
    get isBuiltin() {
        return this.local ? this.local.isBuiltin : false;
    }
    get name() {
        return this.gallery ? this.gallery.name : this.local.manifest.name;
    }
    get displayName() {
        if (this.gallery) {
            return this.gallery.displayName || this.gallery.name;
        }
        return this.local.manifest.displayName || this.local.manifest.name;
    }
    get identifier() {
        if (this.gallery) {
            return this.gallery.identifier;
        }
        return this.local.identifier;
    }
    get uuid() {
        return this.gallery ? this.gallery.identifier.uuid : this.local.identifier.uuid;
    }
    get publisher() {
        return this.gallery ? this.gallery.publisher : this.local.manifest.publisher;
    }
    get publisherDisplayName() {
        if (this.gallery) {
            return this.gallery.publisherDisplayName || this.gallery.publisher;
        }
        if (this.local?.publisherDisplayName) {
            return this.local.publisherDisplayName;
        }
        return this.local.manifest.publisher;
    }
    get publisherUrl() {
        if (!this.productService.extensionsGallery || !this.gallery) {
            return undefined;
        }
        return resources.joinPath(URI.parse(this.productService.extensionsGallery.publisherUrl), this.publisher);
    }
    get publisherDomain() {
        return this.gallery?.publisherDomain;
    }
    get publisherSponsorLink() {
        return this.gallery?.publisherSponsorLink ? URI.parse(this.gallery.publisherSponsorLink) : undefined;
    }
    get version() {
        return this.local ? this.local.manifest.version : this.latestVersion;
    }
    get latestVersion() {
        return this.gallery ? this.gallery.version : this.local.manifest.version;
    }
    get description() {
        return this.gallery ? this.gallery.description : this.local.manifest.description || '';
    }
    get url() {
        if (!this.productService.extensionsGallery || !this.gallery) {
            return undefined;
        }
        return `${this.productService.extensionsGallery.itemUrl}?itemName=${this.publisher}.${this.name}`;
    }
    get iconUrl() {
        return this.galleryIconUrl || this.localIconUrl || this.defaultIconUrl;
    }
    get iconUrlFallback() {
        return this.galleryIconUrlFallback || this.localIconUrl || this.defaultIconUrl;
    }
    get localIconUrl() {
        if (this.local && this.local.manifest.icon) {
            return FileAccess.uriToBrowserUri(resources.joinPath(this.local.location, this.local.manifest.icon)).toString(true);
        }
        return null;
    }
    get galleryIconUrl() {
        return this.gallery?.assets.icon ? this.gallery.assets.icon.uri : null;
    }
    get galleryIconUrlFallback() {
        return this.gallery?.assets.icon ? this.gallery.assets.icon.fallbackUri : null;
    }
    get defaultIconUrl() {
        if (this.type === 0 /* ExtensionType.System */ && this.local) {
            if (this.local.manifest && this.local.manifest.contributes) {
                if (Array.isArray(this.local.manifest.contributes.themes) && this.local.manifest.contributes.themes.length) {
                    return FileAccess.asBrowserUri('vs/workbench/contrib/extensions/browser/media/theme-icon.png').toString(true);
                }
                if (Array.isArray(this.local.manifest.contributes.grammars) && this.local.manifest.contributes.grammars.length) {
                    return FileAccess.asBrowserUri('vs/workbench/contrib/extensions/browser/media/language-icon.svg').toString(true);
                }
            }
        }
        return DefaultIconPath;
    }
    get repository() {
        return this.gallery && this.gallery.assets.repository ? this.gallery.assets.repository.uri : undefined;
    }
    get licenseUrl() {
        return this.gallery && this.gallery.assets.license ? this.gallery.assets.license.uri : undefined;
    }
    get state() {
        return this.stateProvider(this);
    }
    isMalicious = false;
    deprecationInfo;
    get installCount() {
        return this.gallery ? this.gallery.installCount : undefined;
    }
    get rating() {
        return this.gallery ? this.gallery.rating : undefined;
    }
    get ratingCount() {
        return this.gallery ? this.gallery.ratingCount : undefined;
    }
    get outdated() {
        try {
            if (!this.gallery || !this.local) {
                return false;
            }
            // Do not allow updating system extensions in stable
            if (this.type === 0 /* ExtensionType.System */ && this.productService.quality === 'stable') {
                return false;
            }
            if (!this.local.preRelease && this.gallery.properties.isPreReleaseVersion) {
                return false;
            }
            if (semver.gt(this.latestVersion, this.version)) {
                return true;
            }
            if (this.outdatedTargetPlatform) {
                return true;
            }
        }
        catch (error) {
            /* Ignore */
        }
        return false;
    }
    get outdatedTargetPlatform() {
        return !!this.local && !!this.gallery
            && !["undefined" /* TargetPlatform.UNDEFINED */, "web" /* TargetPlatform.WEB */].includes(this.local.targetPlatform)
            && this.gallery.properties.targetPlatform !== "web" /* TargetPlatform.WEB */
            && this.local.targetPlatform !== this.gallery.properties.targetPlatform
            && semver.eq(this.latestVersion, this.version);
    }
    get reloadRequiredStatus() {
        return this.runtimeStateProvider(this);
    }
    get telemetryData() {
        const { local, gallery } = this;
        if (gallery) {
            return getGalleryExtensionTelemetryData(gallery);
        }
        else {
            return getLocalExtensionTelemetryData(local);
        }
    }
    get preview() {
        return this.local?.manifest.preview ?? this.gallery?.preview ?? false;
    }
    get hasPreReleaseVersion() {
        return !!this.gallery?.hasPreReleaseVersion;
    }
    get hasReleaseVersion() {
        return !!this.gallery?.hasReleaseVersion;
    }
    getLocal() {
        return this.local && !this.outdated ? this.local : undefined;
    }
    async getManifest(token) {
        const local = this.getLocal();
        if (local) {
            return local.manifest;
        }
        if (this.gallery) {
            if (this.gallery.assets.manifest) {
                return this.galleryService.getManifest(this.gallery, token);
            }
            this.logService.error(nls.localize('Manifest is not found', "Manifest is not found"), this.identifier.id);
            return null;
        }
        return null;
    }
    hasReadme() {
        if (this.local && this.local.readmeUrl) {
            return true;
        }
        if (this.gallery && this.gallery.assets.readme) {
            return true;
        }
        return this.type === 0 /* ExtensionType.System */;
    }
    async getReadme(token) {
        const local = this.getLocal();
        if (local?.readmeUrl) {
            const content = await this.fileService.readFile(local.readmeUrl);
            return content.value.toString();
        }
        if (this.gallery) {
            if (this.gallery.assets.readme) {
                return this.galleryService.getReadme(this.gallery, token);
            }
            this.telemetryService.publicLog('extensions:NotFoundReadMe', this.telemetryData);
        }
        if (this.type === 0 /* ExtensionType.System */) {
            return Promise.resolve(`# ${this.displayName || this.name}
**Notice:** This extension is bundled with Visual Studio Code. It can be disabled but not uninstalled.
## Features
${this.description}
`);
        }
        return Promise.reject(new Error('not available'));
    }
    hasChangelog() {
        if (this.local && this.local.changelogUrl) {
            return true;
        }
        if (this.gallery && this.gallery.assets.changelog) {
            return true;
        }
        return this.type === 0 /* ExtensionType.System */;
    }
    async getChangelog(token) {
        const local = this.getLocal();
        if (local?.changelogUrl) {
            const content = await this.fileService.readFile(local.changelogUrl);
            return content.value.toString();
        }
        if (this.gallery?.assets.changelog) {
            return this.galleryService.getChangelog(this.gallery, token);
        }
        if (this.type === 0 /* ExtensionType.System */) {
            return Promise.resolve('Please check the [VS Code Release Notes](command:update.showCurrentReleaseNotes) for changes to the built-in extensions.');
        }
        return Promise.reject(new Error('not available'));
    }
    get categories() {
        const { local, gallery } = this;
        if (local && local.manifest.categories && !this.outdated) {
            return local.manifest.categories;
        }
        if (gallery) {
            return gallery.categories;
        }
        return [];
    }
    get tags() {
        const { gallery } = this;
        if (gallery) {
            return gallery.tags.filter(tag => !tag.startsWith('_'));
        }
        return [];
    }
    get dependencies() {
        const { local, gallery } = this;
        if (local && local.manifest.extensionDependencies && !this.outdated) {
            return local.manifest.extensionDependencies;
        }
        if (gallery) {
            return gallery.properties.dependencies || [];
        }
        return [];
    }
    get extensionPack() {
        const { local, gallery } = this;
        if (local && local.manifest.extensionPack && !this.outdated) {
            return local.manifest.extensionPack;
        }
        if (gallery) {
            return gallery.properties.extensionPack || [];
        }
        return [];
    }
};
Extension = __decorate([
    __param(5, IExtensionGalleryService),
    __param(6, ITelemetryService),
    __param(7, ILogService),
    __param(8, IFileService),
    __param(9, IProductService)
], Extension);
export { Extension };
let Extensions = class Extensions extends Disposable {
    server;
    stateProvider;
    runtimeStateProvider;
    galleryService;
    extensionEnablementService;
    instantiationService;
    static updateExtensionFromControlManifest(extension, extensionsControlManifest) {
        extension.isMalicious = extensionsControlManifest.malicious.some(identifier => areSameExtensions(extension.identifier, identifier));
        extension.deprecationInfo = extensionsControlManifest.deprecated ? extensionsControlManifest.deprecated[extension.identifier.id.toLowerCase()] : undefined;
    }
    _onChange = this._register(new Emitter());
    get onChange() { return this._onChange.event; }
    _onReset = this._register(new Emitter());
    get onReset() { return this._onReset.event; }
    installing = [];
    uninstalling = [];
    installed = [];
    constructor(server, stateProvider, runtimeStateProvider, galleryService, extensionEnablementService, instantiationService) {
        super();
        this.server = server;
        this.stateProvider = stateProvider;
        this.runtimeStateProvider = runtimeStateProvider;
        this.galleryService = galleryService;
        this.extensionEnablementService = extensionEnablementService;
        this.instantiationService = instantiationService;
        this._register(server.extensionManagementService.onInstallExtension(e => this.onInstallExtension(e)));
        this._register(server.extensionManagementService.onDidInstallExtensions(e => this.onDidInstallExtensions(e)));
        this._register(server.extensionManagementService.onUninstallExtension(e => this.onUninstallExtension(e.identifier)));
        this._register(server.extensionManagementService.onDidUninstallExtension(e => this.onDidUninstallExtension(e)));
        this._register(server.extensionManagementService.onDidChangeProfile(e => this.onDidChangeProfile(e.added, e.removed)));
        this._register(extensionEnablementService.onEnablementChanged(e => this.onEnablementChanged(e)));
    }
    get local() {
        const installing = this.installing
            .filter(e => !this.installed.some(installed => areSameExtensions(installed.identifier, e.identifier)))
            .map(e => e);
        return [...this.installed, ...installing];
    }
    async queryInstalled() {
        const extensionsControlManifest = await this.server.extensionManagementService.getExtensionsControlManifest();
        const all = await this.server.extensionManagementService.getInstalled();
        // dedup user and system extensions by giving priority to user extensions.
        const installed = groupByExtension(all, r => r.identifier).reduce((result, extensions) => {
            const extension = extensions.length === 1 ? extensions[0]
                : extensions.find(e => e.type === 1 /* ExtensionType.User */) || extensions.find(e => e.type === 0 /* ExtensionType.System */);
            result.push(extension);
            return result;
        }, []);
        const byId = index(this.installed, e => e.local ? e.local.identifier.id : e.identifier.id);
        this.installed = installed.map(local => {
            const extension = byId[local.identifier.id] || this.instantiationService.createInstance(Extension, this.stateProvider, this.runtimeStateProvider, this.server, local, undefined);
            extension.local = local;
            extension.enablementState = this.extensionEnablementService.getEnablementState(local);
            Extensions.updateExtensionFromControlManifest(extension, extensionsControlManifest);
            return extension;
        });
        this._onChange.fire(undefined);
        return this.local;
    }
    async syncInstalledExtensionsWithGallery(galleryExtensions) {
        let hasChanged = false;
        const extensions = await this.mapInstalledExtensionWithCompatibleGalleryExtension(galleryExtensions);
        for (const [extension, gallery] of extensions) {
            // update metadata of the extension if it does not exist
            if (extension.local && !extension.local.identifier.uuid) {
                extension.local = await this.updateMetadata(extension.local, gallery);
            }
            if (!extension.gallery || extension.gallery.version !== gallery.version || extension.gallery.properties.targetPlatform !== gallery.properties.targetPlatform) {
                extension.gallery = gallery;
                this._onChange.fire({ extension });
                hasChanged = true;
            }
        }
        return hasChanged;
    }
    async mapInstalledExtensionWithCompatibleGalleryExtension(galleryExtensions) {
        const mappedExtensions = this.mapInstalledExtensionWithGalleryExtension(galleryExtensions);
        const targetPlatform = await this.server.extensionManagementService.getTargetPlatform();
        const compatibleGalleryExtensions = [];
        const compatibleGalleryExtensionsToFetch = [];
        await Promise.allSettled(mappedExtensions.map(async ([extension, gallery]) => {
            if (extension.local) {
                if (await this.galleryService.isExtensionCompatible(gallery, extension.local.preRelease, targetPlatform)) {
                    compatibleGalleryExtensions.push(gallery);
                }
                else {
                    compatibleGalleryExtensionsToFetch.push({ ...extension.local.identifier, preRelease: extension.local.preRelease });
                }
            }
        }));
        if (compatibleGalleryExtensionsToFetch.length) {
            const result = await this.galleryService.getExtensions(compatibleGalleryExtensionsToFetch, { targetPlatform, compatible: true, queryAllVersions: true }, CancellationToken.None);
            compatibleGalleryExtensions.push(...result);
        }
        return this.mapInstalledExtensionWithGalleryExtension(compatibleGalleryExtensions);
    }
    mapInstalledExtensionWithGalleryExtension(galleryExtensions) {
        const mappedExtensions = [];
        const byUUID = new Map(), byID = new Map();
        for (const gallery of galleryExtensions) {
            byUUID.set(gallery.identifier.uuid, gallery);
            byID.set(gallery.identifier.id.toLowerCase(), gallery);
        }
        for (const installed of this.installed) {
            if (installed.uuid) {
                const gallery = byUUID.get(installed.uuid);
                if (gallery) {
                    mappedExtensions.push([installed, gallery]);
                    continue;
                }
            }
            const gallery = byID.get(installed.identifier.id.toLowerCase());
            if (gallery) {
                mappedExtensions.push([installed, gallery]);
            }
        }
        return mappedExtensions;
    }
    async updateMetadata(localExtension, gallery) {
        let isPreReleaseVersion = false;
        if (localExtension.manifest.version !== gallery.version) {
            const galleryWithLocalVersion = (await this.galleryService.getExtensions([{ ...localExtension.identifier, version: localExtension.manifest.version }], CancellationToken.None))[0];
            isPreReleaseVersion = !!galleryWithLocalVersion?.properties?.isPreReleaseVersion;
        }
        return this.server.extensionManagementService.updateMetadata(localExtension, { id: gallery.identifier.uuid, publisherDisplayName: gallery.publisherDisplayName, publisherId: gallery.publisherId, isPreReleaseVersion });
    }
    canInstall(galleryExtension) {
        return this.server.extensionManagementService.canInstall(galleryExtension);
    }
    onInstallExtension(event) {
        const { source } = event;
        if (source && !URI.isUri(source)) {
            const extension = this.installed.filter(e => areSameExtensions(e.identifier, source.identifier))[0]
                || this.instantiationService.createInstance(Extension, this.stateProvider, this.runtimeStateProvider, this.server, undefined, source);
            this.installing.push(extension);
            this._onChange.fire({ extension });
        }
    }
    async onDidChangeProfile(added, removed) {
        const extensionsControlManifest = await this.server.extensionManagementService.getExtensionsControlManifest();
        for (const addedExtension of added) {
            if (this.installed.find(e => areSameExtensions(e.identifier, addedExtension.identifier))) {
                const extension = this.instantiationService.createInstance(Extension, this.stateProvider, this.runtimeStateProvider, this.server, addedExtension, undefined);
                this.installed.push(extension);
                Extensions.updateExtensionFromControlManifest(extension, extensionsControlManifest);
            }
        }
        if (removed.length) {
            this.installed = this.installed.filter(e => !removed.some(removedExtension => areSameExtensions(e.identifier, removedExtension.identifier)));
        }
        this._onReset.fire();
    }
    async onDidInstallExtensions(results) {
        for (const event of results) {
            const { local, source } = event;
            const gallery = source && !URI.isUri(source) ? source : undefined;
            const location = source && URI.isUri(source) ? source : undefined;
            const installingExtension = gallery ? this.installing.filter(e => areSameExtensions(e.identifier, gallery.identifier))[0] : null;
            this.installing = installingExtension ? this.installing.filter(e => e !== installingExtension) : this.installing;
            let extension = installingExtension ? installingExtension
                : (location || local) ? this.instantiationService.createInstance(Extension, this.stateProvider, this.runtimeStateProvider, this.server, local, undefined)
                    : undefined;
            if (extension) {
                if (local) {
                    const installed = this.installed.filter(e => areSameExtensions(e.identifier, extension.identifier))[0];
                    if (installed) {
                        extension = installed;
                    }
                    else {
                        this.installed.push(extension);
                    }
                    extension.local = local;
                    if (!extension.gallery) {
                        extension.gallery = gallery;
                    }
                    Extensions.updateExtensionFromControlManifest(extension, await this.server.extensionManagementService.getExtensionsControlManifest());
                    extension.enablementState = this.extensionEnablementService.getEnablementState(local);
                }
            }
            this._onChange.fire(!local || !extension ? undefined : { extension, operation: event.operation });
            if (extension && extension.local && !extension.gallery) {
                await this.syncInstalledExtensionWithGallery(extension);
            }
        }
    }
    async syncInstalledExtensionWithGallery(extension) {
        if (!this.galleryService.isEnabled()) {
            return;
        }
        const [compatible] = await this.galleryService.getExtensions([{ ...extension.identifier, preRelease: extension.local?.preRelease }], { compatible: true, targetPlatform: await this.server.extensionManagementService.getTargetPlatform() }, CancellationToken.None);
        if (compatible) {
            extension.gallery = compatible;
            this._onChange.fire({ extension });
        }
    }
    onUninstallExtension(identifier) {
        const extension = this.installed.filter(e => areSameExtensions(e.identifier, identifier))[0];
        if (extension) {
            const uninstalling = this.uninstalling.filter(e => areSameExtensions(e.identifier, identifier))[0] || extension;
            this.uninstalling = [uninstalling, ...this.uninstalling.filter(e => !areSameExtensions(e.identifier, identifier))];
            this._onChange.fire(uninstalling ? { extension: uninstalling } : undefined);
        }
    }
    onDidUninstallExtension({ identifier, error }) {
        const uninstalled = this.uninstalling.find(e => areSameExtensions(e.identifier, identifier)) || this.installed.find(e => areSameExtensions(e.identifier, identifier));
        this.uninstalling = this.uninstalling.filter(e => !areSameExtensions(e.identifier, identifier));
        if (!error) {
            this.installed = this.installed.filter(e => !areSameExtensions(e.identifier, identifier));
        }
        if (uninstalled) {
            this._onChange.fire({ extension: uninstalled });
        }
    }
    onEnablementChanged(platformExtensions) {
        const extensions = this.local.filter(e => platformExtensions.some(p => areSameExtensions(e.identifier, p.identifier)));
        for (const extension of extensions) {
            if (extension.local) {
                const enablementState = this.extensionEnablementService.getEnablementState(extension.local);
                if (enablementState !== extension.enablementState) {
                    extension.enablementState = enablementState;
                    this._onChange.fire({ extension: extension });
                }
            }
        }
    }
    getExtensionState(extension) {
        if (extension.gallery && this.installing.some(e => !!e.gallery && areSameExtensions(e.gallery.identifier, extension.gallery.identifier))) {
            return 0 /* ExtensionState.Installing */;
        }
        if (this.uninstalling.some(e => areSameExtensions(e.identifier, extension.identifier))) {
            return 2 /* ExtensionState.Uninstalling */;
        }
        const local = this.installed.filter(e => e === extension || (e.gallery && extension.gallery && areSameExtensions(e.gallery.identifier, extension.gallery.identifier)))[0];
        return local ? 1 /* ExtensionState.Installed */ : 3 /* ExtensionState.Uninstalled */;
    }
};
Extensions = __decorate([
    __param(3, IExtensionGalleryService),
    __param(4, IWorkbenchExtensionEnablementService),
    __param(5, IInstantiationService)
], Extensions);
let ExtensionsWorkbenchService = class ExtensionsWorkbenchService extends Disposable {
    instantiationService;
    editorService;
    extensionManagementService;
    galleryService;
    configurationService;
    telemetryService;
    notificationService;
    extensionEnablementService;
    hostService;
    progressService;
    extensionManagementServerService;
    storageService;
    languageService;
    extensionsSyncManagementService;
    userDataAutoSyncService;
    productService;
    extensionManifestPropertiesService;
    logService;
    extensionService;
    languagePackService;
    localeService;
    static UpdatesCheckInterval = 1000 * 60 * 60 * 12; // 12 hours
    hasOutdatedExtensionsContextKey;
    localExtensions = null;
    remoteExtensions = null;
    webExtensions = null;
    updatesCheckDelayer;
    autoUpdateDelayer;
    _onChange = new Emitter();
    get onChange() { return this._onChange.event; }
    _onReset = new Emitter();
    get onReset() { return this._onReset.event; }
    preferPreReleases = this.productService.quality !== 'stable';
    installing = [];
    constructor(instantiationService, editorService, extensionManagementService, galleryService, configurationService, telemetryService, notificationService, urlService, extensionEnablementService, hostService, progressService, extensionManagementServerService, storageService, languageService, extensionsSyncManagementService, userDataAutoSyncService, productService, contextKeyService, extensionManifestPropertiesService, logService, extensionService, languagePackService, localeService) {
        super();
        this.instantiationService = instantiationService;
        this.editorService = editorService;
        this.extensionManagementService = extensionManagementService;
        this.galleryService = galleryService;
        this.configurationService = configurationService;
        this.telemetryService = telemetryService;
        this.notificationService = notificationService;
        this.extensionEnablementService = extensionEnablementService;
        this.hostService = hostService;
        this.progressService = progressService;
        this.extensionManagementServerService = extensionManagementServerService;
        this.storageService = storageService;
        this.languageService = languageService;
        this.extensionsSyncManagementService = extensionsSyncManagementService;
        this.userDataAutoSyncService = userDataAutoSyncService;
        this.productService = productService;
        this.extensionManifestPropertiesService = extensionManifestPropertiesService;
        this.logService = logService;
        this.extensionService = extensionService;
        this.languagePackService = languagePackService;
        this.localeService = localeService;
        const preferPreReleasesValue = configurationService.getValue('_extensions.preferPreReleases');
        if (!isUndefined(preferPreReleasesValue)) {
            this.preferPreReleases = !!preferPreReleasesValue;
        }
        this.hasOutdatedExtensionsContextKey = HasOutdatedExtensionsContext.bindTo(contextKeyService);
        if (extensionManagementServerService.localExtensionManagementServer) {
            this.localExtensions = this._register(instantiationService.createInstance(Extensions, extensionManagementServerService.localExtensionManagementServer, ext => this.getExtensionState(ext), ext => this.getReloadStatus(ext)));
            this._register(this.localExtensions.onChange(e => this._onChange.fire(e ? e.extension : undefined)));
            this._register(this.localExtensions.onReset(e => { this._onChange.fire(undefined); this._onReset.fire(); }));
        }
        if (extensionManagementServerService.remoteExtensionManagementServer) {
            this.remoteExtensions = this._register(instantiationService.createInstance(Extensions, extensionManagementServerService.remoteExtensionManagementServer, ext => this.getExtensionState(ext), ext => this.getReloadStatus(ext)));
            this._register(this.remoteExtensions.onChange(e => this._onChange.fire(e ? e.extension : undefined)));
            this._register(this.remoteExtensions.onReset(e => { this._onChange.fire(undefined); this._onReset.fire(); }));
        }
        if (extensionManagementServerService.webExtensionManagementServer) {
            this.webExtensions = this._register(instantiationService.createInstance(Extensions, extensionManagementServerService.webExtensionManagementServer, ext => this.getExtensionState(ext), ext => this.getReloadStatus(ext)));
            this._register(this.webExtensions.onChange(e => this._onChange.fire(e ? e.extension : undefined)));
            this._register(this.webExtensions.onReset(e => { this._onChange.fire(undefined); this._onReset.fire(); }));
        }
        this.updatesCheckDelayer = new ThrottledDelayer(ExtensionsWorkbenchService.UpdatesCheckInterval);
        this.autoUpdateDelayer = new ThrottledDelayer(1000);
        this._register(toDisposable(() => {
            this.updatesCheckDelayer.cancel();
            this.autoUpdateDelayer.cancel();
        }));
        urlService.registerHandler(this);
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(AutoUpdateConfigurationKey)) {
                if (this.isAutoUpdateEnabled()) {
                    this.checkForUpdates();
                }
            }
            if (e.affectsConfiguration(AutoCheckUpdatesConfigurationKey)) {
                if (this.isAutoCheckUpdatesEnabled()) {
                    this.checkForUpdates();
                }
            }
        }, this));
        this._register(extensionEnablementService.onEnablementChanged(platformExtensions => {
            if (this.getAutoUpdateValue() === 'onlyEnabledExtensions' && platformExtensions.some(e => this.extensionEnablementService.isEnabled(e))) {
                this.checkForUpdates();
            }
        }, this));
        this.queryLocal().then(() => {
            this.extensionService.whenInstalledExtensionsRegistered().then(() => {
                this.onDidChangeRunningExtensions(this.extensionService.extensions, []);
                this._register(this.extensionService.onDidChangeExtensions(({ added, removed }) => this.onDidChangeRunningExtensions(added, removed)));
            });
            this.resetIgnoreAutoUpdateExtensions();
            this.eventuallyCheckForUpdates(true);
            this._reportTelemetry();
            // Always auto update builtin extensions in web
            if (isWeb && !this.isAutoUpdateEnabled()) {
                this.autoUpdateBuiltinExtensions();
            }
        });
        this._register(this.onChange(() => {
            this.updateContexts();
            this.updateActivity();
        }));
        this._register(this.storageService.onDidChangeValue(e => this.onDidChangeStorage(e)));
    }
    _reportTelemetry() {
        const extensionIds = this.installed.filter(extension => !extension.isBuiltin &&
            (extension.enablementState === 9 /* EnablementState.EnabledWorkspace */ ||
                extension.enablementState === 8 /* EnablementState.EnabledGlobally */))
            .map(extension => ExtensionIdentifier.toKey(extension.identifier.id));
        this.telemetryService.publicLog2('installedExtensions', { extensionIds: extensionIds.join(';'), count: extensionIds.length });
    }
    async onDidChangeRunningExtensions(added, removed) {
        const local = this.local;
        const changedExtensions = [];
        const extsNotInstalled = [];
        for (const desc of added) {
            const extension = local.find(e => areSameExtensions({ id: desc.identifier.value, uuid: desc.uuid }, e.identifier));
            if (extension) {
                changedExtensions.push(extension);
            }
            else {
                extsNotInstalled.push({ id: desc.identifier.value, uuid: desc.uuid });
            }
        }
        changedExtensions.push(...await this.getExtensions(extsNotInstalled, CancellationToken.None));
        changedExtensions.forEach(e => this._onChange.fire(e));
    }
    get local() {
        const byId = groupByExtension(this.installed, r => r.identifier);
        return byId.reduce((result, extensions) => { result.push(this.getPrimaryExtension(extensions)); return result; }, []);
    }
    get installed() {
        const result = [];
        if (this.localExtensions) {
            result.push(...this.localExtensions.local);
        }
        if (this.remoteExtensions) {
            result.push(...this.remoteExtensions.local);
        }
        if (this.webExtensions) {
            result.push(...this.webExtensions.local);
        }
        return result;
    }
    get outdated() {
        const allLocal = [];
        if (this.localExtensions) {
            allLocal.push(...this.localExtensions.local);
        }
        if (this.remoteExtensions) {
            allLocal.push(...this.remoteExtensions.local);
        }
        if (this.webExtensions) {
            allLocal.push(...this.webExtensions.local);
        }
        return allLocal.filter(e => e.outdated && e.local && e.state === 1 /* ExtensionState.Installed */);
    }
    async queryLocal(server) {
        if (server) {
            if (this.localExtensions && this.extensionManagementServerService.localExtensionManagementServer === server) {
                return this.localExtensions.queryInstalled();
            }
            if (this.remoteExtensions && this.extensionManagementServerService.remoteExtensionManagementServer === server) {
                return this.remoteExtensions.queryInstalled();
            }
            if (this.webExtensions && this.extensionManagementServerService.webExtensionManagementServer === server) {
                return this.webExtensions.queryInstalled();
            }
        }
        if (this.localExtensions) {
            try {
                await this.localExtensions.queryInstalled();
            }
            catch (error) {
                this.logService.error(error);
            }
        }
        if (this.remoteExtensions) {
            try {
                await this.remoteExtensions.queryInstalled();
            }
            catch (error) {
                this.logService.error(error);
            }
        }
        if (this.webExtensions) {
            try {
                await this.webExtensions.queryInstalled();
            }
            catch (error) {
                this.logService.error(error);
            }
        }
        return this.local;
    }
    async queryGallery(arg1, arg2) {
        if (!this.galleryService.isEnabled()) {
            return singlePagePager([]);
        }
        const options = CancellationToken.isCancellationToken(arg1) ? {} : arg1;
        const token = CancellationToken.isCancellationToken(arg1) ? arg1 : arg2;
        options.text = options.text ? this.resolveQueryText(options.text) : options.text;
        options.includePreRelease = isUndefined(options.includePreRelease) ? this.preferPreReleases : options.includePreRelease;
        const extensionsControlManifest = await this.extensionManagementService.getExtensionsControlManifest();
        const pager = await this.galleryService.query(options, token);
        this.syncInstalledExtensionsWithGallery(pager.firstPage);
        return {
            firstPage: pager.firstPage.map(gallery => this.fromGallery(gallery, extensionsControlManifest)),
            total: pager.total,
            pageSize: pager.pageSize,
            getPage: async (pageIndex, token) => {
                const page = await pager.getPage(pageIndex, token);
                this.syncInstalledExtensionsWithGallery(page);
                return page.map(gallery => this.fromGallery(gallery, extensionsControlManifest));
            }
        };
    }
    async getExtensions(extensionInfos, arg1, arg2) {
        if (!this.galleryService.isEnabled()) {
            return [];
        }
        extensionInfos.forEach(e => e.preRelease = e.preRelease ?? this.preferPreReleases);
        const extensionsControlManifest = await this.extensionManagementService.getExtensionsControlManifest();
        const galleryExtensions = await this.galleryService.getExtensions(extensionInfos, arg1, arg2);
        this.syncInstalledExtensionsWithGallery(galleryExtensions);
        return galleryExtensions.map(gallery => this.fromGallery(gallery, extensionsControlManifest));
    }
    resolveQueryText(text) {
        text = text.replace(/@web/g, `tag:"${WEB_EXTENSION_TAG}"`);
        const extensionRegex = /\bext:([^\s]+)\b/g;
        if (extensionRegex.test(text)) {
            text = text.replace(extensionRegex, (m, ext) => {
                // Get curated keywords
                const lookup = this.productService.extensionKeywords || {};
                const keywords = lookup[ext] || [];
                // Get mode name
                const languageId = this.languageService.guessLanguageIdByFilepathOrFirstLine(URI.file(`.${ext}`));
                const languageName = languageId && this.languageService.getLanguageName(languageId);
                const languageTag = languageName ? ` tag:"${languageName}"` : '';
                // Construct a rich query
                return `tag:"__ext_${ext}" tag:"__ext_.${ext}" ${keywords.map(tag => `tag:"${tag}"`).join(' ')}${languageTag} tag:"${ext}"`;
            });
        }
        return text.substr(0, 350);
    }
    fromGallery(gallery, extensionsControlManifest) {
        let extension = this.getInstalledExtensionMatchingGallery(gallery);
        if (!extension) {
            extension = this.instantiationService.createInstance(Extension, ext => this.getExtensionState(ext), ext => this.getReloadStatus(ext), undefined, undefined, gallery);
            Extensions.updateExtensionFromControlManifest(extension, extensionsControlManifest);
        }
        return extension;
    }
    getInstalledExtensionMatchingGallery(gallery) {
        for (const installed of this.local) {
            if (installed.identifier.uuid) { // Installed from Gallery
                if (installed.identifier.uuid === gallery.identifier.uuid) {
                    return installed;
                }
            }
            else {
                if (areSameExtensions(installed.identifier, gallery.identifier)) { // Installed from other sources
                    return installed;
                }
            }
        }
        return null;
    }
    async open(extension, options) {
        const editor = await this.editorService.openEditor(this.instantiationService.createInstance(ExtensionsInput, extension), options, options?.sideByside ? SIDE_GROUP : ACTIVE_GROUP);
        if (options?.tab && editor instanceof ExtensionEditor) {
            await editor.openTab(options.tab);
        }
    }
    getExtensionStatus(extension) {
        const extensionsStatus = this.extensionService.getExtensionsStatus();
        for (const id of Object.keys(extensionsStatus)) {
            if (areSameExtensions({ id }, extension.identifier)) {
                return extensionsStatus[id];
            }
        }
        return undefined;
    }
    getReloadStatus(extension) {
        const isUninstalled = extension.state === 3 /* ExtensionState.Uninstalled */;
        const runningExtension = this.extensionService.extensions.find(e => areSameExtensions({ id: e.identifier.value, uuid: e.uuid }, extension.identifier));
        if (isUninstalled) {
            const canRemoveRunningExtension = runningExtension && this.extensionService.canRemoveExtension(runningExtension);
            const isSameExtensionRunning = runningExtension && (!extension.server || extension.server === this.extensionManagementServerService.getExtensionManagementServer(toExtension(runningExtension)));
            if (!canRemoveRunningExtension && isSameExtensionRunning) {
                return nls.localize('postUninstallTooltip', "Please reload Visual Studio Code to complete the uninstallation of this extension.");
            }
            return undefined;
        }
        if (extension.local) {
            const isSameExtensionRunning = runningExtension && extension.server === this.extensionManagementServerService.getExtensionManagementServer(toExtension(runningExtension));
            const isEnabled = this.extensionEnablementService.isEnabled(extension.local);
            // Extension is running
            if (runningExtension) {
                if (isEnabled) {
                    // No Reload is required if extension can run without reload
                    if (this.extensionService.canAddExtension(toExtensionDescription(extension.local))) {
                        return undefined;
                    }
                    const runningExtensionServer = this.extensionManagementServerService.getExtensionManagementServer(toExtension(runningExtension));
                    if (isSameExtensionRunning) {
                        // Different version or target platform of same extension is running. Requires reload to run the current version
                        if (extension.version !== runningExtension.version || extension.local.targetPlatform !== runningExtension.targetPlatform) {
                            return nls.localize('postUpdateTooltip', "Please reload Visual Studio Code to enable the updated extension.");
                        }
                        const extensionInOtherServer = this.installed.filter(e => areSameExtensions(e.identifier, extension.identifier) && e.server !== extension.server)[0];
                        if (extensionInOtherServer) {
                            // This extension prefers to run on UI/Local side but is running in remote
                            if (runningExtensionServer === this.extensionManagementServerService.remoteExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnUI(extension.local.manifest) && extensionInOtherServer.server === this.extensionManagementServerService.localExtensionManagementServer) {
                                return nls.localize('enable locally', "Please reload Visual Studio Code to enable this extension locally.");
                            }
                            // This extension prefers to run on Workspace/Remote side but is running in local
                            if (runningExtensionServer === this.extensionManagementServerService.localExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(extension.local.manifest) && extensionInOtherServer.server === this.extensionManagementServerService.remoteExtensionManagementServer) {
                                return nls.localize('enable remote', "Please reload Visual Studio Code to enable this extension in {0}.", this.extensionManagementServerService.remoteExtensionManagementServer?.label);
                            }
                        }
                    }
                    else {
                        if (extension.server === this.extensionManagementServerService.localExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.remoteExtensionManagementServer) {
                            // This extension prefers to run on UI/Local side but is running in remote
                            if (this.extensionManifestPropertiesService.prefersExecuteOnUI(extension.local.manifest)) {
                                return nls.localize('postEnableTooltip', "Please reload Visual Studio Code to enable this extension.");
                            }
                        }
                        if (extension.server === this.extensionManagementServerService.remoteExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.localExtensionManagementServer) {
                            // This extension prefers to run on Workspace/Remote side but is running in local
                            if (this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(extension.local.manifest)) {
                                return nls.localize('postEnableTooltip', "Please reload Visual Studio Code to enable this extension.");
                            }
                        }
                    }
                    return undefined;
                }
                else {
                    if (isSameExtensionRunning) {
                        return nls.localize('postDisableTooltip', "Please reload Visual Studio Code to disable this extension.");
                    }
                }
                return undefined;
            }
            // Extension is not running
            else {
                if (isEnabled && !this.extensionService.canAddExtension(toExtensionDescription(extension.local))) {
                    return nls.localize('postEnableTooltip', "Please reload Visual Studio Code to enable this extension.");
                }
                const otherServer = extension.server ? extension.server === this.extensionManagementServerService.localExtensionManagementServer ? this.extensionManagementServerService.remoteExtensionManagementServer : this.extensionManagementServerService.localExtensionManagementServer : null;
                if (otherServer && extension.enablementState === 1 /* EnablementState.DisabledByExtensionKind */) {
                    const extensionInOtherServer = this.local.filter(e => areSameExtensions(e.identifier, extension.identifier) && e.server === otherServer)[0];
                    // Same extension in other server exists and
                    if (extensionInOtherServer && extensionInOtherServer.local && this.extensionEnablementService.isEnabled(extensionInOtherServer.local)) {
                        return nls.localize('postEnableTooltip', "Please reload Visual Studio Code to enable this extension.");
                    }
                }
            }
        }
        return undefined;
    }
    getPrimaryExtension(extensions) {
        if (extensions.length === 1) {
            return extensions[0];
        }
        const enabledExtensions = extensions.filter(e => e.local && this.extensionEnablementService.isEnabled(e.local));
        if (enabledExtensions.length === 1) {
            return enabledExtensions[0];
        }
        const extensionsToChoose = enabledExtensions.length ? enabledExtensions : extensions;
        const manifest = extensionsToChoose.find(e => e.local && e.local.manifest)?.local?.manifest;
        // Manifest is not found which should not happen.
        // In which case return the first extension.
        if (!manifest) {
            return extensionsToChoose[0];
        }
        const extensionKinds = this.extensionManifestPropertiesService.getExtensionKind(manifest);
        let extension = extensionsToChoose.find(extension => {
            for (const extensionKind of extensionKinds) {
                switch (extensionKind) {
                    case 'ui':
                        /* UI extension is chosen only if it is installed locally */
                        if (extension.server === this.extensionManagementServerService.localExtensionManagementServer) {
                            return true;
                        }
                        return false;
                    case 'workspace':
                        /* Choose remote workspace extension if exists */
                        if (extension.server === this.extensionManagementServerService.remoteExtensionManagementServer) {
                            return true;
                        }
                        return false;
                    case 'web':
                        /* Choose web extension if exists */
                        if (extension.server === this.extensionManagementServerService.webExtensionManagementServer) {
                            return true;
                        }
                        return false;
                }
            }
            return false;
        });
        if (!extension && this.extensionManagementServerService.localExtensionManagementServer) {
            extension = extensionsToChoose.find(extension => {
                for (const extensionKind of extensionKinds) {
                    switch (extensionKind) {
                        case 'workspace':
                            /* Choose local workspace extension if exists */
                            if (extension.server === this.extensionManagementServerService.localExtensionManagementServer) {
                                return true;
                            }
                            return false;
                        case 'web':
                            /* Choose local web extension if exists */
                            if (extension.server === this.extensionManagementServerService.localExtensionManagementServer) {
                                return true;
                            }
                            return false;
                    }
                }
                return false;
            });
        }
        if (!extension && this.extensionManagementServerService.webExtensionManagementServer) {
            extension = extensionsToChoose.find(extension => {
                for (const extensionKind of extensionKinds) {
                    switch (extensionKind) {
                        case 'web':
                            /* Choose web extension if exists */
                            if (extension.server === this.extensionManagementServerService.webExtensionManagementServer) {
                                return true;
                            }
                            return false;
                    }
                }
                return false;
            });
        }
        if (!extension && this.extensionManagementServerService.remoteExtensionManagementServer) {
            extension = extensionsToChoose.find(extension => {
                for (const extensionKind of extensionKinds) {
                    switch (extensionKind) {
                        case 'web':
                            /* Choose remote web extension if exists */
                            if (extension.server === this.extensionManagementServerService.remoteExtensionManagementServer) {
                                return true;
                            }
                            return false;
                    }
                }
                return false;
            });
        }
        return extension || extensions[0];
    }
    getExtensionState(extension) {
        const isInstalling = this.installing.some(i => areSameExtensions(i.identifier, extension.identifier));
        if (extension.server) {
            const state = (extension.server === this.extensionManagementServerService.localExtensionManagementServer
                ? this.localExtensions : extension.server === this.extensionManagementServerService.remoteExtensionManagementServer ? this.remoteExtensions : this.webExtensions).getExtensionState(extension);
            return state === 3 /* ExtensionState.Uninstalled */ && isInstalling ? 0 /* ExtensionState.Installing */ : state;
        }
        else if (isInstalling) {
            return 0 /* ExtensionState.Installing */;
        }
        if (this.remoteExtensions) {
            const state = this.remoteExtensions.getExtensionState(extension);
            if (state !== 3 /* ExtensionState.Uninstalled */) {
                return state;
            }
        }
        if (this.webExtensions) {
            const state = this.webExtensions.getExtensionState(extension);
            if (state !== 3 /* ExtensionState.Uninstalled */) {
                return state;
            }
        }
        if (this.localExtensions) {
            return this.localExtensions.getExtensionState(extension);
        }
        return 3 /* ExtensionState.Uninstalled */;
    }
    async checkForUpdates(onlyBuiltin) {
        if (!this.galleryService.isEnabled()) {
            return;
        }
        const extensions = [];
        if (this.localExtensions) {
            extensions.push(this.localExtensions);
        }
        if (this.remoteExtensions) {
            extensions.push(this.remoteExtensions);
        }
        if (this.webExtensions) {
            extensions.push(this.webExtensions);
        }
        if (!extensions.length) {
            return;
        }
        const infos = [];
        for (const installed of this.local) {
            if (onlyBuiltin && !installed.isBuiltin) {
                // Skip if check updates only for builtin extensions and current extension is not builtin.
                continue;
            }
            if (installed.isBuiltin && (installed.type === 0 /* ExtensionType.System */ || !installed.local?.identifier.uuid)) {
                // Skip checking updates for a builtin extension if it is a system extension or if it does not has Marketplace identifier 
                continue;
            }
            infos.push({ ...installed.identifier, preRelease: !!installed.local?.preRelease });
        }
        if (infos.length) {
            const targetPlatform = await extensions[0].server.extensionManagementService.getTargetPlatform();
            const galleryExtensions = await this.galleryService.getExtensions(infos, { targetPlatform, compatible: true }, CancellationToken.None);
            if (galleryExtensions.length) {
                await this.syncInstalledExtensionsWithGallery(galleryExtensions);
            }
        }
    }
    async syncInstalledExtensionsWithGallery(gallery) {
        const extensions = [];
        if (this.localExtensions) {
            extensions.push(this.localExtensions);
        }
        if (this.remoteExtensions) {
            extensions.push(this.remoteExtensions);
        }
        if (this.webExtensions) {
            extensions.push(this.webExtensions);
        }
        if (!extensions.length) {
            return;
        }
        const result = await Promise.allSettled(extensions.map(extensions => extensions.syncInstalledExtensionsWithGallery(gallery)));
        if (this.isAutoUpdateEnabled() && result.some(r => r.status === 'fulfilled' && r.value)) {
            this.eventuallyAutoUpdateExtensions();
        }
    }
    getAutoUpdateValue() {
        const autoUpdate = this.configurationService.getValue(AutoUpdateConfigurationKey);
        return isBoolean(autoUpdate) || autoUpdate === 'onlyEnabledExtensions' ? autoUpdate : true;
    }
    isAutoUpdateEnabled() {
        return this.getAutoUpdateValue() !== false;
    }
    isAutoCheckUpdatesEnabled() {
        return this.configurationService.getValue(AutoCheckUpdatesConfigurationKey);
    }
    eventuallyCheckForUpdates(immediate = false) {
        this.updatesCheckDelayer.trigger(async () => {
            if (this.isAutoUpdateEnabled() || this.isAutoCheckUpdatesEnabled()) {
                await this.checkForUpdates();
            }
            this.eventuallyCheckForUpdates();
        }, immediate ? 0 : ExtensionsWorkbenchService.UpdatesCheckInterval).then(undefined, err => null);
    }
    eventuallyAutoUpdateExtensions() {
        this.autoUpdateDelayer.trigger(() => this.autoUpdateExtensions())
            .then(undefined, err => null);
    }
    async autoUpdateBuiltinExtensions() {
        await this.checkForUpdates(true);
        const toUpdate = this.outdated.filter(e => e.isBuiltin);
        await Promises.settled(toUpdate.map(e => this.install(e, e.local?.preRelease ? { installPreReleaseVersion: true } : undefined)));
    }
    autoUpdateExtensions() {
        if (!this.isAutoUpdateEnabled()) {
            return Promise.resolve();
        }
        const toUpdate = this.outdated.filter(e => !this.isAutoUpdateIgnored(new ExtensionKey(e.identifier, e.version)) &&
            (this.getAutoUpdateValue() === true || (e.local && this.extensionEnablementService.isEnabled(e.local))));
        return Promises.settled(toUpdate.map(e => this.install(e, e.local?.preRelease ? { installPreReleaseVersion: true } : undefined)));
    }
    async canInstall(extension) {
        if (!(extension instanceof Extension)) {
            return false;
        }
        if (extension.isMalicious) {
            return false;
        }
        if (extension.deprecationInfo?.disallowInstall) {
            return false;
        }
        if (!extension.gallery) {
            return false;
        }
        if (this.localExtensions && await this.localExtensions.canInstall(extension.gallery)) {
            return true;
        }
        if (this.remoteExtensions && await this.remoteExtensions.canInstall(extension.gallery)) {
            return true;
        }
        if (this.webExtensions && await this.webExtensions.canInstall(extension.gallery)) {
            return true;
        }
        return false;
    }
    install(extension, installOptions, progressLocation) {
        if (extension instanceof URI) {
            return this.installWithProgress(() => this.installFromVSIX(extension, installOptions));
        }
        if (extension.isMalicious) {
            return Promise.reject(new Error(nls.localize('malicious', "This extension is reported to be problematic.")));
        }
        const gallery = extension.gallery;
        if (!gallery) {
            return Promise.reject(new Error('Missing gallery'));
        }
        return this.installWithProgress(() => this.installFromGallery(extension, gallery, installOptions), gallery.displayName, progressLocation);
    }
    canSetLanguage(extension) {
        if (!isWeb) {
            return false;
        }
        if (!extension.gallery) {
            return false;
        }
        const locale = this.languagePackService.getLocale(extension.gallery);
        if (!locale) {
            return false;
        }
        return true;
    }
    async setLanguage(extension) {
        if (!this.canSetLanguage(extension)) {
            throw new Error('Can not set language');
        }
        const locale = this.languagePackService.getLocale(extension.gallery);
        if (locale === language) {
            return;
        }
        return this.localeService.setLocale({ id: locale, galleryExtension: extension.gallery, extensionId: extension.identifier.id, label: extension.displayName });
    }
    setEnablement(extensions, enablementState) {
        extensions = Array.isArray(extensions) ? extensions : [extensions];
        return this.promptAndSetEnablement(extensions, enablementState);
    }
    uninstall(extension) {
        const ext = extension.local ? extension : this.local.filter(e => areSameExtensions(e.identifier, extension.identifier))[0];
        const toUninstall = ext && ext.local ? ext.local : null;
        if (!toUninstall) {
            return Promise.reject(new Error('Missing local'));
        }
        return this.progressService.withProgress({
            location: 5 /* ProgressLocation.Extensions */,
            title: nls.localize('uninstallingExtension', 'Uninstalling extension....'),
            source: `${toUninstall.identifier.id}`
        }, () => this.extensionManagementService.uninstall(toUninstall).then(() => undefined));
    }
    async installVersion(extension, version, installOptions = {}) {
        if (!(extension instanceof Extension)) {
            return extension;
        }
        if (!extension.gallery) {
            throw new Error('Missing gallery');
        }
        const targetPlatform = extension.server ? await extension.server.extensionManagementService.getTargetPlatform() : undefined;
        const [gallery] = await this.galleryService.getExtensions([{ id: extension.gallery.identifier.id, version }], { targetPlatform }, CancellationToken.None);
        if (!gallery) {
            throw new Error(nls.localize('not found', "Unable to install extension '{0}' because the requested version '{1}' is not found.", extension.gallery.identifier.id, version));
        }
        return this.installWithProgress(async () => {
            installOptions.installGivenVersion = true;
            const installed = await this.installFromGallery(extension, gallery, installOptions);
            if (extension.latestVersion !== version) {
                this.ignoreAutoUpdate(new ExtensionKey(gallery.identifier, version));
            }
            return installed;
        }, gallery.displayName);
    }
    reinstall(extension) {
        const ext = extension.local ? extension : this.local.filter(e => areSameExtensions(e.identifier, extension.identifier))[0];
        const toReinstall = ext && ext.local ? ext.local : null;
        if (!toReinstall) {
            return Promise.reject(new Error('Missing local'));
        }
        return this.progressService.withProgress({
            location: 5 /* ProgressLocation.Extensions */,
            source: `${toReinstall.identifier.id}`
        }, () => this.extensionManagementService.reinstallFromGallery(toReinstall).then(() => this.local.filter(local => areSameExtensions(local.identifier, extension.identifier))[0]));
    }
    isExtensionIgnoredToSync(extension) {
        return extension.local ? !this.isInstalledExtensionSynced(extension.local)
            : this.extensionsSyncManagementService.hasToNeverSyncExtension(extension.identifier.id);
    }
    async toggleExtensionIgnoredToSync(extension) {
        const isIgnored = this.isExtensionIgnoredToSync(extension);
        if (extension.local && isIgnored) {
            extension.local = await this.updateSynchronizingInstalledExtension(extension.local, true);
            this._onChange.fire(extension);
        }
        else {
            this.extensionsSyncManagementService.updateIgnoredExtensions(extension.identifier.id, !isIgnored);
        }
        await this.userDataAutoSyncService.triggerSync(['IgnoredExtensionsUpdated'], false, false);
    }
    isInstalledExtensionSynced(extension) {
        if (extension.isMachineScoped) {
            return false;
        }
        if (this.extensionsSyncManagementService.hasToAlwaysSyncExtension(extension.identifier.id)) {
            return true;
        }
        return !this.extensionsSyncManagementService.hasToNeverSyncExtension(extension.identifier.id);
    }
    async updateSynchronizingInstalledExtension(extension, sync) {
        const isMachineScoped = !sync;
        if (extension.isMachineScoped !== isMachineScoped) {
            extension = await this.extensionManagementService.updateExtensionScope(extension, isMachineScoped);
        }
        if (sync) {
            this.extensionsSyncManagementService.updateIgnoredExtensions(extension.identifier.id, false);
        }
        return extension;
    }
    installWithProgress(installTask, extensionName, progressLocation) {
        const title = extensionName ? nls.localize('installing named extension', "Installing '{0}' extension....", extensionName) : nls.localize('installing extension', 'Installing extension....');
        return this.progressService.withProgress({
            location: progressLocation ?? 5 /* ProgressLocation.Extensions */,
            title
        }, () => installTask());
    }
    async installFromVSIX(vsix, installOptions) {
        const manifest = await this.extensionManagementService.getManifest(vsix);
        const existingExtension = this.local.find(local => areSameExtensions(local.identifier, { id: getGalleryExtensionId(manifest.publisher, manifest.name) }));
        const { identifier } = await this.extensionManagementService.installVSIX(vsix, manifest, installOptions);
        if (existingExtension && existingExtension.latestVersion !== manifest.version) {
            this.ignoreAutoUpdate(new ExtensionKey(identifier, manifest.version));
        }
        return this.waitAndGetInstalledExtension(identifier);
    }
    async installFromGallery(extension, gallery, installOptions) {
        this.installing.push(extension);
        this._onChange.fire(extension);
        try {
            if (extension.state === 1 /* ExtensionState.Installed */ && extension.local) {
                await this.extensionManagementService.updateFromGallery(gallery, extension.local, installOptions);
            }
            else {
                await this.extensionManagementService.installFromGallery(gallery, installOptions);
            }
            return this.waitAndGetInstalledExtension(gallery.identifier);
        }
        finally {
            this.installing = this.installing.filter(e => e !== extension);
            this._onChange.fire(this.local.filter(e => areSameExtensions(e.identifier, extension.identifier))[0]);
        }
    }
    async waitAndGetInstalledExtension(identifier) {
        let installedExtension = this.local.find(local => areSameExtensions(local.identifier, identifier));
        if (!installedExtension) {
            await Event.toPromise(Event.filter(this.onChange, e => !!e && this.local.some(local => areSameExtensions(local.identifier, identifier))));
        }
        installedExtension = this.local.find(local => areSameExtensions(local.identifier, identifier));
        if (!installedExtension) {
            // This should not happen
            throw new Error('Extension should have been installed');
        }
        return installedExtension;
    }
    promptAndSetEnablement(extensions, enablementState) {
        const enable = enablementState === 8 /* EnablementState.EnabledGlobally */ || enablementState === 9 /* EnablementState.EnabledWorkspace */;
        if (enable) {
            const allDependenciesAndPackedExtensions = this.getExtensionsRecursively(extensions, this.local, enablementState, { dependencies: true, pack: true });
            return this.checkAndSetEnablement(extensions, allDependenciesAndPackedExtensions, enablementState);
        }
        else {
            const packedExtensions = this.getExtensionsRecursively(extensions, this.local, enablementState, { dependencies: false, pack: true });
            if (packedExtensions.length) {
                return this.checkAndSetEnablement(extensions, packedExtensions, enablementState);
            }
            return this.checkAndSetEnablement(extensions, [], enablementState);
        }
    }
    checkAndSetEnablement(extensions, otherExtensions, enablementState) {
        const allExtensions = [...extensions, ...otherExtensions];
        const enable = enablementState === 8 /* EnablementState.EnabledGlobally */ || enablementState === 9 /* EnablementState.EnabledWorkspace */;
        if (!enable) {
            for (const extension of extensions) {
                const dependents = this.getDependentsAfterDisablement(extension, allExtensions, this.local);
                if (dependents.length) {
                    return new Promise((resolve, reject) => {
                        this.notificationService.prompt(Severity.Error, this.getDependentsErrorMessage(extension, allExtensions, dependents), [
                            {
                                label: nls.localize('disable all', 'Disable All'),
                                run: async () => {
                                    try {
                                        await this.checkAndSetEnablement(dependents, [extension], enablementState);
                                        resolve();
                                    }
                                    catch (error) {
                                        reject(error);
                                    }
                                }
                            }
                        ], {
                            onCancel: () => reject(new CancellationError())
                        });
                    });
                }
            }
        }
        return this.doSetEnablement(allExtensions, enablementState);
    }
    getExtensionsRecursively(extensions, installed, enablementState, options, checked = []) {
        const toCheck = extensions.filter(e => checked.indexOf(e) === -1);
        if (toCheck.length) {
            for (const extension of toCheck) {
                checked.push(extension);
            }
            const extensionsToEanbleOrDisable = installed.filter(i => {
                if (checked.indexOf(i) !== -1) {
                    return false;
                }
                const enable = enablementState === 8 /* EnablementState.EnabledGlobally */ || enablementState === 9 /* EnablementState.EnabledWorkspace */;
                const isExtensionEnabled = i.enablementState === 8 /* EnablementState.EnabledGlobally */ || i.enablementState === 9 /* EnablementState.EnabledWorkspace */;
                if (enable === isExtensionEnabled) {
                    return false;
                }
                return (enable || !i.isBuiltin) // Include all Extensions for enablement and only non builtin extensions for disablement
                    && (options.dependencies || options.pack)
                    && extensions.some(extension => (options.dependencies && extension.dependencies.some(id => areSameExtensions({ id }, i.identifier)))
                        || (options.pack && extension.extensionPack.some(id => areSameExtensions({ id }, i.identifier))));
            });
            if (extensionsToEanbleOrDisable.length) {
                extensionsToEanbleOrDisable.push(...this.getExtensionsRecursively(extensionsToEanbleOrDisable, installed, enablementState, options, checked));
            }
            return extensionsToEanbleOrDisable;
        }
        return [];
    }
    getDependentsAfterDisablement(extension, extensionsToDisable, installed) {
        return installed.filter(i => {
            if (i.dependencies.length === 0) {
                return false;
            }
            if (i === extension) {
                return false;
            }
            if (!this.extensionEnablementService.isEnabledEnablementState(i.enablementState)) {
                return false;
            }
            if (extensionsToDisable.indexOf(i) !== -1) {
                return false;
            }
            return i.dependencies.some(dep => [extension, ...extensionsToDisable].some(d => areSameExtensions(d.identifier, { id: dep })));
        });
    }
    getDependentsErrorMessage(extension, allDisabledExtensions, dependents) {
        for (const e of [extension, ...allDisabledExtensions]) {
            const dependentsOfTheExtension = dependents.filter(d => d.dependencies.some(id => areSameExtensions({ id }, e.identifier)));
            if (dependentsOfTheExtension.length) {
                return this.getErrorMessageForDisablingAnExtensionWithDependents(e, dependentsOfTheExtension);
            }
        }
        return '';
    }
    getErrorMessageForDisablingAnExtensionWithDependents(extension, dependents) {
        if (dependents.length === 1) {
            return nls.localize('singleDependentError', "Cannot disable '{0}' extension alone. '{1}' extension depends on this. Do you want to disable all these extensions?", extension.displayName, dependents[0].displayName);
        }
        if (dependents.length === 2) {
            return nls.localize('twoDependentsError', "Cannot disable '{0}' extension alone. '{1}' and '{2}' extensions depend on this. Do you want to disable all these extensions?", extension.displayName, dependents[0].displayName, dependents[1].displayName);
        }
        return nls.localize('multipleDependentsError', "Cannot disable '{0}' extension alone. '{1}', '{2}' and other extensions depend on this. Do you want to disable all these extensions?", extension.displayName, dependents[0].displayName, dependents[1].displayName);
    }
    async doSetEnablement(extensions, enablementState) {
        const changed = await this.extensionEnablementService.setEnablement(extensions.map(e => e.local), enablementState);
        for (let i = 0; i < changed.length; i++) {
            if (changed[i]) {
                /* __GDPR__
                "extension:enable" : {
                    "owner": "sandy081",
                    "${include}": [
                        "${GalleryExtensionTelemetryData}"
                    ]
                }
                */
                /* __GDPR__
                "extension:disable" : {
                    "owner": "sandy081",
                    "${include}": [
                        "${GalleryExtensionTelemetryData}"
                    ]
                }
                */
                this.telemetryService.publicLog(enablementState === 8 /* EnablementState.EnabledGlobally */ || enablementState === 9 /* EnablementState.EnabledWorkspace */ ? 'extension:enable' : 'extension:disable', extensions[i].telemetryData);
            }
        }
        return changed;
    }
    updateContexts(extension) {
        if (extension && extension.outdated) {
            this.hasOutdatedExtensionsContextKey.set(true);
        }
        else {
            this.hasOutdatedExtensionsContextKey.set(this.outdated.length > 0);
        }
    }
    _activityCallBack = null;
    updateActivity() {
        if ((this.localExtensions && this.localExtensions.local.some(e => e.state === 0 /* ExtensionState.Installing */ || e.state === 2 /* ExtensionState.Uninstalling */))
            || (this.remoteExtensions && this.remoteExtensions.local.some(e => e.state === 0 /* ExtensionState.Installing */ || e.state === 2 /* ExtensionState.Uninstalling */))
            || (this.webExtensions && this.webExtensions.local.some(e => e.state === 0 /* ExtensionState.Installing */ || e.state === 2 /* ExtensionState.Uninstalling */))) {
            if (!this._activityCallBack) {
                this.progressService.withProgress({ location: 5 /* ProgressLocation.Extensions */ }, () => new Promise(resolve => this._activityCallBack = resolve));
            }
        }
        else {
            this._activityCallBack?.();
            this._activityCallBack = null;
        }
    }
    onError(err) {
        if (isCancellationError(err)) {
            return;
        }
        const message = err && err.message || '';
        if (/getaddrinfo ENOTFOUND|getaddrinfo ENOENT|connect EACCES|connect ECONNREFUSED/.test(message)) {
            return;
        }
        this.notificationService.error(err);
    }
    handleURL(uri, options) {
        if (!/^extension/.test(uri.path)) {
            return Promise.resolve(false);
        }
        this.onOpenExtensionUrl(uri);
        return Promise.resolve(true);
    }
    onOpenExtensionUrl(uri) {
        const match = /^extension\/([^/]+)$/.exec(uri.path);
        if (!match) {
            return;
        }
        const extensionId = match[1];
        this.queryLocal().then(async (local) => {
            let extension = local.find(local => areSameExtensions(local.identifier, { id: extensionId }));
            if (!extension) {
                [extension] = await this.getExtensions([{ id: extensionId }], { source: 'uri' }, CancellationToken.None);
            }
            if (extension) {
                await this.hostService.focus();
                await this.open(extension);
            }
        }).then(undefined, error => this.onError(error));
    }
    //#region Ignore Autoupdates when specific versions are installed
    /* TODO: @sandy081 Extension version shall be moved to extensions.json file */
    _ignoredAutoUpdateExtensions;
    get ignoredAutoUpdateExtensions() {
        if (!this._ignoredAutoUpdateExtensions) {
            this._ignoredAutoUpdateExtensions = JSON.parse(this.storageService.get('extensions.ignoredAutoUpdateExtension', 0 /* StorageScope.PROFILE */, '[]') || '[]');
        }
        return this._ignoredAutoUpdateExtensions;
    }
    set ignoredAutoUpdateExtensions(extensionIds) {
        this._ignoredAutoUpdateExtensions = distinct(extensionIds.map(id => id.toLowerCase()));
        this.storageService.store('extensions.ignoredAutoUpdateExtension', JSON.stringify(this._ignoredAutoUpdateExtensions), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
    }
    onDidChangeStorage(e) {
        if (e.scope === 0 /* StorageScope.PROFILE */ && e.key === 'extensions.ignoredAutoUpdateExtension') {
            this._ignoredAutoUpdateExtensions = undefined;
        }
    }
    ignoreAutoUpdate(extensionKey) {
        if (!this.isAutoUpdateIgnored(extensionKey)) {
            this.ignoredAutoUpdateExtensions = [...this.ignoredAutoUpdateExtensions, extensionKey.toString()];
        }
    }
    setExtensionIgnoresUpdate(extension, ignoreAutoUpate) {
        const extensionKey = new ExtensionKey(extension.identifier, extension.version);
        if (ignoreAutoUpate) {
            this.ignoreAutoUpdate(extensionKey);
        }
        else if (this.isAutoUpdateIgnored(extensionKey)) {
            this.ignoredAutoUpdateExtensions = this.ignoredAutoUpdateExtensions.filter(extensionId => extensionId !== extensionKey.toString());
        }
        else {
            return;
        }
        this._onChange.fire(extension);
    }
    isExtensionIgnoresUpdates(extension) {
        return this.isAutoUpdateIgnored(new ExtensionKey(extension.identifier, extension.version));
    }
    isAutoUpdateIgnored(extensionKey) {
        return this.ignoredAutoUpdateExtensions.indexOf(extensionKey.toString()) !== -1;
    }
    resetIgnoreAutoUpdateExtensions() {
        this.ignoredAutoUpdateExtensions = this.ignoredAutoUpdateExtensions.filter(extensionId => this.local.some(local => !!local.local && new ExtensionKey(local.identifier, local.version).toString() === extensionId));
    }
};
ExtensionsWorkbenchService = __decorate([
    __param(0, IInstantiationService),
    __param(1, IEditorService),
    __param(2, IWorkbenchExtensionManagementService),
    __param(3, IExtensionGalleryService),
    __param(4, IConfigurationService),
    __param(5, ITelemetryService),
    __param(6, INotificationService),
    __param(7, IURLService),
    __param(8, IWorkbenchExtensionEnablementService),
    __param(9, IHostService),
    __param(10, IProgressService),
    __param(11, IExtensionManagementServerService),
    __param(12, IStorageService),
    __param(13, ILanguageService),
    __param(14, IIgnoredExtensionsManagementService),
    __param(15, IUserDataAutoSyncService),
    __param(16, IProductService),
    __param(17, IContextKeyService),
    __param(18, IExtensionManifestPropertiesService),
    __param(19, ILogService),
    __param(20, IExtensionService),
    __param(21, ILanguagePackService),
    __param(22, ILocaleService)
], ExtensionsWorkbenchService);
export { ExtensionsWorkbenchService };
