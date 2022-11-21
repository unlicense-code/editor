import { Disposable } from 'vs/base/common/lifecycle';
import { IUniversalWatcher, IUniversalWatchRequest } from 'vs/platform/files/common/watcher';
import { Event } from 'vs/base/common/event';
export declare class UniversalWatcher extends Disposable implements IUniversalWatcher {
    private readonly recursiveWatcher;
    private readonly nonRecursiveWatcher;
    readonly onDidChangeFile: Event<import("vs/platform/files/common/watcher").IDiskFileChange[]>;
    readonly onDidLogMessage: Event<import("vs/platform/files/common/watcher").ILogMessage>;
    readonly onDidError: Event<any>;
    watch(requests: IUniversalWatchRequest[]): Promise<void>;
    setVerboseLogging(enabled: boolean): Promise<void>;
    stop(): Promise<void>;
}
