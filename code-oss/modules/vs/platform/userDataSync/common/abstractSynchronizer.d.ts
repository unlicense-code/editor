import { CancellationToken } from 'vs/base/common/cancellation';
import { IStringDictionary } from 'vs/base/common/collections';
import { Event } from 'vs/base/common/event';
import { FormattingOptions } from 'vs/base/common/jsonFormatter';
import { Disposable } from 'vs/base/common/lifecycle';
import { IExtUri } from 'vs/base/common/resources';
import { URI } from 'vs/base/common/uri';
import { IHeaders } from 'vs/base/parts/request/common/request';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileContent, IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { Change, IRemoteUserData, IResourcePreview as IBaseResourcePreview, ISyncData, IUserDataSyncResourcePreview as IBaseSyncResourcePreview, IUserData, IUserDataInitializer, IUserDataSyncBackupStoreService, IUserDataSyncConfiguration, IUserDataSynchroniser, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService, IUserDataSyncUtilService, MergeState, SyncResource, SyncStatus, IUserDataResourceManifest, IUserDataSyncResourceConflicts, IUserDataSyncResource } from 'vs/platform/userDataSync/common/userDataSync';
import { IUserDataProfile, IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
export declare function isRemoteUserData(thing: any): thing is IRemoteUserData;
export declare function isSyncData(thing: any): thing is ISyncData;
export declare function getSyncResourceLogLabel(syncResource: SyncResource, profile: IUserDataProfile): string;
export interface IResourcePreview {
    readonly baseResource: URI;
    readonly baseContent: string | null;
    readonly remoteResource: URI;
    readonly remoteContent: string | null;
    readonly remoteChange: Change;
    readonly localResource: URI;
    readonly localContent: string | null;
    readonly localChange: Change;
    readonly previewResource: URI;
    readonly acceptedResource: URI;
}
export interface IAcceptResult {
    readonly content: string | null;
    readonly localChange: Change;
    readonly remoteChange: Change;
}
export interface IMergeResult extends IAcceptResult {
    readonly hasConflicts: boolean;
}
interface IEditableResourcePreview extends IBaseResourcePreview, IResourcePreview {
    localChange: Change;
    remoteChange: Change;
    mergeState: MergeState;
    acceptResult?: IAcceptResult;
}
interface ISyncResourcePreview extends IBaseSyncResourcePreview {
    readonly remoteUserData: IRemoteUserData;
    readonly lastSyncUserData: IRemoteUserData | null;
    readonly resourcePreviews: IEditableResourcePreview[];
}
export declare abstract class AbstractSynchroniser extends Disposable implements IUserDataSynchroniser {
    readonly syncResource: IUserDataSyncResource;
    readonly collection: string | undefined;
    protected readonly fileService: IFileService;
    protected readonly environmentService: IEnvironmentService;
    protected readonly storageService: IStorageService;
    protected readonly userDataSyncStoreService: IUserDataSyncStoreService;
    protected readonly userDataSyncBackupStoreService: IUserDataSyncBackupStoreService;
    protected readonly userDataSyncEnablementService: IUserDataSyncEnablementService;
    protected readonly telemetryService: ITelemetryService;
    protected readonly logService: IUserDataSyncLogService;
    protected readonly configurationService: IConfigurationService;
    private syncPreviewPromise;
    protected readonly syncFolder: URI;
    protected readonly syncPreviewFolder: URI;
    protected readonly extUri: IExtUri;
    protected readonly currentMachineIdPromise: Promise<string>;
    private _status;
    get status(): SyncStatus;
    private _onDidChangStatus;
    readonly onDidChangeStatus: Event<SyncStatus>;
    private _conflicts;
    get conflicts(): IUserDataSyncResourceConflicts;
    private _onDidChangeConflicts;
    readonly onDidChangeConflicts: Event<IUserDataSyncResourceConflicts>;
    private readonly localChangeTriggerThrottler;
    private readonly _onDidChangeLocal;
    readonly onDidChangeLocal: Event<void>;
    protected readonly lastSyncResource: URI;
    private readonly lastSyncUserDataStateKey;
    private hasSyncResourceStateVersionChanged;
    protected readonly syncResourceLogLabel: string;
    protected syncHeaders: IHeaders;
    readonly resource: SyncResource;
    constructor(syncResource: IUserDataSyncResource, collection: string | undefined, fileService: IFileService, environmentService: IEnvironmentService, storageService: IStorageService, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncBackupStoreService: IUserDataSyncBackupStoreService, userDataSyncEnablementService: IUserDataSyncEnablementService, telemetryService: ITelemetryService, logService: IUserDataSyncLogService, configurationService: IConfigurationService, uriIdentityService: IUriIdentityService);
    protected triggerLocalChange(): void;
    protected doTriggerLocalChange(): Promise<void>;
    protected setStatus(status: SyncStatus): void;
    sync(manifest: IUserDataResourceManifest | null, headers?: IHeaders): Promise<void>;
    preview(manifest: IUserDataResourceManifest | null, userDataSyncConfiguration: IUserDataSyncConfiguration, headers?: IHeaders): Promise<ISyncResourcePreview | null>;
    apply(force: boolean, headers?: IHeaders): Promise<ISyncResourcePreview | null>;
    private _sync;
    replace(content: string): Promise<boolean>;
    private isRemoteDataFromCurrentMachine;
    protected getLatestRemoteUserData(manifest: IUserDataResourceManifest | null, lastSyncUserData: IRemoteUserData | null): Promise<IRemoteUserData>;
    private performSync;
    protected doSync(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, apply: boolean, userDataSyncConfiguration: IUserDataSyncConfiguration): Promise<SyncStatus>;
    merge(resource: URI): Promise<ISyncResourcePreview | null>;
    accept(resource: URI, content?: string | null): Promise<ISyncResourcePreview | null>;
    discard(resource: URI): Promise<ISyncResourcePreview | null>;
    private updateSyncResourcePreview;
    private doApply;
    private clearPreviewFolder;
    private updateConflicts;
    hasPreviouslySynced(): Promise<boolean>;
    protected resolvePreviewContent(uri: URI): Promise<string | null>;
    resetLocal(): Promise<void>;
    private doGenerateSyncResourcePreview;
    getLastSyncUserData<T = IRemoteUserData & {
        [key: string]: any;
    }>(): Promise<T | null>;
    protected updateLastSyncUserData(lastSyncRemoteUserData: IRemoteUserData, additionalProps?: IStringDictionary<any>): Promise<void>;
    private readLastSyncStoredRemoteUserData;
    private writeLastSyncStoredRemoteUserData;
    private migrateLastSyncUserData;
    getRemoteUserData(lastSyncData: IRemoteUserData | null): Promise<IRemoteUserData>;
    protected parseSyncData(content: string): ISyncData;
    private getUserData;
    protected updateRemoteUserData(content: string, ref: string | null): Promise<IRemoteUserData>;
    protected backupLocal(content: string): Promise<void>;
    stop(): Promise<void>;
    private getUserDataSyncConfiguration;
    protected abstract readonly version: number;
    protected abstract generateSyncPreview(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, isRemoteDataFromCurrentMachine: boolean, userDataSyncConfiguration: IUserDataSyncConfiguration, token: CancellationToken): Promise<IResourcePreview[]>;
    protected abstract getMergeResult(resourcePreview: IResourcePreview, token: CancellationToken): Promise<IMergeResult>;
    protected abstract getAcceptResult(resourcePreview: IResourcePreview, resource: URI, content: string | null | undefined, token: CancellationToken): Promise<IAcceptResult>;
    protected abstract applyResult(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, result: [IResourcePreview, IAcceptResult][], force: boolean): Promise<void>;
    protected abstract hasRemoteChanged(lastSyncUserData: IRemoteUserData): Promise<boolean>;
    abstract hasLocalData(): Promise<boolean>;
    abstract resolveContent(uri: URI): Promise<string | null>;
}
export interface IFileResourcePreview extends IResourcePreview {
    readonly fileContent: IFileContent | null;
}
export declare abstract class AbstractFileSynchroniser extends AbstractSynchroniser {
    protected readonly file: URI;
    constructor(file: URI, syncResource: IUserDataSyncResource, collection: string | undefined, fileService: IFileService, environmentService: IEnvironmentService, storageService: IStorageService, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncBackupStoreService: IUserDataSyncBackupStoreService, userDataSyncEnablementService: IUserDataSyncEnablementService, telemetryService: ITelemetryService, logService: IUserDataSyncLogService, configurationService: IConfigurationService, uriIdentityService: IUriIdentityService);
    protected getLocalFileContent(): Promise<IFileContent | null>;
    protected updateLocalFileContent(newContent: string, oldContent: IFileContent | null, force: boolean): Promise<void>;
    protected deleteLocalFile(): Promise<void>;
    private onFileChanges;
}
export declare abstract class AbstractJsonFileSynchroniser extends AbstractFileSynchroniser {
    protected readonly userDataSyncUtilService: IUserDataSyncUtilService;
    constructor(file: URI, syncResource: IUserDataSyncResource, collection: string | undefined, fileService: IFileService, environmentService: IEnvironmentService, storageService: IStorageService, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncBackupStoreService: IUserDataSyncBackupStoreService, userDataSyncEnablementService: IUserDataSyncEnablementService, telemetryService: ITelemetryService, logService: IUserDataSyncLogService, userDataSyncUtilService: IUserDataSyncUtilService, configurationService: IConfigurationService, uriIdentityService: IUriIdentityService);
    protected hasErrors(content: string, isArray: boolean): boolean;
    private _formattingOptions;
    protected getFormattingOptions(): Promise<FormattingOptions>;
}
export declare abstract class AbstractInitializer implements IUserDataInitializer {
    readonly resource: SyncResource;
    protected readonly userDataProfilesService: IUserDataProfilesService;
    protected readonly environmentService: IEnvironmentService;
    protected readonly logService: ILogService;
    protected readonly fileService: IFileService;
    protected readonly storageService: IStorageService;
    protected readonly extUri: IExtUri;
    private readonly lastSyncResource;
    constructor(resource: SyncResource, userDataProfilesService: IUserDataProfilesService, environmentService: IEnvironmentService, logService: ILogService, fileService: IFileService, storageService: IStorageService, uriIdentityService: IUriIdentityService);
    initialize({ ref, content }: IUserData): Promise<void>;
    private parseSyncData;
    protected updateLastSyncUserData(lastSyncRemoteUserData: IRemoteUserData, additionalProps?: IStringDictionary<any>): Promise<void>;
    protected abstract doInitialize(remoteUserData: IRemoteUserData): Promise<void>;
}
export {};
