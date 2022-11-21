import { CancellationToken } from 'vs/base/common/cancellation';
import { Disposable } from 'vs/base/common/lifecycle';
import { IDiskFileChange, ILogMessage, IRecursiveWatchRequest, IRecursiveWatcher } from 'vs/platform/files/common/watcher';
export interface IParcelWatcherInstance {
    /**
     * Signals when the watcher is ready to watch.
     */
    readonly ready: Promise<unknown>;
    /**
     * The watch request associated to the watcher.
     */
    readonly request: IRecursiveWatchRequest;
    /**
     * How often this watcher has been restarted in case of an unexpected
     * shutdown.
     */
    readonly restarts: number;
    /**
     * The cancellation token associated with the lifecycle of the watcher.
     */
    readonly token: CancellationToken;
    /**
     * Stops and disposes the watcher. This operation is async to await
     * unsubscribe call in Parcel.
     */
    stop(): Promise<void>;
}
export declare class ParcelWatcher extends Disposable implements IRecursiveWatcher {
    private static readonly MAP_PARCEL_WATCHER_ACTION_TO_FILE_CHANGE;
    private static readonly GLOB_MARKERS;
    private static readonly PARCEL_WATCHER_BACKEND;
    private readonly _onDidChangeFile;
    readonly onDidChangeFile: import("vs/base/common/event").Event<IDiskFileChange[]>;
    private readonly _onDidLogMessage;
    readonly onDidLogMessage: import("vs/base/common/event").Event<ILogMessage>;
    private readonly _onDidError;
    readonly onDidError: import("vs/base/common/event").Event<string>;
    protected readonly watchers: Map<string, IParcelWatcherInstance>;
    private readonly throttledFileChangesWorker;
    private verboseLogging;
    private enospcErrorLogged;
    constructor();
    private registerListeners;
    watch(requests: IRecursiveWatchRequest[]): Promise<void>;
    protected toExcludePaths(path: string, excludes: string[] | undefined): string[] | undefined;
    private startPolling;
    private startWatching;
    private onParcelEvents;
    private handleExcludeIncludes;
    private emitEvents;
    private normalizePath;
    private normalizeEvents;
    private filterEvents;
    private onWatchedPathDeleted;
    private onUnexpectedError;
    stop(): Promise<void>;
    protected restartWatching(watcher: IParcelWatcherInstance, delay?: number): void;
    private stopWatching;
    protected normalizeRequests(requests: IRecursiveWatchRequest[], validatePaths?: boolean): IRecursiveWatchRequest[];
    setVerboseLogging(enabled: boolean): Promise<void>;
    private trace;
    private warn;
    private error;
    private toMessage;
}
