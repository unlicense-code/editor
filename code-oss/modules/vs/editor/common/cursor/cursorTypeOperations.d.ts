import { ReplaceCommandWithOffsetCursorState } from 'vs/editor/common/commands/replaceCommand';
import { CursorConfiguration, EditOperationResult, EditOperationType, ICursorSimpleModel } from 'vs/editor/common/cursorCommon';
import { Range } from 'vs/editor/common/core/range';
import { Selection } from 'vs/editor/common/core/selection';
import { ICommand, ICursorStateComputerData } from 'vs/editor/common/editorCommon';
import { ITextModel } from 'vs/editor/common/model';
export declare class TypeOperations {
    static indent(config: CursorConfiguration, model: ICursorSimpleModel | null, selections: Selection[] | null): ICommand[];
    static outdent(config: CursorConfiguration, model: ICursorSimpleModel, selections: Selection[]): ICommand[];
    static shiftIndent(config: CursorConfiguration, indentation: string, count?: number): string;
    static unshiftIndent(config: CursorConfiguration, indentation: string, count?: number): string;
    private static _distributedPaste;
    private static _simplePaste;
    private static _distributePasteToCursors;
    static paste(config: CursorConfiguration, model: ICursorSimpleModel, selections: Selection[], text: string, pasteOnNewLine: boolean, multicursorText: string[]): EditOperationResult;
    private static _goodIndentForLine;
    private static _replaceJumpToNextIndent;
    static tab(config: CursorConfiguration, model: ITextModel, selections: Selection[]): ICommand[];
    static compositionType(prevEditOperationType: EditOperationType, config: CursorConfiguration, model: ITextModel, selections: Selection[], text: string, replacePrevCharCnt: number, replaceNextCharCnt: number, positionDelta: number): EditOperationResult;
    private static _compositionType;
    private static _typeCommand;
    private static _enter;
    private static _isAutoIndentType;
    private static _runAutoIndentType;
    private static _isAutoClosingOvertype;
    private static _runAutoClosingOvertype;
    private static _isBeforeClosingBrace;
    /**
     * Determine if typing `ch` at all `positions` in the `model` results in an
     * auto closing open sequence being typed.
     *
     * Auto closing open sequences can consist of multiple characters, which
     * can lead to ambiguities. In such a case, the longest auto-closing open
     * sequence is returned.
     */
    private static _findAutoClosingPairOpen;
    /**
     * Find another auto-closing pair that is contained by the one passed in.
     *
     * e.g. when having [(,)] and [(*,*)] as auto-closing pairs
     * this method will find [(,)] as a containment pair for [(*,*)]
     */
    private static _findContainedAutoClosingPair;
    private static _getAutoClosingPairClose;
    private static _runAutoClosingOpenCharType;
    private static _shouldSurroundChar;
    private static _isSurroundSelectionType;
    private static _runSurroundSelectionType;
    private static _isTypeInterceptorElectricChar;
    private static _typeInterceptorElectricChar;
    /**
     * This is very similar with typing, but the character is already in the text buffer!
     */
    static compositionEndWithInterceptors(prevEditOperationType: EditOperationType, config: CursorConfiguration, model: ITextModel, compositions: CompositionOutcome[] | null, selections: Selection[], autoClosedCharacters: Range[]): EditOperationResult | null;
    static typeWithInterceptors(isDoingComposition: boolean, prevEditOperationType: EditOperationType, config: CursorConfiguration, model: ITextModel, selections: Selection[], autoClosedCharacters: Range[], ch: string): EditOperationResult;
    static typeWithoutInterceptors(prevEditOperationType: EditOperationType, config: CursorConfiguration, model: ITextModel, selections: Selection[], str: string): EditOperationResult;
    static lineInsertBefore(config: CursorConfiguration, model: ITextModel | null, selections: Selection[] | null): ICommand[];
    static lineInsertAfter(config: CursorConfiguration, model: ITextModel | null, selections: Selection[] | null): ICommand[];
    static lineBreakInsert(config: CursorConfiguration, model: ITextModel, selections: Selection[]): ICommand[];
}
export declare class TypeWithAutoClosingCommand extends ReplaceCommandWithOffsetCursorState {
    private readonly _openCharacter;
    private readonly _closeCharacter;
    closeCharacterRange: Range | null;
    enclosingRange: Range | null;
    constructor(selection: Selection, openCharacter: string, insertOpenCharacter: boolean, closeCharacter: string);
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
export declare class CompositionOutcome {
    readonly deletedText: string;
    readonly deletedSelectionStart: number;
    readonly deletedSelectionEnd: number;
    readonly insertedText: string;
    readonly insertedSelectionStart: number;
    readonly insertedSelectionEnd: number;
    constructor(deletedText: string, deletedSelectionStart: number, deletedSelectionEnd: number, insertedText: string, insertedSelectionStart: number, insertedSelectionEnd: number);
}
