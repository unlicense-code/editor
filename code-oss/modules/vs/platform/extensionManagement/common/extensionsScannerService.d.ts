import { Disposable } from 'vs/base/common/lifecycle';
import Severity from 'vs/base/common/severity';
import { URI } from 'vs/base/common/uri';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { Metadata } from 'vs/platform/extensionManagement/common/extensionManagement';
import { ExtensionType, IExtensionManifest, TargetPlatform, IExtensionIdentifier, IRelaxedExtensionManifest, IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { Event } from 'vs/base/common/event';
import { IExtensionsProfileScannerService } from 'vs/platform/extensionManagement/common/extensionsProfileScannerService';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
export declare type IScannedExtensionManifest = IRelaxedExtensionManifest & {
    __metadata?: Metadata;
};
interface IRelaxedScannedExtension {
    type: ExtensionType;
    isBuiltin: boolean;
    identifier: IExtensionIdentifier;
    manifest: IRelaxedExtensionManifest;
    location: URI;
    targetPlatform: TargetPlatform;
    metadata: Metadata | undefined;
    isValid: boolean;
    validations: readonly [Severity, string][];
}
export declare type IScannedExtension = Readonly<IRelaxedScannedExtension> & {
    manifest: IExtensionManifest;
};
export interface Translations {
    [id: string]: string;
}
export declare namespace Translations {
    function equals(a: Translations, b: Translations): boolean;
}
export declare type ScanOptions = {
    readonly profileLocation?: URI;
    readonly includeInvalid?: boolean;
    readonly includeAllVersions?: boolean;
    readonly includeUninstalled?: boolean;
    readonly checkControlFile?: boolean;
    readonly language?: string;
    readonly useCache?: boolean;
};
export declare const IExtensionsScannerService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtensionsScannerService>;
export interface IExtensionsScannerService {
    readonly _serviceBrand: undefined;
    readonly systemExtensionsLocation: URI;
    readonly userExtensionsLocation: URI;
    readonly onDidChangeCache: Event<ExtensionType>;
    getTargetPlatform(): Promise<TargetPlatform>;
    scanAllExtensions(systemScanOptions: ScanOptions, userScanOptions: ScanOptions, includeExtensionsUnderDev: boolean): Promise<IScannedExtension[]>;
    scanSystemExtensions(scanOptions: ScanOptions): Promise<IScannedExtension[]>;
    scanUserExtensions(scanOptions: ScanOptions): Promise<IScannedExtension[]>;
    scanExtensionsUnderDevelopment(scanOptions: ScanOptions, existingExtensions: IScannedExtension[]): Promise<IScannedExtension[]>;
    scanExistingExtension(extensionLocation: URI, extensionType: ExtensionType, scanOptions: ScanOptions): Promise<IScannedExtension | null>;
    scanOneOrMultipleExtensions(extensionLocation: URI, extensionType: ExtensionType, scanOptions: ScanOptions): Promise<IScannedExtension[]>;
    scanMetadata(extensionLocation: URI): Promise<Metadata | undefined>;
    updateMetadata(extensionLocation: URI, metadata: Partial<Metadata>): Promise<void>;
}
export declare abstract class AbstractExtensionsScannerService extends Disposable implements IExtensionsScannerService {
    readonly systemExtensionsLocation: URI;
    readonly userExtensionsLocation: URI;
    private readonly extensionsControlLocation;
    private readonly cacheLocation;
    private readonly userDataProfilesService;
    protected readonly extensionsProfileScannerService: IExtensionsProfileScannerService;
    protected readonly fileService: IFileService;
    protected readonly logService: ILogService;
    private readonly environmentService;
    private readonly productService;
    private readonly uriIdentityService;
    private readonly instantiationService;
    readonly _serviceBrand: undefined;
    protected abstract getTranslations(language: string): Promise<Translations>;
    private readonly _onDidChangeCache;
    readonly onDidChangeCache: Event<ExtensionType>;
    private readonly obsoleteFile;
    private readonly systemExtensionsCachedScanner;
    private readonly userExtensionsCachedScanner;
    private readonly extensionsScanner;
    constructor(systemExtensionsLocation: URI, userExtensionsLocation: URI, extensionsControlLocation: URI, cacheLocation: URI, userDataProfilesService: IUserDataProfilesService, extensionsProfileScannerService: IExtensionsProfileScannerService, fileService: IFileService, logService: ILogService, environmentService: IEnvironmentService, productService: IProductService, uriIdentityService: IUriIdentityService, instantiationService: IInstantiationService);
    private _targetPlatformPromise;
    getTargetPlatform(): Promise<TargetPlatform>;
    scanAllExtensions(systemScanOptions: ScanOptions, userScanOptions: ScanOptions, includeExtensionsUnderDev: boolean): Promise<IScannedExtension[]>;
    scanSystemExtensions(scanOptions: ScanOptions): Promise<IScannedExtension[]>;
    scanUserExtensions(scanOptions: ScanOptions): Promise<IScannedExtension[]>;
    scanExtensionsUnderDevelopment(scanOptions: ScanOptions, existingExtensions: IScannedExtension[]): Promise<IScannedExtension[]>;
    scanExistingExtension(extensionLocation: URI, extensionType: ExtensionType, scanOptions: ScanOptions): Promise<IScannedExtension | null>;
    scanOneOrMultipleExtensions(extensionLocation: URI, extensionType: ExtensionType, scanOptions: ScanOptions): Promise<IScannedExtension[]>;
    scanMetadata(extensionLocation: URI): Promise<Metadata | undefined>;
    updateMetadata(extensionLocation: URI, metaData: Partial<Metadata>): Promise<void>;
    private applyScanOptions;
    private dedupExtensions;
    private scanDefaultSystemExtensions;
    private scanDevSystemExtensions;
    private getBuiltInExtensionControl;
    private createExtensionScannerInput;
    private getMtime;
}
export declare function toExtensionDescription(extension: IScannedExtension, isUnderDevelopment: boolean): IExtensionDescription;
export declare class NativeExtensionsScannerService extends AbstractExtensionsScannerService implements IExtensionsScannerService {
    private readonly translationsPromise;
    constructor(systemExtensionsLocation: URI, userExtensionsLocation: URI, userHome: URI, userDataPath: URI, userDataProfilesService: IUserDataProfilesService, extensionsProfileScannerService: IExtensionsProfileScannerService, fileService: IFileService, logService: ILogService, environmentService: IEnvironmentService, productService: IProductService, uriIdentityService: IUriIdentityService, instantiationService: IInstantiationService);
    protected getTranslations(language: string): Promise<Translations>;
}
export {};
