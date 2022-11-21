import { ShutdownReason } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
import { AbstractLifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycleService';
import { IStorageService } from 'vs/platform/storage/common/storage';
export declare class BrowserLifecycleService extends AbstractLifecycleService {
    private beforeUnloadListener;
    private unloadListener;
    private ignoreBeforeUnload;
    private didUnload;
    constructor(logService: ILogService, storageService: IStorageService);
    private registerListeners;
    private onBeforeUnload;
    private vetoBeforeUnload;
    withExpectedShutdown(reason: ShutdownReason): Promise<void>;
    withExpectedShutdown(reason: {
        disableShutdownHandling: true;
    }, callback: Function): void;
    shutdown(): Promise<void>;
    private doShutdown;
    private onUnload;
    private onLoadAfterUnload;
}
