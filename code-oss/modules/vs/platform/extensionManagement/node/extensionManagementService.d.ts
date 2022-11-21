import { CancellationToken } from 'vs/base/common/cancellation';
import { IStringDictionary } from 'vs/base/common/collections';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IDownloadService } from 'vs/platform/download/common/download';
import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { AbstractExtensionManagementService, AbstractExtensionTask, IInstallExtensionTask, InstallExtensionTaskOptions, IUninstallExtensionTask, UninstallExtensionTaskOptions } from 'vs/platform/extensionManagement/common/abstractExtensionManagementService';
import { IExtensionGalleryService, IExtensionIdentifier, IExtensionManagementService, IGalleryExtension, IGalleryMetadata, ILocalExtension, InstallOperation, Metadata, InstallOptions, InstallVSIXOptions } from 'vs/platform/extensionManagement/common/extensionManagement';
import { ExtensionKey } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { IExtensionsProfileScannerService } from 'vs/platform/extensionManagement/common/extensionsProfileScannerService';
import { IExtensionsScannerService, IScannedExtension } from 'vs/platform/extensionManagement/common/extensionsScannerService';
import { ExtensionsDownloader } from 'vs/platform/extensionManagement/node/extensionDownloader';
import { ExtensionType, IExtension, IExtensionManifest, TargetPlatform } from 'vs/platform/extensions/common/extensions';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
interface InstallableExtension {
    zipPath: string;
    key: ExtensionKey;
    metadata: Metadata;
}
export declare const INativeServerExtensionManagementService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<INativeServerExtensionManagementService>;
export interface INativeServerExtensionManagementService extends IExtensionManagementService {
    readonly _serviceBrand: undefined;
    migrateDefaultProfileExtensions(): Promise<void>;
    markAsUninstalled(...extensions: IExtension[]): Promise<void>;
    removeUninstalledExtensions(): Promise<void>;
    getAllUserInstalled(): Promise<ILocalExtension[]>;
}
export declare class ExtensionManagementService extends AbstractExtensionManagementService implements INativeServerExtensionManagementService {
    private readonly extensionsScannerService;
    private readonly extensionsProfileScannerService;
    private downloadService;
    private readonly fileService;
    private readonly uriIdentityService;
    private readonly extensionsScanner;
    private readonly manifestCache;
    private readonly extensionsDownloader;
    private readonly installGalleryExtensionsTasks;
    constructor(galleryService: IExtensionGalleryService, telemetryService: ITelemetryService, logService: ILogService, environmentService: INativeEnvironmentService, extensionsScannerService: IExtensionsScannerService, extensionsProfileScannerService: IExtensionsProfileScannerService, downloadService: IDownloadService, instantiationService: IInstantiationService, fileService: IFileService, productService: IProductService, uriIdentityService: IUriIdentityService, userDataProfilesService: IUserDataProfilesService);
    private _targetPlatformPromise;
    getTargetPlatform(): Promise<TargetPlatform>;
    zip(extension: ILocalExtension): Promise<URI>;
    unzip(zipLocation: URI): Promise<IExtensionIdentifier>;
    getManifest(vsix: URI): Promise<IExtensionManifest>;
    getInstalled(type?: ExtensionType, profileLocation?: URI): Promise<ILocalExtension[]>;
    getAllUserInstalled(): Promise<ILocalExtension[]>;
    install(vsix: URI, options?: InstallVSIXOptions): Promise<ILocalExtension>;
    getMetadata(extension: ILocalExtension): Promise<Metadata | undefined>;
    updateMetadata(local: ILocalExtension, metadata: IGalleryMetadata): Promise<ILocalExtension>;
    updateExtensionScope(local: ILocalExtension, isMachineScoped: boolean): Promise<ILocalExtension>;
    reinstallFromGallery(extension: ILocalExtension): Promise<void>;
    markAsUninstalled(...extensions: IExtension[]): Promise<void>;
    removeUninstalledExtensions(): Promise<void>;
    migrateDefaultProfileExtensions(): Promise<void>;
    download(extension: IGalleryExtension, operation: InstallOperation): Promise<URI>;
    private downloadVsix;
    protected getCurrentExtensionsManifestLocation(): URI;
    protected createInstallExtensionTask(manifest: IExtensionManifest, extension: URI | IGalleryExtension, options: InstallExtensionTaskOptions): IInstallExtensionTask;
    protected createUninstallExtensionTask(extension: ILocalExtension, options: UninstallExtensionTaskOptions): IUninstallExtensionTask;
    private collectFiles;
    private onDidChangeExtensionsFromAnotherSource;
    private readonly knownDirectories;
    private watchForExtensionsNotInstalledBySystem;
    private onDidFilesChange;
}
export declare class ExtensionsScanner extends Disposable {
    private readonly beforeRemovingExtension;
    private readonly fileService;
    private readonly extensionsScannerService;
    private readonly userDataProfilesService;
    private readonly extensionsProfileScannerService;
    private readonly logService;
    private readonly uninstalledPath;
    private readonly uninstalledFileLimiter;
    private readonly _onExtract;
    readonly onExtract: import("vs/base/common/event").Event<URI>;
    constructor(beforeRemovingExtension: (e: ILocalExtension) => Promise<void>, fileService: IFileService, extensionsScannerService: IExtensionsScannerService, userDataProfilesService: IUserDataProfilesService, extensionsProfileScannerService: IExtensionsProfileScannerService, logService: ILogService);
    cleanUp(): Promise<void>;
    scanExtensions(type: ExtensionType | null, profileLocation: URI | undefined): Promise<ILocalExtension[]>;
    scanAllUserExtensions(excludeOutdated: boolean): Promise<ILocalExtension[]>;
    scanUserExtensionAtLocation(location: URI): Promise<ILocalExtension | null>;
    extractUserExtension(extensionKey: ExtensionKey, zipPath: string, metadata: Metadata, token: CancellationToken): Promise<ILocalExtension>;
    updateMetadata(local: ILocalExtension, metadata: Partial<Metadata>): Promise<ILocalExtension>;
    getUninstalledExtensions(): Promise<IStringDictionary<boolean>>;
    setUninstalled(...extensions: IExtension[]): Promise<void>;
    setInstalled(extensionKey: ExtensionKey): Promise<ILocalExtension | null>;
    removeExtension(extension: ILocalExtension | IScannedExtension, type: string): Promise<void>;
    removeUninstalledExtension(extension: ILocalExtension | IScannedExtension): Promise<void>;
    private withUninstalledExtensions;
    private extractAtLocation;
    private rename;
    private scanLocalExtension;
    private toLocalExtension;
    private removeUninstalledExtensions;
    private _migrateDefaultProfileExtensionsPromise;
    migrateDefaultProfileExtensions(): Promise<void>;
    private joinErrors;
}
declare abstract class InstallExtensionTask extends AbstractExtensionTask<{
    local: ILocalExtension;
    metadata: Metadata;
}> implements IInstallExtensionTask {
    readonly identifier: IExtensionIdentifier;
    readonly source: URI | IGalleryExtension;
    protected readonly options: InstallOptions;
    protected readonly extensionsScanner: ExtensionsScanner;
    protected readonly logService: ILogService;
    wasVerified: boolean;
    protected _operation: InstallOperation;
    get operation(): InstallOperation;
    constructor(identifier: IExtensionIdentifier, source: URI | IGalleryExtension, options: InstallOptions, extensionsScanner: ExtensionsScanner, logService: ILogService);
    protected installExtension(installableExtension: InstallableExtension, token: CancellationToken): Promise<ILocalExtension>;
    protected unsetUninstalledAndGetLocal(extensionKey: ExtensionKey): Promise<ILocalExtension | null>;
    private isUninstalled;
    private extract;
}
export declare class InstallGalleryExtensionTask extends InstallExtensionTask {
    private readonly manifest;
    private readonly gallery;
    private readonly extensionsDownloader;
    constructor(manifest: IExtensionManifest, gallery: IGalleryExtension, options: InstallOptions, extensionsDownloader: ExtensionsDownloader, extensionsScanner: ExtensionsScanner, logService: ILogService);
    protected doRun(token: CancellationToken): Promise<{
        local: ILocalExtension;
        metadata: Metadata;
    }>;
    protected validateManifest(zipPath: string): Promise<void>;
}
export {};
