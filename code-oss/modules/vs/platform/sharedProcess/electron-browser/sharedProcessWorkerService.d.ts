import { ILogService } from 'vs/platform/log/common/log';
import { IOnDidTerminateSharedProcessWorkerProcess, ISharedProcessWorkerConfiguration, ISharedProcessWorkerService } from 'vs/platform/sharedProcess/common/sharedProcessWorkerService';
export declare class SharedProcessWorkerService implements ISharedProcessWorkerService {
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly workers;
    private readonly processeDisposables;
    private readonly processResolvers;
    constructor(logService: ILogService);
    createWorker(configuration: ISharedProcessWorkerConfiguration): Promise<IOnDidTerminateSharedProcessWorkerProcess>;
    private getOrCreateWebWorker;
    disposeWorker(configuration: ISharedProcessWorkerConfiguration): Promise<void>;
    private doDisposeWorker;
}
