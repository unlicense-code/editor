import { Event } from 'vs/base/common/event';
import { IRelativePattern, ParsedPattern } from 'vs/base/common/glob';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { FileChangeType, IFileChange } from 'vs/platform/files/common/files';
interface IWatchRequest {
    /**
     * The path to watch.
     */
    path: string;
    /**
     * Whether to watch recursively or not.
     */
    recursive: boolean;
    /**
     * A set of glob patterns or paths to exclude from watching.
     *
     * Paths or basic glob patterns that are relative will be
     * resolved to an absolute path using the currently opened
     * workspace. Complex glob patterns must match on absolute
     * paths via leading or trailing `**`.
     */
    excludes: string[];
    /**
     * An optional set of glob patterns or paths to include for
     * watching. If not provided, all paths are considered for
     * events.
     *
     * Paths or basic glob patterns that are relative will be
     * resolved to an absolute path using the currently opened
     * workspace. Complex glob patterns must match on absolute
     * paths via leading or trailing `**`.
     */
    includes?: Array<string | IRelativePattern>;
}
export interface INonRecursiveWatchRequest extends IWatchRequest {
    /**
     * The watcher will be non-recursive.
     */
    recursive: false;
}
export interface IRecursiveWatchRequest extends IWatchRequest {
    /**
     * The watcher will be recursive.
     */
    recursive: true;
    /**
     * @deprecated this only exists for WSL1 support and should never
     * be used in any other case.
     */
    pollingInterval?: number;
}
export declare function isRecursiveWatchRequest(request: IWatchRequest): request is IRecursiveWatchRequest;
export declare type IUniversalWatchRequest = IRecursiveWatchRequest | INonRecursiveWatchRequest;
interface IWatcher {
    /**
     * A normalized file change event from the raw events
     * the watcher emits.
     */
    readonly onDidChangeFile: Event<IDiskFileChange[]>;
    /**
     * An event to indicate a message that should get logged.
     */
    readonly onDidLogMessage: Event<ILogMessage>;
    /**
     * An event to indicate an error occurred from the watcher
     * that is unrecoverable. Listeners should restart the
     * watcher if possible.
     */
    readonly onDidError: Event<string>;
    /**
     * Configures the watcher to watch according to the
     * requests. Any existing watched path that is not
     * in the array, will be removed from watching and
     * any new path will be added to watching.
     */
    watch(requests: IWatchRequest[]): Promise<void>;
    /**
     * Enable verbose logging in the watcher.
     */
    setVerboseLogging(enabled: boolean): Promise<void>;
    /**
     * Stop all watchers.
     */
    stop(): Promise<void>;
}
export interface IRecursiveWatcher extends IWatcher {
    watch(requests: IRecursiveWatchRequest[]): Promise<void>;
}
export interface IRecursiveWatcherOptions {
    /**
     * If `true`, will enable polling for all watchers, otherwise
     * will enable it for paths included in the string array.
     *
     * @deprecated this only exists for WSL1 support and should never
     * be used in any other case.
     */
    usePolling: boolean | string[];
    /**
     * If polling is enabled (via `usePolling`), defines the duration
     * in which the watcher will poll for changes.
     *
     * @deprecated this only exists for WSL1 support and should never
     * be used in any other case.
     */
    pollingInterval?: number;
}
export interface INonRecursiveWatcher extends IWatcher {
    watch(requests: INonRecursiveWatchRequest[]): Promise<void>;
}
export interface IUniversalWatcher extends IWatcher {
    watch(requests: IUniversalWatchRequest[]): Promise<void>;
}
export declare abstract class AbstractWatcherClient extends Disposable {
    private readonly onFileChanges;
    private readonly onLogMessage;
    private verboseLogging;
    private options;
    private static readonly MAX_RESTARTS;
    private watcher;
    private readonly watcherDisposables;
    private requests;
    private restartCounter;
    constructor(onFileChanges: (changes: IDiskFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean, options: {
        type: string;
        restartOnError: boolean;
    });
    protected abstract createWatcher(disposables: DisposableStore): IWatcher;
    protected init(): void;
    protected onError(error: string): void;
    private restart;
    watch(requests: IUniversalWatchRequest[]): Promise<void>;
    setVerboseLogging(verboseLogging: boolean): Promise<void>;
    private error;
    dispose(): void;
}
export declare abstract class AbstractNonRecursiveWatcherClient extends AbstractWatcherClient {
    constructor(onFileChanges: (changes: IDiskFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean);
    protected abstract createWatcher(disposables: DisposableStore): INonRecursiveWatcher;
}
export declare abstract class AbstractUniversalWatcherClient extends AbstractWatcherClient {
    constructor(onFileChanges: (changes: IDiskFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean);
    protected abstract createWatcher(disposables: DisposableStore): IUniversalWatcher;
}
export interface IDiskFileChange {
    type: FileChangeType;
    path: string;
}
export interface ILogMessage {
    type: 'trace' | 'warn' | 'error' | 'info' | 'debug';
    message: string;
}
export declare function toFileChanges(changes: IDiskFileChange[]): IFileChange[];
export declare function coalesceEvents(changes: IDiskFileChange[]): IDiskFileChange[];
export declare function normalizeWatcherPattern(path: string, pattern: string | IRelativePattern): string | IRelativePattern;
export declare function parseWatcherPatterns(path: string, patterns: Array<string | IRelativePattern>): ParsedPattern[];
export {};
