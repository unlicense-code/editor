import type * as vscode from 'vscode';
import { IEditorTabGroupDto, IExtHostEditorTabsShape, TabOperation } from 'vs/workbench/api/common/extHost.protocol';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
export interface IExtHostEditorTabs extends IExtHostEditorTabsShape {
    readonly _serviceBrand: undefined;
    tabGroups: vscode.TabGroups;
}
export declare const IExtHostEditorTabs: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtHostEditorTabs>;
export declare class ExtHostEditorTabs implements IExtHostEditorTabs {
    readonly _serviceBrand: undefined;
    private readonly _proxy;
    private readonly _onDidChangeTabs;
    private readonly _onDidChangeTabGroups;
    private _activeGroupId;
    private _extHostTabGroups;
    private _apiObject;
    constructor(extHostRpc: IExtHostRpcService);
    get tabGroups(): vscode.TabGroups;
    $acceptEditorTabModel(tabGroups: IEditorTabGroupDto[]): void;
    $acceptTabGroupUpdate(groupDto: IEditorTabGroupDto): void;
    $acceptTabOperation(operation: TabOperation): void;
    private _findExtHostTabFromApi;
    private _findExtHostTabGroupFromApi;
    private _closeTabs;
    private _closeGroups;
}
