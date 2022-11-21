import { CancellationToken } from 'vs/base/common/cancellation';
import { URI } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IFileService } from 'vs/platform/files/common/files';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IUserDataProfile, IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { AbstractInitializer, AbstractJsonFileSynchroniser, IAcceptResult, IFileResourcePreview, IMergeResult } from 'vs/platform/userDataSync/common/abstractSynchronizer';
import { IRemoteUserData, IUserDataSyncBackupStoreService, IUserDataSyncConfiguration, IUserDataSynchroniser, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService, IUserDataSyncUtilService, IUserDataResourceManifest } from 'vs/platform/userDataSync/common/userDataSync';
interface ISettingsResourcePreview extends IFileResourcePreview {
    previewResult: IMergeResult;
}
export interface ISettingsSyncContent {
    settings: string;
}
export declare function parseSettingsSyncContent(syncContent: string): ISettingsSyncContent;
export declare class SettingsSynchroniser extends AbstractJsonFileSynchroniser implements IUserDataSynchroniser {
    private readonly extensionManagementService;
    protected readonly version: number;
    readonly previewResource: URI;
    readonly baseResource: URI;
    readonly localResource: URI;
    readonly remoteResource: URI;
    readonly acceptedResource: URI;
    constructor(profile: IUserDataProfile, collection: string | undefined, fileService: IFileService, environmentService: IEnvironmentService, storageService: IStorageService, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncBackupStoreService: IUserDataSyncBackupStoreService, logService: IUserDataSyncLogService, userDataSyncUtilService: IUserDataSyncUtilService, configurationService: IConfigurationService, userDataSyncEnablementService: IUserDataSyncEnablementService, telemetryService: ITelemetryService, extensionManagementService: IExtensionManagementService, uriIdentityService: IUriIdentityService);
    getRemoteUserDataSyncConfiguration(manifest: IUserDataResourceManifest | null): Promise<IUserDataSyncConfiguration>;
    protected generateSyncPreview(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, isRemoteDataFromCurrentMachine: boolean): Promise<ISettingsResourcePreview[]>;
    protected hasRemoteChanged(lastSyncUserData: IRemoteUserData): Promise<boolean>;
    protected getMergeResult(resourcePreview: ISettingsResourcePreview, token: CancellationToken): Promise<IMergeResult>;
    protected getAcceptResult(resourcePreview: ISettingsResourcePreview, resource: URI, content: string | null | undefined, token: CancellationToken): Promise<IAcceptResult>;
    protected applyResult(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, resourcePreviews: [ISettingsResourcePreview, IAcceptResult][], force: boolean): Promise<void>;
    hasLocalData(): Promise<boolean>;
    resolveContent(uri: URI): Promise<string | null>;
    protected resolvePreviewContent(resource: URI): Promise<string | null>;
    private getSettingsSyncContent;
    private parseSettingsSyncContent;
    private toSettingsSyncContent;
    private _defaultIgnoredSettings;
    private getIgnoredSettings;
    private validateContent;
}
export declare class SettingsInitializer extends AbstractInitializer {
    constructor(fileService: IFileService, userDataProfilesService: IUserDataProfilesService, environmentService: IEnvironmentService, logService: IUserDataSyncLogService, storageService: IStorageService, uriIdentityService: IUriIdentityService);
    doInitialize(remoteUserData: IRemoteUserData): Promise<void>;
    private isEmpty;
    private parseSettingsSyncContent;
}
export {};
