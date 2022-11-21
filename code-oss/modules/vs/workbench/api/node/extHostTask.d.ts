import { UriComponents } from 'vs/base/common/uri';
import { IExtHostWorkspace } from 'vs/workbench/api/common/extHostWorkspace';
import type * as vscode from 'vscode';
import * as tasks from '../common/shared/tasks';
import { IExtHostDocumentsAndEditors } from 'vs/workbench/api/common/extHostDocumentsAndEditors';
import { IExtHostConfiguration } from 'vs/workbench/api/common/extHostConfiguration';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { IExtHostTerminalService } from 'vs/workbench/api/common/extHostTerminalService';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { IExtHostInitDataService } from 'vs/workbench/api/common/extHostInitDataService';
import { ExtHostTaskBase, HandlerData } from 'vs/workbench/api/common/extHostTask';
import { ILogService } from 'vs/platform/log/common/log';
import { IExtHostApiDeprecationService } from 'vs/workbench/api/common/extHostApiDeprecationService';
import { IExtHostVariableResolverProvider } from 'vs/workbench/api/common/extHostVariableResolverService';
export declare class ExtHostTask extends ExtHostTaskBase {
    private readonly workspaceService;
    private readonly variableResolver;
    constructor(extHostRpc: IExtHostRpcService, initData: IExtHostInitDataService, workspaceService: IExtHostWorkspace, editorService: IExtHostDocumentsAndEditors, configurationService: IExtHostConfiguration, extHostTerminalService: IExtHostTerminalService, logService: ILogService, deprecationService: IExtHostApiDeprecationService, variableResolver: IExtHostVariableResolverProvider);
    executeTask(extension: IExtensionDescription, task: vscode.Task): Promise<vscode.TaskExecution>;
    protected provideTasksInternal(validTypes: {
        [key: string]: boolean;
    }, taskIdPromises: Promise<void>[], handler: HandlerData, value: vscode.Task[] | null | undefined): {
        tasks: tasks.ITaskDTO[];
        extension: IExtensionDescription;
    };
    protected resolveTaskInternal(resolvedTaskDTO: tasks.ITaskDTO): Promise<tasks.ITaskDTO | undefined>;
    private getAFolder;
    $resolveVariables(uriComponents: UriComponents, toResolve: {
        process?: {
            name: string;
            cwd?: string;
            path?: string;
        };
        variables: string[];
    }): Promise<{
        process?: string;
        variables: {
            [key: string]: string;
        };
    }>;
    $jsonTasksSupported(): Promise<boolean>;
    $findExecutable(command: string, cwd?: string, paths?: string[]): Promise<string>;
}
