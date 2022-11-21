import { ShutdownReason } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ILogService } from 'vs/platform/log/common/log';
import { AbstractLifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycleService';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
export declare class NativeLifecycleService extends AbstractLifecycleService {
    private readonly nativeHostService;
    private static readonly BEFORE_SHUTDOWN_WARNING_DELAY;
    private static readonly WILL_SHUTDOWN_WARNING_DELAY;
    constructor(nativeHostService: INativeHostService, storageService: IStorageService, logService: ILogService);
    private registerListeners;
    protected handleBeforeShutdown(reason: ShutdownReason): Promise<boolean>;
    private handleBeforeShutdownError;
    protected handleWillShutdown(reason: ShutdownReason): Promise<void>;
    shutdown(): Promise<void>;
}
