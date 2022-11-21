import { Disposable } from 'vs/base/common/lifecycle';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { ILogService } from 'vs/platform/log/common/log';
export declare class LogsDataCleaner extends Disposable {
    private readonly environmentService;
    private readonly logService;
    constructor(environmentService: IEnvironmentService, logService: ILogService);
    private cleanUpOldLogs;
}
