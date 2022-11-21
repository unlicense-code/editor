import { Selection } from 'vs/editor/common/core/selection';
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from 'vs/editor/common/editorCommon';
import { ITextModel } from 'vs/editor/common/model';
export declare class CopyLinesCommand implements ICommand {
    private readonly _selection;
    private readonly _isCopyingDown;
    private readonly _noop;
    private _selectionDirection;
    private _selectionId;
    private _startLineNumberDelta;
    private _endLineNumberDelta;
    constructor(selection: Selection, isCopyingDown: boolean, noop?: boolean);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
