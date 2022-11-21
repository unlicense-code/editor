import { CancellationToken } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { UriComponents } from 'vs/base/common/uri';
import { ExtensionIdentifier, IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { ILogService } from 'vs/platform/log/common/log';
import { EditSessionIdentityMatch } from 'vs/platform/workspace/common/editSessions';
import { Workspace } from 'vs/platform/workspace/common/workspace';
import { IExtHostFileSystemInfo } from 'vs/workbench/api/common/extHostFileSystemInfo';
import { IExtHostInitDataService } from 'vs/workbench/api/common/extHostInitDataService';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { IURITransformerService } from 'vs/workbench/api/common/extHostUriTransformerService';
import { IRawFileMatch2 } from 'vs/workbench/services/search/common/search';
import * as vscode from 'vscode';
import { ExtHostWorkspaceShape, IWorkspaceData } from './extHost.protocol';
export interface IExtHostWorkspaceProvider {
    getWorkspaceFolder2(uri: vscode.Uri, resolveParent?: boolean): Promise<vscode.WorkspaceFolder | undefined>;
    resolveWorkspaceFolder(uri: vscode.Uri): Promise<vscode.WorkspaceFolder | undefined>;
    getWorkspaceFolders2(): Promise<vscode.WorkspaceFolder[] | undefined>;
    resolveProxy(url: string): Promise<string | undefined>;
}
export declare class ExtHostWorkspace implements ExtHostWorkspaceShape, IExtHostWorkspaceProvider {
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeWorkspace;
    readonly onDidChangeWorkspace: Event<vscode.WorkspaceFoldersChangeEvent>;
    private readonly _onDidGrantWorkspaceTrust;
    readonly onDidGrantWorkspaceTrust: Event<void>;
    private readonly _logService;
    private readonly _requestIdProvider;
    private readonly _barrier;
    private _confirmedWorkspace?;
    private _unconfirmedWorkspace?;
    private readonly _proxy;
    private readonly _messageService;
    private readonly _extHostFileSystemInfo;
    private readonly _uriTransformerService;
    private readonly _activeSearchCallbacks;
    private _trusted;
    private readonly _editSessionIdentityProviders;
    constructor(extHostRpc: IExtHostRpcService, initData: IExtHostInitDataService, extHostFileSystemInfo: IExtHostFileSystemInfo, logService: ILogService, uriTransformerService: IURITransformerService);
    $initializeWorkspace(data: IWorkspaceData | null, trusted: boolean): void;
    waitForInitializeCall(): Promise<boolean>;
    get workspace(): Workspace | undefined;
    get name(): string | undefined;
    get workspaceFile(): vscode.Uri | undefined;
    private get _actualWorkspace();
    getWorkspaceFolders(): vscode.WorkspaceFolder[] | undefined;
    getWorkspaceFolders2(): Promise<vscode.WorkspaceFolder[] | undefined>;
    updateWorkspaceFolders(extension: IExtensionDescription, index: number, deleteCount: number, ...workspaceFoldersToAdd: {
        uri: vscode.Uri;
        name?: string;
    }[]): boolean;
    getWorkspaceFolder(uri: vscode.Uri, resolveParent?: boolean): vscode.WorkspaceFolder | undefined;
    getWorkspaceFolder2(uri: vscode.Uri, resolveParent?: boolean): Promise<vscode.WorkspaceFolder | undefined>;
    resolveWorkspaceFolder(uri: vscode.Uri): Promise<vscode.WorkspaceFolder | undefined>;
    getPath(): string | undefined;
    getRelativePath(pathOrUri: string | vscode.Uri, includeWorkspace?: boolean): string;
    private trySetWorkspaceFolders;
    $acceptWorkspaceData(data: IWorkspaceData | null): void;
    /**
     * Note, null/undefined have different and important meanings for "exclude"
     */
    findFiles(include: vscode.GlobPattern | undefined, exclude: vscode.GlobPattern | null | undefined, maxResults: number | undefined, extensionId: ExtensionIdentifier, token?: vscode.CancellationToken): Promise<vscode.Uri[]>;
    findTextInFiles(query: vscode.TextSearchQuery, options: vscode.FindTextInFilesOptions, callback: (result: vscode.TextSearchResult) => void, extensionId: ExtensionIdentifier, token?: vscode.CancellationToken): Promise<vscode.TextSearchComplete>;
    $handleTextSearchResult(result: IRawFileMatch2, requestId: number): void;
    saveAll(includeUntitled?: boolean): Promise<boolean>;
    resolveProxy(url: string): Promise<string | undefined>;
    get trusted(): boolean;
    requestWorkspaceTrust(options?: vscode.WorkspaceTrustRequestOptions): Promise<boolean | undefined>;
    $onDidGrantWorkspaceTrust(): void;
    private _providerHandlePool;
    registerEditSessionIdentityProvider(scheme: string, provider: vscode.EditSessionIdentityProvider): import("vs/base/common/lifecycle").IDisposable;
    $getEditSessionIdentifier(workspaceFolder: UriComponents, cancellationToken: CancellationToken): Promise<string | undefined>;
    $provideEditSessionIdentityMatch(workspaceFolder: UriComponents, identity1: string, identity2: string, cancellationToken: CancellationToken): Promise<EditSessionIdentityMatch | undefined>;
}
export declare const IExtHostWorkspace: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtHostWorkspace>;
export interface IExtHostWorkspace extends ExtHostWorkspace, ExtHostWorkspaceShape, IExtHostWorkspaceProvider {
}
