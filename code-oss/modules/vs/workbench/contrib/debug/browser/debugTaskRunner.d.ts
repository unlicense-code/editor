import { ITaskService, ITaskSummary } from 'vs/workbench/contrib/tasks/common/taskService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWorkspaceFolder, IWorkspace } from 'vs/platform/workspace/common/workspace';
import { ITaskIdentifier } from 'vs/workbench/contrib/tasks/common/tasks';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IMarkerService } from 'vs/platform/markers/common/markers';
import { IViewsService } from 'vs/workbench/common/views';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ICommandService } from 'vs/platform/commands/common/commands';
export declare const enum TaskRunResult {
    Failure = 0,
    Success = 1
}
export declare class DebugTaskRunner {
    private readonly taskService;
    private readonly markerService;
    private readonly configurationService;
    private readonly viewsService;
    private readonly dialogService;
    private readonly storageService;
    private readonly commandService;
    private canceled;
    constructor(taskService: ITaskService, markerService: IMarkerService, configurationService: IConfigurationService, viewsService: IViewsService, dialogService: IDialogService, storageService: IStorageService, commandService: ICommandService);
    cancel(): void;
    runTaskAndCheckErrors(root: IWorkspaceFolder | IWorkspace | undefined, taskId: string | ITaskIdentifier | undefined): Promise<TaskRunResult>;
    runTask(root: IWorkspace | IWorkspaceFolder | undefined, taskId: string | ITaskIdentifier | undefined): Promise<ITaskSummary | null>;
}
