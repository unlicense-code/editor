import { ConfigurationChangedEvent, EditorAutoClosingEditStrategy, EditorAutoClosingStrategy, EditorAutoIndentStrategy, EditorAutoSurroundStrategy } from 'vs/editor/common/config/editorOptions';
import { LineTokens } from 'vs/editor/common/tokens/lineTokens';
import { Position } from 'vs/editor/common/core/position';
import { Range } from 'vs/editor/common/core/range';
import { ISelection, Selection } from 'vs/editor/common/core/selection';
import { ICommand } from 'vs/editor/common/editorCommon';
import { IEditorConfiguration } from 'vs/editor/common/config/editorConfiguration';
import { PositionAffinity, TextModelResolvedOptions } from 'vs/editor/common/model';
import { AutoClosingPairs } from 'vs/editor/common/languages/languageConfiguration';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { IElectricAction } from 'vs/editor/common/languages/supports/electricCharacter';
export interface IColumnSelectData {
    isReal: boolean;
    fromViewLineNumber: number;
    fromViewVisualColumn: number;
    toViewLineNumber: number;
    toViewVisualColumn: number;
}
/**
 * This is an operation type that will be recorded for undo/redo purposes.
 * The goal is to introduce an undo stop when the controller switches between different operation types.
 */
export declare const enum EditOperationType {
    Other = 0,
    DeletingLeft = 2,
    DeletingRight = 3,
    TypingOther = 4,
    TypingFirstSpace = 5,
    TypingConsecutiveSpace = 6
}
export interface CharacterMap {
    [char: string]: string;
}
export declare class CursorConfiguration {
    readonly languageConfigurationService: ILanguageConfigurationService;
    _cursorMoveConfigurationBrand: void;
    readonly readOnly: boolean;
    readonly tabSize: number;
    readonly indentSize: number;
    readonly insertSpaces: boolean;
    readonly stickyTabStops: boolean;
    readonly pageSize: number;
    readonly lineHeight: number;
    readonly typicalHalfwidthCharacterWidth: number;
    readonly useTabStops: boolean;
    readonly wordSeparators: string;
    readonly emptySelectionClipboard: boolean;
    readonly copyWithSyntaxHighlighting: boolean;
    readonly multiCursorMergeOverlapping: boolean;
    readonly multiCursorPaste: 'spread' | 'full';
    readonly autoClosingBrackets: EditorAutoClosingStrategy;
    readonly autoClosingQuotes: EditorAutoClosingStrategy;
    readonly autoClosingDelete: EditorAutoClosingEditStrategy;
    readonly autoClosingOvertype: EditorAutoClosingEditStrategy;
    readonly autoSurround: EditorAutoSurroundStrategy;
    readonly autoIndent: EditorAutoIndentStrategy;
    readonly autoClosingPairs: AutoClosingPairs;
    readonly surroundingPairs: CharacterMap;
    readonly shouldAutoCloseBefore: {
        quote: (ch: string) => boolean;
        bracket: (ch: string) => boolean;
    };
    private readonly _languageId;
    private _electricChars;
    static shouldRecreate(e: ConfigurationChangedEvent): boolean;
    constructor(languageId: string, modelOptions: TextModelResolvedOptions, configuration: IEditorConfiguration, languageConfigurationService: ILanguageConfigurationService);
    get electricChars(): {
        [key: string]: boolean;
    };
    /**
     * Should return opening bracket type to match indentation with
     */
    onElectricCharacter(character: string, context: LineTokens, column: number): IElectricAction | null;
    normalizeIndentation(str: string): string;
    private _getShouldAutoClose;
    private _getLanguageDefinedShouldAutoClose;
    /**
     * Returns a visible column from a column.
     * @see {@link CursorColumns}
     */
    visibleColumnFromColumn(model: ICursorSimpleModel, position: Position): number;
    /**
     * Returns a visible column from a column.
     * @see {@link CursorColumns}
     */
    columnFromVisibleColumn(model: ICursorSimpleModel, lineNumber: number, visibleColumn: number): number;
}
/**
 * Represents a simple model (either the model or the view model).
 */
export interface ICursorSimpleModel {
    getLineCount(): number;
    getLineContent(lineNumber: number): string;
    getLineMinColumn(lineNumber: number): number;
    getLineMaxColumn(lineNumber: number): number;
    getLineFirstNonWhitespaceColumn(lineNumber: number): number;
    getLineLastNonWhitespaceColumn(lineNumber: number): number;
    normalizePosition(position: Position, affinity: PositionAffinity): Position;
    /**
     * Gets the column at which indentation stops at a given line.
     * @internal
     */
    getLineIndentColumn(lineNumber: number): number;
}
export declare type PartialCursorState = CursorState | PartialModelCursorState | PartialViewCursorState;
export declare class CursorState {
    _cursorStateBrand: void;
    static fromModelState(modelState: SingleCursorState): PartialModelCursorState;
    static fromViewState(viewState: SingleCursorState): PartialViewCursorState;
    static fromModelSelection(modelSelection: ISelection): PartialModelCursorState;
    static fromModelSelections(modelSelections: readonly ISelection[]): PartialModelCursorState[];
    readonly modelState: SingleCursorState;
    readonly viewState: SingleCursorState;
    constructor(modelState: SingleCursorState, viewState: SingleCursorState);
    equals(other: CursorState): boolean;
}
export declare class PartialModelCursorState {
    readonly modelState: SingleCursorState;
    readonly viewState: null;
    constructor(modelState: SingleCursorState);
}
export declare class PartialViewCursorState {
    readonly modelState: null;
    readonly viewState: SingleCursorState;
    constructor(viewState: SingleCursorState);
}
/**
 * Represents the cursor state on either the model or on the view model.
 */
export declare class SingleCursorState {
    _singleCursorStateBrand: void;
    readonly selectionStart: Range;
    readonly selectionStartLeftoverVisibleColumns: number;
    readonly position: Position;
    readonly leftoverVisibleColumns: number;
    readonly selection: Selection;
    constructor(selectionStart: Range, selectionStartLeftoverVisibleColumns: number, position: Position, leftoverVisibleColumns: number);
    equals(other: SingleCursorState): boolean;
    hasSelection(): boolean;
    move(inSelectionMode: boolean, lineNumber: number, column: number, leftoverVisibleColumns: number): SingleCursorState;
    private static _computeSelection;
}
export declare class EditOperationResult {
    _editOperationResultBrand: void;
    readonly type: EditOperationType;
    readonly commands: Array<ICommand | null>;
    readonly shouldPushStackElementBefore: boolean;
    readonly shouldPushStackElementAfter: boolean;
    constructor(type: EditOperationType, commands: Array<ICommand | null>, opts: {
        shouldPushStackElementBefore: boolean;
        shouldPushStackElementAfter: boolean;
    });
}
export declare function isQuote(ch: string): boolean;
