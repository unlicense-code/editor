import { Event } from 'vs/base/common/event';
import { URI, UriComponents } from 'vs/base/common/uri';
import { IModelChangedEvent } from 'vs/editor/common/model/mirrorTextModel';
import { ExtHostDocumentsShape, IMainContext } from 'vs/workbench/api/common/extHost.protocol';
import { ExtHostDocumentData } from 'vs/workbench/api/common/extHostDocumentData';
import { ExtHostDocumentsAndEditors } from 'vs/workbench/api/common/extHostDocumentsAndEditors';
import type * as vscode from 'vscode';
export declare class ExtHostDocuments implements ExtHostDocumentsShape {
    private readonly _onDidAddDocument;
    private readonly _onDidRemoveDocument;
    private readonly _onDidChangeDocument;
    private readonly _onDidSaveDocument;
    readonly onDidAddDocument: Event<vscode.TextDocument>;
    readonly onDidRemoveDocument: Event<vscode.TextDocument>;
    readonly onDidChangeDocument: Event<vscode.TextDocumentChangeEvent>;
    readonly onDidSaveDocument: Event<vscode.TextDocument>;
    private readonly _toDispose;
    private _proxy;
    private _documentsAndEditors;
    private _documentLoader;
    constructor(mainContext: IMainContext, documentsAndEditors: ExtHostDocumentsAndEditors);
    dispose(): void;
    getAllDocumentData(): ExtHostDocumentData[];
    getDocumentData(resource: vscode.Uri): ExtHostDocumentData | undefined;
    getDocument(resource: vscode.Uri): vscode.TextDocument;
    ensureDocumentData(uri: URI): Promise<ExtHostDocumentData>;
    createDocumentData(options?: {
        language?: string;
        content?: string;
    }): Promise<URI>;
    $acceptModelLanguageChanged(uriComponents: UriComponents, newLanguageId: string): void;
    $acceptModelSaved(uriComponents: UriComponents): void;
    $acceptDirtyStateChanged(uriComponents: UriComponents, isDirty: boolean): void;
    $acceptModelChanged(uriComponents: UriComponents, events: IModelChangedEvent, isDirty: boolean): void;
    setWordDefinitionFor(languageId: string, wordDefinition: RegExp | undefined): void;
}
