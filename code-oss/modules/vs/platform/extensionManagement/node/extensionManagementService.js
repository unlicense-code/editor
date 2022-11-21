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
import { Promises, Queue } from 'vs/base/common/async';
import { VSBuffer } from 'vs/base/common/buffer';
import { CancellationToken } from 'vs/base/common/cancellation';
import { toErrorMessage } from 'vs/base/common/errorMessage';
import { getErrorMessage } from 'vs/base/common/errors';
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { ResourceSet } from 'vs/base/common/map';
import { Schemas } from 'vs/base/common/network';
import * as path from 'vs/base/common/path';
import { isMacintosh, isWindows } from 'vs/base/common/platform';
import { joinPath } from 'vs/base/common/resources';
import * as semver from 'vs/base/common/semver/semver';
import { isBoolean, isUndefined } from 'vs/base/common/types';
import { URI } from 'vs/base/common/uri';
import { generateUuid } from 'vs/base/common/uuid';
import * as pfs from 'vs/base/node/pfs';
import { extract, ExtractError, zip } from 'vs/base/node/zip';
import * as nls from 'vs/nls';
import { IDownloadService } from 'vs/platform/download/common/download';
import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { AbstractExtensionManagementService, AbstractExtensionTask, joinErrors } from 'vs/platform/extensionManagement/common/abstractExtensionManagementService';
import { ExtensionManagementError, ExtensionManagementErrorCode, IExtensionGalleryService, IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { areSameExtensions, computeTargetPlatform, ExtensionKey, getGalleryExtensionId, groupByExtension } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { IExtensionsProfileScannerService } from 'vs/platform/extensionManagement/common/extensionsProfileScannerService';
import { IExtensionsScannerService } from 'vs/platform/extensionManagement/common/extensionsScannerService';
import { ExtensionsDownloader } from 'vs/platform/extensionManagement/node/extensionDownloader';
import { ExtensionsLifecycle } from 'vs/platform/extensionManagement/node/extensionLifecycle';
import { getManifest } from 'vs/platform/extensionManagement/node/extensionManagementUtil';
import { ExtensionsManifestCache } from 'vs/platform/extensionManagement/node/extensionsManifestCache';
import { ExtensionsWatcher } from 'vs/platform/extensionManagement/node/extensionsWatcher';
import { isApplicationScopedExtension } from 'vs/platform/extensions/common/extensions';
import { isEngineValid } from 'vs/platform/extensions/common/extensionValidator';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService, refineServiceDecorator } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
export const INativeServerExtensionManagementService = refineServiceDecorator(IExtensionManagementService);
let ExtensionManagementService = class ExtensionManagementService extends AbstractExtensionManagementService {
    extensionsScannerService;
    extensionsProfileScannerService;
    downloadService;
    fileService;
    uriIdentityService;
    extensionsScanner;
    manifestCache;
    extensionsDownloader;
    installGalleryExtensionsTasks = new Map();
    constructor(galleryService, telemetryService, logService, environmentService, extensionsScannerService, extensionsProfileScannerService, downloadService, instantiationService, fileService, productService, uriIdentityService, userDataProfilesService) {
        super(galleryService, telemetryService, logService, productService, userDataProfilesService);
        this.extensionsScannerService = extensionsScannerService;
        this.extensionsProfileScannerService = extensionsProfileScannerService;
        this.downloadService = downloadService;
        this.fileService = fileService;
        this.uriIdentityService = uriIdentityService;
        const extensionLifecycle = this._register(instantiationService.createInstance(ExtensionsLifecycle));
        this.extensionsScanner = this._register(instantiationService.createInstance(ExtensionsScanner, extension => extensionLifecycle.postUninstall(extension)));
        this.manifestCache = this._register(new ExtensionsManifestCache(environmentService, this));
        this.extensionsDownloader = this._register(instantiationService.createInstance(ExtensionsDownloader));
        const extensionsWatcher = this._register(new ExtensionsWatcher(this, userDataProfilesService, extensionsProfileScannerService, uriIdentityService, fileService, logService));
        this._register(extensionsWatcher.onDidChangeExtensionsByAnotherSource(e => this.onDidChangeExtensionsFromAnotherSource(e)));
        this.watchForExtensionsNotInstalledBySystem();
    }
    _targetPlatformPromise;
    getTargetPlatform() {
        if (!this._targetPlatformPromise) {
            this._targetPlatformPromise = computeTargetPlatform(this.fileService, this.logService);
        }
        return this._targetPlatformPromise;
    }
    async zip(extension) {
        this.logService.trace('ExtensionManagementService#zip', extension.identifier.id);
        const files = await this.collectFiles(extension);
        const location = await zip(joinPath(this.extensionsDownloader.extensionsDownloadDir, generateUuid()).fsPath, files);
        return URI.file(location);
    }
    async unzip(zipLocation) {
        this.logService.trace('ExtensionManagementService#unzip', zipLocation.toString());
        const local = await this.install(zipLocation);
        return local.identifier;
    }
    async getManifest(vsix) {
        const { location, cleanup } = await this.downloadVsix(vsix);
        const zipPath = path.resolve(location.fsPath);
        try {
            return await getManifest(zipPath);
        }
        finally {
            await cleanup();
        }
    }
    getInstalled(type, profileLocation) {
        return this.extensionsScanner.scanExtensions(type ?? null, profileLocation);
    }
    getAllUserInstalled() {
        return this.extensionsScanner.scanAllUserExtensions(false);
    }
    async install(vsix, options = {}) {
        this.logService.trace('ExtensionManagementService#install', vsix.toString());
        const { location, cleanup } = await this.downloadVsix(vsix);
        try {
            const manifest = await getManifest(path.resolve(location.fsPath));
            if (manifest.engines && manifest.engines.vscode && !isEngineValid(manifest.engines.vscode, this.productService.version, this.productService.date)) {
                throw new Error(nls.localize('incompatible', "Unable to install extension '{0}' as it is not compatible with VS Code '{1}'.", getGalleryExtensionId(manifest.publisher, manifest.name), this.productService.version));
            }
            return await this.installExtension(manifest, location, options);
        }
        finally {
            await cleanup();
        }
    }
    getMetadata(extension) {
        return this.extensionsScannerService.scanMetadata(extension.location);
    }
    async updateMetadata(local, metadata) {
        this.logService.trace('ExtensionManagementService#updateMetadata', local.identifier.id);
        const localMetadata = { ...metadata };
        if (metadata.isPreReleaseVersion) {
            localMetadata.preRelease = true;
        }
        local = await this.extensionsScanner.updateMetadata(local, localMetadata);
        this.manifestCache.invalidate();
        return local;
    }
    async updateExtensionScope(local, isMachineScoped) {
        this.logService.trace('ExtensionManagementService#updateExtensionScope', local.identifier.id);
        local = await this.extensionsScanner.updateMetadata(local, { isMachineScoped });
        this.manifestCache.invalidate();
        return local;
    }
    async reinstallFromGallery(extension) {
        this.logService.trace('ExtensionManagementService#reinstallFromGallery', extension.identifier.id);
        if (!this.galleryService.isEnabled()) {
            throw new Error(nls.localize('MarketPlaceDisabled', "Marketplace is not enabled"));
        }
        const targetPlatform = await this.getTargetPlatform();
        const [galleryExtension] = await this.galleryService.getExtensions([{ ...extension.identifier, preRelease: extension.preRelease }], { targetPlatform, compatible: true }, CancellationToken.None);
        if (!galleryExtension) {
            throw new Error(nls.localize('Not a Marketplace extension', "Only Marketplace Extensions can be reinstalled"));
        }
        await this.extensionsScanner.setUninstalled(extension);
        try {
            await this.extensionsScanner.removeUninstalledExtension(extension);
        }
        catch (e) {
            throw new Error(nls.localize('removeError', "Error while removing the extension: {0}. Please Quit and Start VS Code before trying again.", toErrorMessage(e)));
        }
        await this.installFromGallery(galleryExtension);
    }
    markAsUninstalled(...extensions) {
        return this.extensionsScanner.setUninstalled(...extensions);
    }
    removeUninstalledExtensions() {
        return this.extensionsScanner.cleanUp();
    }
    migrateDefaultProfileExtensions() {
        return this.extensionsScanner.migrateDefaultProfileExtensions();
    }
    async download(extension, operation) {
        const { location } = await this.extensionsDownloader.download(extension, operation);
        return location;
    }
    async downloadVsix(vsix) {
        if (vsix.scheme === Schemas.file) {
            return { location: vsix, async cleanup() { } };
        }
        this.logService.trace('Downloading extension from', vsix.toString());
        const location = joinPath(this.extensionsDownloader.extensionsDownloadDir, generateUuid());
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
    getCurrentExtensionsManifestLocation() {
        return this.userDataProfilesService.defaultProfile.extensionsResource;
    }
    createInstallExtensionTask(manifest, extension, options) {
        let installExtensionTask;
        if (URI.isUri(extension)) {
            installExtensionTask = new InstallVSIXTask(manifest, extension, options, this.galleryService, this.extensionsScanner, this.logService);
        }
        else {
            const key = ExtensionKey.create(extension).toString();
            installExtensionTask = this.installGalleryExtensionsTasks.get(key);
            if (!installExtensionTask) {
                this.installGalleryExtensionsTasks.set(key, installExtensionTask = new InstallGalleryExtensionTask(manifest, extension, options, this.extensionsDownloader, this.extensionsScanner, this.logService));
                installExtensionTask.waitUntilTaskIsFinished().then(() => this.installGalleryExtensionsTasks.delete(key));
            }
        }
        return new InstallExtensionInProfileTask(installExtensionTask, options.profileLocation, this.extensionsProfileScannerService);
    }
    createUninstallExtensionTask(extension, options) {
        return new UninstallExtensionFromProfileTask(extension, options.profileLocation, this.extensionsProfileScannerService);
    }
    async collectFiles(extension) {
        const collectFilesFromDirectory = async (dir) => {
            let entries = await pfs.Promises.readdir(dir);
            entries = entries.map(e => path.join(dir, e));
            const stats = await Promise.all(entries.map(e => pfs.Promises.stat(e)));
            let promise = Promise.resolve([]);
            stats.forEach((stat, index) => {
                const entry = entries[index];
                if (stat.isFile()) {
                    promise = promise.then(result => ([...result, entry]));
                }
                if (stat.isDirectory()) {
                    promise = promise
                        .then(result => collectFilesFromDirectory(entry)
                        .then(files => ([...result, ...files])));
                }
            });
            return promise;
        };
        const files = await collectFilesFromDirectory(extension.location.fsPath);
        return files.map(f => ({ path: `extension/${path.relative(extension.location.fsPath, f)}`, localPath: f }));
    }
    async onDidChangeExtensionsFromAnotherSource({ added, removed }) {
        if (removed) {
            for (const identifier of removed.extensions) {
                this.logService.info('Extensions removed from another source', identifier.id, removed.profileLocation.toString());
                this._onDidUninstallExtension.fire({ identifier, profileLocation: removed.profileLocation });
            }
        }
        if (added) {
            const extensions = await this.extensionsScanner.scanExtensions(1 /* ExtensionType.User */, added.profileLocation);
            const addedExtensions = extensions.filter(e => added.extensions.some(identifier => areSameExtensions(identifier, e.identifier)));
            this._onDidInstallExtensions.fire(addedExtensions.map(local => {
                this.logService.info('Extensions added from another source', local.identifier.id, added.profileLocation.toString());
                return { identifier: local.identifier, local, profileLocation: added.profileLocation, operation: 1 /* InstallOperation.None */ };
            }));
        }
    }
    knownDirectories = new ResourceSet();
    async watchForExtensionsNotInstalledBySystem() {
        this._register(this.extensionsScanner.onExtract(resource => this.knownDirectories.add(resource)));
        const stat = await this.fileService.resolve(this.extensionsScannerService.userExtensionsLocation);
        for (const childStat of stat.children ?? []) {
            if (childStat.isDirectory) {
                this.knownDirectories.add(childStat.resource);
            }
        }
        this._register(this.fileService.watch(this.extensionsScannerService.userExtensionsLocation));
        this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
    }
    async onDidFilesChange(e) {
        const added = [];
        for (const resource of e.rawAdded) {
            // Check if this is a known directory
            if (this.knownDirectories.has(resource)) {
                continue;
            }
            // Is not immediate child of extensions resource
            if (!this.uriIdentityService.extUri.isEqual(this.uriIdentityService.extUri.dirname(resource), this.extensionsScannerService.userExtensionsLocation)) {
                continue;
            }
            // .obsolete file changed
            if (this.uriIdentityService.extUri.isEqual(resource, this.uriIdentityService.extUri.joinPath(this.extensionsScannerService.userExtensionsLocation, '.obsolete'))) {
                continue;
            }
            // Ignore changes to files starting with `.`
            if (this.uriIdentityService.extUri.basename(resource).startsWith('.')) {
                continue;
            }
            // Check if this is a directory
            if (!(await this.fileService.stat(resource)).isDirectory) {
                continue;
            }
            // Check if this is an extension added by another source
            // Extension added by another source will not have installed timestamp
            const extension = await this.extensionsScanner.scanUserExtensionAtLocation(resource);
            if (extension && extension.installedTimestamp === undefined) {
                this.knownDirectories.add(resource);
                added.push(extension);
            }
        }
        if (added.length) {
            await this.extensionsProfileScannerService.addExtensionsToProfile(added.map(local => ([local, undefined])), this.userDataProfilesService.defaultProfile.extensionsResource);
            this._onDidInstallExtensions.fire(added.map(local => ({ local, version: local.manifest.version, identifier: local.identifier, operation: 1 /* InstallOperation.None */, profileLocation: this.userDataProfilesService.defaultProfile.extensionsResource })));
        }
    }
};
ExtensionManagementService = __decorate([
    __param(0, IExtensionGalleryService),
    __param(1, ITelemetryService),
    __param(2, ILogService),
    __param(3, INativeEnvironmentService),
    __param(4, IExtensionsScannerService),
    __param(5, IExtensionsProfileScannerService),
    __param(6, IDownloadService),
    __param(7, IInstantiationService),
    __param(8, IFileService),
    __param(9, IProductService),
    __param(10, IUriIdentityService),
    __param(11, IUserDataProfilesService)
], ExtensionManagementService);
export { ExtensionManagementService };
let ExtensionsScanner = class ExtensionsScanner extends Disposable {
    beforeRemovingExtension;
    fileService;
    extensionsScannerService;
    userDataProfilesService;
    extensionsProfileScannerService;
    logService;
    uninstalledPath;
    uninstalledFileLimiter;
    _onExtract = this._register(new Emitter());
    onExtract = this._onExtract.event;
    constructor(beforeRemovingExtension, fileService, extensionsScannerService, userDataProfilesService, extensionsProfileScannerService, logService) {
        super();
        this.beforeRemovingExtension = beforeRemovingExtension;
        this.fileService = fileService;
        this.extensionsScannerService = extensionsScannerService;
        this.userDataProfilesService = userDataProfilesService;
        this.extensionsProfileScannerService = extensionsProfileScannerService;
        this.logService = logService;
        this.uninstalledPath = joinPath(this.extensionsScannerService.userExtensionsLocation, '.obsolete').fsPath;
        this.uninstalledFileLimiter = new Queue();
    }
    async cleanUp() {
        await this.removeUninstalledExtensions();
    }
    async scanExtensions(type, profileLocation) {
        await this.migrateDefaultProfileExtensions();
        const userScanOptions = { includeInvalid: true, profileLocation };
        let scannedExtensions = [];
        if (type === null || type === 0 /* ExtensionType.System */) {
            scannedExtensions.push(...await this.extensionsScannerService.scanAllExtensions({ includeInvalid: true }, userScanOptions, false));
        }
        else if (type === 1 /* ExtensionType.User */) {
            scannedExtensions.push(...await this.extensionsScannerService.scanUserExtensions(userScanOptions));
        }
        scannedExtensions = type !== null ? scannedExtensions.filter(r => r.type === type) : scannedExtensions;
        return Promise.all(scannedExtensions.map(extension => this.toLocalExtension(extension)));
    }
    async scanAllUserExtensions(excludeOutdated) {
        const scannedExtensions = await this.extensionsScannerService.scanUserExtensions({ includeAllVersions: !excludeOutdated, includeInvalid: true });
        return Promise.all(scannedExtensions.map(extension => this.toLocalExtension(extension)));
    }
    async scanUserExtensionAtLocation(location) {
        try {
            const scannedExtension = await this.extensionsScannerService.scanExistingExtension(location, 1 /* ExtensionType.User */, { includeInvalid: true });
            if (scannedExtension) {
                return await this.toLocalExtension(scannedExtension);
            }
        }
        catch (error) {
            this.logService.error(error);
        }
        return null;
    }
    async extractUserExtension(extensionKey, zipPath, metadata, token) {
        await this.migrateDefaultProfileExtensions();
        const folderName = extensionKey.toString();
        const tempPath = path.join(this.extensionsScannerService.userExtensionsLocation.fsPath, `.${generateUuid()}`);
        const extensionPath = path.join(this.extensionsScannerService.userExtensionsLocation.fsPath, folderName);
        try {
            await pfs.Promises.rm(extensionPath);
        }
        catch (error) {
            throw new ExtensionManagementError(nls.localize('errorDeleting', "Unable to delete the existing folder '{0}' while installing the extension '{1}'. Please delete the folder manually and try again", extensionPath, extensionKey.id), ExtensionManagementErrorCode.Delete);
        }
        await this.extractAtLocation(extensionKey, zipPath, tempPath, token);
        await this.extensionsScannerService.updateMetadata(URI.file(tempPath), metadata);
        try {
            this._onExtract.fire(URI.file(extensionPath));
            await this.rename(extensionKey, tempPath, extensionPath, Date.now() + (2 * 60 * 1000) /* Retry for 2 minutes */);
            this.logService.info('Renamed to', extensionPath);
        }
        catch (error) {
            try {
                await pfs.Promises.rm(tempPath);
            }
            catch (e) { /* ignore */ }
            if (error.code === 'ENOTEMPTY') {
                this.logService.info(`Rename failed because extension was installed by another source. So ignoring renaming.`, extensionKey.id);
            }
            else {
                this.logService.info(`Rename failed because of ${getErrorMessage(error)}. Deleted from extracted location`, tempPath);
                throw error;
            }
        }
        return this.scanLocalExtension(URI.file(extensionPath), 1 /* ExtensionType.User */);
    }
    async updateMetadata(local, metadata) {
        await this.extensionsScannerService.updateMetadata(local.location, metadata);
        return this.scanLocalExtension(local.location, local.type);
    }
    getUninstalledExtensions() {
        return this.withUninstalledExtensions();
    }
    async setUninstalled(...extensions) {
        const extensionKeys = extensions.map(e => ExtensionKey.create(e));
        await this.withUninstalledExtensions(uninstalled => extensionKeys.forEach(extensionKey => {
            uninstalled[extensionKey.toString()] = true;
            this.logService.info('Marked extension as uninstalled', extensionKey.toString());
        }));
    }
    async setInstalled(extensionKey) {
        await this.withUninstalledExtensions(uninstalled => delete uninstalled[extensionKey.toString()]);
        const userExtensions = await this.scanAllUserExtensions(true);
        const localExtension = userExtensions.find(i => ExtensionKey.create(i).equals(extensionKey)) || null;
        if (!localExtension) {
            return null;
        }
        return this.updateMetadata(localExtension, { installedTimestamp: Date.now() });
    }
    async removeExtension(extension, type) {
        this.logService.trace(`Deleting ${type} extension from disk`, extension.identifier.id, extension.location.fsPath);
        await pfs.Promises.rm(extension.location.fsPath);
        this.logService.info('Deleted from disk', extension.identifier.id, extension.location.fsPath);
    }
    async removeUninstalledExtension(extension) {
        await this.removeExtension(extension, 'uninstalled');
        await this.withUninstalledExtensions(uninstalled => delete uninstalled[ExtensionKey.create(extension).toString()]);
    }
    async withUninstalledExtensions(updateFn) {
        return this.uninstalledFileLimiter.queue(async () => {
            let raw;
            try {
                raw = await pfs.Promises.readFile(this.uninstalledPath, 'utf8');
            }
            catch (err) {
                if (err.code !== 'ENOENT') {
                    throw err;
                }
            }
            let uninstalled = {};
            if (raw) {
                try {
                    uninstalled = JSON.parse(raw);
                }
                catch (e) { /* ignore */ }
            }
            if (updateFn) {
                updateFn(uninstalled);
                if (Object.keys(uninstalled).length) {
                    await pfs.Promises.writeFile(this.uninstalledPath, JSON.stringify(uninstalled));
                }
                else {
                    await pfs.Promises.rm(this.uninstalledPath);
                }
            }
            return uninstalled;
        });
    }
    async extractAtLocation(identifier, zipPath, location, token) {
        this.logService.trace(`Started extracting the extension from ${zipPath} to ${location}`);
        // Clean the location
        try {
            await pfs.Promises.rm(location);
        }
        catch (e) {
            throw new ExtensionManagementError(this.joinErrors(e).message, ExtensionManagementErrorCode.Delete);
        }
        try {
            await extract(zipPath, location, { sourcePath: 'extension', overwrite: true }, token);
            this.logService.info(`Extracted extension to ${location}:`, identifier.id);
        }
        catch (e) {
            try {
                await pfs.Promises.rm(location);
            }
            catch (e) { /* Ignore */ }
            let errorCode = ExtensionManagementErrorCode.Extract;
            if (e instanceof ExtractError) {
                if (e.type === 'CorruptZip') {
                    errorCode = ExtensionManagementErrorCode.CorruptZip;
                }
                else if (e.type === 'Incomplete') {
                    errorCode = ExtensionManagementErrorCode.IncompleteZip;
                }
            }
            throw new ExtensionManagementError(e.message, errorCode);
        }
    }
    async rename(identifier, extractPath, renamePath, retryUntil) {
        try {
            await pfs.Promises.rename(extractPath, renamePath);
        }
        catch (error) {
            if (isWindows && error && error.code === 'EPERM' && Date.now() < retryUntil) {
                this.logService.info(`Failed renaming ${extractPath} to ${renamePath} with 'EPERM' error. Trying again...`, identifier.id);
                return this.rename(identifier, extractPath, renamePath, retryUntil);
            }
            throw new ExtensionManagementError(error.message || nls.localize('renameError', "Unknown error while renaming {0} to {1}", extractPath, renamePath), error.code || ExtensionManagementErrorCode.Rename);
        }
    }
    async scanLocalExtension(location, type) {
        const scannedExtension = await this.extensionsScannerService.scanExistingExtension(location, type, { includeInvalid: true });
        if (scannedExtension) {
            return this.toLocalExtension(scannedExtension);
        }
        throw new Error(nls.localize('cannot read', "Cannot read the extension from {0}", location.path));
    }
    async toLocalExtension(extension) {
        const stat = await this.fileService.resolve(extension.location);
        let readmeUrl;
        let changelogUrl;
        if (stat.children) {
            readmeUrl = stat.children.find(({ name }) => /^readme(\.txt|\.md|)$/i.test(name))?.resource;
            changelogUrl = stat.children.find(({ name }) => /^changelog(\.txt|\.md|)$/i.test(name))?.resource;
        }
        return {
            identifier: extension.identifier,
            type: extension.type,
            isBuiltin: extension.isBuiltin || !!extension.metadata?.isBuiltin,
            location: extension.location,
            manifest: extension.manifest,
            targetPlatform: extension.targetPlatform,
            validations: extension.validations,
            isValid: extension.isValid,
            readmeUrl,
            changelogUrl,
            publisherDisplayName: extension.metadata?.publisherDisplayName || null,
            publisherId: extension.metadata?.publisherId || null,
            isApplicationScoped: !!extension.metadata?.isApplicationScoped,
            isMachineScoped: !!extension.metadata?.isMachineScoped,
            isPreReleaseVersion: !!extension.metadata?.isPreReleaseVersion,
            preRelease: !!extension.metadata?.preRelease,
            installedTimestamp: extension.metadata?.installedTimestamp,
            updated: !!extension.metadata?.updated,
        };
    }
    async removeUninstalledExtensions() {
        const uninstalled = await this.getUninstalledExtensions();
        const extensions = await this.extensionsScannerService.scanUserExtensions({ includeAllVersions: true, includeUninstalled: true, includeInvalid: true }); // All user extensions
        const installed = new Set();
        for (const e of extensions) {
            if (!uninstalled[ExtensionKey.create(e).toString()]) {
                installed.add(e.identifier.id.toLowerCase());
            }
        }
        const byExtension = groupByExtension(extensions, e => e.identifier);
        await Promises.settled(byExtension.map(async (e) => {
            const latest = e.sort((a, b) => semver.rcompare(a.manifest.version, b.manifest.version))[0];
            if (!installed.has(latest.identifier.id.toLowerCase())) {
                await this.beforeRemovingExtension(await this.toLocalExtension(latest));
            }
        }));
        const toRemove = extensions.filter(e => uninstalled[ExtensionKey.create(e).toString()]);
        await Promises.settled(toRemove.map(e => this.removeUninstalledExtension(e)));
    }
    _migrateDefaultProfileExtensionsPromise = undefined;
    migrateDefaultProfileExtensions() {
        if (!this._migrateDefaultProfileExtensionsPromise) {
            this._migrateDefaultProfileExtensionsPromise = (async () => {
                try {
                    const migrationMarkerFile = joinPath(this.userDataProfilesService.defaultProfile.location, '.migrated-default-profile');
                    if (await this.fileService.exists(migrationMarkerFile)) {
                        return;
                    }
                    if (!(await this.fileService.exists(this.userDataProfilesService.defaultProfile.extensionsResource))) {
                        this.logService.info('Started migrating default profile extensions from extensions installation folder to extensions manifest.');
                        const userExtensions = await this.extensionsScannerService.scanUserExtensions({ includeInvalid: true });
                        await this.extensionsProfileScannerService.addExtensionsToProfile(userExtensions.map(e => [e, e.metadata]), this.userDataProfilesService.defaultProfile.extensionsResource);
                        this.logService.info('Completed migrating default profile extensions from extensions installation folder to extensions manifest.');
                    }
                    try {
                        await this.fileService.createFile(migrationMarkerFile, VSBuffer.fromString(''));
                    }
                    catch (error) {
                        this.logService.warn('Failed to create migration marker file for default profile extensions migration.', getErrorMessage(error));
                    }
                }
                catch (error) {
                    this.logService.error(error);
                    throw error;
                }
            })();
        }
        return this._migrateDefaultProfileExtensionsPromise;
    }
    joinErrors(errorOrErrors) {
        const errors = Array.isArray(errorOrErrors) ? errorOrErrors : [errorOrErrors];
        if (errors.length === 1) {
            return errors[0] instanceof Error ? errors[0] : new Error(errors[0]);
        }
        return errors.reduce((previousValue, currentValue) => {
            return new Error(`${previousValue.message}${previousValue.message ? ',' : ''}${currentValue instanceof Error ? currentValue.message : currentValue}`);
        }, new Error(''));
    }
};
ExtensionsScanner = __decorate([
    __param(1, IFileService),
    __param(2, IExtensionsScannerService),
    __param(3, IUserDataProfilesService),
    __param(4, IExtensionsProfileScannerService),
    __param(5, ILogService)
], ExtensionsScanner);
export { ExtensionsScanner };
class InstallExtensionTask extends AbstractExtensionTask {
    identifier;
    source;
    options;
    extensionsScanner;
    logService;
    wasVerified = false;
    _operation = 2 /* InstallOperation.Install */;
    get operation() { return isUndefined(this.options.operation) ? this._operation : this.options.operation; }
    constructor(identifier, source, options, extensionsScanner, logService) {
        super();
        this.identifier = identifier;
        this.source = source;
        this.options = options;
        this.extensionsScanner = extensionsScanner;
        this.logService = logService;
    }
    async installExtension(installableExtension, token) {
        try {
            const local = await this.unsetUninstalledAndGetLocal(installableExtension.key);
            if (local) {
                return this.extensionsScanner.updateMetadata(local, installableExtension.metadata);
            }
        }
        catch (e) {
            if (isMacintosh) {
                throw new ExtensionManagementError(nls.localize('quitCode', "Unable to install the extension. Please Quit and Start VS Code before reinstalling."), ExtensionManagementErrorCode.Internal);
            }
            else {
                throw new ExtensionManagementError(nls.localize('exitCode', "Unable to install the extension. Please Exit and Start VS Code before reinstalling."), ExtensionManagementErrorCode.Internal);
            }
        }
        return this.extract(installableExtension, token);
    }
    async unsetUninstalledAndGetLocal(extensionKey) {
        const isUninstalled = await this.isUninstalled(extensionKey);
        if (!isUninstalled) {
            return null;
        }
        this.logService.trace('Removing the extension from uninstalled list:', extensionKey.id);
        // If the same version of extension is marked as uninstalled, remove it from there and return the local.
        const local = await this.extensionsScanner.setInstalled(extensionKey);
        this.logService.info('Removed the extension from uninstalled list:', extensionKey.id);
        return local;
    }
    async isUninstalled(extensionId) {
        const uninstalled = await this.extensionsScanner.getUninstalledExtensions();
        return !!uninstalled[extensionId.toString()];
    }
    async extract({ zipPath, key, metadata }, token) {
        const local = await this.extensionsScanner.extractUserExtension(key, zipPath, metadata, token);
        this.logService.info('Extracting completed.', key.id);
        return local;
    }
}
export class InstallGalleryExtensionTask extends InstallExtensionTask {
    manifest;
    gallery;
    extensionsDownloader;
    constructor(manifest, gallery, options, extensionsDownloader, extensionsScanner, logService) {
        super(gallery.identifier, gallery, options, extensionsScanner, logService);
        this.manifest = manifest;
        this.gallery = gallery;
        this.extensionsDownloader = extensionsDownloader;
    }
    async doRun(token) {
        const installed = await this.extensionsScanner.scanExtensions(null, undefined);
        const existingExtension = installed.find(i => areSameExtensions(i.identifier, this.gallery.identifier));
        if (existingExtension) {
            this._operation = 3 /* InstallOperation.Update */;
        }
        const metadata = {
            id: this.gallery.identifier.uuid,
            publisherId: this.gallery.publisherId,
            publisherDisplayName: this.gallery.publisherDisplayName,
            targetPlatform: this.gallery.properties.targetPlatform,
            isApplicationScoped: isApplicationScopedExtension(this.manifest),
            isMachineScoped: this.options.isMachineScoped || existingExtension?.isMachineScoped,
            isBuiltin: this.options.isBuiltin || existingExtension?.isBuiltin,
            isSystem: existingExtension?.type === 0 /* ExtensionType.System */ ? true : undefined,
            updated: !!existingExtension,
            isPreReleaseVersion: this.gallery.properties.isPreReleaseVersion,
            installedTimestamp: Date.now(),
            preRelease: this.gallery.properties.isPreReleaseVersion ||
                (isBoolean(this.options.installPreReleaseVersion)
                    ? this.options.installPreReleaseVersion /* Respect the passed flag */
                    : existingExtension?.preRelease /* Respect the existing pre-release flag if it was set */)
        };
        if (existingExtension?.manifest.version === this.gallery.version) {
            const local = await this.extensionsScanner.updateMetadata(existingExtension, metadata);
            return { local, metadata };
        }
        const { location, verified } = await this.extensionsDownloader.download(this.gallery, this._operation);
        try {
            this.wasVerified = !!verified;
            this.validateManifest(location.fsPath);
            const local = await this.installExtension({ zipPath: location.fsPath, key: ExtensionKey.create(this.gallery), metadata }, token);
            return { local, metadata };
        }
        catch (error) {
            try {
                await this.extensionsDownloader.delete(location);
            }
            catch (error) {
                /* Ignore */
                this.logService.warn(`Error while deleting the downloaded file`, location.toString(), getErrorMessage(error));
            }
            throw error;
        }
    }
    async validateManifest(zipPath) {
        try {
            await getManifest(zipPath);
        }
        catch (error) {
            throw new ExtensionManagementError(joinErrors(error).message, ExtensionManagementErrorCode.Invalid);
        }
    }
}
class InstallVSIXTask extends InstallExtensionTask {
    manifest;
    location;
    galleryService;
    constructor(manifest, location, options, galleryService, extensionsScanner, logService) {
        super({ id: getGalleryExtensionId(manifest.publisher, manifest.name) }, location, options, extensionsScanner, logService);
        this.manifest = manifest;
        this.location = location;
        this.galleryService = galleryService;
    }
    async doRun(token) {
        const extensionKey = new ExtensionKey(this.identifier, this.manifest.version);
        const installedExtensions = await this.extensionsScanner.scanExtensions(1 /* ExtensionType.User */, undefined);
        const existing = installedExtensions.find(i => areSameExtensions(this.identifier, i.identifier));
        const metadata = await this.getMetadata(this.identifier.id, this.manifest.version, token);
        metadata.isApplicationScoped = isApplicationScopedExtension(this.manifest);
        metadata.isMachineScoped = this.options.isMachineScoped || existing?.isMachineScoped;
        metadata.isBuiltin = this.options.isBuiltin || existing?.isBuiltin;
        metadata.installedTimestamp = Date.now();
        if (existing) {
            this._operation = 3 /* InstallOperation.Update */;
            if (extensionKey.equals(new ExtensionKey(existing.identifier, existing.manifest.version))) {
                try {
                    await this.extensionsScanner.removeExtension(existing, 'existing');
                }
                catch (e) {
                    throw new Error(nls.localize('restartCode', "Please restart VS Code before reinstalling {0}.", this.manifest.displayName || this.manifest.name));
                }
            }
            else if (!this.options.profileLocation && semver.gt(existing.manifest.version, this.manifest.version)) {
                await this.extensionsScanner.setUninstalled(existing);
            }
        }
        else {
            // Remove the extension with same version if it is already uninstalled.
            // Installing a VSIX extension shall replace the existing extension always.
            const existing = await this.unsetUninstalledAndGetLocal(extensionKey);
            if (existing) {
                try {
                    await this.extensionsScanner.removeExtension(existing, 'existing');
                }
                catch (e) {
                    throw new Error(nls.localize('restartCode', "Please restart VS Code before reinstalling {0}.", this.manifest.displayName || this.manifest.name));
                }
            }
        }
        const local = await this.installExtension({ zipPath: path.resolve(this.location.fsPath), key: extensionKey, metadata }, token);
        return { local, metadata };
    }
    async getMetadata(id, version, token) {
        try {
            let [galleryExtension] = await this.galleryService.getExtensions([{ id, version }], token);
            if (!galleryExtension) {
                [galleryExtension] = await this.galleryService.getExtensions([{ id }], token);
            }
            if (galleryExtension) {
                return {
                    id: galleryExtension.identifier.uuid,
                    publisherDisplayName: galleryExtension.publisherDisplayName,
                    publisherId: galleryExtension.publisherId,
                    isPreReleaseVersion: galleryExtension.properties.isPreReleaseVersion,
                    preRelease: galleryExtension.properties.isPreReleaseVersion || this.options.installPreReleaseVersion
                };
            }
        }
        catch (error) {
            /* Ignore Error */
        }
        return {};
    }
}
class InstallExtensionInProfileTask {
    task;
    profileLocation;
    extensionsProfileScannerService;
    identifier = this.task.identifier;
    source = this.task.source;
    operation = this.task.operation;
    promise;
    constructor(task, profileLocation, extensionsProfileScannerService) {
        this.task = task;
        this.profileLocation = profileLocation;
        this.extensionsProfileScannerService = extensionsProfileScannerService;
        this.promise = this.waitAndAddExtensionToProfile();
    }
    async waitAndAddExtensionToProfile() {
        const result = await this.task.waitUntilTaskIsFinished();
        await this.extensionsProfileScannerService.addExtensionsToProfile([[result.local, result.metadata]], this.profileLocation);
        return result;
    }
    async run() {
        await this.task.run();
        return this.promise;
    }
    waitUntilTaskIsFinished() {
        return this.promise;
    }
    cancel() {
        return this.task.cancel();
    }
}
class UninstallExtensionFromProfileTask extends AbstractExtensionTask {
    extension;
    profileLocation;
    extensionsProfileScannerService;
    constructor(extension, profileLocation, extensionsProfileScannerService) {
        super();
        this.extension = extension;
        this.profileLocation = profileLocation;
        this.extensionsProfileScannerService = extensionsProfileScannerService;
    }
    async doRun(token) {
        await this.extensionsProfileScannerService.removeExtensionFromProfile(this.extension, this.profileLocation);
    }
}
