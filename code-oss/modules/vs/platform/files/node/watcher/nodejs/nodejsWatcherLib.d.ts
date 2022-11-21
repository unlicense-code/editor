import { CancellationToken } from 'vs/base/common/cancellation';
import { Disposable } from 'vs/base/common/lifecycle';
import { IDiskFileChange, ILogMessage, INonRecursiveWatchRequest } from 'vs/platform/files/common/watcher';
export declare class NodeJSFileWatcherLibrary extends Disposable {
    private request;
    private onDidFilesChange;
    private onLogMessage?;
    private verboseLogging?;
    private static readonly FILE_DELETE_HANDLER_DELAY;
    private static readonly FILE_CHANGES_HANDLER_DELAY;
    private readonly throttledFileChangesWorker;
    private readonly fileChangesDelayer;
    private fileChangesBuffer;
    private readonly excludes;
    private readonly includes;
    private readonly cts;
    readonly ready: Promise<void>;
    constructor(request: INonRecursiveWatchRequest, onDidFilesChange: (changes: IDiskFileChange[]) => void, onLogMessage?: ((msg: ILogMessage) => void) | undefined, verboseLogging?: boolean | undefined);
    private watch;
    private normalizePath;
    private doWatch;
    private onFileChange;
    private existsChildStrictCase;
    setVerboseLogging(verboseLogging: boolean): void;
    private error;
    private warn;
    private trace;
    dispose(): void;
}
/**
 * Watch the provided `path` for changes and return
 * the data in chunks of `Uint8Array` for further use.
 */
export declare function watchFileContents(path: string, onData: (chunk: Uint8Array) => void, onReady: () => void, token: CancellationToken, bufferSize?: number): Promise<void>;
