import { Disposable } from 'vs/base/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
import { ITerminalChildProcess } from 'vs/platform/terminal/common/terminal';
/**
 * Tracks a terminal process's data stream and responds immediately when a matching string is
 * received. This is done in a low overhead way and is ideally run on the same process as the
 * where the process is handled to minimize latency.
 */
export declare class TerminalAutoResponder extends Disposable {
    private _pointer;
    private _paused;
    /**
     * Each reply is throttled by a second to avoid resource starvation and responding to screen
     * reprints on Winodws.
     */
    private _throttled;
    constructor(proc: ITerminalChildProcess, matchWord: string, response: string, logService: ILogService);
    private _reset;
    /**
     * No auto response will happen after a resize on Windows in case the resize is a result of
     * reprinting the screen.
     */
    handleResize(): void;
    handleInput(): void;
}
