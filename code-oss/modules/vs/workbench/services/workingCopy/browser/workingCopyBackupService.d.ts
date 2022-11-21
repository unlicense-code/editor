import { IFileService } from 'vs/platform/files/common/files';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { ILogService } from 'vs/platform/log/common/log';
import { WorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackupService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
export declare class BrowserWorkingCopyBackupService extends WorkingCopyBackupService {
    constructor(contextService: IWorkspaceContextService, environmentService: IWorkbenchEnvironmentService, fileService: IFileService, logService: ILogService);
}
