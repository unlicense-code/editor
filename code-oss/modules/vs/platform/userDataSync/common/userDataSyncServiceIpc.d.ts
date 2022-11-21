import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IChannel, IServerChannel } from 'vs/base/parts/ipc/common/ipc';
import { ILogService } from 'vs/platform/log/common/log';
import { IUserDataProfile, IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IUserDataManualSyncTask, IUserDataSyncResourceConflicts, IUserDataSyncResourceError, IUserDataSyncResource, ISyncResourceHandle, IUserDataSyncTask, IUserDataSyncService, SyncResource, SyncStatus, ISyncUserDataProfile } from 'vs/platform/userDataSync/common/userDataSync';
export declare class UserDataSyncChannel implements IServerChannel {
    private readonly service;
    private readonly userDataProfilesService;
    private readonly logService;
    private readonly manualSyncTasks;
    private readonly onManualSynchronizeResources;
    constructor(service: IUserDataSyncService, userDataProfilesService: IUserDataProfilesService, logService: ILogService);
    listen(_: unknown, event: string): Event<any>;
    call(context: any, command: string, args?: any): Promise<any>;
    private _call;
    private getManualSyncTask;
    private createManualSyncTask;
    private createKey;
}
export declare class UserDataSyncChannelClient extends Disposable implements IUserDataSyncService {
    private readonly userDataProfilesService;
    readonly _serviceBrand: undefined;
    private readonly channel;
    private _status;
    get status(): SyncStatus;
    private _onDidChangeStatus;
    readonly onDidChangeStatus: Event<SyncStatus>;
    get onDidChangeLocal(): Event<SyncResource>;
    private _conflicts;
    get conflicts(): IUserDataSyncResourceConflicts[];
    private _onDidChangeConflicts;
    readonly onDidChangeConflicts: Event<IUserDataSyncResourceConflicts[]>;
    private _lastSyncTime;
    get lastSyncTime(): number | undefined;
    private _onDidChangeLastSyncTime;
    readonly onDidChangeLastSyncTime: Event<number>;
    private _onSyncErrors;
    readonly onSyncErrors: Event<IUserDataSyncResourceError[]>;
    get onDidResetLocal(): Event<void>;
    get onDidResetRemote(): Event<void>;
    constructor(userDataSyncChannel: IChannel, userDataProfilesService: IUserDataProfilesService);
    createSyncTask(): Promise<IUserDataSyncTask>;
    createManualSyncTask(): Promise<IUserDataManualSyncTask>;
    reset(): Promise<void>;
    resetRemote(): Promise<void>;
    resetLocal(): Promise<void>;
    hasPreviouslySynced(): Promise<boolean>;
    hasLocalData(): Promise<boolean>;
    accept(syncResource: IUserDataSyncResource, resource: URI, content: string | null, apply: boolean | {
        force: boolean;
    }): Promise<void>;
    resolveContent(resource: URI): Promise<string | null>;
    getRemoteProfiles(): Promise<ISyncUserDataProfile[]>;
    getLocalSyncResourceHandles(syncResource: SyncResource, profile?: IUserDataProfile): Promise<ISyncResourceHandle[]>;
    getRemoteSyncResourceHandles(syncResource: SyncResource, profile?: ISyncUserDataProfile): Promise<ISyncResourceHandle[]>;
    getAssociatedResources(syncResourceHandle: ISyncResourceHandle): Promise<{
        resource: URI;
        comparableResource: URI;
    }[]>;
    getMachineId(syncResourceHandle: ISyncResourceHandle): Promise<string | undefined>;
    replace(syncResourceHandle: ISyncResourceHandle): Promise<void>;
    private updateStatus;
    private updateConflicts;
    private updateLastSyncTime;
}
