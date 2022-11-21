import { VSBuffer } from 'vs/base/common/buffer';
import { CancellationToken } from 'vs/base/common/cancellation';
import { UriComponents } from 'vs/base/common/uri';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { ExtHostDocuments } from 'vs/workbench/api/common/extHostDocuments';
import { IExtensionStoragePaths } from 'vs/workbench/api/common/extHostStoragePaths';
import { ExtHostWebviews } from 'vs/workbench/api/common/extHostWebview';
import { ExtHostWebviewPanels } from 'vs/workbench/api/common/extHostWebviewPanels';
import { EditorGroupColumn } from 'vs/workbench/services/editor/common/editorGroupColumn';
import type * as vscode from 'vscode';
import * as extHostProtocol from './extHost.protocol';
export declare class ExtHostCustomEditors implements extHostProtocol.ExtHostCustomEditorsShape {
    private readonly _extHostDocuments;
    private readonly _extensionStoragePaths;
    private readonly _extHostWebview;
    private readonly _extHostWebviewPanels;
    private readonly _proxy;
    private readonly _editorProviders;
    private readonly _documents;
    constructor(mainContext: extHostProtocol.IMainContext, _extHostDocuments: ExtHostDocuments, _extensionStoragePaths: IExtensionStoragePaths | undefined, _extHostWebview: ExtHostWebviews, _extHostWebviewPanels: ExtHostWebviewPanels);
    registerCustomEditorProvider(extension: IExtensionDescription, viewType: string, provider: vscode.CustomReadonlyEditorProvider | vscode.CustomTextEditorProvider, options: {
        webviewOptions?: vscode.WebviewPanelOptions;
        supportsMultipleEditorsPerDocument?: boolean;
    }): vscode.Disposable;
    $createCustomDocument(resource: UriComponents, viewType: string, backupId: string | undefined, untitledDocumentData: VSBuffer | undefined, cancellation: CancellationToken): Promise<{
        editable: boolean;
    }>;
    $disposeCustomDocument(resource: UriComponents, viewType: string): Promise<void>;
    $resolveWebviewEditor(resource: UriComponents, handle: extHostProtocol.WebviewHandle, viewType: string, initData: {
        title: string;
        contentOptions: extHostProtocol.IWebviewContentOptions;
        options: extHostProtocol.IWebviewPanelOptions;
    }, position: EditorGroupColumn, cancellation: CancellationToken): Promise<void>;
    $disposeEdits(resourceComponents: UriComponents, viewType: string, editIds: number[]): void;
    $onMoveCustomEditor(handle: string, newResourceComponents: UriComponents, viewType: string): Promise<void>;
    $undo(resourceComponents: UriComponents, viewType: string, editId: number, isDirty: boolean): Promise<void>;
    $redo(resourceComponents: UriComponents, viewType: string, editId: number, isDirty: boolean): Promise<void>;
    $revert(resourceComponents: UriComponents, viewType: string, cancellation: CancellationToken): Promise<void>;
    $onSave(resourceComponents: UriComponents, viewType: string, cancellation: CancellationToken): Promise<void>;
    $onSaveAs(resourceComponents: UriComponents, viewType: string, targetResource: UriComponents, cancellation: CancellationToken): Promise<void>;
    $backup(resourceComponents: UriComponents, viewType: string, cancellation: CancellationToken): Promise<string>;
    private getCustomDocumentEntry;
    private getCustomEditorProvider;
}
