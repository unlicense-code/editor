import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { ILoggerOptions, ILoggerService, ILogService, LogLevel } from 'vs/platform/log/common/log';
import { MainThreadLoggerShape } from 'vs/workbench/api/common/extHost.protocol';
import { UriComponents } from 'vs/base/common/uri';
import { ILogLevelService } from 'vs/workbench/contrib/logs/common/logLevelService';
import { IOutputService } from 'vs/workbench/services/output/common/output';
export declare class MainThreadLoggerService implements MainThreadLoggerShape {
    private readonly loggerService;
    private readonly disposables;
    constructor(extHostContext: IExtHostContext, logService: ILogService, loggerService: ILoggerService, extensionLoggerService: ILogLevelService, outputService: IOutputService);
    $log(file: UriComponents, messages: [LogLevel, string][]): void;
    $createLogger(file: UriComponents, options?: ILoggerOptions): Promise<void>;
    dispose(): void;
}
