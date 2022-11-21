import { Selection } from 'vs/editor/common/core/selection';
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from 'vs/editor/common/editorCommon';
import { ITextModel } from 'vs/editor/common/model';
export declare class SortLinesCommand implements ICommand {
    private static _COLLATOR;
    static getCollator(): Intl.Collator;
    private readonly selection;
    private readonly descending;
    private selectionId;
    constructor(selection: Selection, descending: boolean);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
    static canRun(model: ITextModel | null, selection: Selection, descending: boolean): boolean;
}
