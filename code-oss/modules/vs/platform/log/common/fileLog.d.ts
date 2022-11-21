import { URI } from 'vs/base/common/uri';
import { IFileService } from 'vs/platform/files/common/files';
import { AbstractLogger, AbstractLoggerService, ILogger, ILoggerOptions, ILoggerService, ILogService, LogLevel } from 'vs/platform/log/common/log';
export declare class FileLogger extends AbstractLogger implements ILogger {
    private readonly resource;
    private readonly donotUseFormatters;
    private readonly fileService;
    private readonly initializePromise;
    private readonly queue;
    private backupIndex;
    constructor(name: string, resource: URI, level: LogLevel, donotUseFormatters: boolean, fileService: IFileService);
    trace(): void;
    debug(): void;
    info(): void;
    warn(): void;
    error(): void;
    flush(): void;
    private initialize;
    private _log;
    private getCurrentTimestamp;
    private getBackupResource;
    private loadContent;
    private stringifyLogLevel;
}
export declare class FileLoggerService extends AbstractLoggerService implements ILoggerService {
    private readonly fileService;
    constructor(logService: ILogService, fileService: IFileService);
    protected doCreateLogger(resource: URI, logLevel: LogLevel, options?: ILoggerOptions): ILogger;
}
