import { URI } from 'vs/base/common/uri';
import { AbstractLoggerService, ILogger, ILoggerOptions, ILoggerService, ILogService, LogLevel } from 'vs/platform/log/common/log';
export declare class LoggerService extends AbstractLoggerService implements ILoggerService {
    constructor(logService: ILogService);
    protected doCreateLogger(resource: URI, logLevel: LogLevel, options?: ILoggerOptions): ILogger;
}
