import { ILogService } from 'vs/platform/log/common/log';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { ISharedProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { IOnDidTerminateSharedProcessWorkerProcess, ISharedProcessWorkerProcess } from 'vs/platform/sharedProcess/common/sharedProcessWorkerService';
import { IPCClient } from 'vs/base/parts/ipc/common/ipc';
export declare const ISharedProcessWorkerWorkbenchService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ISharedProcessWorkerWorkbenchService>;
export interface ISharedProcessWorker extends IDisposable {
    /**
     * A IPC client to communicate to the worker process.
     */
    client: IPCClient<string>;
    /**
     * A promise that resolves to an object once the
     * worker process terminates, giving information
     * how the process terminated.
     *
     * This can be used to figure out whether the worker
     * should be restarted in case of an unexpected
     * termination.
     */
    onDidTerminate: Promise<IOnDidTerminateSharedProcessWorkerProcess>;
}
export interface ISharedProcessWorkerWorkbenchService {
    readonly _serviceBrand: undefined;
    /**
     * Will fork a new process with the provided module identifier off the shared
     * process and establishes a message port connection to that process.
     *
     * Requires the forked process to be AMD module that uses our IPC channel framework
     * to respond to the provided `channelName` as a server.
     *
     * The process will be automatically terminated when the workbench window closes,
     * crashes or loads/reloads.
     *
     * Note on affinity: repeated calls to `createWorkerChannel` with the same `moduleId`
     * from the same window will result in any previous forked process to get terminated.
     * In other words, it is not possible, nor intended to create multiple workers of
     * the same process from one window. The intent of these workers is to be reused per
     * window and the communication channel allows to dynamically update the processes
     * after the fact.
     *
     * @param process information around the process to fork as worker
     *
     * @returns the worker IPC client to communicate with. Provides a `dispose` method that
     * allows to terminate the worker if needed.
     */
    createWorker(process: ISharedProcessWorkerProcess): Promise<ISharedProcessWorker>;
}
export declare class SharedProcessWorkerWorkbenchService extends Disposable implements ISharedProcessWorkerWorkbenchService {
    readonly windowId: number;
    private readonly logService;
    private readonly sharedProcessService;
    readonly _serviceBrand: undefined;
    private _sharedProcessWorkerService;
    private get sharedProcessWorkerService();
    constructor(windowId: number, logService: ILogService, sharedProcessService: ISharedProcessService);
    createWorker(process: ISharedProcessWorkerProcess): Promise<ISharedProcessWorker>;
}
