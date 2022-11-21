import { Action } from 'vs/base/common/actions';
import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IWorkspaceFolder, IWorkspace } from 'vs/platform/workspace/common/workspace';
import { Task, ContributedTask, CustomTask, ITaskSet, TaskSorter, ITaskEvent, ITaskIdentifier, ConfiguringTask, TaskRunSource } from 'vs/workbench/contrib/tasks/common/tasks';
import { ITaskSummary, ITaskTerminateResponse, ITaskSystemInfo } from 'vs/workbench/contrib/tasks/common/taskSystem';
import { IStringDictionary } from 'vs/base/common/collections';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
export { ITaskSummary, Task, ITaskTerminateResponse as TaskTerminateResponse };
export declare const CustomExecutionSupportedContext: RawContextKey<boolean>;
export declare const ShellExecutionSupportedContext: RawContextKey<boolean>;
export declare const TaskCommandsRegistered: RawContextKey<boolean>;
export declare const ProcessExecutionSupportedContext: RawContextKey<boolean>;
export declare const ServerlessWebContext: RawContextKey<boolean>;
export declare const TaskExecutionSupportedContext: import("vs/platform/contextkey/common/contextkey").ContextKeyExpression | undefined;
export declare const ITaskService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ITaskService>;
export interface ITaskProvider {
    provideTasks(validTypes: IStringDictionary<boolean>): Promise<ITaskSet>;
    resolveTask(task: ConfiguringTask): Promise<ContributedTask | undefined>;
}
export interface IProblemMatcherRunOptions {
    attachProblemMatcher?: boolean;
}
export interface ICustomizationProperties {
    group?: string | {
        kind?: string;
        isDefault?: boolean;
    };
    problemMatcher?: string | string[];
    isBackground?: boolean;
    color?: string;
    icon?: string;
}
export interface ITaskFilter {
    version?: string;
    type?: string;
    task?: string;
}
interface IWorkspaceTaskResult {
    set: ITaskSet | undefined;
    configurations: {
        byIdentifier: IStringDictionary<ConfiguringTask>;
    } | undefined;
    hasErrors: boolean;
}
export interface IWorkspaceFolderTaskResult extends IWorkspaceTaskResult {
    workspaceFolder: IWorkspaceFolder;
}
export interface ITaskService {
    readonly _serviceBrand: undefined;
    onDidStateChange: Event<ITaskEvent>;
    supportsMultipleTaskExecutions: boolean;
    configureAction(): Action;
    run(task: Task | undefined, options?: IProblemMatcherRunOptions): Promise<ITaskSummary | undefined>;
    inTerminal(): boolean;
    getActiveTasks(): Promise<Task[]>;
    getBusyTasks(): Promise<Task[]>;
    terminate(task: Task): Promise<ITaskTerminateResponse>;
    tasks(filter?: ITaskFilter): Promise<Task[]>;
    taskTypes(): string[];
    getWorkspaceTasks(runSource?: TaskRunSource): Promise<Map<string, IWorkspaceFolderTaskResult>>;
    getSavedTasks(type: 'persistent' | 'historical'): Promise<(Task | ConfiguringTask)[]>;
    removeRecentlyUsedTask(taskRecentlyUsedKey: string): void;
    /**
     * @param alias The task's name, label or defined identifier.
     */
    getTask(workspaceFolder: IWorkspace | IWorkspaceFolder | string, alias: string | ITaskIdentifier, compareId?: boolean): Promise<Task | undefined>;
    tryResolveTask(configuringTask: ConfiguringTask): Promise<Task | undefined>;
    createSorter(): TaskSorter;
    getTaskDescription(task: Task | ConfiguringTask): string | undefined;
    customize(task: ContributedTask | CustomTask | ConfiguringTask, properties?: {}, openConfig?: boolean): Promise<void>;
    openConfig(task: CustomTask | ConfiguringTask | undefined): Promise<boolean>;
    registerTaskProvider(taskProvider: ITaskProvider, type: string): IDisposable;
    registerTaskSystem(scheme: string, taskSystemInfo: ITaskSystemInfo): void;
    onDidChangeTaskSystemInfo: Event<void>;
    readonly hasTaskSystemInfo: boolean;
    registerSupportedExecutions(custom?: boolean, shell?: boolean, process?: boolean): void;
    extensionCallbackTaskComplete(task: Task, result: number | undefined): Promise<void>;
}
