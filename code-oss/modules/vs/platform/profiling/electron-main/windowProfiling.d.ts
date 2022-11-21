import { BrowserWindow } from 'electron';
import { ILogService } from 'vs/platform/log/common/log';
import { IV8Profile } from 'vs/platform/profiling/common/profiling';
export declare class WindowProfiler {
    private readonly _window;
    private readonly _sessionId;
    private readonly _logService;
    constructor(_window: BrowserWindow, _sessionId: string, _logService: ILogService);
    inspect(duration: number): Promise<IV8Profile>;
    private _connect;
    private _disconnect;
}
