import { Disposable } from 'vs/base/common/lifecycle';
import { IFileService } from 'vs/platform/files/common/files';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
export declare class LogsDataCleaner extends Disposable {
    private readonly environmentService;
    private readonly fileService;
    private readonly lifecycleService;
    constructor(environmentService: IWorkbenchEnvironmentService, fileService: IFileService, lifecycleService: ILifecycleService);
    private cleanUpOldLogsSoon;
}
