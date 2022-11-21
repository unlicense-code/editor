import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { ExtHostEditors } from 'vs/workbench/api/common/extHostTextEditors';
import { WebviewRemoteInfo } from 'vs/workbench/contrib/webview/common/webview';
import type * as vscode from 'vscode';
import { ExtHostEditorInsetsShape, MainThreadEditorInsetsShape } from './extHost.protocol';
export declare class ExtHostEditorInsets implements ExtHostEditorInsetsShape {
    private readonly _proxy;
    private readonly _editors;
    private readonly _remoteInfo;
    private _handlePool;
    private _disposables;
    private _insets;
    constructor(_proxy: MainThreadEditorInsetsShape, _editors: ExtHostEditors, _remoteInfo: WebviewRemoteInfo);
    dispose(): void;
    createWebviewEditorInset(editor: vscode.TextEditor, line: number, height: number, options: vscode.WebviewOptions | undefined, extension: IExtensionDescription): vscode.WebviewEditorInset;
    $onDidDispose(handle: number): void;
    $onDidReceiveMessage(handle: number, message: any): void;
}
