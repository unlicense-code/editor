import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { NativeParsedArgs } from 'vs/platform/environment/common/argv';
import { ILogService } from 'vs/platform/log/common/log';
import { IStateMainService } from 'vs/platform/state/electron-main/state';
import { ICodeWindow, LoadReason, UnloadReason } from 'vs/platform/window/electron-main/window';
import { ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
import { IEnvironmentMainService } from 'vs/platform/environment/electron-main/environmentMainService';
export declare const ILifecycleMainService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ILifecycleMainService>;
interface WindowLoadEvent {
    /**
     * The window that is loaded to a new workspace.
     */
    window: ICodeWindow;
    /**
     * The workspace the window is loaded into.
     */
    workspace: IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | undefined;
    /**
     * More details why the window loads to a new workspace.
     */
    reason: LoadReason;
}
export declare const enum ShutdownReason {
    /**
     * The application exits normally.
     */
    QUIT = 1,
    /**
     * The application exits abnormally and is being
     * killed with an exit code (e.g. from integration
     * test run)
     */
    KILL = 2
}
export interface ShutdownEvent {
    /**
     * More details why the application is shutting down.
     */
    reason: ShutdownReason;
    /**
     * Allows to join the shutdown. The promise can be a long running operation but it
     * will block the application from closing.
     */
    join(promise: Promise<void>): void;
}
export interface ILifecycleMainService {
    readonly _serviceBrand: undefined;
    /**
     * Will be true if the program was restarted (e.g. due to explicit request or update).
     */
    readonly wasRestarted: boolean;
    /**
     * Will be true if the program was requested to quit.
     */
    readonly quitRequested: boolean;
    /**
     * A flag indicating in what phase of the lifecycle we currently are.
     */
    phase: LifecycleMainPhase;
    /**
     * An event that fires when the application is about to shutdown before any window is closed.
     * The shutdown can still be prevented by any window that vetos this event.
     */
    readonly onBeforeShutdown: Event<void>;
    /**
     * An event that fires after the onBeforeShutdown event has been fired and after no window has
     * vetoed the shutdown sequence. At this point listeners are ensured that the application will
     * quit without veto.
     */
    readonly onWillShutdown: Event<ShutdownEvent>;
    /**
     * An event that fires when a window is loading. This can either be a window opening for the
     * first time or a window reloading or changing to another URL.
     */
    readonly onWillLoadWindow: Event<WindowLoadEvent>;
    /**
     * An event that fires before a window closes. This event is fired after any veto has been dealt
     * with so that listeners know for sure that the window will close without veto.
     */
    readonly onBeforeCloseWindow: Event<ICodeWindow>;
    /**
     * Make a `ICodeWindow` known to the lifecycle main service.
     */
    registerWindow(window: ICodeWindow): void;
    /**
     * Reload a window. All lifecycle event handlers are triggered.
     */
    reload(window: ICodeWindow, cli?: NativeParsedArgs): Promise<void>;
    /**
     * Unload a window for the provided reason. All lifecycle event handlers are triggered.
     */
    unload(window: ICodeWindow, reason: UnloadReason): Promise<boolean>;
    /**
     * Restart the application with optional arguments (CLI). All lifecycle event handlers are triggered.
     */
    relaunch(options?: {
        addArgs?: string[];
        removeArgs?: string[];
    }): Promise<void>;
    /**
     * Shutdown the application normally. All lifecycle event handlers are triggered.
     */
    quit(willRestart?: boolean): Promise<boolean>;
    /**
     * Forcefully shutdown the application and optionally set an exit code.
     *
     * This method should only be used in rare situations where it is important
     * to set an exit code (e.g. running tests) or when the application is
     * not in a healthy state and should terminate asap.
     *
     * This method does not fire the normal lifecycle events to the windows,
     * that normally can be vetoed. Windows are destroyed without a chance
     * of components to participate. The only lifecycle event handler that
     * is triggered is `onWillShutdown` in the main process.
     */
    kill(code?: number): Promise<void>;
    /**
     * Returns a promise that resolves when a certain lifecycle phase
     * has started.
     */
    when(phase: LifecycleMainPhase): Promise<void>;
}
export declare const enum LifecycleMainPhase {
    /**
     * The first phase signals that we are about to startup.
     */
    Starting = 1,
    /**
     * Services are ready and first window is about to open.
     */
    Ready = 2,
    /**
     * This phase signals a point in time after the window has opened
     * and is typically the best place to do work that is not required
     * for the window to open.
     */
    AfterWindowOpen = 3,
    /**
     * The last phase after a window has opened and some time has passed
     * (2-5 seconds).
     */
    Eventually = 4
}
export declare class LifecycleMainService extends Disposable implements ILifecycleMainService {
    private readonly logService;
    private readonly stateMainService;
    private readonly environmentMainService;
    readonly _serviceBrand: undefined;
    private static readonly QUIT_AND_RESTART_KEY;
    private readonly _onBeforeShutdown;
    readonly onBeforeShutdown: Event<void>;
    private readonly _onWillShutdown;
    readonly onWillShutdown: Event<ShutdownEvent>;
    private readonly _onWillLoadWindow;
    readonly onWillLoadWindow: Event<WindowLoadEvent>;
    private readonly _onBeforeCloseWindow;
    readonly onBeforeCloseWindow: Event<ICodeWindow>;
    private _quitRequested;
    get quitRequested(): boolean;
    private _wasRestarted;
    get wasRestarted(): boolean;
    private _phase;
    get phase(): LifecycleMainPhase;
    private readonly windowToCloseRequest;
    private oneTimeListenerTokenGenerator;
    private windowCounter;
    private pendingQuitPromise;
    private pendingQuitPromiseResolve;
    private pendingWillShutdownPromise;
    private readonly mapWindowIdToPendingUnload;
    private readonly phaseWhen;
    constructor(logService: ILogService, stateMainService: IStateMainService, environmentMainService: IEnvironmentMainService);
    private resolveRestarted;
    private registerListeners;
    private fireOnWillShutdown;
    set phase(value: LifecycleMainPhase);
    when(phase: LifecycleMainPhase): Promise<void>;
    registerWindow(window: ICodeWindow): void;
    reload(window: ICodeWindow, cli?: NativeParsedArgs): Promise<void>;
    unload(window: ICodeWindow, reason: UnloadReason): Promise<boolean>;
    private doUnload;
    private handleWindowUnloadVeto;
    private resolvePendingQuitPromise;
    private onBeforeUnloadWindowInRenderer;
    private onWillUnloadWindowInRenderer;
    quit(willRestart?: boolean): Promise<boolean>;
    private trace;
    relaunch(options?: {
        addArgs?: string[];
        removeArgs?: string[];
    }): Promise<void>;
    kill(code?: number): Promise<void>;
}
export {};
