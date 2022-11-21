import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { Disposable } from 'vs/base/common/lifecycle';
import { IActivityService } from 'vs/workbench/services/activity/common/activity';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { IFilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
export declare class DirtyFilesIndicator extends Disposable implements IWorkbenchContribution {
    private readonly lifecycleService;
    private readonly activityService;
    private readonly workingCopyService;
    private readonly filesConfigurationService;
    private readonly badgeHandle;
    private lastKnownDirtyCount;
    constructor(lifecycleService: ILifecycleService, activityService: IActivityService, workingCopyService: IWorkingCopyService, filesConfigurationService: IFilesConfigurationService);
    private registerListeners;
    private onWorkingCopyDidChangeDirty;
    private updateActivityBadge;
}
