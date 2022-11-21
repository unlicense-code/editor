import { Event } from 'vs/base/common/event';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { ExtHostEditorsShape, IEditorPropertiesChangeData, IMainContext, ITextEditorPositionData } from 'vs/workbench/api/common/extHost.protocol';
import { ExtHostDocumentsAndEditors } from 'vs/workbench/api/common/extHostDocumentsAndEditors';
import { ExtHostTextEditor } from 'vs/workbench/api/common/extHostTextEditor';
import * as vscode from 'vscode';
export declare class ExtHostEditors implements ExtHostEditorsShape {
    private readonly _extHostDocumentsAndEditors;
    private readonly _onDidChangeTextEditorSelection;
    private readonly _onDidChangeTextEditorOptions;
    private readonly _onDidChangeTextEditorVisibleRanges;
    private readonly _onDidChangeTextEditorViewColumn;
    private readonly _onDidChangeActiveTextEditor;
    private readonly _onDidChangeVisibleTextEditors;
    readonly onDidChangeTextEditorSelection: Event<vscode.TextEditorSelectionChangeEvent>;
    readonly onDidChangeTextEditorOptions: Event<vscode.TextEditorOptionsChangeEvent>;
    readonly onDidChangeTextEditorVisibleRanges: Event<vscode.TextEditorVisibleRangesChangeEvent>;
    readonly onDidChangeTextEditorViewColumn: Event<vscode.TextEditorViewColumnChangeEvent>;
    readonly onDidChangeActiveTextEditor: Event<vscode.TextEditor | undefined>;
    readonly onDidChangeVisibleTextEditors: Event<readonly vscode.TextEditor[]>;
    private readonly _proxy;
    constructor(mainContext: IMainContext, _extHostDocumentsAndEditors: ExtHostDocumentsAndEditors);
    getActiveTextEditor(): vscode.TextEditor | undefined;
    getVisibleTextEditors(): vscode.TextEditor[];
    getVisibleTextEditors(internal: true): ExtHostTextEditor[];
    showTextDocument(document: vscode.TextDocument, column: vscode.ViewColumn, preserveFocus: boolean): Promise<vscode.TextEditor>;
    showTextDocument(document: vscode.TextDocument, options: {
        column: vscode.ViewColumn;
        preserveFocus: boolean;
        pinned: boolean;
    }): Promise<vscode.TextEditor>;
    showTextDocument(document: vscode.TextDocument, columnOrOptions: vscode.ViewColumn | vscode.TextDocumentShowOptions | undefined, preserveFocus?: boolean): Promise<vscode.TextEditor>;
    createTextEditorDecorationType(extension: IExtensionDescription, options: vscode.DecorationRenderOptions): vscode.TextEditorDecorationType;
    $acceptEditorPropertiesChanged(id: string, data: IEditorPropertiesChangeData): void;
    $acceptEditorPositionData(data: ITextEditorPositionData): void;
    getDiffInformation(id: string): Promise<vscode.LineChange[]>;
}
