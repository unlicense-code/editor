import { AbstractMessageLogger, ILogger, LogLevel } from 'vs/platform/log/common/log';
export declare class SpdLogLogger extends AbstractMessageLogger implements ILogger {
    private buffer;
    private readonly _loggerCreationPromise;
    private _logger;
    constructor(name: string, filepath: string, rotating: boolean, donotUseFormatters: boolean, level: LogLevel);
    private _createSpdLogLogger;
    protected log(level: LogLevel, message: string): void;
    flush(): void;
    dispose(): void;
    private disposeLogger;
}
