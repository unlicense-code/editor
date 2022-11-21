import { ILoggerService, LogService } from 'vs/platform/log/common/log';
import { IExtHostInitDataService } from 'vs/workbench/api/common/extHostInitDataService';
export declare class ExtHostLogService extends LogService {
    readonly _serviceBrand: undefined;
    constructor(loggerService: ILoggerService, initData: IExtHostInitDataService);
}
