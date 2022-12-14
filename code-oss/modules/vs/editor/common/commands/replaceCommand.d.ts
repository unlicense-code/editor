import { Range } from 'vs/editor/common/core/range';
import { Selection } from 'vs/editor/common/core/selection';
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from 'vs/editor/common/editorCommon';
import { ITextModel } from 'vs/editor/common/model';
export declare class ReplaceCommand implements ICommand {
    private readonly _range;
    private readonly _text;
    readonly insertsAutoWhitespace: boolean;
    constructor(range: Range, text: string, insertsAutoWhitespace?: boolean);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
export declare class ReplaceCommandThatSelectsText implements ICommand {
    private readonly _range;
    private readonly _text;
    constructor(range: Range, text: string);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
export declare class ReplaceCommandWithoutChangingPosition implements ICommand {
    private readonly _range;
    private readonly _text;
    readonly insertsAutoWhitespace: boolean;
    constructor(range: Range, text: string, insertsAutoWhitespace?: boolean);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
export declare class ReplaceCommandWithOffsetCursorState implements ICommand {
    private readonly _range;
    private readonly _text;
    private readonly _columnDeltaOffset;
    private readonly _lineNumberDeltaOffset;
    readonly insertsAutoWhitespace: boolean;
    constructor(range: Range, text: string, lineNumberDeltaOffset: number, columnDeltaOffset: number, insertsAutoWhitespace?: boolean);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
export declare class ReplaceCommandThatPreservesSelection implements ICommand {
    private readonly _range;
    private readonly _text;
    private readonly _initialSelection;
    private readonly _forceMoveMarkers;
    private _selectionId;
    constructor(editRange: Range, text: string, initialSelection: Selection, forceMoveMarkers?: boolean);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
