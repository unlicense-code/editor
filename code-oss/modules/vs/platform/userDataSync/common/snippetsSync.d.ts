import { CancellationToken } from 'vs/base/common/cancellation';
import { IStringDictionary } from 'vs/base/common/collections';
import { URI } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IUserDataProfile, IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { AbstractInitializer, AbstractSynchroniser, IAcceptResult, IFileResourcePreview, IMergeResult } from 'vs/platform/userDataSync/common/abstractSynchronizer';
import { IRemoteUserData, ISyncData, IUserDataSyncBackupStoreService, IUserDataSynchroniser, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService } from 'vs/platform/userDataSync/common/userDataSync';
interface ISnippetsResourcePreview extends IFileResourcePreview {
    previewResult: IMergeResult;
}
export declare function parseSnippets(syncData: ISyncData): IStringDictionary<string>;
export declare class SnippetsSynchroniser extends AbstractSynchroniser implements IUserDataSynchroniser {
    protected readonly version: number;
    private readonly snippetsFolder;
    constructor(profile: IUserDataProfile, collection: string | undefined, environmentService: IEnvironmentService, fileService: IFileService, storageService: IStorageService, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncBackupStoreService: IUserDataSyncBackupStoreService, logService: IUserDataSyncLogService, configurationService: IConfigurationService, userDataSyncEnablementService: IUserDataSyncEnablementService, telemetryService: ITelemetryService, uriIdentityService: IUriIdentityService);
    protected generateSyncPreview(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, isRemoteDataFromCurrentMachine: boolean): Promise<ISnippetsResourcePreview[]>;
    protected hasRemoteChanged(lastSyncUserData: IRemoteUserData): Promise<boolean>;
    protected getMergeResult(resourcePreview: ISnippetsResourcePreview, token: CancellationToken): Promise<IMergeResult>;
    protected getAcceptResult(resourcePreview: ISnippetsResourcePreview, resource: URI, content: string | null | undefined, token: CancellationToken): Promise<IAcceptResult>;
    protected applyResult(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, resourcePreviews: [ISnippetsResourcePreview, IAcceptResult][], force: boolean): Promise<void>;
    private getResourcePreviews;
    resolveContent(uri: URI): Promise<string | null>;
    hasLocalData(): Promise<boolean>;
    private updateLocalBackup;
    private updateLocalSnippets;
    private updateRemoteSnippets;
    private parseSnippets;
    private toSnippetsContents;
    private getSnippetsFileContents;
}
export declare class SnippetsInitializer extends AbstractInitializer {
    constructor(fileService: IFileService, userDataProfilesService: IUserDataProfilesService, environmentService: IEnvironmentService, logService: IUserDataSyncLogService, storageService: IStorageService, uriIdentityService: IUriIdentityService);
    doInitialize(remoteUserData: IRemoteUserData): Promise<void>;
    private isEmpty;
}
export {};
