import { CancellationToken } from 'vs/base/common/cancellation';
import { URI } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IUserDataProfile, IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { AbstractSynchroniser, IAcceptResult, IMergeResult, IResourcePreview } from 'vs/platform/userDataSync/common/abstractSynchronizer';
import { IRemoteUserData, IUserDataSyncBackupStoreService, IUserDataSynchroniser, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService, ISyncUserDataProfile, ISyncData, IUserDataResourceManifest } from 'vs/platform/userDataSync/common/userDataSync';
export interface IUserDataProfileManifestResourceMergeResult extends IAcceptResult {
    readonly local: {
        added: ISyncUserDataProfile[];
        removed: IUserDataProfile[];
        updated: ISyncUserDataProfile[];
    };
    readonly remote: {
        added: IUserDataProfile[];
        removed: ISyncUserDataProfile[];
        updated: IUserDataProfile[];
    } | null;
}
export interface IUserDataProfilesManifestResourcePreview extends IResourcePreview {
    readonly previewResult: IUserDataProfileManifestResourceMergeResult;
    readonly remoteProfiles: ISyncUserDataProfile[] | null;
}
export declare class UserDataProfilesManifestSynchroniser extends AbstractSynchroniser implements IUserDataSynchroniser {
    private readonly userDataProfilesService;
    protected readonly version: number;
    readonly previewResource: URI;
    readonly baseResource: URI;
    readonly localResource: URI;
    readonly remoteResource: URI;
    readonly acceptedResource: URI;
    constructor(profile: IUserDataProfile, collection: string | undefined, userDataProfilesService: IUserDataProfilesService, fileService: IFileService, environmentService: IEnvironmentService, storageService: IStorageService, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncBackupStoreService: IUserDataSyncBackupStoreService, logService: IUserDataSyncLogService, configurationService: IConfigurationService, userDataSyncEnablementService: IUserDataSyncEnablementService, telemetryService: ITelemetryService, uriIdentityService: IUriIdentityService);
    getLastSyncedProfiles(): Promise<ISyncUserDataProfile[] | null>;
    getRemoteSyncedProfiles(manifest: IUserDataResourceManifest | null): Promise<ISyncUserDataProfile[] | null>;
    protected generateSyncPreview(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, isRemoteDataFromCurrentMachine: boolean): Promise<IUserDataProfilesManifestResourcePreview[]>;
    protected hasRemoteChanged(lastSyncUserData: IRemoteUserData): Promise<boolean>;
    protected getMergeResult(resourcePreview: IUserDataProfilesManifestResourcePreview, token: CancellationToken): Promise<IMergeResult>;
    protected getAcceptResult(resourcePreview: IUserDataProfilesManifestResourcePreview, resource: URI, content: string | null | undefined, token: CancellationToken): Promise<IAcceptResult>;
    private acceptLocal;
    private acceptRemote;
    protected applyResult(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, resourcePreviews: [IUserDataProfilesManifestResourcePreview, IUserDataProfileManifestResourceMergeResult][], force: boolean): Promise<void>;
    hasLocalData(): Promise<boolean>;
    resolveContent(uri: URI): Promise<string | null>;
    private getLocalUserDataProfiles;
    private stringifyRemoteProfiles;
}
export declare function stringifyLocalProfiles(profiles: IUserDataProfile[], format: boolean): string;
export declare function parseUserDataProfilesManifest(syncData: ISyncData): ISyncUserDataProfile[];
