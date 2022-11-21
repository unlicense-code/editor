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
import { distinct } from 'vs/base/common/arrays';
import { CancellationToken } from 'vs/base/common/cancellation';
import { CancellationError, getErrorMessage, isCancellationError } from 'vs/base/common/errors';
import { isWeb, platform } from 'vs/base/common/platform';
import { arch } from 'vs/base/common/process';
import { isBoolean } from 'vs/base/common/types';
import { URI } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { getFallbackTargetPlarforms, getTargetPlatform, isNotWebExtensionInWebTargetPlatform, isTargetPlatformCompatible, toTargetPlatform, WEB_EXTENSION_TAG } from 'vs/platform/extensionManagement/common/extensionManagement';
import { adoptToGalleryExtensionId, areSameExtensions, getGalleryExtensionId, getGalleryExtensionTelemetryData } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { isEngineValid } from 'vs/platform/extensions/common/extensionValidator';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { asJson, asTextOrError, IRequestService, isSuccess } from 'vs/platform/request/common/request';
import { resolveMarketplaceHeaders } from 'vs/platform/externalServices/common/marketplace';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
const CURRENT_TARGET_PLATFORM = isWeb ? "web" /* TargetPlatform.WEB */ : getTargetPlatform(platform, arch);
var Flags;
(function (Flags) {
    /**
     * None is used to retrieve only the basic extension details.
     */
    Flags[Flags["None"] = 0] = "None";
    /**
     * IncludeVersions will return version information for extensions returned
     */
    Flags[Flags["IncludeVersions"] = 1] = "IncludeVersions";
    /**
     * IncludeFiles will return information about which files were found
     * within the extension that were stored independent of the manifest.
     * When asking for files, versions will be included as well since files
     * are returned as a property of the versions.
     * These files can be retrieved using the path to the file without
     * requiring the entire manifest be downloaded.
     */
    Flags[Flags["IncludeFiles"] = 2] = "IncludeFiles";
    /**
     * Include the Categories and Tags that were added to the extension definition.
     */
    Flags[Flags["IncludeCategoryAndTags"] = 4] = "IncludeCategoryAndTags";
    /**
     * Include the details about which accounts the extension has been shared
     * with if the extension is a private extension.
     */
    Flags[Flags["IncludeSharedAccounts"] = 8] = "IncludeSharedAccounts";
    /**
     * Include properties associated with versions of the extension
     */
    Flags[Flags["IncludeVersionProperties"] = 16] = "IncludeVersionProperties";
    /**
     * Excluding non-validated extensions will remove any extension versions that
     * either are in the process of being validated or have failed validation.
     */
    Flags[Flags["ExcludeNonValidated"] = 32] = "ExcludeNonValidated";
    /**
     * Include the set of installation targets the extension has requested.
     */
    Flags[Flags["IncludeInstallationTargets"] = 64] = "IncludeInstallationTargets";
    /**
     * Include the base uri for assets of this extension
     */
    Flags[Flags["IncludeAssetUri"] = 128] = "IncludeAssetUri";
    /**
     * Include the statistics associated with this extension
     */
    Flags[Flags["IncludeStatistics"] = 256] = "IncludeStatistics";
    /**
     * When retrieving versions from a query, only include the latest
     * version of the extensions that matched. This is useful when the
     * caller doesn't need all the published versions. It will save a
     * significant size in the returned payload.
     */
    Flags[Flags["IncludeLatestVersionOnly"] = 512] = "IncludeLatestVersionOnly";
    /**
     * This flag switches the asset uri to use GetAssetByName instead of CDN
     * When this is used, values of base asset uri and base asset uri fallback are switched
     * When this is used, source of asset files are pointed to Gallery service always even if CDN is available
     */
    Flags[Flags["Unpublished"] = 4096] = "Unpublished";
    /**
     * Include the details if an extension is in conflict list or not
     */
    Flags[Flags["IncludeNameConflictInfo"] = 32768] = "IncludeNameConflictInfo";
})(Flags || (Flags = {}));
function flagsToString(...flags) {
    return String(flags.reduce((r, f) => r | f, 0));
}
var FilterType;
(function (FilterType) {
    FilterType[FilterType["Tag"] = 1] = "Tag";
    FilterType[FilterType["ExtensionId"] = 4] = "ExtensionId";
    FilterType[FilterType["Category"] = 5] = "Category";
    FilterType[FilterType["ExtensionName"] = 7] = "ExtensionName";
    FilterType[FilterType["Target"] = 8] = "Target";
    FilterType[FilterType["Featured"] = 9] = "Featured";
    FilterType[FilterType["SearchText"] = 10] = "SearchText";
    FilterType[FilterType["ExcludeWithFlags"] = 12] = "ExcludeWithFlags";
})(FilterType || (FilterType = {}));
const AssetType = {
    Icon: 'Microsoft.VisualStudio.Services.Icons.Default',
    Details: 'Microsoft.VisualStudio.Services.Content.Details',
    Changelog: 'Microsoft.VisualStudio.Services.Content.Changelog',
    Manifest: 'Microsoft.VisualStudio.Code.Manifest',
    VSIX: 'Microsoft.VisualStudio.Services.VSIXPackage',
    License: 'Microsoft.VisualStudio.Services.Content.License',
    Repository: 'Microsoft.VisualStudio.Services.Links.Source',
    Signature: 'Microsoft.VisualStudio.Services.VsixSignature'
};
const PropertyType = {
    Dependency: 'Microsoft.VisualStudio.Code.ExtensionDependencies',
    ExtensionPack: 'Microsoft.VisualStudio.Code.ExtensionPack',
    Engine: 'Microsoft.VisualStudio.Code.Engine',
    PreRelease: 'Microsoft.VisualStudio.Code.PreRelease',
    LocalizedLanguages: 'Microsoft.VisualStudio.Code.LocalizedLanguages',
    WebExtension: 'Microsoft.VisualStudio.Code.WebExtension',
    SponsorLink: 'Microsoft.VisualStudio.Code.SponsorLink'
};
const DefaultPageSize = 10;
const DefaultQueryState = {
    pageNumber: 1,
    pageSize: DefaultPageSize,
    sortBy: 0 /* SortBy.NoneOrRelevance */,
    sortOrder: 0 /* SortOrder.Default */,
    flags: Flags.None,
    criteria: [],
    assetTypes: []
};
class Query {
    state;
    constructor(state = DefaultQueryState) {
        this.state = state;
    }
    get pageNumber() { return this.state.pageNumber; }
    get pageSize() { return this.state.pageSize; }
    get sortBy() { return this.state.sortBy; }
    get sortOrder() { return this.state.sortOrder; }
    get flags() { return this.state.flags; }
    get criteria() { return this.state.criteria; }
    withPage(pageNumber, pageSize = this.state.pageSize) {
        return new Query({ ...this.state, pageNumber, pageSize });
    }
    withFilter(filterType, ...values) {
        const criteria = [
            ...this.state.criteria,
            ...values.length ? values.map(value => ({ filterType, value })) : [{ filterType }]
        ];
        return new Query({ ...this.state, criteria });
    }
    withSortBy(sortBy) {
        return new Query({ ...this.state, sortBy });
    }
    withSortOrder(sortOrder) {
        return new Query({ ...this.state, sortOrder });
    }
    withFlags(...flags) {
        return new Query({ ...this.state, flags: flags.reduce((r, f) => r | f, 0) });
    }
    withAssetTypes(...assetTypes) {
        return new Query({ ...this.state, assetTypes });
    }
    withSource(source) {
        return new Query({ ...this.state, source });
    }
    get raw() {
        const { criteria, pageNumber, pageSize, sortBy, sortOrder, flags, assetTypes } = this.state;
        const filters = [{ criteria, pageNumber, pageSize, sortBy, sortOrder }];
        return { filters, assetTypes, flags };
    }
    get searchText() {
        const criterium = this.state.criteria.filter(criterium => criterium.filterType === FilterType.SearchText)[0];
        return criterium && criterium.value ? criterium.value : '';
    }
    get telemetryData() {
        return {
            filterTypes: this.state.criteria.map(criterium => String(criterium.filterType)),
            flags: this.state.flags,
            sortBy: String(this.sortBy),
            sortOrder: String(this.sortOrder),
            pageNumber: String(this.pageNumber),
            source: this.state.source,
            searchTextLength: this.searchText.length
        };
    }
}
function getStatistic(statistics, name) {
    const result = (statistics || []).filter(s => s.statisticName === name)[0];
    return result ? result.value : 0;
}
function getCoreTranslationAssets(version) {
    const coreTranslationAssetPrefix = 'Microsoft.VisualStudio.Code.Translation.';
    const result = version.files.filter(f => f.assetType.indexOf(coreTranslationAssetPrefix) === 0);
    return result.reduce((result, file) => {
        const asset = getVersionAsset(version, file.assetType);
        if (asset) {
            result.push([file.assetType.substring(coreTranslationAssetPrefix.length), asset]);
        }
        return result;
    }, []);
}
function getRepositoryAsset(version) {
    if (version.properties) {
        const results = version.properties.filter(p => p.key === AssetType.Repository);
        const gitRegExp = new RegExp('((git|ssh|http(s)?)|(git@[\\w.]+))(:(//)?)([\\w.@:/\\-~]+)(.git)(/)?');
        const uri = results.filter(r => gitRegExp.test(r.value))[0];
        return uri ? { uri: uri.value, fallbackUri: uri.value } : null;
    }
    return getVersionAsset(version, AssetType.Repository);
}
function getDownloadAsset(version) {
    return {
        uri: `${version.fallbackAssetUri}/${AssetType.VSIX}?redirect=true${version.targetPlatform ? `&targetPlatform=${version.targetPlatform}` : ''}`,
        fallbackUri: `${version.fallbackAssetUri}/${AssetType.VSIX}${version.targetPlatform ? `?targetPlatform=${version.targetPlatform}` : ''}`
    };
}
function getVersionAsset(version, type) {
    const result = version.files.filter(f => f.assetType === type)[0];
    return result ? {
        uri: `${version.assetUri}/${type}${version.targetPlatform ? `?targetPlatform=${version.targetPlatform}` : ''}`,
        fallbackUri: `${version.fallbackAssetUri}/${type}${version.targetPlatform ? `?targetPlatform=${version.targetPlatform}` : ''}`
    } : null;
}
function getExtensions(version, property) {
    const values = version.properties ? version.properties.filter(p => p.key === property) : [];
    const value = values.length > 0 && values[0].value;
    return value ? value.split(',').map(v => adoptToGalleryExtensionId(v)) : [];
}
function getEngine(version) {
    const values = version.properties ? version.properties.filter(p => p.key === PropertyType.Engine) : [];
    return (values.length > 0 && values[0].value) || '';
}
function isPreReleaseVersion(version) {
    const values = version.properties ? version.properties.filter(p => p.key === PropertyType.PreRelease) : [];
    return values.length > 0 && values[0].value === 'true';
}
function getLocalizedLanguages(version) {
    const values = version.properties ? version.properties.filter(p => p.key === PropertyType.LocalizedLanguages) : [];
    const value = (values.length > 0 && values[0].value) || '';
    return value ? value.split(',') : [];
}
function getSponsorLink(version) {
    return version.properties?.find(p => p.key === PropertyType.SponsorLink)?.value;
}
function getIsPreview(flags) {
    return flags.indexOf('preview') !== -1;
}
function getTargetPlatformForExtensionVersion(version) {
    return version.targetPlatform ? toTargetPlatform(version.targetPlatform) : "undefined" /* TargetPlatform.UNDEFINED */;
}
function getAllTargetPlatforms(rawGalleryExtension) {
    const allTargetPlatforms = distinct(rawGalleryExtension.versions.map(getTargetPlatformForExtensionVersion));
    // Is a web extension only if it has WEB_EXTENSION_TAG
    const isWebExtension = !!rawGalleryExtension.tags?.includes(WEB_EXTENSION_TAG);
    // Include Web Target Platform only if it is a web extension
    const webTargetPlatformIndex = allTargetPlatforms.indexOf("web" /* TargetPlatform.WEB */);
    if (isWebExtension) {
        if (webTargetPlatformIndex === -1) {
            // Web extension but does not has web target platform -> add it
            allTargetPlatforms.push("web" /* TargetPlatform.WEB */);
        }
    }
    else {
        if (webTargetPlatformIndex !== -1) {
            // Not a web extension but has web target platform -> remove it
            allTargetPlatforms.splice(webTargetPlatformIndex, 1);
        }
    }
    return allTargetPlatforms;
}
export function sortExtensionVersions(versions, preferredTargetPlatform) {
    /* It is expected that versions from Marketplace are sorted by version. So we are just sorting by preferred targetPlatform */
    const fallbackTargetPlatforms = getFallbackTargetPlarforms(preferredTargetPlatform);
    for (let index = 0; index < versions.length; index++) {
        const version = versions[index];
        if (version.version === versions[index - 1]?.version) {
            let insertionIndex = index;
            const versionTargetPlatform = getTargetPlatformForExtensionVersion(version);
            /* put it at the beginning */
            if (versionTargetPlatform === preferredTargetPlatform) {
                while (insertionIndex > 0 && versions[insertionIndex - 1].version === version.version) {
                    insertionIndex--;
                }
            }
            /* put it after version with preferred targetPlatform or at the beginning */
            else if (fallbackTargetPlatforms.includes(versionTargetPlatform)) {
                while (insertionIndex > 0 && versions[insertionIndex - 1].version === version.version && getTargetPlatformForExtensionVersion(versions[insertionIndex - 1]) !== preferredTargetPlatform) {
                    insertionIndex--;
                }
            }
            if (insertionIndex !== index) {
                versions.splice(index, 1);
                versions.splice(insertionIndex, 0, version);
            }
        }
    }
    return versions;
}
function setTelemetry(extension, index, querySource) {
    /* __GDPR__FRAGMENT__
    "GalleryExtensionTelemetryData2" : {
        "index" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
        "querySource": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
    }
    */
    extension.telemetryData = { index, querySource };
}
function toExtension(galleryExtension, version, allTargetPlatforms) {
    const latestVersion = galleryExtension.versions[0];
    const assets = {
        manifest: getVersionAsset(version, AssetType.Manifest),
        readme: getVersionAsset(version, AssetType.Details),
        changelog: getVersionAsset(version, AssetType.Changelog),
        license: getVersionAsset(version, AssetType.License),
        repository: getRepositoryAsset(version),
        download: getDownloadAsset(version),
        icon: getVersionAsset(version, AssetType.Icon),
        signature: getVersionAsset(version, AssetType.Signature),
        coreTranslations: getCoreTranslationAssets(version)
    };
    return {
        identifier: {
            id: getGalleryExtensionId(galleryExtension.publisher.publisherName, galleryExtension.extensionName),
            uuid: galleryExtension.extensionId
        },
        name: galleryExtension.extensionName,
        version: version.version,
        displayName: galleryExtension.displayName,
        publisherId: galleryExtension.publisher.publisherId,
        publisher: galleryExtension.publisher.publisherName,
        publisherDisplayName: galleryExtension.publisher.displayName,
        publisherDomain: galleryExtension.publisher.domain ? { link: galleryExtension.publisher.domain, verified: !!galleryExtension.publisher.isDomainVerified } : undefined,
        publisherSponsorLink: getSponsorLink(latestVersion),
        description: galleryExtension.shortDescription || '',
        installCount: getStatistic(galleryExtension.statistics, 'install'),
        rating: getStatistic(galleryExtension.statistics, 'averagerating'),
        ratingCount: getStatistic(galleryExtension.statistics, 'ratingcount'),
        categories: galleryExtension.categories || [],
        tags: galleryExtension.tags || [],
        releaseDate: Date.parse(galleryExtension.releaseDate),
        lastUpdated: Date.parse(galleryExtension.lastUpdated),
        allTargetPlatforms,
        assets,
        properties: {
            dependencies: getExtensions(version, PropertyType.Dependency),
            extensionPack: getExtensions(version, PropertyType.ExtensionPack),
            engine: getEngine(version),
            localizedLanguages: getLocalizedLanguages(version),
            targetPlatform: getTargetPlatformForExtensionVersion(version),
            isPreReleaseVersion: isPreReleaseVersion(version)
        },
        hasPreReleaseVersion: isPreReleaseVersion(latestVersion),
        hasReleaseVersion: true,
        preview: getIsPreview(galleryExtension.flags),
        isSigned: !!assets.signature
    };
}
let AbstractExtensionGalleryService = class AbstractExtensionGalleryService {
    requestService;
    logService;
    environmentService;
    telemetryService;
    fileService;
    productService;
    configurationService;
    extensionsGalleryUrl;
    extensionsGallerySearchUrl;
    extensionsControlUrl;
    commonHeadersPromise;
    constructor(storageService, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService) {
        this.requestService = requestService;
        this.logService = logService;
        this.environmentService = environmentService;
        this.telemetryService = telemetryService;
        this.fileService = fileService;
        this.productService = productService;
        this.configurationService = configurationService;
        const config = productService.extensionsGallery;
        const isPPEEnabled = config?.servicePPEUrl && configurationService.getValue('_extensionsGallery.enablePPE');
        this.extensionsGalleryUrl = isPPEEnabled ? config.servicePPEUrl : config?.serviceUrl;
        this.extensionsGallerySearchUrl = isPPEEnabled ? undefined : config?.searchUrl;
        this.extensionsControlUrl = config?.controlUrl;
        this.commonHeadersPromise = resolveMarketplaceHeaders(productService.version, productService, this.environmentService, this.configurationService, this.fileService, storageService, this.telemetryService);
    }
    api(path = '') {
        return `${this.extensionsGalleryUrl}${path}`;
    }
    isEnabled() {
        return !!this.extensionsGalleryUrl;
    }
    async getExtensions(extensionInfos, arg1, arg2) {
        const options = CancellationToken.isCancellationToken(arg1) ? {} : arg1;
        const token = CancellationToken.isCancellationToken(arg1) ? arg1 : arg2;
        const names = [];
        const ids = [], includePreReleases = [], versions = [];
        let isQueryForReleaseVersionFromPreReleaseVersion = true;
        for (const extensionInfo of extensionInfos) {
            if (extensionInfo.uuid) {
                ids.push(extensionInfo.uuid);
            }
            else {
                names.push(extensionInfo.id);
            }
            // Set includePreRelease to true if version is set, because the version can be a pre-release version
            const includePreRelease = !!(extensionInfo.version || extensionInfo.preRelease);
            includePreReleases.push({ id: extensionInfo.id, uuid: extensionInfo.uuid, includePreRelease });
            if (extensionInfo.version) {
                versions.push({ id: extensionInfo.id, uuid: extensionInfo.uuid, version: extensionInfo.version });
            }
            isQueryForReleaseVersionFromPreReleaseVersion = isQueryForReleaseVersionFromPreReleaseVersion && (!!extensionInfo.hasPreRelease && !includePreRelease);
        }
        if (!ids.length && !names.length) {
            return [];
        }
        let query = new Query().withPage(1, extensionInfos.length);
        if (ids.length) {
            query = query.withFilter(FilterType.ExtensionId, ...ids);
        }
        if (names.length) {
            query = query.withFilter(FilterType.ExtensionName, ...names);
        }
        if (options.queryAllVersions || isQueryForReleaseVersionFromPreReleaseVersion /* Inlcude all versions if every requested extension is for release version and has pre-release version  */) {
            query = query.withFlags(query.flags, Flags.IncludeVersions);
        }
        if (options.source) {
            query = query.withSource(options.source);
        }
        const { extensions } = await this.queryGalleryExtensions(query, { targetPlatform: options.targetPlatform ?? CURRENT_TARGET_PLATFORM, includePreRelease: includePreReleases, versions, compatible: !!options.compatible }, token);
        if (options.source) {
            extensions.forEach((e, index) => setTelemetry(e, index, options.source));
        }
        return extensions;
    }
    async getCompatibleExtension(extension, includePreRelease, targetPlatform) {
        if (isNotWebExtensionInWebTargetPlatform(extension.allTargetPlatforms, targetPlatform)) {
            return null;
        }
        if (await this.isExtensionCompatible(extension, includePreRelease, targetPlatform)) {
            return extension;
        }
        const query = new Query()
            .withFlags(Flags.IncludeVersions)
            .withPage(1, 1)
            .withFilter(FilterType.ExtensionId, extension.identifier.uuid);
        const { extensions } = await this.queryGalleryExtensions(query, { targetPlatform, compatible: true, includePreRelease }, CancellationToken.None);
        return extensions[0] || null;
    }
    async isExtensionCompatible(extension, includePreRelease, targetPlatform) {
        if (!isTargetPlatformCompatible(extension.properties.targetPlatform, extension.allTargetPlatforms, targetPlatform)) {
            return false;
        }
        if (!includePreRelease && extension.properties.isPreReleaseVersion) {
            // Pre-releases are not allowed when include pre-release flag is not set
            return false;
        }
        let engine = extension.properties.engine;
        if (!engine) {
            const manifest = await this.getManifest(extension, CancellationToken.None);
            if (!manifest) {
                throw new Error('Manifest was not found');
            }
            engine = manifest.engines.vscode;
        }
        return isEngineValid(engine, this.productService.version, this.productService.date);
    }
    async isValidVersion(rawGalleryExtensionVersion, versionType, compatible, allTargetPlatforms, targetPlatform) {
        if (!isTargetPlatformCompatible(getTargetPlatformForExtensionVersion(rawGalleryExtensionVersion), allTargetPlatforms, targetPlatform)) {
            return false;
        }
        if (versionType !== 'any' && isPreReleaseVersion(rawGalleryExtensionVersion) !== (versionType === 'prerelease')) {
            return false;
        }
        if (compatible) {
            try {
                const engine = await this.getEngine(rawGalleryExtensionVersion);
                if (!isEngineValid(engine, this.productService.version, this.productService.date)) {
                    return false;
                }
            }
            catch (error) {
                this.logService.error(`Error while getting the engine for the version ${rawGalleryExtensionVersion.version}.`, getErrorMessage(error));
                return false;
            }
        }
        return true;
    }
    async query(options, token) {
        let text = options.text || '';
        const pageSize = options.pageSize ?? 50;
        let query = new Query()
            .withPage(1, pageSize);
        if (text) {
            // Use category filter instead of "category:themes"
            text = text.replace(/\bcategory:("([^"]*)"|([^"]\S*))(\s+|\b|$)/g, (_, quotedCategory, category) => {
                query = query.withFilter(FilterType.Category, category || quotedCategory);
                return '';
            });
            // Use tag filter instead of "tag:debuggers"
            text = text.replace(/\btag:("([^"]*)"|([^"]\S*))(\s+|\b|$)/g, (_, quotedTag, tag) => {
                query = query.withFilter(FilterType.Tag, tag || quotedTag);
                return '';
            });
            // Use featured filter
            text = text.replace(/\bfeatured(\s+|\b|$)/g, () => {
                query = query.withFilter(FilterType.Featured);
                return '';
            });
            text = text.trim();
            if (text) {
                text = text.length < 200 ? text : text.substring(0, 200);
                query = query.withFilter(FilterType.SearchText, text);
            }
            query = query.withSortBy(0 /* SortBy.NoneOrRelevance */);
        }
        else if (options.ids) {
            query = query.withFilter(FilterType.ExtensionId, ...options.ids);
        }
        else if (options.names) {
            query = query.withFilter(FilterType.ExtensionName, ...options.names);
        }
        else {
            query = query.withSortBy(4 /* SortBy.InstallCount */);
        }
        if (typeof options.sortBy === 'number') {
            query = query.withSortBy(options.sortBy);
        }
        if (typeof options.sortOrder === 'number') {
            query = query.withSortOrder(options.sortOrder);
        }
        if (options.source) {
            query = query.withSource(options.source);
        }
        const runQuery = async (query, token) => {
            const { extensions, total } = await this.queryGalleryExtensions(query, { targetPlatform: CURRENT_TARGET_PLATFORM, compatible: false, includePreRelease: !!options.includePreRelease }, token);
            extensions.forEach((e, index) => setTelemetry(e, ((query.pageNumber - 1) * query.pageSize) + index, options.source));
            return { extensions, total };
        };
        const { extensions, total } = await runQuery(query, token);
        const getPage = async (pageIndex, ct) => {
            if (ct.isCancellationRequested) {
                throw new CancellationError();
            }
            const { extensions } = await runQuery(query.withPage(pageIndex + 1), ct);
            return extensions;
        };
        return { firstPage: extensions, total, pageSize: query.pageSize, getPage };
    }
    async queryGalleryExtensions(query, criteria, token) {
        const flags = query.flags;
        /**
         * If both version flags (IncludeLatestVersionOnly and IncludeVersions) are included, then only include latest versions (IncludeLatestVersionOnly) flag.
         */
        if (!!(query.flags & Flags.IncludeLatestVersionOnly) && !!(query.flags & Flags.IncludeVersions)) {
            query = query.withFlags(query.flags & ~Flags.IncludeVersions, Flags.IncludeLatestVersionOnly);
        }
        /**
         * If version flags (IncludeLatestVersionOnly and IncludeVersions) are not included, default is to query for latest versions (IncludeLatestVersionOnly).
         */
        if (!(query.flags & Flags.IncludeLatestVersionOnly) && !(query.flags & Flags.IncludeVersions)) {
            query = query.withFlags(query.flags, Flags.IncludeLatestVersionOnly);
        }
        /**
         * If versions criteria exist, then remove IncludeLatestVersionOnly flag and add IncludeVersions flag.
         */
        if (criteria.versions?.length) {
            query = query.withFlags(query.flags & ~Flags.IncludeLatestVersionOnly, Flags.IncludeVersions);
        }
        /**
         * Add necessary extension flags
         */
        query = query.withFlags(query.flags, Flags.IncludeAssetUri, Flags.IncludeCategoryAndTags, Flags.IncludeFiles, Flags.IncludeStatistics, Flags.IncludeVersionProperties);
        const { galleryExtensions: rawGalleryExtensions, total } = await this.queryRawGalleryExtensions(query, token);
        const hasAllVersions = !(query.flags & Flags.IncludeLatestVersionOnly);
        if (hasAllVersions) {
            const extensions = [];
            for (const rawGalleryExtension of rawGalleryExtensions) {
                const extension = await this.toGalleryExtensionWithCriteria(rawGalleryExtension, criteria);
                if (extension) {
                    extensions.push(extension);
                }
            }
            return { extensions, total };
        }
        const result = [];
        const needAllVersions = new Map();
        for (let index = 0; index < rawGalleryExtensions.length; index++) {
            const rawGalleryExtension = rawGalleryExtensions[index];
            const extensionIdentifier = { id: getGalleryExtensionId(rawGalleryExtension.publisher.publisherName, rawGalleryExtension.extensionName), uuid: rawGalleryExtension.extensionId };
            const includePreRelease = isBoolean(criteria.includePreRelease) ? criteria.includePreRelease : !!criteria.includePreRelease.find(extensionIdentifierWithPreRelease => areSameExtensions(extensionIdentifierWithPreRelease, extensionIdentifier))?.includePreRelease;
            if (criteria.compatible && isNotWebExtensionInWebTargetPlatform(getAllTargetPlatforms(rawGalleryExtension), criteria.targetPlatform)) {
                /** Skip if requested for a web-compatible extension and it is not a web extension.
                 * All versions are not needed in this case
                */
                continue;
            }
            const extension = await this.toGalleryExtensionWithCriteria(rawGalleryExtension, criteria);
            if (!extension
                /** Need all versions if the extension is a pre-release version but
                 * 		- the query is to look for a release version or
                 * 		- the extension has no release version
                 * Get all versions to get or check the release version
                */
                || (extension.properties.isPreReleaseVersion && (!includePreRelease || !extension.hasReleaseVersion))
                /**
                 * Need all versions if the extension is a release version with a different target platform than requested and also has a pre-release version
                 * Because, this is a platform specific extension and can have a newer release version supporting this platform.
                 * See https://github.com/microsoft/vscode/issues/139628
                */
                || (!extension.properties.isPreReleaseVersion && extension.properties.targetPlatform !== criteria.targetPlatform && extension.hasPreReleaseVersion)) {
                needAllVersions.set(rawGalleryExtension.extensionId, index);
            }
            else {
                result.push([index, extension]);
            }
        }
        if (needAllVersions.size) {
            const startTime = new Date().getTime();
            const query = new Query()
                .withFlags(flags & ~Flags.IncludeLatestVersionOnly, Flags.IncludeVersions)
                .withPage(1, needAllVersions.size)
                .withFilter(FilterType.ExtensionId, ...needAllVersions.keys());
            const { extensions } = await this.queryGalleryExtensions(query, criteria, token);
            this.telemetryService.publicLog2('galleryService:additionalQuery', {
                duration: new Date().getTime() - startTime,
                count: needAllVersions.size
            });
            for (const extension of extensions) {
                const index = needAllVersions.get(extension.identifier.uuid);
                result.push([index, extension]);
            }
        }
        return { extensions: result.sort((a, b) => a[0] - b[0]).map(([, extension]) => extension), total };
    }
    async toGalleryExtensionWithCriteria(rawGalleryExtension, criteria) {
        const extensionIdentifier = { id: getGalleryExtensionId(rawGalleryExtension.publisher.publisherName, rawGalleryExtension.extensionName), uuid: rawGalleryExtension.extensionId };
        const version = criteria.versions?.find(extensionIdentifierWithVersion => areSameExtensions(extensionIdentifierWithVersion, extensionIdentifier))?.version;
        const includePreRelease = isBoolean(criteria.includePreRelease) ? criteria.includePreRelease : !!criteria.includePreRelease.find(extensionIdentifierWithPreRelease => areSameExtensions(extensionIdentifierWithPreRelease, extensionIdentifier))?.includePreRelease;
        const allTargetPlatforms = getAllTargetPlatforms(rawGalleryExtension);
        const rawGalleryExtensionVersions = sortExtensionVersions(rawGalleryExtension.versions, criteria.targetPlatform);
        if (criteria.compatible && isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, criteria.targetPlatform)) {
            return null;
        }
        for (let index = 0; index < rawGalleryExtensionVersions.length; index++) {
            const rawGalleryExtensionVersion = rawGalleryExtensionVersions[index];
            if (version && rawGalleryExtensionVersion.version !== version) {
                continue;
            }
            // Allow any version if includePreRelease flag is set otherwise only release versions are allowed
            if (await this.isValidVersion(rawGalleryExtensionVersion, includePreRelease ? 'any' : 'release', criteria.compatible, allTargetPlatforms, criteria.targetPlatform)) {
                return toExtension(rawGalleryExtension, rawGalleryExtensionVersion, allTargetPlatforms);
            }
            if (version && rawGalleryExtensionVersion.version === version) {
                return null;
            }
        }
        if (version || criteria.compatible) {
            return null;
        }
        /**
         * Fallback: Return the latest version
         * This can happen when the extension does not have a release version or does not have a version compatible with the given target platform.
         */
        return toExtension(rawGalleryExtension, rawGalleryExtension.versions[0], allTargetPlatforms);
    }
    async queryRawGalleryExtensions(query, token) {
        if (!this.isEnabled()) {
            throw new Error('No extension gallery service configured.');
        }
        query = query
            /* Always exclude non validated extensions */
            .withFlags(query.flags, Flags.ExcludeNonValidated)
            .withFilter(FilterType.Target, 'Microsoft.VisualStudio.Code')
            /* Always exclude unpublished extensions */
            .withFilter(FilterType.ExcludeWithFlags, flagsToString(Flags.Unpublished));
        const commonHeaders = await this.commonHeadersPromise;
        const data = JSON.stringify(query.raw);
        const headers = {
            ...commonHeaders,
            'Content-Type': 'application/json',
            'Accept': 'application/json;api-version=3.0-preview.1',
            'Accept-Encoding': 'gzip',
            'Content-Length': String(data.length),
        };
        const startTime = new Date().getTime();
        let context, error, total = 0;
        try {
            context = await this.requestService.request({
                type: 'POST',
                url: this.extensionsGallerySearchUrl && query.criteria.some(c => c.filterType === FilterType.SearchText) ? this.extensionsGallerySearchUrl : this.api('/extensionquery'),
                data,
                headers
            }, token);
            if (context.res.statusCode && context.res.statusCode >= 400 && context.res.statusCode < 500) {
                return { galleryExtensions: [], total };
            }
            const result = await asJson(context);
            if (result) {
                const r = result.results[0];
                const galleryExtensions = r.extensions;
                const resultCount = r.resultMetadata && r.resultMetadata.filter(m => m.metadataType === 'ResultCount')[0];
                total = resultCount && resultCount.metadataItems.filter(i => i.name === 'TotalCount')[0].count || 0;
                return { galleryExtensions, total };
            }
            return { galleryExtensions: [], total };
        }
        catch (e) {
            error = e;
            throw e;
        }
        finally {
            this.telemetryService.publicLog2('galleryService:query', {
                ...query.telemetryData,
                requestBodySize: String(data.length),
                duration: new Date().getTime() - startTime,
                success: !!context && isSuccess(context),
                responseBodySize: context?.res.headers['Content-Length'],
                statusCode: context ? String(context.res.statusCode) : undefined,
                errorCode: error
                    ? isCancellationError(error) ? 'canceled' : getErrorMessage(error).startsWith('XHR timeout') ? 'timeout' : 'failed'
                    : undefined,
                count: String(total)
            });
        }
    }
    async reportStatistic(publisher, name, version, type) {
        if (!this.isEnabled()) {
            return undefined;
        }
        const url = isWeb ? this.api(`/itemName/${publisher}.${name}/version/${version}/statType/${type === "install" /* StatisticType.Install */ ? '1' : '3'}/vscodewebextension`) : this.api(`/publishers/${publisher}/extensions/${name}/${version}/stats?statType=${type}`);
        const Accept = isWeb ? 'api-version=6.1-preview.1' : '*/*;api-version=4.0-preview.1';
        const commonHeaders = await this.commonHeadersPromise;
        const headers = { ...commonHeaders, Accept };
        try {
            await this.requestService.request({
                type: 'POST',
                url,
                headers
            }, CancellationToken.None);
        }
        catch (error) { /* Ignore */ }
    }
    async download(extension, location, operation) {
        this.logService.trace('ExtensionGalleryService#download', extension.identifier.id);
        const data = getGalleryExtensionTelemetryData(extension);
        const startTime = new Date().getTime();
        /* __GDPR__
            "galleryService:downloadVSIX" : {
                "owner": "sandy081",
                "duration": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                "${include}": [
                    "${GalleryExtensionTelemetryData}"
                ]
            }
        */
        const log = (duration) => this.telemetryService.publicLog('galleryService:downloadVSIX', { ...data, duration });
        const operationParam = operation === 2 /* InstallOperation.Install */ ? 'install' : operation === 3 /* InstallOperation.Update */ ? 'update' : '';
        const downloadAsset = operationParam ? {
            uri: `${extension.assets.download.uri}${URI.parse(extension.assets.download.uri).query ? '&' : '?'}${operationParam}=true`,
            fallbackUri: `${extension.assets.download.fallbackUri}${URI.parse(extension.assets.download.fallbackUri).query ? '&' : '?'}${operationParam}=true`
        } : extension.assets.download;
        const context = await this.getAsset(downloadAsset);
        await this.fileService.writeFile(location, context.stream);
        log(new Date().getTime() - startTime);
    }
    async downloadSignatureArchive(extension, location) {
        if (!extension.assets.signature) {
            throw new Error('No signature asset found');
        }
        this.logService.trace('ExtensionGalleryService#downloadSignatureArchive', extension.identifier.id);
        const context = await this.getAsset(extension.assets.signature);
        await this.fileService.writeFile(location, context.stream);
    }
    async getReadme(extension, token) {
        if (extension.assets.readme) {
            const context = await this.getAsset(extension.assets.readme, {}, token);
            const content = await asTextOrError(context);
            return content || '';
        }
        return '';
    }
    async getManifest(extension, token) {
        if (extension.assets.manifest) {
            const context = await this.getAsset(extension.assets.manifest, {}, token);
            const text = await asTextOrError(context);
            return text ? JSON.parse(text) : null;
        }
        return null;
    }
    async getManifestFromRawExtensionVersion(rawExtensionVersion, token) {
        const manifestAsset = getVersionAsset(rawExtensionVersion, AssetType.Manifest);
        if (!manifestAsset) {
            throw new Error('Manifest was not found');
        }
        const headers = { 'Accept-Encoding': 'gzip' };
        const context = await this.getAsset(manifestAsset, { headers });
        return await asJson(context);
    }
    async getCoreTranslation(extension, languageId) {
        const asset = extension.assets.coreTranslations.filter(t => t[0] === languageId.toUpperCase())[0];
        if (asset) {
            const context = await this.getAsset(asset[1]);
            const text = await asTextOrError(context);
            return text ? JSON.parse(text) : null;
        }
        return null;
    }
    async getChangelog(extension, token) {
        if (extension.assets.changelog) {
            const context = await this.getAsset(extension.assets.changelog, {}, token);
            const content = await asTextOrError(context);
            return content || '';
        }
        return '';
    }
    async getAllCompatibleVersions(extension, includePreRelease, targetPlatform) {
        let query = new Query()
            .withFlags(Flags.IncludeVersions, Flags.IncludeCategoryAndTags, Flags.IncludeFiles, Flags.IncludeVersionProperties)
            .withPage(1, 1);
        if (extension.identifier.uuid) {
            query = query.withFilter(FilterType.ExtensionId, extension.identifier.uuid);
        }
        else {
            query = query.withFilter(FilterType.ExtensionName, extension.identifier.id);
        }
        const { galleryExtensions } = await this.queryRawGalleryExtensions(query, CancellationToken.None);
        if (!galleryExtensions.length) {
            return [];
        }
        const allTargetPlatforms = getAllTargetPlatforms(galleryExtensions[0]);
        if (isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, targetPlatform)) {
            return [];
        }
        const validVersions = [];
        await Promise.all(galleryExtensions[0].versions.map(async (version) => {
            try {
                if (await this.isValidVersion(version, includePreRelease ? 'any' : 'release', true, allTargetPlatforms, targetPlatform)) {
                    validVersions.push(version);
                }
            }
            catch (error) { /* Ignore error and skip version */ }
        }));
        const result = [];
        const seen = new Set();
        for (const version of sortExtensionVersions(validVersions, targetPlatform)) {
            if (!seen.has(version.version)) {
                seen.add(version.version);
                result.push({ version: version.version, date: version.lastUpdated, isPreReleaseVersion: isPreReleaseVersion(version) });
            }
        }
        return result;
    }
    async getAsset(asset, options = {}, token = CancellationToken.None) {
        const commonHeaders = await this.commonHeadersPromise;
        const baseOptions = { type: 'GET' };
        const headers = { ...commonHeaders, ...(options.headers || {}) };
        options = { ...options, ...baseOptions, headers };
        const url = asset.uri;
        const fallbackUrl = asset.fallbackUri;
        const firstOptions = { ...options, url };
        try {
            const context = await this.requestService.request(firstOptions, token);
            if (context.res.statusCode === 200) {
                return context;
            }
            const message = await asTextOrError(context);
            throw new Error(`Expected 200, got back ${context.res.statusCode} instead.\n\n${message}`);
        }
        catch (err) {
            if (isCancellationError(err)) {
                throw err;
            }
            const message = getErrorMessage(err);
            this.telemetryService.publicLog2('galleryService:cdnFallback', { url, message });
            const fallbackOptions = { ...options, url: fallbackUrl };
            return this.requestService.request(fallbackOptions, token);
        }
    }
    async getEngine(rawExtensionVersion) {
        let engine = getEngine(rawExtensionVersion);
        if (!engine) {
            const manifest = await this.getManifestFromRawExtensionVersion(rawExtensionVersion, CancellationToken.None);
            if (!manifest) {
                throw new Error('Manifest was not found');
            }
            engine = manifest.engines.vscode;
        }
        return engine;
    }
    async getExtensionsControlManifest() {
        if (!this.isEnabled()) {
            throw new Error('No extension gallery service configured.');
        }
        if (!this.extensionsControlUrl) {
            return { malicious: [], deprecated: {} };
        }
        const context = await this.requestService.request({ type: 'GET', url: this.extensionsControlUrl }, CancellationToken.None);
        if (context.res.statusCode !== 200) {
            throw new Error('Could not get extensions report.');
        }
        const result = await asJson(context);
        const malicious = [];
        const deprecated = {};
        if (result) {
            for (const id of result.malicious) {
                malicious.push({ id });
            }
            if (result.migrateToPreRelease) {
                for (const [unsupportedPreReleaseExtensionId, preReleaseExtensionInfo] of Object.entries(result.migrateToPreRelease)) {
                    if (!preReleaseExtensionInfo.engine || isEngineValid(preReleaseExtensionInfo.engine, this.productService.version, this.productService.date)) {
                        deprecated[unsupportedPreReleaseExtensionId.toLowerCase()] = {
                            disallowInstall: true,
                            extension: {
                                id: preReleaseExtensionInfo.id,
                                displayName: preReleaseExtensionInfo.displayName,
                                autoMigrate: { storage: !!preReleaseExtensionInfo.migrateStorage },
                                preRelease: true
                            }
                        };
                    }
                }
            }
            if (result.deprecated) {
                for (const [deprecatedExtensionId, deprecationInfo] of Object.entries(result.deprecated)) {
                    if (deprecationInfo) {
                        deprecated[deprecatedExtensionId.toLowerCase()] = isBoolean(deprecationInfo) ? {} : deprecationInfo;
                    }
                }
            }
        }
        return { malicious, deprecated };
    }
};
AbstractExtensionGalleryService = __decorate([
    __param(1, IRequestService),
    __param(2, ILogService),
    __param(3, IEnvironmentService),
    __param(4, ITelemetryService),
    __param(5, IFileService),
    __param(6, IProductService),
    __param(7, IConfigurationService)
], AbstractExtensionGalleryService);
let ExtensionGalleryService = class ExtensionGalleryService extends AbstractExtensionGalleryService {
    constructor(storageService, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService) {
        super(storageService, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService);
    }
};
ExtensionGalleryService = __decorate([
    __param(0, IStorageService),
    __param(1, IRequestService),
    __param(2, ILogService),
    __param(3, IEnvironmentService),
    __param(4, ITelemetryService),
    __param(5, IFileService),
    __param(6, IProductService),
    __param(7, IConfigurationService)
], ExtensionGalleryService);
export { ExtensionGalleryService };
let ExtensionGalleryServiceWithNoStorageService = class ExtensionGalleryServiceWithNoStorageService extends AbstractExtensionGalleryService {
    constructor(requestService, logService, environmentService, telemetryService, fileService, productService, configurationService) {
        super(undefined, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService);
    }
};
ExtensionGalleryServiceWithNoStorageService = __decorate([
    __param(0, IRequestService),
    __param(1, ILogService),
    __param(2, IEnvironmentService),
    __param(3, ITelemetryService),
    __param(4, IFileService),
    __param(5, IProductService),
    __param(6, IConfigurationService)
], ExtensionGalleryServiceWithNoStorageService);
export { ExtensionGalleryServiceWithNoStorageService };
