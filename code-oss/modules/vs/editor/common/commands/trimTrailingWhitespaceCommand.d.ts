import { ISingleEditOperation } from 'vs/editor/common/core/editOperation';
import { Position } from 'vs/editor/common/core/position';
import { Selection } from 'vs/editor/common/core/selection';
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from 'vs/editor/common/editorCommon';
import { ITextModel } from 'vs/editor/common/model';
export declare class TrimTrailingWhitespaceCommand implements ICommand {
    private readonly _selection;
    private _selectionId;
    private readonly _cursors;
    constructor(selection: Selection, cursors: Position[]);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
/**
 * Generate commands for trimming trailing whitespace on a model and ignore lines on which cursors are sitting.
 */
export declare function trimTrailingWhitespace(model: ITextModel, cursors: Position[]): ISingleEditOperation[];
