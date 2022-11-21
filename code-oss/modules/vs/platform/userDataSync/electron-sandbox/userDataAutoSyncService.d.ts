import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IProductService } from 'vs/platform/product/common/productService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { UserDataAutoSyncService as BaseUserDataAutoSyncService } from 'vs/platform/userDataSync/common/userDataAutoSyncService';
import { IUserDataSyncEnablementService, IUserDataSyncLogService, IUserDataSyncService, IUserDataSyncStoreManagementService, IUserDataSyncStoreService } from 'vs/platform/userDataSync/common/userDataSync';
import { IUserDataSyncAccountService } from 'vs/platform/userDataSync/common/userDataSyncAccount';
import { IUserDataSyncMachinesService } from 'vs/platform/userDataSync/common/userDataSyncMachines';
export declare class UserDataAutoSyncService extends BaseUserDataAutoSyncService {
    constructor(productService: IProductService, userDataSyncStoreManagementService: IUserDataSyncStoreManagementService, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncEnablementService: IUserDataSyncEnablementService, userDataSyncService: IUserDataSyncService, nativeHostService: INativeHostService, logService: IUserDataSyncLogService, authTokenService: IUserDataSyncAccountService, telemetryService: ITelemetryService, userDataSyncMachinesService: IUserDataSyncMachinesService, storageService: IStorageService);
}
