import { Range } from 'vs/editor/common/core/range';
import { Selection } from 'vs/editor/common/core/selection';
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from 'vs/editor/common/editorCommon';
import { ITextModel } from 'vs/editor/common/model';
export declare class ReplaceAllCommand implements ICommand {
    private readonly _editorSelection;
    private _trackedEditorSelectionId;
    private readonly _ranges;
    private readonly _replaceStrings;
    constructor(editorSelection: Selection, ranges: Range[], replaceStrings: string[]);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
