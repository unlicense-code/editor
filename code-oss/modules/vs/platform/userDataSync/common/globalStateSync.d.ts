import { CancellationToken } from 'vs/base/common/cancellation';
import { IStringDictionary } from 'vs/base/common/collections';
import { URI } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { AbstractInitializer, AbstractSynchroniser, IAcceptResult, IMergeResult, IResourcePreview } from 'vs/platform/userDataSync/common/abstractSynchronizer';
import { IGlobalState, IRemoteUserData, IStorageValue, IUserData, IUserDataSyncBackupStoreService, IUserDataSynchroniser, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService, UserDataSyncStoreType } from 'vs/platform/userDataSync/common/userDataSync';
import { UserDataSyncStoreClient } from 'vs/platform/userDataSync/common/userDataSyncStoreService';
import { IUserDataProfile, IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IUserDataProfileStorageService } from 'vs/platform/userDataProfile/common/userDataProfileStorageService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
declare type StorageKeys = {
    machine: string[];
    user: string[];
    unregistered: string[];
};
interface IGlobalStateResourceMergeResult extends IAcceptResult {
    readonly local: {
        added: IStringDictionary<IStorageValue>;
        removed: string[];
        updated: IStringDictionary<IStorageValue>;
    };
    readonly remote: {
        added: string[];
        removed: string[];
        updated: string[];
        all: IStringDictionary<IStorageValue> | null;
    };
}
export interface IGlobalStateResourcePreview extends IResourcePreview {
    readonly localUserData: IGlobalState;
    readonly previewResult: IGlobalStateResourceMergeResult;
    readonly storageKeys: StorageKeys;
}
export declare function stringify(globalState: IGlobalState, format: boolean): string;
/**
 * Synchronises global state that includes
 * 	- Global storage with user scope
 * 	- Locale from argv properties
 *
 * Global storage is synced without checking version just like other resources (settings, keybindings).
 * If there is a change in format of the value of a storage key which requires migration then
 * 		Owner of that key should remove that key from user scope and replace that with new user scoped key.
 */
export declare class GlobalStateSynchroniser extends AbstractSynchroniser implements IUserDataSynchroniser {
    private readonly userDataProfileStorageService;
    protected readonly version: number;
    private readonly previewResource;
    private readonly baseResource;
    private readonly localResource;
    private readonly remoteResource;
    private readonly acceptedResource;
    private readonly localGlobalStateProvider;
    constructor(profile: IUserDataProfile, collection: string | undefined, userDataProfileStorageService: IUserDataProfileStorageService, fileService: IFileService, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncBackupStoreService: IUserDataSyncBackupStoreService, logService: IUserDataSyncLogService, environmentService: IEnvironmentService, userDataSyncEnablementService: IUserDataSyncEnablementService, telemetryService: ITelemetryService, configurationService: IConfigurationService, storageService: IStorageService, uriIdentityService: IUriIdentityService, instantiationService: IInstantiationService);
    protected generateSyncPreview(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, isRemoteDataFromCurrentMachine: boolean): Promise<IGlobalStateResourcePreview[]>;
    protected hasRemoteChanged(lastSyncUserData: IRemoteUserData): Promise<boolean>;
    protected getMergeResult(resourcePreview: IGlobalStateResourcePreview, token: CancellationToken): Promise<IMergeResult>;
    protected getAcceptResult(resourcePreview: IGlobalStateResourcePreview, resource: URI, content: string | null | undefined, token: CancellationToken): Promise<IGlobalStateResourceMergeResult>;
    private acceptLocal;
    private acceptRemote;
    protected applyResult(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, resourcePreviews: [IGlobalStateResourcePreview, IGlobalStateResourceMergeResult][], force: boolean): Promise<void>;
    resolveContent(uri: URI): Promise<string | null>;
    hasLocalData(): Promise<boolean>;
    private getStorageKeys;
}
export declare class LocalGlobalStateProvider {
    private readonly fileService;
    private readonly environmentService;
    private readonly userDataProfileStorageService;
    private readonly logService;
    constructor(fileService: IFileService, environmentService: IEnvironmentService, userDataProfileStorageService: IUserDataProfileStorageService, logService: IUserDataSyncLogService);
    getLocalGlobalState(profile: IUserDataProfile): Promise<IGlobalState>;
    private getLocalArgvContent;
    writeLocalGlobalState({ added, removed, updated }: {
        added: IStringDictionary<IStorageValue>;
        updated: IStringDictionary<IStorageValue>;
        removed: string[];
    }, profile: IUserDataProfile): Promise<void>;
}
export declare class GlobalStateInitializer extends AbstractInitializer {
    constructor(storageService: IStorageService, fileService: IFileService, userDataProfilesService: IUserDataProfilesService, environmentService: IEnvironmentService, logService: IUserDataSyncLogService, uriIdentityService: IUriIdentityService);
    protected doInitialize(remoteUserData: IRemoteUserData): Promise<void>;
}
export declare class UserDataSyncStoreTypeSynchronizer {
    private readonly userDataSyncStoreClient;
    private readonly storageService;
    private readonly environmentService;
    private readonly fileService;
    private readonly logService;
    constructor(userDataSyncStoreClient: UserDataSyncStoreClient, storageService: IStorageService, environmentService: IEnvironmentService, fileService: IFileService, logService: ILogService);
    getSyncStoreType(userData: IUserData): UserDataSyncStoreType | undefined;
    sync(userDataSyncStoreType: UserDataSyncStoreType): Promise<void>;
    private doSync;
    private parseGlobalState;
}
export {};
