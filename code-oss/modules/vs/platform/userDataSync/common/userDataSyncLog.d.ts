import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { AbstractLogger, ILoggerService } from 'vs/platform/log/common/log';
import { IUserDataSyncLogService } from 'vs/platform/userDataSync/common/userDataSync';
export declare class UserDataSyncLogService extends AbstractLogger implements IUserDataSyncLogService {
    readonly _serviceBrand: undefined;
    private readonly logger;
    constructor(loggerService: ILoggerService, environmentService: IEnvironmentService);
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string | Error, ...args: any[]): void;
    flush(): void;
}
