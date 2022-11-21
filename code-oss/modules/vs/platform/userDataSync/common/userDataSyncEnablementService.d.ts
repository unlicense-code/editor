import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUserDataSyncEnablementService, IUserDataSyncStoreManagementService, SyncResource } from 'vs/platform/userDataSync/common/userDataSync';
export declare class UserDataSyncEnablementService extends Disposable implements IUserDataSyncEnablementService {
    private readonly storageService;
    private readonly telemetryService;
    protected readonly environmentService: IEnvironmentService;
    private readonly userDataSyncStoreManagementService;
    _serviceBrand: any;
    private _onDidChangeEnablement;
    readonly onDidChangeEnablement: Event<boolean>;
    private _onDidChangeResourceEnablement;
    readonly onDidChangeResourceEnablement: Event<[SyncResource, boolean]>;
    constructor(storageService: IStorageService, telemetryService: ITelemetryService, environmentService: IEnvironmentService, userDataSyncStoreManagementService: IUserDataSyncStoreManagementService);
    isEnabled(): boolean;
    canToggleEnablement(): boolean;
    setEnablement(enabled: boolean): void;
    isResourceEnabled(resource: SyncResource): boolean;
    setResourceEnablement(resource: SyncResource, enabled: boolean): void;
    getResourceSyncStateVersion(resource: SyncResource): string | undefined;
    private storeResourceEnablement;
    private onDidStorageChange;
}
