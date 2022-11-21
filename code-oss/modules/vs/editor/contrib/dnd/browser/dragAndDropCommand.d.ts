import { Position } from 'vs/editor/common/core/position';
import { Selection } from 'vs/editor/common/core/selection';
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from 'vs/editor/common/editorCommon';
import { ITextModel } from 'vs/editor/common/model';
export declare class DragAndDropCommand implements ICommand {
    private readonly selection;
    private readonly targetPosition;
    private targetSelection;
    private readonly copy;
    constructor(selection: Selection, targetPosition: Position, copy: boolean);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
