import { CancellationToken } from 'vs/base/common/cancellation';
import { URI } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IExtensionGalleryService, IExtensionManagementService, ILocalExtension } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IExtensionStorageService } from 'vs/platform/extensionManagement/common/extensionStorage';
import { IExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IUserDataProfile, IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { AbstractInitializer, AbstractSynchroniser, IAcceptResult, IMergeResult, IResourcePreview } from 'vs/platform/userDataSync/common/abstractSynchronizer';
import { IMergeResult as IExtensionMergeResult } from 'vs/platform/userDataSync/common/extensionsMerge';
import { IIgnoredExtensionsManagementService } from 'vs/platform/userDataSync/common/ignoredExtensions';
import { IRemoteUserData, ISyncData, ISyncExtension, ISyncExtensionWithVersion, IUserDataSyncBackupStoreService, IUserDataSynchroniser, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService } from 'vs/platform/userDataSync/common/userDataSync';
import { IUserDataProfileStorageService } from 'vs/platform/userDataProfile/common/userDataProfileStorageService';
declare type IExtensionResourceMergeResult = IAcceptResult & IExtensionMergeResult;
interface IExtensionResourcePreview extends IResourcePreview {
    readonly localExtensions: ISyncExtensionWithVersion[];
    readonly remoteExtensions: ISyncExtension[] | null;
    readonly skippedExtensions: ISyncExtension[];
    readonly builtinExtensions: IExtensionIdentifier[];
    readonly previewResult: IExtensionResourceMergeResult;
}
interface ILastSyncUserData extends IRemoteUserData {
    skippedExtensions: ISyncExtension[] | undefined;
    builtinExtensions: IExtensionIdentifier[] | undefined;
}
export declare function parseExtensions(syncData: ISyncData): ISyncExtension[];
export declare function stringify(extensions: ISyncExtension[], format: boolean): string;
export declare class ExtensionsSynchroniser extends AbstractSynchroniser implements IUserDataSynchroniser {
    private readonly extensionManagementService;
    private readonly ignoredExtensionsManagementService;
    private readonly instantiationService;
    protected readonly version: number;
    private readonly previewResource;
    private readonly baseResource;
    private readonly localResource;
    private readonly remoteResource;
    private readonly acceptedResource;
    private readonly localExtensionsProvider;
    constructor(profile: IUserDataProfile, collection: string | undefined, environmentService: IEnvironmentService, fileService: IFileService, storageService: IStorageService, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncBackupStoreService: IUserDataSyncBackupStoreService, extensionManagementService: IExtensionManagementService, ignoredExtensionsManagementService: IIgnoredExtensionsManagementService, logService: IUserDataSyncLogService, configurationService: IConfigurationService, userDataSyncEnablementService: IUserDataSyncEnablementService, telemetryService: ITelemetryService, extensionStorageService: IExtensionStorageService, uriIdentityService: IUriIdentityService, userDataProfileStorageService: IUserDataProfileStorageService, instantiationService: IInstantiationService);
    protected generateSyncPreview(remoteUserData: IRemoteUserData, lastSyncUserData: ILastSyncUserData | null): Promise<IExtensionResourcePreview[]>;
    protected hasRemoteChanged(lastSyncUserData: ILastSyncUserData): Promise<boolean>;
    private getPreviewContent;
    protected getMergeResult(resourcePreview: IExtensionResourcePreview, token: CancellationToken): Promise<IMergeResult>;
    protected getAcceptResult(resourcePreview: IExtensionResourcePreview, resource: URI, content: string | null | undefined, token: CancellationToken): Promise<IExtensionResourceMergeResult>;
    private acceptLocal;
    private acceptRemote;
    protected applyResult(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, resourcePreviews: [IExtensionResourcePreview, IExtensionResourceMergeResult][], force: boolean): Promise<void>;
    resolveContent(uri: URI): Promise<string | null>;
    private stringify;
    hasLocalData(): Promise<boolean>;
}
export declare class LocalExtensionsProvider {
    private readonly extensionManagementService;
    private readonly userDataProfileStorageService;
    private readonly extensionGalleryService;
    private readonly ignoredExtensionsManagementService;
    private readonly instantiationService;
    private readonly logService;
    constructor(extensionManagementService: IExtensionManagementService, userDataProfileStorageService: IUserDataProfileStorageService, extensionGalleryService: IExtensionGalleryService, ignoredExtensionsManagementService: IIgnoredExtensionsManagementService, instantiationService: IInstantiationService, logService: IUserDataSyncLogService);
    getLocalExtensions(profile: IUserDataProfile): Promise<{
        localExtensions: ISyncExtensionWithVersion[];
        ignoredExtensions: string[];
    }>;
    updateLocalExtensions(added: ISyncExtension[], removed: IExtensionIdentifier[], updated: ISyncExtension[], skippedExtensions: ISyncExtension[], profile: IUserDataProfile): Promise<ISyncExtension[]>;
    private updateExtensionState;
    private withProfileScopedServices;
}
export interface IExtensionsInitializerPreviewResult {
    readonly installedExtensions: ILocalExtension[];
    readonly disabledExtensions: IExtensionIdentifier[];
    readonly newExtensions: (IExtensionIdentifier & {
        preRelease: boolean;
    })[];
    readonly remoteExtensions: ISyncExtension[];
}
export declare abstract class AbstractExtensionsInitializer extends AbstractInitializer {
    protected readonly extensionManagementService: IExtensionManagementService;
    private readonly ignoredExtensionsManagementService;
    constructor(extensionManagementService: IExtensionManagementService, ignoredExtensionsManagementService: IIgnoredExtensionsManagementService, fileService: IFileService, userDataProfilesService: IUserDataProfilesService, environmentService: IEnvironmentService, logService: ILogService, storageService: IStorageService, uriIdentityService: IUriIdentityService);
    protected parseExtensions(remoteUserData: IRemoteUserData): Promise<ISyncExtension[] | null>;
    protected generatePreview(remoteExtensions: ISyncExtension[], localExtensions: ILocalExtension[]): IExtensionsInitializerPreviewResult;
}
export {};
