import { WorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackupService';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
export declare class NativeWorkingCopyBackupService extends WorkingCopyBackupService {
    private readonly lifecycleService;
    constructor(environmentService: INativeWorkbenchEnvironmentService, fileService: IFileService, logService: ILogService, lifecycleService: ILifecycleService);
    private registerListeners;
}
