import { VSBuffer } from 'vs/base/common/buffer';
import { Emitter, Event } from 'vs/base/common/event';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { ILogService } from 'vs/platform/log/common/log';
import { IExtHostApiDeprecationService } from 'vs/workbench/api/common/extHostApiDeprecationService';
import { IExtHostWorkspace } from 'vs/workbench/api/common/extHostWorkspace';
import { WebviewRemoteInfo } from 'vs/workbench/contrib/webview/common/webview';
import { SerializableObjectWithBuffers } from 'vs/workbench/services/extensions/common/proxyIdentifier';
import type * as vscode from 'vscode';
import * as extHostProtocol from './extHost.protocol';
export declare class ExtHostWebview implements vscode.Webview {
    #private;
    constructor(handle: extHostProtocol.WebviewHandle, proxy: extHostProtocol.MainThreadWebviewsShape, options: vscode.WebviewOptions, remoteInfo: WebviewRemoteInfo, workspace: IExtHostWorkspace | undefined, extension: IExtensionDescription, deprecationService: IExtHostApiDeprecationService);
    readonly _onMessageEmitter: Emitter<any>;
    readonly onDidReceiveMessage: Event<any>;
    readonly _onDidDispose: Event<void>;
    dispose(): void;
    asWebviewUri(resource: vscode.Uri): vscode.Uri;
    get cspSource(): string;
    get html(): string;
    set html(value: string);
    get options(): vscode.WebviewOptions;
    set options(newOptions: vscode.WebviewOptions);
    postMessage(message: any): Promise<boolean>;
    private assertNotDisposed;
    private rewriteOldResourceUrlsIfNeeded;
}
export declare function shouldSerializeBuffersForPostMessage(extension: IExtensionDescription): boolean;
export declare class ExtHostWebviews implements extHostProtocol.ExtHostWebviewsShape {
    private readonly remoteInfo;
    private readonly workspace;
    private readonly _logService;
    private readonly _deprecationService;
    private readonly _webviewProxy;
    private readonly _webviews;
    constructor(mainContext: extHostProtocol.IMainContext, remoteInfo: WebviewRemoteInfo, workspace: IExtHostWorkspace | undefined, _logService: ILogService, _deprecationService: IExtHostApiDeprecationService);
    $onMessage(handle: extHostProtocol.WebviewHandle, jsonMessage: string, buffers: SerializableObjectWithBuffers<VSBuffer[]>): void;
    $onMissingCsp(_handle: extHostProtocol.WebviewHandle, extensionId: string): void;
    createNewWebview(handle: string, options: extHostProtocol.IWebviewContentOptions, extension: IExtensionDescription): ExtHostWebview;
    deleteWebview(handle: string): void;
    private getWebview;
}
export declare function toExtensionData(extension: IExtensionDescription): extHostProtocol.WebviewExtensionDescription;
export declare function serializeWebviewOptions(extension: IExtensionDescription, workspace: IExtHostWorkspace | undefined, options: vscode.WebviewOptions): extHostProtocol.IWebviewContentOptions;
