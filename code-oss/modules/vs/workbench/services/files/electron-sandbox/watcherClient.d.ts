import { DisposableStore } from 'vs/base/common/lifecycle';
import { AbstractUniversalWatcherClient, IDiskFileChange, ILogMessage, IRecursiveWatcher } from 'vs/platform/files/common/watcher';
import { ISharedProcessWorkerWorkbenchService } from 'vs/workbench/services/sharedProcess/electron-sandbox/sharedProcessWorkerWorkbenchService';
export declare class UniversalWatcherClient extends AbstractUniversalWatcherClient {
    private readonly sharedProcessWorkerWorkbenchService;
    constructor(onFileChanges: (changes: IDiskFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean, sharedProcessWorkerWorkbenchService: ISharedProcessWorkerWorkbenchService);
    protected createWatcher(disposables: DisposableStore): IRecursiveWatcher;
}
