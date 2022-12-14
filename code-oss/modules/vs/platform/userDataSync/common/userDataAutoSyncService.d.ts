import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IProductService } from 'vs/platform/product/common/productService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUserDataAutoSyncService, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncService, IUserDataSyncStoreManagementService, IUserDataSyncStoreService, UserDataSyncError } from 'vs/platform/userDataSync/common/userDataSync';
import { IUserDataSyncAccountService } from 'vs/platform/userDataSync/common/userDataSyncAccount';
import { IUserDataSyncMachinesService } from 'vs/platform/userDataSync/common/userDataSyncMachines';
export declare class UserDataAutoSyncService extends Disposable implements IUserDataAutoSyncService {
    private readonly userDataSyncStoreManagementService;
    private readonly userDataSyncStoreService;
    private readonly userDataSyncEnablementService;
    private readonly userDataSyncService;
    private readonly logService;
    private readonly userDataSyncAccountService;
    private readonly telemetryService;
    private readonly userDataSyncMachinesService;
    private readonly storageService;
    _serviceBrand: any;
    private readonly autoSync;
    private successiveFailures;
    private lastSyncTriggerTime;
    private readonly syncTriggerDelayer;
    private suspendUntilRestart;
    private readonly _onError;
    readonly onError: Event<UserDataSyncError>;
    private lastSyncUrl;
    private get syncUrl();
    private set syncUrl(value);
    private previousProductQuality;
    private get productQuality();
    private set productQuality(value);
    constructor(productService: IProductService, userDataSyncStoreManagementService: IUserDataSyncStoreManagementService, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncEnablementService: IUserDataSyncEnablementService, userDataSyncService: IUserDataSyncService, logService: IUserDataSyncLogService, userDataSyncAccountService: IUserDataSyncAccountService, telemetryService: ITelemetryService, userDataSyncMachinesService: IUserDataSyncMachinesService, storageService: IStorageService);
    private updateAutoSync;
    protected startAutoSync(): boolean;
    private isAutoSyncEnabled;
    turnOn(): Promise<void>;
    turnOff(everywhere: boolean, softTurnOffOnError?: boolean, donotRemoveMachine?: boolean): Promise<void>;
    private updateEnablement;
    private hasProductQualityChanged;
    private onDidFinishSync;
    private disableMachineEventually;
    private hasToDisableMachineEventually;
    private stopDisableMachineEventually;
    private sources;
    triggerSync(sources: string[], skipIfSyncedRecently: boolean, disableCache: boolean): Promise<void>;
    protected getSyncTriggerDelayTime(): number;
}
