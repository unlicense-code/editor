import { IResolvedTextEditorConfiguration, MainThreadTextEditorsShape } from 'vs/workbench/api/common/extHost.protocol';
import { EndOfLine, Position, Range, Selection } from 'vs/workbench/api/common/extHostTypes';
import type * as vscode from 'vscode';
import { ILogService } from 'vs/platform/log/common/log';
import { Lazy } from 'vs/base/common/lazy';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
export declare class TextEditorDecorationType {
    private static readonly _Keys;
    readonly value: vscode.TextEditorDecorationType;
    constructor(proxy: MainThreadTextEditorsShape, extension: IExtensionDescription, options: vscode.DecorationRenderOptions);
}
export interface ITextEditOperation {
    range: vscode.Range;
    text: string | null;
    forceMoveMarkers: boolean;
}
export interface IEditData {
    documentVersionId: number;
    edits: ITextEditOperation[];
    setEndOfLine: EndOfLine | undefined;
    undoStopBefore: boolean;
    undoStopAfter: boolean;
}
export declare class TextEditorEdit {
    private readonly _document;
    private readonly _documentVersionId;
    private readonly _undoStopBefore;
    private readonly _undoStopAfter;
    private _collectedEdits;
    private _setEndOfLine;
    private _finalized;
    constructor(document: vscode.TextDocument, options: {
        undoStopBefore: boolean;
        undoStopAfter: boolean;
    });
    finalize(): IEditData;
    private _throwIfFinalized;
    replace(location: Position | Range | Selection, value: string): void;
    insert(location: Position, value: string): void;
    delete(location: Range | Selection): void;
    private _pushEdit;
    setEndOfLine(endOfLine: EndOfLine): void;
}
export declare class ExtHostTextEditorOptions {
    private _proxy;
    private _id;
    private _logService;
    private _tabSize;
    private _indentSize;
    private _insertSpaces;
    private _cursorStyle;
    private _lineNumbers;
    readonly value: vscode.TextEditorOptions;
    constructor(proxy: MainThreadTextEditorsShape, id: string, source: IResolvedTextEditorConfiguration, logService: ILogService);
    _accept(source: IResolvedTextEditorConfiguration): void;
    private _validateTabSize;
    private _setTabSize;
    private _validateIndentSize;
    private _setIndentSize;
    private _validateInsertSpaces;
    private _setInsertSpaces;
    private _setCursorStyle;
    private _setLineNumbers;
    assign(newOptions: vscode.TextEditorOptions): void;
    private _warnOnError;
}
export declare class ExtHostTextEditor {
    readonly id: string;
    private readonly _proxy;
    private readonly _logService;
    private _selections;
    private _options;
    private _visibleRanges;
    private _viewColumn;
    private _disposed;
    private _hasDecorationsForKey;
    readonly value: vscode.TextEditor;
    constructor(id: string, _proxy: MainThreadTextEditorsShape, _logService: ILogService, document: Lazy<vscode.TextDocument>, selections: Selection[], options: IResolvedTextEditorConfiguration, visibleRanges: Range[], viewColumn: vscode.ViewColumn | undefined);
    dispose(): void;
    _acceptOptions(options: IResolvedTextEditorConfiguration): void;
    _acceptVisibleRanges(value: Range[]): void;
    _acceptViewColumn(value: vscode.ViewColumn): void;
    _acceptSelections(selections: Selection[]): void;
    private _trySetSelection;
    private _applyEdit;
    private _runOnProxy;
}
