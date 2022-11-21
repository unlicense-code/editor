import { Position } from 'vs/editor/common/core/position';
import { Selection } from 'vs/editor/common/core/selection';
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from 'vs/editor/common/editorCommon';
import { ITextModel } from 'vs/editor/common/model';
export declare class SurroundSelectionCommand implements ICommand {
    private readonly _range;
    private readonly _charBeforeSelection;
    private readonly _charAfterSelection;
    constructor(range: Selection, charBeforeSelection: string, charAfterSelection: string);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
/**
 * A surround selection command that runs after composition finished.
 */
export declare class CompositionSurroundSelectionCommand implements ICommand {
    private readonly _position;
    private readonly _text;
    private readonly _charAfter;
    constructor(_position: Position, _text: string, _charAfter: string);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
