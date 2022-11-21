import { Disposable } from 'vs/base/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
export declare const ignoreProcessNames: string[];
/**
 * Monitors a process for child processes, checking at differing times depending on input and output
 * calls into the monitor.
 */
export declare class ChildProcessMonitor extends Disposable {
    private readonly _pid;
    private readonly _logService;
    private _isDisposed;
    private _hasChildProcesses;
    private set hasChildProcesses(value);
    /**
     * Whether the process has child processes.
     */
    get hasChildProcesses(): boolean;
    private readonly _onDidChangeHasChildProcesses;
    /**
     * An event that fires when whether the process has child processes changes.
     */
    readonly onDidChangeHasChildProcesses: import("vs/base/common/event").Event<boolean>;
    constructor(_pid: number, _logService: ILogService);
    dispose(): void;
    /**
     * Input was triggered on the process.
     */
    handleInput(): void;
    /**
     * Output was triggered on the process.
     */
    handleOutput(): void;
    private _refreshActive;
    private _refreshInactive;
    private _processContainsChildren;
}
