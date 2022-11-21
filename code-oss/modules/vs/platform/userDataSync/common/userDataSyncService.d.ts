import { CancellationToken } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IExtensionGalleryService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IProductService } from 'vs/platform/product/common/productService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUserDataProfile, IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IUserDataManualSyncTask, IUserDataSyncResourceConflicts, IUserDataSyncResourceError, IUserDataSyncResource, ISyncResourceHandle, IUserDataSyncTask, ISyncUserDataProfile, IUserDataManifest, IUserDataSyncEnablementService, IUserDataSynchroniser, IUserDataSyncLogService, IUserDataSyncService, IUserDataSyncStoreManagementService, IUserDataSyncStoreService, SyncResource, SyncStatus, UserDataSyncError, IUserDataSyncResourceProviderService } from 'vs/platform/userDataSync/common/userDataSync';
export declare class UserDataSyncService extends Disposable implements IUserDataSyncService {
    private readonly userDataSyncStoreService;
    private readonly userDataSyncStoreManagementService;
    private readonly instantiationService;
    private readonly logService;
    private readonly telemetryService;
    private readonly storageService;
    private readonly userDataSyncEnablementService;
    private readonly userDataProfilesService;
    private readonly productService;
    private readonly environmentService;
    private readonly userDataSyncResourceProviderService;
    _serviceBrand: any;
    private _status;
    get status(): SyncStatus;
    private _onDidChangeStatus;
    readonly onDidChangeStatus: Event<SyncStatus>;
    private _onDidChangeLocal;
    readonly onDidChangeLocal: Event<SyncResource>;
    private _conflicts;
    get conflicts(): IUserDataSyncResourceConflicts[];
    private _onDidChangeConflicts;
    readonly onDidChangeConflicts: Event<IUserDataSyncResourceConflicts[]>;
    private _syncErrors;
    private _onSyncErrors;
    readonly onSyncErrors: Event<IUserDataSyncResourceError[]>;
    private _lastSyncTime;
    get lastSyncTime(): number | undefined;
    private _onDidChangeLastSyncTime;
    readonly onDidChangeLastSyncTime: Event<number>;
    private _onDidResetLocal;
    readonly onDidResetLocal: Event<void>;
    private _onDidResetRemote;
    readonly onDidResetRemote: Event<void>;
    private activeProfileSynchronizers;
    constructor(userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncStoreManagementService: IUserDataSyncStoreManagementService, instantiationService: IInstantiationService, logService: IUserDataSyncLogService, telemetryService: ITelemetryService, storageService: IStorageService, userDataSyncEnablementService: IUserDataSyncEnablementService, userDataProfilesService: IUserDataProfilesService, productService: IProductService, environmentService: IEnvironmentService, userDataSyncResourceProviderService: IUserDataSyncResourceProviderService);
    createSyncTask(manifest: IUserDataManifest | null, disableCache?: boolean): Promise<IUserDataSyncTask>;
    createManualSyncTask(): Promise<IUserDataManualSyncTask>;
    private sync;
    private syncRemoteProfiles;
    private applyManualSync;
    private syncProfile;
    private stop;
    resolveContent(resource: URI): Promise<string | null>;
    replace(syncResourceHandle: ISyncResourceHandle): Promise<void>;
    accept(syncResource: IUserDataSyncResource, resource: URI, content: string | null | undefined, apply: boolean | {
        force: boolean;
    }): Promise<void>;
    getRemoteProfiles(): Promise<ISyncUserDataProfile[]>;
    getRemoteSyncResourceHandles(syncResource: SyncResource, profile?: ISyncUserDataProfile): Promise<ISyncResourceHandle[]>;
    getLocalSyncResourceHandles(syncResource: SyncResource, profile?: IUserDataProfile): Promise<ISyncResourceHandle[]>;
    getAssociatedResources(syncResourceHandle: ISyncResourceHandle): Promise<{
        resource: URI;
        comparableResource: URI;
    }[]>;
    getMachineId(syncResourceHandle: ISyncResourceHandle): Promise<string | undefined>;
    hasLocalData(): Promise<boolean>;
    hasPreviouslySynced(): Promise<boolean>;
    reset(): Promise<void>;
    resetRemote(): Promise<void>;
    resetLocal(): Promise<void>;
    private performAction;
    private performActionWithProfileSynchronizer;
    private setStatus;
    private updateConflicts;
    private updateLastSyncTime;
    getOrCreateActiveProfileSynchronizer(profile: IUserDataProfile, syncProfile: ISyncUserDataProfile | undefined): ProfileSynchronizer;
    private getActiveProfileSynchronizers;
    private clearActiveProfileSynchronizers;
    private checkEnablement;
}
declare class ProfileSynchronizer extends Disposable {
    readonly profile: IUserDataProfile;
    readonly collection: string | undefined;
    private readonly userDataSyncEnablementService;
    private readonly instantiationService;
    private readonly extensionGalleryService;
    private readonly userDataSyncStoreManagementService;
    private readonly telemetryService;
    private readonly logService;
    private readonly productService;
    private readonly userDataProfilesService;
    private readonly configurationService;
    private readonly environmentService;
    private _enabled;
    get enabled(): IUserDataSynchroniser[];
    get disabled(): SyncResource[];
    private _status;
    get status(): SyncStatus;
    private _onDidChangeStatus;
    readonly onDidChangeStatus: Event<SyncStatus>;
    private _onDidChangeLocal;
    readonly onDidChangeLocal: Event<SyncResource>;
    private _conflicts;
    get conflicts(): IUserDataSyncResourceConflicts[];
    private _onDidChangeConflicts;
    readonly onDidChangeConflicts: Event<IUserDataSyncResourceConflicts[]>;
    constructor(profile: IUserDataProfile, collection: string | undefined, userDataSyncEnablementService: IUserDataSyncEnablementService, instantiationService: IInstantiationService, extensionGalleryService: IExtensionGalleryService, userDataSyncStoreManagementService: IUserDataSyncStoreManagementService, telemetryService: ITelemetryService, logService: IUserDataSyncLogService, productService: IProductService, userDataProfilesService: IUserDataProfilesService, configurationService: IConfigurationService, environmentService: IEnvironmentService);
    private onDidChangeResourceEnablement;
    protected registerSynchronizer(syncResource: SyncResource): void;
    private deRegisterSynchronizer;
    createSynchronizer(syncResource: SyncResource): IUserDataSynchroniser & IDisposable;
    sync(manifest: IUserDataManifest | null, merge: boolean, executionId: string, token: CancellationToken): Promise<[SyncResource, UserDataSyncError][]>;
    apply(executionId: string, token: CancellationToken): Promise<void>;
    stop(): Promise<void>;
    resetLocal(): Promise<void>;
    private getUserDataSyncConfiguration;
    private setStatus;
    private updateStatus;
    private updateConflicts;
    private getOrder;
}
export {};
