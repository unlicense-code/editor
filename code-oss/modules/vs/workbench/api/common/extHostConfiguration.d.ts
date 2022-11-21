import { Event } from 'vs/base/common/event';
import type * as vscode from 'vscode';
import { ExtHostWorkspace, IExtHostWorkspace } from 'vs/workbench/api/common/extHostWorkspace';
import { ExtHostConfigurationShape, MainThreadConfigurationShape, IConfigurationInitData } from './extHost.protocol';
import { IConfigurationChange } from 'vs/platform/configuration/common/configuration';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { ILogService } from 'vs/platform/log/common/log';
export declare class ExtHostConfiguration implements ExtHostConfigurationShape {
    readonly _serviceBrand: undefined;
    private readonly _proxy;
    private readonly _logService;
    private readonly _extHostWorkspace;
    private readonly _barrier;
    private _actual;
    constructor(extHostRpc: IExtHostRpcService, extHostWorkspace: IExtHostWorkspace, logService: ILogService);
    getConfigProvider(): Promise<ExtHostConfigProvider>;
    $initializeConfiguration(data: IConfigurationInitData): void;
    $acceptConfigurationChanged(data: IConfigurationInitData, change: IConfigurationChange): void;
}
export declare class ExtHostConfigProvider {
    private readonly _onDidChangeConfiguration;
    private readonly _proxy;
    private readonly _extHostWorkspace;
    private _configurationScopes;
    private _configuration;
    private _logService;
    constructor(proxy: MainThreadConfigurationShape, extHostWorkspace: ExtHostWorkspace, data: IConfigurationInitData, logService: ILogService);
    get onDidChangeConfiguration(): Event<vscode.ConfigurationChangeEvent>;
    $acceptConfigurationChanged(data: IConfigurationInitData, change: IConfigurationChange): void;
    getConfiguration(section?: string, scope?: vscode.ConfigurationScope | null, extensionDescription?: IExtensionDescription): vscode.WorkspaceConfiguration;
    private _toReadonlyValue;
    private _validateConfigurationAccess;
    private _toConfigurationChangeEvent;
    private _toMap;
}
export declare const IExtHostConfiguration: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtHostConfiguration>;
export interface IExtHostConfiguration extends ExtHostConfiguration {
}
