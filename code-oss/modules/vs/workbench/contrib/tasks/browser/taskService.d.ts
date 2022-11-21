import { IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
import { ITaskSystem } from 'vs/workbench/contrib/tasks/common/taskSystem';
import { AbstractTaskService, IWorkspaceFolderConfigurationResult } from 'vs/workbench/contrib/tasks/browser/abstractTaskService';
import { ITaskFilter } from 'vs/workbench/contrib/tasks/common/taskService';
export declare class TaskService extends AbstractTaskService {
    private static readonly ProcessTaskSystemSupportMessage;
    protected _getTaskSystem(): ITaskSystem;
    protected _computeLegacyConfiguration(workspaceFolder: IWorkspaceFolder): Promise<IWorkspaceFolderConfigurationResult>;
    protected _versionAndEngineCompatible(filter?: ITaskFilter): boolean;
}
