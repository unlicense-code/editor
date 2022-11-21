import { IBuiltinExtensionsScannerService, ExtensionType, IExtension, IExtensionManifest } from 'vs/platform/extensions/common/extensions';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IScannedExtension, IWebExtensionsScannerService, ScanOptions } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { URI } from 'vs/base/common/uri';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { IExtensionGalleryService, IGalleryExtension, Metadata } from 'vs/platform/extensionManagement/common/extensionManagement';
import { Disposable } from 'vs/base/common/lifecycle';
import { IExtensionManifestPropertiesService } from 'vs/workbench/services/extensions/common/extensionManifestPropertiesService';
import { IExtensionResourceLoaderService } from 'vs/platform/extensionResourceLoader/common/extensionResourceLoader';
import { IExtensionStorageService } from 'vs/platform/extensionManagement/common/extensionStorage';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IProductService } from 'vs/platform/product/common/productService';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
export declare class WebExtensionsScannerService extends Disposable implements IWebExtensionsScannerService {
    private readonly environmentService;
    private readonly builtinExtensionsScannerService;
    private readonly fileService;
    private readonly logService;
    private readonly galleryService;
    private readonly extensionManifestPropertiesService;
    private readonly extensionResourceLoaderService;
    private readonly extensionStorageService;
    private readonly storageService;
    private readonly productService;
    private readonly userDataProfilesService;
    private readonly uriIdentityService;
    readonly _serviceBrand: undefined;
    private readonly systemExtensionsCacheResource;
    private readonly customBuiltinExtensionsCacheResource;
    private readonly resourcesAccessQueueMap;
    constructor(environmentService: IBrowserWorkbenchEnvironmentService, builtinExtensionsScannerService: IBuiltinExtensionsScannerService, fileService: IFileService, logService: ILogService, galleryService: IExtensionGalleryService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, extensionResourceLoaderService: IExtensionResourceLoaderService, extensionStorageService: IExtensionStorageService, storageService: IStorageService, productService: IProductService, userDataProfilesService: IUserDataProfilesService, uriIdentityService: IUriIdentityService, lifecycleService: ILifecycleService);
    private _customBuiltinExtensionsInfoPromise;
    private readCustomBuiltinExtensionsInfoFromEnv;
    private checkAdditionalBuiltinExtensions;
    /**
     * All system extensions bundled with the product
     */
    private readSystemExtensions;
    /**
     * All extensions defined via `additionalBuiltinExtensions` API
     */
    private readCustomBuiltinExtensions;
    private getCustomBuiltinExtensionsFromLocations;
    private getCustomBuiltinExtensionsFromGallery;
    private getCustomBuiltinExtensionsFromCache;
    private _migrateExtensionsStoragePromise;
    private migrateExtensionsStorage;
    private updateCaches;
    private updateSystemExtensionsCache;
    private _updateCustomBuiltinExtensionsCachePromise;
    private updateCustomBuiltinExtensionsCache;
    private getExtensionsWithDependenciesAndPackedExtensions;
    scanSystemExtensions(): Promise<IExtension[]>;
    scanUserExtensions(profileLocation: URI, scanOptions?: ScanOptions): Promise<IScannedExtension[]>;
    scanExtensionsUnderDevelopment(): Promise<IExtension[]>;
    scanExistingExtension(extensionLocation: URI, extensionType: ExtensionType, profileLocation: URI): Promise<IScannedExtension | null>;
    scanMetadata(extensionLocation: URI, profileLocation: URI): Promise<Metadata | undefined>;
    scanExtensionManifest(extensionLocation: URI): Promise<IExtensionManifest | null>;
    addExtensionFromGallery(galleryExtension: IGalleryExtension, metadata: Metadata, profileLocation: URI): Promise<IScannedExtension>;
    addExtension(location: URI, metadata: Metadata, profileLocation: URI): Promise<IScannedExtension>;
    removeExtension(extension: IScannedExtension, profileLocation: URI): Promise<void>;
    copyExtensions(fromProfileLocation: URI, toProfileLocation: URI, filter: (extension: IScannedExtension) => boolean): Promise<void>;
    private addWebExtension;
    private addToInstalledExtensions;
    private scanInstalledExtensions;
    private toWebExtensionFromGallery;
    private getPackageNLSResourceMapFromResources;
    private getBundleNLSResourceMapFromResources;
    private toWebExtension;
    private toScannedExtension;
    private listExtensionResources;
    private translateManifest;
    private _migratePackageNLSUrisPromise;
    private migratePackageNLSUris;
    private getExtensionManifest;
    private readInstalledExtensions;
    private writeInstalledExtensions;
    private readCustomBuiltinExtensionsCache;
    private writeCustomBuiltinExtensionsCache;
    private readSystemExtensionsCache;
    private writeSystemExtensionsCache;
    private withWebExtensions;
    private migrateWebExtensions;
    private storeWebExtensions;
    private getResourceAccessQueue;
}
