import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IDiskFileChange, ILogMessage, INonRecursiveWatchRequest, INonRecursiveWatcher } from 'vs/platform/files/common/watcher';
import { NodeJSFileWatcherLibrary } from 'vs/platform/files/node/watcher/nodejs/nodejsWatcherLib';
export interface INodeJSWatcherInstance {
    /**
     * The watcher instance.
     */
    readonly instance: NodeJSFileWatcherLibrary;
    /**
     * The watch request associated to the watcher.
     */
    readonly request: INonRecursiveWatchRequest;
}
export declare class NodeJSWatcher extends Disposable implements INonRecursiveWatcher {
    private readonly _onDidChangeFile;
    readonly onDidChangeFile: Event<IDiskFileChange[]>;
    private readonly _onDidLogMessage;
    readonly onDidLogMessage: Event<ILogMessage>;
    readonly onDidError: Event<any>;
    protected readonly watchers: Map<string, INodeJSWatcherInstance>;
    private verboseLogging;
    watch(requests: INonRecursiveWatchRequest[]): Promise<void>;
    private startWatching;
    stop(): Promise<void>;
    private stopWatching;
    private normalizeRequests;
    setVerboseLogging(enabled: boolean): Promise<void>;
    private trace;
    private toMessage;
}
