import { CancellationToken } from 'vs/base/common/cancellation';
import { URI } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IUserDataProfile, IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { AbstractInitializer, AbstractJsonFileSynchroniser, IAcceptResult, IFileResourcePreview, IMergeResult } from 'vs/platform/userDataSync/common/abstractSynchronizer';
import { IRemoteUserData, IUserDataSyncBackupStoreService, IUserDataSyncConfiguration, IUserDataSynchroniser, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService, IUserDataSyncUtilService } from 'vs/platform/userDataSync/common/userDataSync';
interface IKeybindingsResourcePreview extends IFileResourcePreview {
    previewResult: IMergeResult;
}
interface ILastSyncUserData extends IRemoteUserData {
    platformSpecific?: boolean;
}
export declare function getKeybindingsContentFromSyncContent(syncContent: string, platformSpecific: boolean, logService: ILogService): string | null;
export declare class KeybindingsSynchroniser extends AbstractJsonFileSynchroniser implements IUserDataSynchroniser {
    protected readonly version: number;
    private readonly previewResource;
    private readonly baseResource;
    private readonly localResource;
    private readonly remoteResource;
    private readonly acceptedResource;
    constructor(profile: IUserDataProfile, collection: string | undefined, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncBackupStoreService: IUserDataSyncBackupStoreService, logService: IUserDataSyncLogService, configurationService: IConfigurationService, userDataSyncEnablementService: IUserDataSyncEnablementService, fileService: IFileService, environmentService: IEnvironmentService, storageService: IStorageService, userDataSyncUtilService: IUserDataSyncUtilService, telemetryService: ITelemetryService, uriIdentityService: IUriIdentityService);
    protected generateSyncPreview(remoteUserData: IRemoteUserData, lastSyncUserData: ILastSyncUserData | null, isRemoteDataFromCurrentMachine: boolean, userDataSyncConfiguration: IUserDataSyncConfiguration): Promise<IKeybindingsResourcePreview[]>;
    protected hasRemoteChanged(lastSyncUserData: IRemoteUserData): Promise<boolean>;
    protected getMergeResult(resourcePreview: IKeybindingsResourcePreview, token: CancellationToken): Promise<IMergeResult>;
    protected getAcceptResult(resourcePreview: IKeybindingsResourcePreview, resource: URI, content: string | null | undefined, token: CancellationToken): Promise<IAcceptResult>;
    protected applyResult(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, resourcePreviews: [IKeybindingsResourcePreview, IAcceptResult][], force: boolean): Promise<void>;
    hasLocalData(): Promise<boolean>;
    resolveContent(uri: URI): Promise<string | null>;
    private getKeybindingsContentFromLastSyncUserData;
    private toSyncContent;
    private syncKeybindingsPerPlatform;
}
export declare class KeybindingsInitializer extends AbstractInitializer {
    constructor(fileService: IFileService, userDataProfilesService: IUserDataProfilesService, environmentService: IEnvironmentService, logService: IUserDataSyncLogService, storageService: IStorageService, uriIdentityService: IUriIdentityService);
    doInitialize(remoteUserData: IRemoteUserData): Promise<void>;
    private isEmpty;
    private getKeybindingsContentFromSyncContent;
}
export {};
