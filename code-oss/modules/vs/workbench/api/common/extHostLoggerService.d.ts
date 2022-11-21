import { ILogger, ILoggerOptions, LogLevel, AbstractLoggerService } from 'vs/platform/log/common/log';
import { ExtHostLogLevelServiceShape as ExtHostLogLevelServiceShape } from 'vs/workbench/api/common/extHost.protocol';
import { IExtHostInitDataService } from 'vs/workbench/api/common/extHostInitDataService';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { URI, UriComponents } from 'vs/base/common/uri';
export declare class ExtHostLoggerService extends AbstractLoggerService implements ExtHostLogLevelServiceShape {
    readonly _serviceBrand: undefined;
    private readonly _proxy;
    constructor(rpc: IExtHostRpcService, initData: IExtHostInitDataService);
    $setLevel(level: LogLevel, resource?: UriComponents): void;
    protected doCreateLogger(resource: URI, logLevel: LogLevel, options?: ILoggerOptions): ILogger;
}
