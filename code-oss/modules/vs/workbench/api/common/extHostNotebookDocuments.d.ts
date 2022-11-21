import { UriComponents } from 'vs/base/common/uri';
import * as extHostProtocol from 'vs/workbench/api/common/extHost.protocol';
import { ExtHostNotebookController } from 'vs/workbench/api/common/extHostNotebook';
import { NotebookDocumentMetadata } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { SerializableObjectWithBuffers } from 'vs/workbench/services/extensions/common/proxyIdentifier';
import type * as vscode from 'vscode';
export declare class ExtHostNotebookDocuments implements extHostProtocol.ExtHostNotebookDocumentsShape {
    private readonly _notebooksAndEditors;
    private readonly _onDidSaveNotebookDocument;
    readonly onDidSaveNotebookDocument: import("vs/base/common/event").Event<vscode.NotebookDocument>;
    private readonly _onDidChangeNotebookDocument;
    readonly onDidChangeNotebookDocument: import("vs/base/common/event").Event<vscode.NotebookDocumentChangeEvent>;
    constructor(_notebooksAndEditors: ExtHostNotebookController);
    $acceptModelChanged(uri: UriComponents, event: SerializableObjectWithBuffers<extHostProtocol.NotebookCellsChangedEventDto>, isDirty: boolean, newMetadata?: NotebookDocumentMetadata): void;
    $acceptDirtyStateChanged(uri: UriComponents, isDirty: boolean): void;
    $acceptModelSaved(uri: UriComponents): void;
}
