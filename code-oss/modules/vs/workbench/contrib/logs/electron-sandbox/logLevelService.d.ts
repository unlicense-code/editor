import { ILoggerService, LogLevel } from 'vs/platform/log/common/log';
import { IOutputService } from 'vs/workbench/services/output/common/output';
import { IMainProcessService, ISharedProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { LogLevelService as CommonLogLevelService } from 'vs/workbench/contrib/logs/common/logLevelService';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
export declare class LogLevelService extends CommonLogLevelService {
    private readonly sharedProcessService;
    private readonly mainProcessService;
    private readonly remoteAgentService;
    constructor(outputService: IOutputService, loggerService: ILoggerService, sharedProcessService: ISharedProcessService, mainProcessService: IMainProcessService, remoteAgentService: IRemoteAgentService);
    setLogLevel(id: string, logLevel: LogLevel): boolean;
}
