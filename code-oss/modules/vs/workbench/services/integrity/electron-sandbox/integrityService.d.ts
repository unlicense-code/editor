import { IIntegrityService, IntegrityTestResult } from 'vs/workbench/services/integrity/common/integrity';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IProductService } from 'vs/platform/product/common/productService';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IChecksumService } from 'vs/platform/checksum/common/checksumService';
export declare class IntegrityService implements IIntegrityService {
    private readonly notificationService;
    private readonly lifecycleService;
    private readonly openerService;
    private readonly productService;
    private readonly checksumService;
    readonly _serviceBrand: undefined;
    private _storage;
    private _isPurePromise;
    constructor(notificationService: INotificationService, storageService: IStorageService, lifecycleService: ILifecycleService, openerService: IOpenerService, productService: IProductService, checksumService: IChecksumService);
    private _prompt;
    isPure(): Promise<IntegrityTestResult>;
    private _isPure;
    private _resolve;
    private static _createChecksumPair;
}
