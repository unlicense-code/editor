import { CancellationToken } from 'vs/base/common/cancellation';
import { IStringDictionary } from 'vs/base/common/collections';
import { Event } from 'vs/base/common/event';
import { IPager } from 'vs/base/common/paging';
import { Platform } from 'vs/base/common/platform';
import { URI } from 'vs/base/common/uri';
import { ExtensionType, IExtension, IExtensionManifest, TargetPlatform } from 'vs/platform/extensions/common/extensions';
export declare const EXTENSION_IDENTIFIER_PATTERN = "^([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$";
export declare const EXTENSION_IDENTIFIER_REGEX: RegExp;
export declare const WEB_EXTENSION_TAG = "__web_extension";
export declare const DEFAULT_PROFILE_EXTENSIONS_MIGRATION_KEY = "DEFAULT_PROFILE_EXTENSIONS_MIGRATION";
export declare function TargetPlatformToString(targetPlatform: TargetPlatform): "Web" | "Mac" | TargetPlatform.UNIVERSAL | TargetPlatform.UNKNOWN | TargetPlatform.UNDEFINED | "Windows 64 bit" | "Windows 32 bit" | "Windows ARM" | "Linux 64 bit" | "Linux ARM 64" | "Linux ARM" | "Alpine Linux 64 bit" | "Alpine ARM 64" | "Mac Silicon";
export declare function toTargetPlatform(targetPlatform: string): TargetPlatform;
export declare function getTargetPlatform(platform: Platform | 'alpine', arch: string | undefined): TargetPlatform;
export declare function isNotWebExtensionInWebTargetPlatform(allTargetPlatforms: TargetPlatform[], productTargetPlatform: TargetPlatform): boolean;
export declare function isTargetPlatformCompatible(extensionTargetPlatform: TargetPlatform, allTargetPlatforms: TargetPlatform[], productTargetPlatform: TargetPlatform): boolean;
export declare function getFallbackTargetPlarforms(targetPlatform: TargetPlatform): TargetPlatform[];
export interface IGalleryExtensionProperties {
    dependencies?: string[];
    extensionPack?: string[];
    engine?: string;
    localizedLanguages?: string[];
    targetPlatform: TargetPlatform;
    isPreReleaseVersion: boolean;
}
export interface IGalleryExtensionAsset {
    uri: string;
    fallbackUri: string;
}
export interface IGalleryExtensionAssets {
    manifest: IGalleryExtensionAsset | null;
    readme: IGalleryExtensionAsset | null;
    changelog: IGalleryExtensionAsset | null;
    license: IGalleryExtensionAsset | null;
    repository: IGalleryExtensionAsset | null;
    download: IGalleryExtensionAsset;
    icon: IGalleryExtensionAsset | null;
    signature: IGalleryExtensionAsset | null;
    coreTranslations: [string, IGalleryExtensionAsset][];
}
export declare function isIExtensionIdentifier(thing: any): thing is IExtensionIdentifier;
export interface IExtensionIdentifier {
    id: string;
    uuid?: string;
}
export interface IGalleryExtensionIdentifier extends IExtensionIdentifier {
    uuid: string;
}
export interface IGalleryExtensionVersion {
    version: string;
    date: string;
    isPreReleaseVersion: boolean;
}
export interface IGalleryExtension {
    name: string;
    identifier: IGalleryExtensionIdentifier;
    version: string;
    displayName: string;
    publisherId: string;
    publisher: string;
    publisherDisplayName: string;
    publisherDomain?: {
        link: string;
        verified: boolean;
    };
    publisherSponsorLink?: string;
    description: string;
    installCount: number;
    rating: number;
    ratingCount: number;
    categories: readonly string[];
    tags: readonly string[];
    releaseDate: number;
    lastUpdated: number;
    preview: boolean;
    hasPreReleaseVersion: boolean;
    hasReleaseVersion: boolean;
    isSigned: boolean;
    allTargetPlatforms: TargetPlatform[];
    assets: IGalleryExtensionAssets;
    properties: IGalleryExtensionProperties;
    telemetryData?: any;
}
export interface IGalleryMetadata {
    id: string;
    publisherId: string;
    publisherDisplayName: string;
    isPreReleaseVersion: boolean;
    targetPlatform?: TargetPlatform;
}
export declare type Metadata = Partial<IGalleryMetadata & {
    isApplicationScoped: boolean;
    isMachineScoped: boolean;
    isBuiltin: boolean;
    isSystem: boolean;
    updated: boolean;
    preRelease: boolean;
    installedTimestamp: number;
}>;
export interface ILocalExtension extends IExtension {
    isMachineScoped: boolean;
    isApplicationScoped: boolean;
    publisherId: string | null;
    publisherDisplayName: string | null;
    installedTimestamp?: number;
    isPreReleaseVersion: boolean;
    preRelease: boolean;
    updated: boolean;
}
export declare const enum SortBy {
    NoneOrRelevance = 0,
    LastUpdatedDate = 1,
    Title = 2,
    PublisherName = 3,
    InstallCount = 4,
    PublishedDate = 10,
    AverageRating = 6,
    WeightedRating = 12
}
export declare const enum SortOrder {
    Default = 0,
    Ascending = 1,
    Descending = 2
}
export interface IQueryOptions {
    text?: string;
    ids?: string[];
    names?: string[];
    pageSize?: number;
    sortBy?: SortBy;
    sortOrder?: SortOrder;
    source?: string;
    includePreRelease?: boolean;
}
export declare const enum StatisticType {
    Install = "install",
    Uninstall = "uninstall"
}
export interface IDeprecationInfo {
    readonly disallowInstall?: boolean;
    readonly extension?: {
        readonly id: string;
        readonly displayName: string;
        readonly autoMigrate?: {
            readonly storage: boolean;
        };
        readonly preRelease?: boolean;
    };
    readonly settings?: readonly string[];
}
export interface IExtensionsControlManifest {
    readonly malicious: IExtensionIdentifier[];
    readonly deprecated: IStringDictionary<IDeprecationInfo>;
}
export declare const enum InstallOperation {
    None = 1,
    Install = 2,
    Update = 3,
    Migrate = 4
}
export interface ITranslation {
    contents: {
        [key: string]: {};
    };
}
export interface IExtensionInfo extends IExtensionIdentifier {
    version?: string;
    preRelease?: boolean;
    hasPreRelease?: boolean;
}
export interface IExtensionQueryOptions {
    targetPlatform?: TargetPlatform;
    compatible?: boolean;
    queryAllVersions?: boolean;
    source?: string;
}
export declare const IExtensionGalleryService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtensionGalleryService>;
export interface IExtensionGalleryService {
    readonly _serviceBrand: undefined;
    isEnabled(): boolean;
    query(options: IQueryOptions, token: CancellationToken): Promise<IPager<IGalleryExtension>>;
    getExtensions(extensionInfos: ReadonlyArray<IExtensionInfo>, token: CancellationToken): Promise<IGalleryExtension[]>;
    getExtensions(extensionInfos: ReadonlyArray<IExtensionInfo>, options: IExtensionQueryOptions, token: CancellationToken): Promise<IGalleryExtension[]>;
    isExtensionCompatible(extension: IGalleryExtension, includePreRelease: boolean, targetPlatform: TargetPlatform): Promise<boolean>;
    getCompatibleExtension(extension: IGalleryExtension, includePreRelease: boolean, targetPlatform: TargetPlatform): Promise<IGalleryExtension | null>;
    getAllCompatibleVersions(extension: IGalleryExtension, includePreRelease: boolean, targetPlatform: TargetPlatform): Promise<IGalleryExtensionVersion[]>;
    download(extension: IGalleryExtension, location: URI, operation: InstallOperation): Promise<void>;
    downloadSignatureArchive(extension: IGalleryExtension, location: URI): Promise<void>;
    reportStatistic(publisher: string, name: string, version: string, type: StatisticType): Promise<void>;
    getReadme(extension: IGalleryExtension, token: CancellationToken): Promise<string>;
    getManifest(extension: IGalleryExtension, token: CancellationToken): Promise<IExtensionManifest | null>;
    getChangelog(extension: IGalleryExtension, token: CancellationToken): Promise<string>;
    getCoreTranslation(extension: IGalleryExtension, languageId: string): Promise<ITranslation | null>;
    getExtensionsControlManifest(): Promise<IExtensionsControlManifest>;
}
export interface InstallExtensionEvent {
    readonly identifier: IExtensionIdentifier;
    readonly source: URI | IGalleryExtension;
    readonly profileLocation?: URI;
    readonly applicationScoped?: boolean;
}
export interface InstallExtensionResult {
    readonly identifier: IExtensionIdentifier;
    readonly operation: InstallOperation;
    readonly source?: URI | IGalleryExtension;
    readonly local?: ILocalExtension;
    readonly context?: IStringDictionary<any>;
    readonly profileLocation?: URI;
    readonly applicationScoped?: boolean;
}
export interface UninstallExtensionEvent {
    readonly identifier: IExtensionIdentifier;
    readonly profileLocation?: URI;
    readonly applicationScoped?: boolean;
}
export interface DidUninstallExtensionEvent {
    readonly identifier: IExtensionIdentifier;
    readonly error?: string;
    readonly profileLocation?: URI;
    readonly applicationScoped?: boolean;
}
export declare enum ExtensionManagementErrorCode {
    Unsupported = "Unsupported",
    Deprecated = "Deprecated",
    Malicious = "Malicious",
    Incompatible = "Incompatible",
    IncompatiblePreRelease = "IncompatiblePreRelease",
    IncompatibleTargetPlatform = "IncompatibleTargetPlatform",
    ReleaseVersionNotFound = "ReleaseVersionNotFound",
    Invalid = "Invalid",
    Download = "Download",
    Extract = "Extract",
    Delete = "Delete",
    Rename = "Rename",
    CorruptZip = "CorruptZip",
    IncompleteZip = "IncompleteZip",
    Internal = "Internal",
    Signature = "Signature"
}
export declare class ExtensionManagementError extends Error {
    readonly code: ExtensionManagementErrorCode;
    constructor(message: string, code: ExtensionManagementErrorCode);
}
export declare type InstallOptions = {
    isBuiltin?: boolean;
    isMachineScoped?: boolean;
    donotIncludePackAndDependencies?: boolean;
    installGivenVersion?: boolean;
    installPreReleaseVersion?: boolean;
    operation?: InstallOperation;
    /**
     * Context passed through to InstallExtensionResult
     */
    context?: IStringDictionary<any>;
    profileLocation?: URI;
};
export declare type InstallVSIXOptions = Omit<InstallOptions, 'installGivenVersion'> & {
    installOnlyNewlyAddedFromExtensionPack?: boolean;
};
export declare type UninstallOptions = {
    readonly donotIncludePack?: boolean;
    readonly donotCheckDependents?: boolean;
    readonly versionOnly?: boolean;
    readonly remove?: boolean;
    readonly profileLocation?: URI;
};
export interface IExtensionManagementParticipant {
    postInstall(local: ILocalExtension, source: URI | IGalleryExtension, options: InstallOptions | InstallVSIXOptions, token: CancellationToken): Promise<void>;
    postUninstall(local: ILocalExtension, options: UninstallOptions, token: CancellationToken): Promise<void>;
}
export declare const IExtensionManagementService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtensionManagementService>;
export interface IExtensionManagementService {
    readonly _serviceBrand: undefined;
    onInstallExtension: Event<InstallExtensionEvent>;
    onDidInstallExtensions: Event<readonly InstallExtensionResult[]>;
    onUninstallExtension: Event<UninstallExtensionEvent>;
    onDidUninstallExtension: Event<DidUninstallExtensionEvent>;
    zip(extension: ILocalExtension): Promise<URI>;
    unzip(zipLocation: URI): Promise<IExtensionIdentifier>;
    getManifest(vsix: URI): Promise<IExtensionManifest>;
    install(vsix: URI, options?: InstallVSIXOptions): Promise<ILocalExtension>;
    canInstall(extension: IGalleryExtension): Promise<boolean>;
    installFromGallery(extension: IGalleryExtension, options?: InstallOptions): Promise<ILocalExtension>;
    uninstall(extension: ILocalExtension, options?: UninstallOptions): Promise<void>;
    reinstallFromGallery(extension: ILocalExtension): Promise<void>;
    getInstalled(type?: ExtensionType, profileLocation?: URI): Promise<ILocalExtension[]>;
    getExtensionsControlManifest(): Promise<IExtensionsControlManifest>;
    download(extension: IGalleryExtension, operation: InstallOperation): Promise<URI>;
    getMetadata(extension: ILocalExtension): Promise<Metadata | undefined>;
    updateMetadata(local: ILocalExtension, metadata: IGalleryMetadata): Promise<ILocalExtension>;
    updateExtensionScope(local: ILocalExtension, isMachineScoped: boolean): Promise<ILocalExtension>;
    registerParticipant(pariticipant: IExtensionManagementParticipant): void;
    getTargetPlatform(): Promise<TargetPlatform>;
}
export declare const DISABLED_EXTENSIONS_STORAGE_PATH = "extensionsIdentifiers/disabled";
export declare const ENABLED_EXTENSIONS_STORAGE_PATH = "extensionsIdentifiers/enabled";
export declare const IGlobalExtensionEnablementService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IGlobalExtensionEnablementService>;
export interface IGlobalExtensionEnablementService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeEnablement: Event<{
        readonly extensions: IExtensionIdentifier[];
        readonly source?: string;
    }>;
    getDisabledExtensions(): IExtensionIdentifier[];
    enableExtension(extension: IExtensionIdentifier, source?: string): Promise<boolean>;
    disableExtension(extension: IExtensionIdentifier, source?: string): Promise<boolean>;
}
export declare type IConfigBasedExtensionTip = {
    readonly extensionId: string;
    readonly extensionName: string;
    readonly isExtensionPack: boolean;
    readonly configName: string;
    readonly important: boolean;
    readonly whenNotInstalled?: string[];
};
export declare type IExecutableBasedExtensionTip = {
    readonly extensionId: string;
    readonly extensionName: string;
    readonly isExtensionPack: boolean;
    readonly exeName: string;
    readonly exeFriendlyName: string;
    readonly windowsPath?: string;
    readonly whenNotInstalled?: string[];
};
export declare type IWorkspaceTips = {
    readonly remoteSet: string[];
    readonly recommendations: string[];
};
export declare const IExtensionTipsService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtensionTipsService>;
export interface IExtensionTipsService {
    readonly _serviceBrand: undefined;
    getConfigBasedTips(folder: URI): Promise<IConfigBasedExtensionTip[]>;
    getImportantExecutableBasedTips(): Promise<IExecutableBasedExtensionTip[]>;
    getOtherExecutableBasedTips(): Promise<IExecutableBasedExtensionTip[]>;
    getAllWorkspacesTips(): Promise<IWorkspaceTips[]>;
}
export declare const ExtensionsLabel: string;
export declare const ExtensionsLocalizedLabel: {
    value: string;
    original: string;
};
export declare const PreferencesLabel: string;
export declare const PreferencesLocalizedLabel: {
    value: string;
    original: string;
};
export interface CLIOutput {
    log(s: string): void;
    error(s: string): void;
}
