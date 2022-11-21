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
import { coalesce } from 'vs/base/common/arrays';
import { ThrottledDelayer } from 'vs/base/common/async';
import * as objects from 'vs/base/common/objects';
import { VSBuffer } from 'vs/base/common/buffer';
import { getErrorMessage } from 'vs/base/common/errors';
import { getNodeType, parse } from 'vs/base/common/json';
import { getParseErrorMessage } from 'vs/base/common/jsonErrorMessages';
import { Disposable } from 'vs/base/common/lifecycle';
import { FileAccess, Schemas } from 'vs/base/common/network';
import * as path from 'vs/base/common/path';
import * as platform from 'vs/base/common/platform';
import { basename, isEqual, joinPath } from 'vs/base/common/resources';
import * as semver from 'vs/base/common/semver/semver';
import Severity from 'vs/base/common/severity';
import { isEmptyObject } from 'vs/base/common/types';
import { URI } from 'vs/base/common/uri';
import { localize } from 'vs/nls';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { areSameExtensions, computeTargetPlatform, ExtensionKey, getExtensionId, getGalleryExtensionId } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { ExtensionIdentifier, UNDEFINED_PUBLISHER, BUILTIN_MANIFEST_CACHE_FILE, USER_MANIFEST_CACHE_FILE, MANIFEST_CACHE_FOLDER } from 'vs/platform/extensions/common/extensions';
import { validateExtensionManifest } from 'vs/platform/extensions/common/extensionValidator';
import { IFileService, toFileOperationResult } from 'vs/platform/files/common/files';
import { createDecorator, IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { Emitter } from 'vs/base/common/event';
import { revive } from 'vs/base/common/marshalling';
import { IExtensionsProfileScannerService } from 'vs/platform/extensionManagement/common/extensionsProfileScannerService';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { localizeManifest } from 'vs/platform/extensionManagement/common/extensionNls';
import { ImplicitActivationEvents } from 'vs/platform/extensionManagement/common/implicitActivationEvents';
export var Translations;
(function (Translations) {
    function equals(a, b) {
        if (a === b) {
            return true;
        }
        const aKeys = Object.keys(a);
        const bKeys = new Set();
        for (const key of Object.keys(b)) {
            bKeys.add(key);
        }
        if (aKeys.length !== bKeys.size) {
            return false;
        }
        for (const key of aKeys) {
            if (a[key] !== b[key]) {
                return false;
            }
            bKeys.delete(key);
        }
        return bKeys.size === 0;
    }
    Translations.equals = equals;
})(Translations || (Translations = {}));
export const IExtensionsScannerService = createDecorator('IExtensionsScannerService');
let AbstractExtensionsScannerService = class AbstractExtensionsScannerService extends Disposable {
    systemExtensionsLocation;
    userExtensionsLocation;
    extensionsControlLocation;
    cacheLocation;
    userDataProfilesService;
    extensionsProfileScannerService;
    fileService;
    logService;
    environmentService;
    productService;
    uriIdentityService;
    instantiationService;
    _serviceBrand;
    _onDidChangeCache = this._register(new Emitter());
    onDidChangeCache = this._onDidChangeCache.event;
    obsoleteFile = joinPath(this.userExtensionsLocation, '.obsolete');
    systemExtensionsCachedScanner = this._register(this.instantiationService.createInstance(CachedExtensionsScanner, joinPath(this.cacheLocation, BUILTIN_MANIFEST_CACHE_FILE), this.obsoleteFile));
    userExtensionsCachedScanner = this._register(this.instantiationService.createInstance(CachedExtensionsScanner, joinPath(this.cacheLocation, USER_MANIFEST_CACHE_FILE), this.obsoleteFile));
    extensionsScanner = this._register(this.instantiationService.createInstance(ExtensionsScanner, this.obsoleteFile));
    constructor(systemExtensionsLocation, userExtensionsLocation, extensionsControlLocation, cacheLocation, userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService) {
        super();
        this.systemExtensionsLocation = systemExtensionsLocation;
        this.userExtensionsLocation = userExtensionsLocation;
        this.extensionsControlLocation = extensionsControlLocation;
        this.cacheLocation = cacheLocation;
        this.userDataProfilesService = userDataProfilesService;
        this.extensionsProfileScannerService = extensionsProfileScannerService;
        this.fileService = fileService;
        this.logService = logService;
        this.environmentService = environmentService;
        this.productService = productService;
        this.uriIdentityService = uriIdentityService;
        this.instantiationService = instantiationService;
        this._register(this.systemExtensionsCachedScanner.onDidChangeCache(() => this._onDidChangeCache.fire(0 /* ExtensionType.System */)));
        this._register(this.userExtensionsCachedScanner.onDidChangeCache(() => this._onDidChangeCache.fire(1 /* ExtensionType.User */)));
    }
    _targetPlatformPromise;
    getTargetPlatform() {
        if (!this._targetPlatformPromise) {
            this._targetPlatformPromise = computeTargetPlatform(this.fileService, this.logService);
        }
        return this._targetPlatformPromise;
    }
    async scanAllExtensions(systemScanOptions, userScanOptions, includeExtensionsUnderDev) {
        const [system, user] = await Promise.all([
            this.scanSystemExtensions(systemScanOptions),
            this.scanUserExtensions(userScanOptions),
        ]);
        const development = includeExtensionsUnderDev ? await this.scanExtensionsUnderDevelopment(systemScanOptions, [...system, ...user]) : [];
        return this.dedupExtensions(system, user, development, await this.getTargetPlatform(), true);
    }
    async scanSystemExtensions(scanOptions) {
        const promises = [];
        promises.push(this.scanDefaultSystemExtensions(!!scanOptions.useCache, scanOptions.language));
        promises.push(this.scanDevSystemExtensions(scanOptions.language, !!scanOptions.checkControlFile));
        const [defaultSystemExtensions, devSystemExtensions] = await Promise.all(promises);
        return this.applyScanOptions([...defaultSystemExtensions, ...devSystemExtensions], 0 /* ExtensionType.System */, scanOptions, false);
    }
    async scanUserExtensions(scanOptions) {
        const location = scanOptions.profileLocation ?? this.userExtensionsLocation;
        this.logService.trace('Started scanning user extensions', location);
        const extensionsScannerInput = await this.createExtensionScannerInput(location, !!scanOptions.profileLocation, 1 /* ExtensionType.User */, !scanOptions.includeUninstalled, scanOptions.language);
        const extensionsScanner = scanOptions.useCache && !extensionsScannerInput.devMode && extensionsScannerInput.excludeObsolete ? this.userExtensionsCachedScanner : this.extensionsScanner;
        let extensions = await extensionsScanner.scanExtensions(extensionsScannerInput);
        extensions = await this.applyScanOptions(extensions, 1 /* ExtensionType.User */, scanOptions, true);
        this.logService.trace('Scanned user extensions:', extensions.length);
        return extensions;
    }
    async scanExtensionsUnderDevelopment(scanOptions, existingExtensions) {
        if (this.environmentService.isExtensionDevelopment && this.environmentService.extensionDevelopmentLocationURI) {
            const extensions = (await Promise.all(this.environmentService.extensionDevelopmentLocationURI.filter(extLoc => extLoc.scheme === Schemas.file)
                .map(async (extensionDevelopmentLocationURI) => {
                const input = await this.createExtensionScannerInput(extensionDevelopmentLocationURI, false, 1 /* ExtensionType.User */, true, scanOptions.language, false /* do not validate */);
                const extensions = await this.extensionsScanner.scanOneOrMultipleExtensions(input);
                return extensions.map(extension => {
                    // Override the extension type from the existing extensions
                    extension.type = existingExtensions.find(e => areSameExtensions(e.identifier, extension.identifier))?.type ?? extension.type;
                    // Validate the extension
                    return this.extensionsScanner.validate(extension, input);
                });
            })))
                .flat();
            return this.applyScanOptions(extensions, 'development', scanOptions, true);
        }
        return [];
    }
    async scanExistingExtension(extensionLocation, extensionType, scanOptions) {
        const extensionsScannerInput = await this.createExtensionScannerInput(extensionLocation, false, extensionType, true, scanOptions.language);
        const extension = await this.extensionsScanner.scanExtension(extensionsScannerInput);
        if (!extension) {
            return null;
        }
        if (!scanOptions.includeInvalid && !extension.isValid) {
            return null;
        }
        return extension;
    }
    async scanOneOrMultipleExtensions(extensionLocation, extensionType, scanOptions) {
        const extensionsScannerInput = await this.createExtensionScannerInput(extensionLocation, false, extensionType, true, scanOptions.language);
        const extensions = await this.extensionsScanner.scanOneOrMultipleExtensions(extensionsScannerInput);
        return this.applyScanOptions(extensions, extensionType, scanOptions, true);
    }
    async scanMetadata(extensionLocation) {
        const manifestLocation = joinPath(extensionLocation, 'package.json');
        const content = (await this.fileService.readFile(manifestLocation)).value.toString();
        const manifest = JSON.parse(content);
        return manifest.__metadata;
    }
    async updateMetadata(extensionLocation, metaData) {
        const manifestLocation = joinPath(extensionLocation, 'package.json');
        const content = (await this.fileService.readFile(manifestLocation)).value.toString();
        const manifest = JSON.parse(content);
        // unset if false
        metaData.isMachineScoped = metaData.isMachineScoped || undefined;
        metaData.isBuiltin = metaData.isBuiltin || undefined;
        metaData.installedTimestamp = metaData.installedTimestamp || undefined;
        manifest.__metadata = { ...manifest.__metadata, ...metaData };
        await this.fileService.writeFile(joinPath(extensionLocation, 'package.json'), VSBuffer.fromString(JSON.stringify(manifest, null, '\t')));
    }
    async applyScanOptions(extensions, type, scanOptions, pickLatest) {
        if (!scanOptions.includeAllVersions) {
            extensions = this.dedupExtensions(type === 0 /* ExtensionType.System */ ? extensions : undefined, type === 1 /* ExtensionType.User */ ? extensions : undefined, type === 'development' ? extensions : undefined, await this.getTargetPlatform(), pickLatest);
        }
        if (!scanOptions.includeInvalid) {
            extensions = extensions.filter(extension => extension.isValid);
        }
        return extensions.sort((a, b) => {
            const aLastSegment = path.basename(a.location.fsPath);
            const bLastSegment = path.basename(b.location.fsPath);
            if (aLastSegment < bLastSegment) {
                return -1;
            }
            if (aLastSegment > bLastSegment) {
                return 1;
            }
            return 0;
        });
    }
    dedupExtensions(system, user, development, targetPlatform, pickLatest) {
        const pick = (existing, extension, isDevelopment) => {
            if (existing.isValid && !extension.isValid) {
                return false;
            }
            if (existing.isValid === extension.isValid) {
                if (pickLatest && semver.gt(existing.manifest.version, extension.manifest.version)) {
                    this.logService.debug(`Skipping extension ${extension.location.path} with lower version ${extension.manifest.version} in favour of ${existing.location.path} with version ${existing.manifest.version}`);
                    return false;
                }
                if (semver.eq(existing.manifest.version, extension.manifest.version)) {
                    if (existing.type === 0 /* ExtensionType.System */) {
                        this.logService.debug(`Skipping extension ${extension.location.path} in favour of system extension ${existing.location.path} with same version`);
                        return false;
                    }
                    if (existing.targetPlatform === targetPlatform) {
                        this.logService.debug(`Skipping extension ${extension.location.path} from different target platform ${extension.targetPlatform}`);
                        return false;
                    }
                }
            }
            if (isDevelopment) {
                this.logService.warn(`Overwriting user extension ${existing.location.path} with ${extension.location.path}.`);
            }
            else {
                this.logService.debug(`Overwriting user extension ${existing.location.path} with ${extension.location.path}.`);
            }
            return true;
        };
        const result = new Map();
        system?.forEach((extension) => {
            const extensionKey = ExtensionIdentifier.toKey(extension.identifier.id);
            const existing = result.get(extensionKey);
            if (!existing || pick(existing, extension, false)) {
                result.set(extensionKey, extension);
            }
        });
        user?.forEach((extension) => {
            const extensionKey = ExtensionIdentifier.toKey(extension.identifier.id);
            const existing = result.get(extensionKey);
            if (!existing && system && extension.type === 0 /* ExtensionType.System */) {
                this.logService.debug(`Skipping obsolete system extension ${extension.location.path}.`);
                return;
            }
            if (!existing || pick(existing, extension, false)) {
                result.set(extensionKey, extension);
            }
        });
        development?.forEach(extension => {
            const extensionKey = ExtensionIdentifier.toKey(extension.identifier.id);
            const existing = result.get(extensionKey);
            if (!existing || pick(existing, extension, true)) {
                result.set(extensionKey, extension);
            }
            result.set(extensionKey, extension);
        });
        return [...result.values()];
    }
    async scanDefaultSystemExtensions(useCache, language) {
        this.logService.trace('Started scanning system extensions');
        const extensionsScannerInput = await this.createExtensionScannerInput(this.systemExtensionsLocation, false, 0 /* ExtensionType.System */, true, language);
        const extensionsScanner = useCache && !extensionsScannerInput.devMode ? this.systemExtensionsCachedScanner : this.extensionsScanner;
        const result = await extensionsScanner.scanExtensions(extensionsScannerInput);
        this.logService.trace('Scanned system extensions:', result.length);
        return result;
    }
    async scanDevSystemExtensions(language, checkControlFile) {
        const devSystemExtensionsList = this.environmentService.isBuilt ? [] : this.productService.builtInExtensions;
        if (!devSystemExtensionsList?.length) {
            return [];
        }
        this.logService.trace('Started scanning dev system extensions');
        const builtinExtensionControl = checkControlFile ? await this.getBuiltInExtensionControl() : {};
        const devSystemExtensionsLocations = [];
        const devSystemExtensionsLocation = URI.file(path.normalize(path.join(FileAccess.asFileUri('').fsPath, '..', '.build', 'builtInExtensions')));
        for (const extension of devSystemExtensionsList) {
            const controlState = builtinExtensionControl[extension.name] || 'marketplace';
            switch (controlState) {
                case 'disabled':
                    break;
                case 'marketplace':
                    devSystemExtensionsLocations.push(joinPath(devSystemExtensionsLocation, extension.name));
                    break;
                default:
                    devSystemExtensionsLocations.push(URI.file(controlState));
                    break;
            }
        }
        const result = await Promise.all(devSystemExtensionsLocations.map(async (location) => this.extensionsScanner.scanExtension((await this.createExtensionScannerInput(location, false, 0 /* ExtensionType.System */, true, language)))));
        this.logService.trace('Scanned dev system extensions:', result.length);
        return coalesce(result);
    }
    async getBuiltInExtensionControl() {
        try {
            const content = await this.fileService.readFile(this.extensionsControlLocation);
            return JSON.parse(content.value.toString());
        }
        catch (error) {
            return {};
        }
    }
    async createExtensionScannerInput(location, profile, type, excludeObsolete, language, validate = true) {
        const translations = await this.getTranslations(language ?? platform.language);
        const mtime = await this.getMtime(location);
        const applicationExtensionsLocation = profile && !this.uriIdentityService.extUri.isEqual(location, this.userDataProfilesService.defaultProfile.extensionsResource) ? this.userDataProfilesService.defaultProfile.extensionsResource : undefined;
        const applicationExtensionsLocationMtime = applicationExtensionsLocation ? await this.getMtime(applicationExtensionsLocation) : undefined;
        return new ExtensionScannerInput(location, mtime, applicationExtensionsLocation, applicationExtensionsLocationMtime, profile, type, excludeObsolete, validate, this.productService.version, this.productService.date, this.productService.commit, !this.environmentService.isBuilt, language, translations);
    }
    async getMtime(location) {
        try {
            const stat = await this.fileService.stat(location);
            if (typeof stat.mtime === 'number') {
                return stat.mtime;
            }
        }
        catch (err) {
            // That's ok...
        }
        return undefined;
    }
};
AbstractExtensionsScannerService = __decorate([
    __param(4, IUserDataProfilesService),
    __param(5, IExtensionsProfileScannerService),
    __param(6, IFileService),
    __param(7, ILogService),
    __param(8, IEnvironmentService),
    __param(9, IProductService),
    __param(10, IUriIdentityService),
    __param(11, IInstantiationService)
], AbstractExtensionsScannerService);
export { AbstractExtensionsScannerService };
class ExtensionScannerInput {
    location;
    mtime;
    applicationExtensionslocation;
    applicationExtensionslocationMtime;
    profile;
    type;
    excludeObsolete;
    validate;
    productVersion;
    productDate;
    productCommit;
    devMode;
    language;
    translations;
    constructor(location, mtime, applicationExtensionslocation, applicationExtensionslocationMtime, profile, type, excludeObsolete, validate, productVersion, productDate, productCommit, devMode, language, translations) {
        this.location = location;
        this.mtime = mtime;
        this.applicationExtensionslocation = applicationExtensionslocation;
        this.applicationExtensionslocationMtime = applicationExtensionslocationMtime;
        this.profile = profile;
        this.type = type;
        this.excludeObsolete = excludeObsolete;
        this.validate = validate;
        this.productVersion = productVersion;
        this.productDate = productDate;
        this.productCommit = productCommit;
        this.devMode = devMode;
        this.language = language;
        this.translations = translations;
        // Keep empty!! (JSON.parse)
    }
    static createNlsConfiguration(input) {
        return {
            language: input.language,
            pseudo: input.language === 'pseudo',
            devMode: input.devMode,
            translations: input.translations
        };
    }
    static equals(a, b) {
        return (isEqual(a.location, b.location)
            && a.mtime === b.mtime
            && isEqual(a.applicationExtensionslocation, b.applicationExtensionslocation)
            && a.applicationExtensionslocationMtime === b.applicationExtensionslocationMtime
            && a.profile === b.profile
            && a.type === b.type
            && a.excludeObsolete === b.excludeObsolete
            && a.validate === b.validate
            && a.productVersion === b.productVersion
            && a.productDate === b.productDate
            && a.productCommit === b.productCommit
            && a.devMode === b.devMode
            && a.language === b.language
            && Translations.equals(a.translations, b.translations));
    }
}
let ExtensionsScanner = class ExtensionsScanner extends Disposable {
    obsoleteFile;
    extensionsProfileScannerService;
    uriIdentityService;
    fileService;
    logService;
    constructor(obsoleteFile, extensionsProfileScannerService, uriIdentityService, fileService, logService) {
        super();
        this.obsoleteFile = obsoleteFile;
        this.extensionsProfileScannerService = extensionsProfileScannerService;
        this.uriIdentityService = uriIdentityService;
        this.fileService = fileService;
        this.logService = logService;
    }
    async scanExtensions(input) {
        const extensions = input.profile ? await this.scanExtensionsFromProfile(input) : await this.scanExtensionsFromLocation(input);
        let obsolete = {};
        if (input.excludeObsolete && input.type === 1 /* ExtensionType.User */) {
            try {
                const raw = (await this.fileService.readFile(this.obsoleteFile)).value.toString();
                obsolete = JSON.parse(raw);
            }
            catch (error) { /* ignore */ }
        }
        return isEmptyObject(obsolete) ? extensions : extensions.filter(e => !obsolete[ExtensionKey.create(e).toString()]);
    }
    async scanExtensionsFromLocation(input) {
        const stat = await this.fileService.resolve(input.location);
        if (!stat.children?.length) {
            return [];
        }
        const extensions = await Promise.all(stat.children.map(async (c) => {
            if (!c.isDirectory) {
                return null;
            }
            // Do not consider user extension folder starting with `.`
            if (input.type === 1 /* ExtensionType.User */ && basename(c.resource).indexOf('.') === 0) {
                return null;
            }
            const extensionScannerInput = new ExtensionScannerInput(c.resource, input.mtime, input.applicationExtensionslocation, input.applicationExtensionslocationMtime, input.profile, input.type, input.excludeObsolete, input.validate, input.productVersion, input.productDate, input.productCommit, input.devMode, input.language, input.translations);
            return this.scanExtension(extensionScannerInput);
        }));
        return coalesce(extensions)
            // Sort: Make sure extensions are in the same order always. Helps cache invalidation even if the order changes.
            .sort((a, b) => a.location.path < b.location.path ? -1 : 1);
    }
    async scanExtensionsFromProfile(input) {
        let profileExtensions = await this.scanExtensionsFromProfileResource(input.location, () => true, input);
        if (input.applicationExtensionslocation && !this.uriIdentityService.extUri.isEqual(input.location, input.applicationExtensionslocation)) {
            profileExtensions = profileExtensions.filter(e => !e.metadata?.isApplicationScoped);
            const applicationExtensions = await this.scanExtensionsFromProfileResource(input.applicationExtensionslocation, (e) => !!e.metadata?.isApplicationScoped, input);
            profileExtensions.push(...applicationExtensions);
        }
        return profileExtensions;
    }
    async scanExtensionsFromProfileResource(profileResource, filter, input) {
        const scannedProfileExtensions = await this.extensionsProfileScannerService.scanProfileExtensions(profileResource);
        if (!scannedProfileExtensions.length) {
            return [];
        }
        const extensions = await Promise.all(scannedProfileExtensions.map(async (extensionInfo) => {
            if (filter(extensionInfo)) {
                const extensionScannerInput = new ExtensionScannerInput(extensionInfo.location, input.mtime, input.applicationExtensionslocation, input.applicationExtensionslocationMtime, input.profile, input.type, input.excludeObsolete, input.validate, input.productVersion, input.productDate, input.productCommit, input.devMode, input.language, input.translations);
                return this.scanExtension(extensionScannerInput, extensionInfo.metadata);
            }
            return null;
        }));
        return coalesce(extensions);
    }
    async scanOneOrMultipleExtensions(input) {
        try {
            if (await this.fileService.exists(joinPath(input.location, 'package.json'))) {
                const extension = await this.scanExtension(input);
                return extension ? [extension] : [];
            }
            else {
                return await this.scanExtensions(input);
            }
        }
        catch (error) {
            this.logService.error(`Error scanning extensions at ${input.location.path}:`, getErrorMessage(error));
            return [];
        }
    }
    async scanExtension(input, metadata) {
        try {
            let manifest = await this.scanExtensionManifest(input.location);
            if (manifest) {
                // allow publisher to be undefined to make the initial extension authoring experience smoother
                if (!manifest.publisher) {
                    manifest.publisher = UNDEFINED_PUBLISHER;
                }
                metadata = metadata ?? manifest.__metadata;
                delete manifest.__metadata;
                const id = getGalleryExtensionId(manifest.publisher, manifest.name);
                const identifier = metadata?.id ? { id, uuid: metadata.id } : { id };
                const type = metadata?.isSystem ? 0 /* ExtensionType.System */ : input.type;
                const isBuiltin = type === 0 /* ExtensionType.System */ || !!metadata?.isBuiltin;
                ImplicitActivationEvents.updateManifest(manifest);
                manifest = await this.translateManifest(input.location, manifest, ExtensionScannerInput.createNlsConfiguration(input));
                const extension = {
                    type,
                    identifier,
                    manifest,
                    location: input.location,
                    isBuiltin,
                    targetPlatform: metadata?.targetPlatform ?? "undefined" /* TargetPlatform.UNDEFINED */,
                    metadata,
                    isValid: true,
                    validations: []
                };
                return input.validate ? this.validate(extension, input) : extension;
            }
        }
        catch (e) {
            if (input.type !== 0 /* ExtensionType.System */) {
                this.logService.error(e);
            }
        }
        return null;
    }
    validate(extension, input) {
        let isValid = true;
        const validations = validateExtensionManifest(input.productVersion, input.productDate, input.location, extension.manifest, extension.isBuiltin);
        for (const [severity, message] of validations) {
            if (severity === Severity.Error) {
                isValid = false;
                this.logService.error(this.formatMessage(input.location, message));
            }
        }
        extension.isValid = isValid;
        extension.validations = validations;
        return extension;
    }
    async scanExtensionManifest(extensionLocation) {
        const manifestLocation = joinPath(extensionLocation, 'package.json');
        let content;
        try {
            content = (await this.fileService.readFile(manifestLocation)).value.toString();
        }
        catch (error) {
            if (toFileOperationResult(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                this.logService.error(this.formatMessage(extensionLocation, localize('fileReadFail', "Cannot read file {0}: {1}.", manifestLocation.path, error.message)));
            }
            return null;
        }
        let manifest;
        try {
            manifest = JSON.parse(content);
        }
        catch (err) {
            // invalid JSON, let's get good errors
            const errors = [];
            parse(content, errors);
            for (const e of errors) {
                this.logService.error(this.formatMessage(extensionLocation, localize('jsonParseFail', "Failed to parse {0}: [{1}, {2}] {3}.", manifestLocation.path, e.offset, e.length, getParseErrorMessage(e.error))));
            }
            return null;
        }
        if (getNodeType(manifest) !== 'object') {
            this.logService.error(this.formatMessage(extensionLocation, localize('jsonParseInvalidType', "Invalid manifest file {0}: Not an JSON object.", manifestLocation.path)));
            return null;
        }
        return manifest;
    }
    async translateManifest(extensionLocation, extensionManifest, nlsConfiguration) {
        const localizedMessages = await this.getLocalizedMessages(extensionLocation, extensionManifest, nlsConfiguration);
        if (localizedMessages) {
            try {
                const errors = [];
                // resolveOriginalMessageBundle returns null if localizedMessages.default === undefined;
                const defaults = await this.resolveOriginalMessageBundle(localizedMessages.default, errors);
                if (errors.length > 0) {
                    errors.forEach((error) => {
                        this.logService.error(this.formatMessage(extensionLocation, localize('jsonsParseReportErrors', "Failed to parse {0}: {1}.", localizedMessages.default?.path, getParseErrorMessage(error.error))));
                    });
                    return extensionManifest;
                }
                else if (getNodeType(localizedMessages) !== 'object') {
                    this.logService.error(this.formatMessage(extensionLocation, localize('jsonInvalidFormat', "Invalid format {0}: JSON object expected.", localizedMessages.default?.path)));
                    return extensionManifest;
                }
                const localized = localizedMessages.values || Object.create(null);
                return localizeManifest(extensionManifest, localized, defaults);
            }
            catch (error) {
                /*Ignore Error*/
            }
        }
        return extensionManifest;
    }
    async getLocalizedMessages(extensionLocation, extensionManifest, nlsConfiguration) {
        const defaultPackageNLS = joinPath(extensionLocation, 'package.nls.json');
        const reportErrors = (localized, errors) => {
            errors.forEach((error) => {
                this.logService.error(this.formatMessage(extensionLocation, localize('jsonsParseReportErrors', "Failed to parse {0}: {1}.", localized?.path, getParseErrorMessage(error.error))));
            });
        };
        const reportInvalidFormat = (localized) => {
            this.logService.error(this.formatMessage(extensionLocation, localize('jsonInvalidFormat', "Invalid format {0}: JSON object expected.", localized?.path)));
        };
        const translationId = `${extensionManifest.publisher}.${extensionManifest.name}`;
        const translationPath = nlsConfiguration.translations[translationId];
        if (translationPath) {
            try {
                const translationResource = URI.file(translationPath);
                const content = (await this.fileService.readFile(translationResource)).value.toString();
                const errors = [];
                const translationBundle = parse(content, errors);
                if (errors.length > 0) {
                    reportErrors(translationResource, errors);
                    return { values: undefined, default: defaultPackageNLS };
                }
                else if (getNodeType(translationBundle) !== 'object') {
                    reportInvalidFormat(translationResource);
                    return { values: undefined, default: defaultPackageNLS };
                }
                else {
                    const values = translationBundle.contents ? translationBundle.contents.package : undefined;
                    return { values: values, default: defaultPackageNLS };
                }
            }
            catch (error) {
                return { values: undefined, default: defaultPackageNLS };
            }
        }
        else {
            const exists = await this.fileService.exists(defaultPackageNLS);
            if (!exists) {
                return undefined;
            }
            let messageBundle;
            try {
                messageBundle = await this.findMessageBundles(extensionLocation, nlsConfiguration);
            }
            catch (error) {
                return undefined;
            }
            if (!messageBundle.localized) {
                return { values: undefined, default: messageBundle.original };
            }
            try {
                const messageBundleContent = (await this.fileService.readFile(messageBundle.localized)).value.toString();
                const errors = [];
                const messages = parse(messageBundleContent, errors);
                if (errors.length > 0) {
                    reportErrors(messageBundle.localized, errors);
                    return { values: undefined, default: messageBundle.original };
                }
                else if (getNodeType(messages) !== 'object') {
                    reportInvalidFormat(messageBundle.localized);
                    return { values: undefined, default: messageBundle.original };
                }
                return { values: messages, default: messageBundle.original };
            }
            catch (error) {
                return { values: undefined, default: messageBundle.original };
            }
        }
    }
    /**
     * Parses original message bundle, returns null if the original message bundle is null.
     */
    async resolveOriginalMessageBundle(originalMessageBundle, errors) {
        if (originalMessageBundle) {
            try {
                const originalBundleContent = (await this.fileService.readFile(originalMessageBundle)).value.toString();
                return parse(originalBundleContent, errors);
            }
            catch (error) {
                /* Ignore Error */
            }
        }
        return;
    }
    /**
     * Finds localized message bundle and the original (unlocalized) one.
     * If the localized file is not present, returns null for the original and marks original as localized.
     */
    findMessageBundles(extensionLocation, nlsConfiguration) {
        return new Promise((c, e) => {
            const loop = (locale) => {
                const toCheck = joinPath(extensionLocation, `package.nls.${locale}.json`);
                this.fileService.exists(toCheck).then(exists => {
                    if (exists) {
                        c({ localized: toCheck, original: joinPath(extensionLocation, 'package.nls.json') });
                    }
                    const index = locale.lastIndexOf('-');
                    if (index === -1) {
                        c({ localized: joinPath(extensionLocation, 'package.nls.json'), original: null });
                    }
                    else {
                        locale = locale.substring(0, index);
                        loop(locale);
                    }
                });
            };
            if (nlsConfiguration.devMode || nlsConfiguration.pseudo || !nlsConfiguration.language) {
                return c({ localized: joinPath(extensionLocation, 'package.nls.json'), original: null });
            }
            loop(nlsConfiguration.language);
        });
    }
    formatMessage(extensionLocation, message) {
        return `[${extensionLocation.path}]: ${message}`;
    }
};
ExtensionsScanner = __decorate([
    __param(1, IExtensionsProfileScannerService),
    __param(2, IUriIdentityService),
    __param(3, IFileService),
    __param(4, ILogService)
], ExtensionsScanner);
let CachedExtensionsScanner = class CachedExtensionsScanner extends ExtensionsScanner {
    cacheFile;
    input;
    cacheValidatorThrottler = this._register(new ThrottledDelayer(3000));
    _onDidChangeCache = this._register(new Emitter());
    onDidChangeCache = this._onDidChangeCache.event;
    constructor(cacheFile, obsoleteFile, extensionsProfileScannerService, uriIdentityService, fileService, logService) {
        super(obsoleteFile, extensionsProfileScannerService, uriIdentityService, fileService, logService);
        this.cacheFile = cacheFile;
    }
    async scanExtensions(input) {
        const cacheContents = await this.readExtensionCache();
        this.input = input;
        if (cacheContents && cacheContents.input && ExtensionScannerInput.equals(cacheContents.input, this.input)) {
            this.cacheValidatorThrottler.trigger(() => this.validateCache());
            return cacheContents.result.map((extension) => {
                // revive URI object
                extension.location = URI.revive(extension.location);
                return extension;
            });
        }
        const result = await super.scanExtensions(input);
        await this.writeExtensionCache({ input, result });
        return result;
    }
    async readExtensionCache() {
        try {
            const cacheRawContents = await this.fileService.readFile(this.cacheFile);
            const extensionCacheData = JSON.parse(cacheRawContents.value.toString());
            return { result: extensionCacheData.result, input: revive(extensionCacheData.input) };
        }
        catch (error) {
            this.logService.debug('Error while reading the extension cache file:', this.cacheFile.path, getErrorMessage(error));
        }
        return null;
    }
    async writeExtensionCache(cacheContents) {
        try {
            await this.fileService.writeFile(this.cacheFile, VSBuffer.fromString(JSON.stringify(cacheContents)));
        }
        catch (error) {
            this.logService.debug('Error while writing the extension cache file:', this.cacheFile.path, getErrorMessage(error));
        }
    }
    async validateCache() {
        if (!this.input) {
            // Input has been unset by the time we get here, so skip validation
            return;
        }
        const cacheContents = await this.readExtensionCache();
        if (!cacheContents) {
            // Cache has been deleted by someone else, which is perfectly fine...
            return;
        }
        const actual = cacheContents.result;
        const expected = JSON.parse(JSON.stringify(await super.scanExtensions(this.input)));
        if (objects.equals(expected, actual)) {
            // Cache is valid and running with it is perfectly fine...
            return;
        }
        try {
            // Cache is invalid, delete it
            await this.fileService.del(this.cacheFile);
            this._onDidChangeCache.fire();
        }
        catch (error) {
            this.logService.error(error);
        }
    }
};
CachedExtensionsScanner = __decorate([
    __param(2, IExtensionsProfileScannerService),
    __param(3, IUriIdentityService),
    __param(4, IFileService),
    __param(5, ILogService)
], CachedExtensionsScanner);
export function toExtensionDescription(extension, isUnderDevelopment) {
    const id = getExtensionId(extension.manifest.publisher, extension.manifest.name);
    return {
        id,
        identifier: new ExtensionIdentifier(id),
        isBuiltin: extension.type === 0 /* ExtensionType.System */,
        isUserBuiltin: extension.type === 1 /* ExtensionType.User */ && extension.isBuiltin,
        isUnderDevelopment,
        extensionLocation: extension.location,
        uuid: extension.identifier.uuid,
        targetPlatform: extension.targetPlatform,
        ...extension.manifest,
    };
}
export class NativeExtensionsScannerService extends AbstractExtensionsScannerService {
    translationsPromise;
    constructor(systemExtensionsLocation, userExtensionsLocation, userHome, userDataPath, userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService) {
        super(systemExtensionsLocation, userExtensionsLocation, joinPath(userHome, '.vscode-oss-dev', 'extensions', 'control.json'), joinPath(userDataPath, MANIFEST_CACHE_FOLDER), userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService);
        this.translationsPromise = (async () => {
            if (platform.translationsConfigFile) {
                try {
                    const content = await this.fileService.readFile(URI.file(platform.translationsConfigFile));
                    return JSON.parse(content.value.toString());
                }
                catch (err) { /* Ignore Error */ }
            }
            return Object.create(null);
        })();
    }
    getTranslations(language) {
        return this.translationsPromise;
    }
}
