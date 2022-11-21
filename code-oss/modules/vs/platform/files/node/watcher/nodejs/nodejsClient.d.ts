import { IDiskFileChange, ILogMessage, AbstractNonRecursiveWatcherClient, INonRecursiveWatcher } from 'vs/platform/files/common/watcher';
export declare class NodeJSWatcherClient extends AbstractNonRecursiveWatcherClient {
    constructor(onFileChanges: (changes: IDiskFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean);
    protected createWatcher(): INonRecursiveWatcher;
}
