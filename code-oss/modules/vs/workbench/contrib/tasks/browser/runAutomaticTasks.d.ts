import { Disposable } from 'vs/base/common/lifecycle';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { ITaskService } from 'vs/workbench/contrib/tasks/common/taskService';
import { Action2 } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILogService } from 'vs/platform/log/common/log';
export declare class RunAutomaticTasks extends Disposable implements IWorkbenchContribution {
    private readonly _taskService;
    private readonly _configurationService;
    private readonly _workspaceTrustManagementService;
    private readonly _logService;
    private _hasRunTasks;
    constructor(_taskService: ITaskService, _configurationService: IConfigurationService, _workspaceTrustManagementService: IWorkspaceTrustManagementService, _logService: ILogService);
    private _tryRunTasks;
    private _runTasks;
    private _getTaskSource;
    private _findAutoTasks;
    private _runWithPermission;
}
export declare class ManageAutomaticTaskRunning extends Action2 {
    static readonly ID = "workbench.action.tasks.manageAutomaticRunning";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor): Promise<any>;
}
