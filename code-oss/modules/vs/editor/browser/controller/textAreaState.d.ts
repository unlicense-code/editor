import { Position } from 'vs/editor/common/core/position';
import { Range } from 'vs/editor/common/core/range';
import { EndOfLinePreference } from 'vs/editor/common/model';
export declare const _debugComposition = false;
export interface ITextAreaWrapper {
    getValue(): string;
    setValue(reason: string, value: string): void;
    getSelectionStart(): number;
    getSelectionEnd(): number;
    setSelectionRange(reason: string, selectionStart: number, selectionEnd: number): void;
}
export interface ISimpleModel {
    getLineCount(): number;
    getLineMaxColumn(lineNumber: number): number;
    getValueInRange(range: Range, eol: EndOfLinePreference): string;
    getValueLengthInRange(range: Range, eol: EndOfLinePreference): number;
    modifyPosition(position: Position, offset: number): Position;
}
export interface ITypeData {
    text: string;
    replacePrevCharCnt: number;
    replaceNextCharCnt: number;
    positionDelta: number;
}
export declare class TextAreaState {
    readonly value: string;
    /** the offset where selection starts inside `value` */
    readonly selectionStart: number;
    /** the offset where selection ends inside `value` */
    readonly selectionEnd: number;
    /** the editor range in the view coordinate system that matches the selection inside `value` */
    readonly selection: Range | null;
    /** the visible line count (wrapped, not necessarily matching \n characters) for the text in `value` before `selectionStart` */
    readonly newlineCountBeforeSelection: number | undefined;
    static readonly EMPTY: TextAreaState;
    constructor(value: string, 
    /** the offset where selection starts inside `value` */
    selectionStart: number, 
    /** the offset where selection ends inside `value` */
    selectionEnd: number, 
    /** the editor range in the view coordinate system that matches the selection inside `value` */
    selection: Range | null, 
    /** the visible line count (wrapped, not necessarily matching \n characters) for the text in `value` before `selectionStart` */
    newlineCountBeforeSelection: number | undefined);
    toString(): string;
    static readFromTextArea(textArea: ITextAreaWrapper, previousState: TextAreaState | null): TextAreaState;
    collapseSelection(): TextAreaState;
    writeToTextArea(reason: string, textArea: ITextAreaWrapper, select: boolean): void;
    deduceEditorPosition(offset: number): [Position | null, number, number];
    private _finishDeduceEditorPosition;
    static deduceInput(previousState: TextAreaState, currentState: TextAreaState, couldBeEmojiInput: boolean): ITypeData;
    static deduceAndroidCompositionInput(previousState: TextAreaState, currentState: TextAreaState): ITypeData;
}
export declare class PagedScreenReaderStrategy {
    private static _getPageOfLine;
    private static _getRangeForPage;
    static fromEditorSelection(model: ISimpleModel, selection: Range, linesPerPage: number, trimLongText: boolean): TextAreaState;
}
