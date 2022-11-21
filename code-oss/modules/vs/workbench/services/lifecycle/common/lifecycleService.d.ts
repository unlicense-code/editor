import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { ILifecycleService, WillShutdownEvent, StartupKind, LifecyclePhase, ShutdownReason, BeforeShutdownErrorEvent, InternalBeforeShutdownEvent } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
import { IStorageService } from 'vs/platform/storage/common/storage';
export declare abstract class AbstractLifecycleService extends Disposable implements ILifecycleService {
    protected readonly logService: ILogService;
    protected readonly storageService: IStorageService;
    private static readonly LAST_SHUTDOWN_REASON_KEY;
    readonly _serviceBrand: undefined;
    protected readonly _onBeforeShutdown: Emitter<InternalBeforeShutdownEvent>;
    readonly onBeforeShutdown: import("vs/base/common/event").Event<InternalBeforeShutdownEvent>;
    protected readonly _onWillShutdown: Emitter<WillShutdownEvent>;
    readonly onWillShutdown: import("vs/base/common/event").Event<WillShutdownEvent>;
    protected readonly _onDidShutdown: Emitter<void>;
    readonly onDidShutdown: import("vs/base/common/event").Event<void>;
    protected readonly _onBeforeShutdownError: Emitter<BeforeShutdownErrorEvent>;
    readonly onBeforeShutdownError: import("vs/base/common/event").Event<BeforeShutdownErrorEvent>;
    protected readonly _onShutdownVeto: Emitter<void>;
    readonly onShutdownVeto: import("vs/base/common/event").Event<void>;
    private _startupKind;
    get startupKind(): StartupKind;
    private _phase;
    get phase(): LifecyclePhase;
    private readonly phaseWhen;
    protected shutdownReason: ShutdownReason | undefined;
    constructor(logService: ILogService, storageService: IStorageService);
    private resolveStartupKind;
    set phase(value: LifecyclePhase);
    when(phase: LifecyclePhase): Promise<void>;
    /**
     * Subclasses to implement the explicit shutdown method.
     */
    abstract shutdown(): Promise<void>;
}
