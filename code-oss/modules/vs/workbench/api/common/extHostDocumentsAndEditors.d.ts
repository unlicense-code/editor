import * as vscode from 'vscode';
import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
import { ExtHostDocumentsAndEditorsShape, IDocumentsAndEditorsDelta, IModelAddedData } from 'vs/workbench/api/common/extHost.protocol';
import { ExtHostDocumentData } from 'vs/workbench/api/common/extHostDocumentData';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { ExtHostTextEditor } from 'vs/workbench/api/common/extHostTextEditor';
import { ILogService } from 'vs/platform/log/common/log';
export interface IExtHostModelAddedData extends IModelAddedData {
    notebook?: vscode.NotebookDocument;
}
export interface IExtHostDocumentsAndEditorsDelta extends IDocumentsAndEditorsDelta {
    addedDocuments?: IExtHostModelAddedData[];
}
export declare class ExtHostDocumentsAndEditors implements ExtHostDocumentsAndEditorsShape {
    private readonly _extHostRpc;
    private readonly _logService;
    readonly _serviceBrand: undefined;
    private _activeEditorId;
    private readonly _editors;
    private readonly _documents;
    private readonly _onDidAddDocuments;
    private readonly _onDidRemoveDocuments;
    private readonly _onDidChangeVisibleTextEditors;
    private readonly _onDidChangeActiveTextEditor;
    readonly onDidAddDocuments: Event<readonly ExtHostDocumentData[]>;
    readonly onDidRemoveDocuments: Event<readonly ExtHostDocumentData[]>;
    readonly onDidChangeVisibleTextEditors: Event<readonly vscode.TextEditor[]>;
    readonly onDidChangeActiveTextEditor: Event<vscode.TextEditor | undefined>;
    constructor(_extHostRpc: IExtHostRpcService, _logService: ILogService);
    $acceptDocumentsAndEditorsDelta(delta: IDocumentsAndEditorsDelta): void;
    acceptDocumentsAndEditorsDelta(delta: IExtHostDocumentsAndEditorsDelta): void;
    getDocument(uri: URI): ExtHostDocumentData | undefined;
    allDocuments(): Iterable<ExtHostDocumentData>;
    getEditor(id: string): ExtHostTextEditor | undefined;
    activeEditor(): vscode.TextEditor | undefined;
    activeEditor(internal: true): ExtHostTextEditor | undefined;
    allEditors(): ExtHostTextEditor[];
}
export interface IExtHostDocumentsAndEditors extends ExtHostDocumentsAndEditors {
}
export declare const IExtHostDocumentsAndEditors: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtHostDocumentsAndEditors>;
