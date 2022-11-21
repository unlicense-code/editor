import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ITaskService } from 'vs/workbench/contrib/tasks/common/taskService';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { MainThreadTaskShape } from 'vs/workbench/api/common/extHost.protocol';
import { ITaskExecutionDTO, ITaskDTO, ITaskHandleDTO, ITaskFilterDTO, ITaskSystemInfoDTO } from 'vs/workbench/api/common/shared/tasks';
import { IConfigurationResolverService } from 'vs/workbench/services/configurationResolver/common/configurationResolver';
export declare class MainThreadTask implements MainThreadTaskShape {
    private readonly _taskService;
    private readonly _workspaceContextServer;
    private readonly _configurationResolverService;
    private readonly _extHostContext;
    private readonly _proxy;
    private readonly _providers;
    constructor(extHostContext: IExtHostContext, _taskService: ITaskService, _workspaceContextServer: IWorkspaceContextService, _configurationResolverService: IConfigurationResolverService);
    dispose(): void;
    $createTaskId(taskDTO: ITaskDTO): Promise<string>;
    $registerTaskProvider(handle: number, type: string): Promise<void>;
    $unregisterTaskProvider(handle: number): Promise<void>;
    $fetchTasks(filter?: ITaskFilterDTO): Promise<ITaskDTO[]>;
    private getWorkspace;
    $getTaskExecution(value: ITaskHandleDTO | ITaskDTO): Promise<ITaskExecutionDTO>;
    $executeTask(value: ITaskHandleDTO | ITaskDTO): Promise<ITaskExecutionDTO>;
    $customExecutionComplete(id: string, result?: number): Promise<void>;
    $terminateTask(id: string): Promise<void>;
    $registerTaskSystem(key: string, info: ITaskSystemInfoDTO): void;
    $registerSupportedExecutions(custom?: boolean, shell?: boolean, process?: boolean): Promise<void>;
}
