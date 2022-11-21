import { CancellationToken } from 'vs/base/common/cancellation';
import { IPager } from 'vs/base/common/paging';
import { URI } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IExtensionGalleryService, IExtensionInfo, IGalleryExtension, IGalleryExtensionVersion, InstallOperation, IQueryOptions, IExtensionsControlManifest, ITranslation, StatisticType, IExtensionQueryOptions } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IExtensionManifest, TargetPlatform } from 'vs/platform/extensions/common/extensions';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { IRequestService } from 'vs/platform/request/common/request';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
interface IRawGalleryExtensionFile {
    readonly assetType: string;
    readonly source: string;
}
interface IRawGalleryExtensionProperty {
    readonly key: string;
    readonly value: string;
}
export interface IRawGalleryExtensionVersion {
    readonly version: string;
    readonly lastUpdated: string;
    readonly assetUri: string;
    readonly fallbackAssetUri: string;
    readonly files: IRawGalleryExtensionFile[];
    readonly properties?: IRawGalleryExtensionProperty[];
    readonly targetPlatform?: string;
}
export declare function sortExtensionVersions(versions: IRawGalleryExtensionVersion[], preferredTargetPlatform: TargetPlatform): IRawGalleryExtensionVersion[];
declare abstract class AbstractExtensionGalleryService implements IExtensionGalleryService {
    private readonly requestService;
    private readonly logService;
    private readonly environmentService;
    private readonly telemetryService;
    private readonly fileService;
    private readonly productService;
    private readonly configurationService;
    readonly _serviceBrand: undefined;
    private readonly extensionsGalleryUrl;
    private readonly extensionsGallerySearchUrl;
    private readonly extensionsControlUrl;
    private readonly commonHeadersPromise;
    constructor(storageService: IStorageService | undefined, requestService: IRequestService, logService: ILogService, environmentService: IEnvironmentService, telemetryService: ITelemetryService, fileService: IFileService, productService: IProductService, configurationService: IConfigurationService);
    private api;
    isEnabled(): boolean;
    getExtensions(extensionInfos: ReadonlyArray<IExtensionInfo>, token: CancellationToken): Promise<IGalleryExtension[]>;
    getExtensions(extensionInfos: ReadonlyArray<IExtensionInfo>, options: IExtensionQueryOptions, token: CancellationToken): Promise<IGalleryExtension[]>;
    getCompatibleExtension(extension: IGalleryExtension, includePreRelease: boolean, targetPlatform: TargetPlatform): Promise<IGalleryExtension | null>;
    isExtensionCompatible(extension: IGalleryExtension, includePreRelease: boolean, targetPlatform: TargetPlatform): Promise<boolean>;
    private isValidVersion;
    query(options: IQueryOptions, token: CancellationToken): Promise<IPager<IGalleryExtension>>;
    private queryGalleryExtensions;
    private toGalleryExtensionWithCriteria;
    private queryRawGalleryExtensions;
    reportStatistic(publisher: string, name: string, version: string, type: StatisticType): Promise<void>;
    download(extension: IGalleryExtension, location: URI, operation: InstallOperation): Promise<void>;
    downloadSignatureArchive(extension: IGalleryExtension, location: URI): Promise<void>;
    getReadme(extension: IGalleryExtension, token: CancellationToken): Promise<string>;
    getManifest(extension: IGalleryExtension, token: CancellationToken): Promise<IExtensionManifest | null>;
    private getManifestFromRawExtensionVersion;
    getCoreTranslation(extension: IGalleryExtension, languageId: string): Promise<ITranslation | null>;
    getChangelog(extension: IGalleryExtension, token: CancellationToken): Promise<string>;
    getAllCompatibleVersions(extension: IGalleryExtension, includePreRelease: boolean, targetPlatform: TargetPlatform): Promise<IGalleryExtensionVersion[]>;
    private getAsset;
    private getEngine;
    getExtensionsControlManifest(): Promise<IExtensionsControlManifest>;
}
export declare class ExtensionGalleryService extends AbstractExtensionGalleryService {
    constructor(storageService: IStorageService, requestService: IRequestService, logService: ILogService, environmentService: IEnvironmentService, telemetryService: ITelemetryService, fileService: IFileService, productService: IProductService, configurationService: IConfigurationService);
}
export declare class ExtensionGalleryServiceWithNoStorageService extends AbstractExtensionGalleryService {
    constructor(requestService: IRequestService, logService: ILogService, environmentService: IEnvironmentService, telemetryService: ITelemetryService, fileService: IFileService, productService: IProductService, configurationService: IConfigurationService);
}
export {};
