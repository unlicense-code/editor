import { DisposableStore } from 'vs/base/common/lifecycle';
import { AbstractUniversalWatcherClient, IDiskFileChange, ILogMessage, IUniversalWatcher } from 'vs/platform/files/common/watcher';
export declare class UniversalWatcherClient extends AbstractUniversalWatcherClient {
    constructor(onFileChanges: (changes: IDiskFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean);
    protected createWatcher(disposables: DisposableStore): IUniversalWatcher;
}
