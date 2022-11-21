import { LogService, LogLevel } from 'vs/platform/log/common/log';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { LogLevelChannelClient, LoggerChannelClient } from 'vs/platform/log/common/logIpc';
export declare class NativeLogService extends LogService {
    constructor(name: string, logLevel: LogLevel, loggerService: LoggerChannelClient, loggerClient: LogLevelChannelClient, environmentService: INativeWorkbenchEnvironmentService);
}
