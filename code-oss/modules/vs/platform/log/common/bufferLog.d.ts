import { AbstractLogger, ILogger, ILogService, LogLevel } from 'vs/platform/log/common/log';
export declare class BufferLogService extends AbstractLogger implements ILogService {
    readonly _serviceBrand: undefined;
    private buffer;
    private _logger;
    constructor(logLevel?: LogLevel);
    set logger(logger: ILogger);
    private _log;
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string | Error, ...args: any[]): void;
    dispose(): void;
    flush(): void;
}
