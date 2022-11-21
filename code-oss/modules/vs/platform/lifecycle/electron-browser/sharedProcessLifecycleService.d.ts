import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
export declare const ISharedProcessLifecycleService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ISharedProcessLifecycleService>;
export interface ISharedProcessLifecycleService {
    readonly _serviceBrand: undefined;
    /**
     * An event that fires after after no window has vetoed the shutdown sequence. At
     * this point listeners are ensured that the application will quit without veto.
     */
    readonly onWillShutdown: Event<ShutdownEvent>;
}
export interface ShutdownEvent {
    /**
     * Allows to join the shutdown. The promise can be a long running operation but it
     * will block the application from closing.
     */
    join(promise: Promise<void>): void;
}
export declare class SharedProcessLifecycleService extends Disposable implements ISharedProcessLifecycleService {
    private readonly logService;
    readonly _serviceBrand: undefined;
    private pendingWillShutdownPromise;
    private readonly _onWillShutdown;
    readonly onWillShutdown: Event<ShutdownEvent>;
    constructor(logService: ILogService);
    fireOnWillShutdown(): Promise<void>;
}
