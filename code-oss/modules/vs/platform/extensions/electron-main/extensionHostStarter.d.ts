import { SerializedError } from 'vs/base/common/errors';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IExtensionHostProcessOptions, IExtensionHostStarter } from 'vs/platform/extensions/common/extensionHostStarter';
import { Emitter, Event } from 'vs/base/common/event';
import { ILogService } from 'vs/platform/log/common/log';
import { ILifecycleMainService } from 'vs/platform/lifecycle/electron-main/lifecycleMainService';
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';
export declare class ExtensionHostStarter implements IDisposable, IExtensionHostStarter {
    private readonly _logService;
    private readonly _windowsMainService;
    _serviceBrand: undefined;
    private static _lastId;
    protected readonly _extHosts: Map<string, ExtensionHostProcess | UtilityExtensionHostProcess>;
    private _shutdown;
    constructor(_logService: ILogService, lifecycleMainService: ILifecycleMainService, _windowsMainService: IWindowsMainService);
    dispose(): void;
    private _getExtHost;
    onDynamicStdout(id: string): Event<string>;
    onDynamicStderr(id: string): Event<string>;
    onDynamicMessage(id: string): Event<any>;
    onDynamicError(id: string): Event<{
        error: SerializedError;
    }>;
    onDynamicExit(id: string): Event<{
        code: number;
        signal: string;
    }>;
    canUseUtilityProcess(): Promise<boolean>;
    createExtensionHost(useUtilityProcess: boolean): Promise<{
        id: string;
    }>;
    start(id: string, opts: IExtensionHostProcessOptions): Promise<void>;
    enableInspectPort(id: string): Promise<boolean>;
    kill(id: string): Promise<void>;
    _killAllNow(): Promise<void>;
    _waitForAllExit(maxWaitTimeMs: number): Promise<void>;
}
declare class ExtensionHostProcess extends Disposable {
    readonly id: string;
    private readonly _logService;
    readonly _onStdout: Emitter<string>;
    readonly onStdout: Event<string>;
    readonly _onStderr: Emitter<string>;
    readonly onStderr: Event<string>;
    readonly _onMessage: Emitter<any>;
    readonly onMessage: Event<any>;
    readonly _onError: Emitter<{
        error: SerializedError;
    }>;
    readonly onError: Event<{
        error: SerializedError;
    }>;
    readonly _onExit: Emitter<{
        pid: number;
        code: number;
        signal: string;
    }>;
    readonly onExit: Event<{
        pid: number;
        code: number;
        signal: string;
    }>;
    private _process;
    private _hasExited;
    constructor(id: string, _logService: ILogService);
    start(opts: IExtensionHostProcessOptions): void;
    enableInspectPort(): boolean;
    kill(): void;
    waitForExit(maxWaitTimeMs: number): Promise<void>;
}
declare class UtilityExtensionHostProcess extends Disposable {
    readonly id: string;
    private readonly _logService;
    private readonly _windowsMainService;
    readonly onError: Event<any>;
    readonly _onStdout: Emitter<string>;
    readonly onStdout: Event<string>;
    readonly _onStderr: Emitter<string>;
    readonly onStderr: Event<string>;
    readonly _onMessage: Emitter<any>;
    readonly onMessage: Event<any>;
    readonly _onExit: Emitter<{
        pid: number;
        code: number;
        signal: string;
    }>;
    readonly onExit: Event<{
        pid: number;
        code: number;
        signal: string;
    }>;
    private _process;
    private _hasExited;
    constructor(id: string, _logService: ILogService, _windowsMainService: IWindowsMainService);
    start(opts: IExtensionHostProcessOptions): void;
    enableInspectPort(): boolean;
    kill(): void;
    waitForExit(maxWaitTimeMs: number): Promise<void>;
}
export {};
