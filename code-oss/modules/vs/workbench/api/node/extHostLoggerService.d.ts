import { ILogger, ILoggerOptions, LogLevel } from 'vs/platform/log/common/log';
import { URI } from 'vs/base/common/uri';
import { ExtHostLoggerService as BaseExtHostLoggerService } from 'vs/workbench/api/common/extHostLoggerService';
export declare class ExtHostLoggerService extends BaseExtHostLoggerService {
    protected doCreateLogger(resource: URI, logLevel: LogLevel, options?: ILoggerOptions): ILogger;
}
