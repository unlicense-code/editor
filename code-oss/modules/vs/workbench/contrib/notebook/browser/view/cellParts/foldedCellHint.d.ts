import { INotebookEditor } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { CellContentPart } from 'vs/workbench/contrib/notebook/browser/view/cellPart';
import { MarkupCellViewModel } from 'vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel';
export declare class FoldedCellHint extends CellContentPart {
    private readonly _notebookEditor;
    private readonly _container;
    constructor(_notebookEditor: INotebookEditor, _container: HTMLElement);
    didRenderCell(element: MarkupCellViewModel): void;
    private update;
    private getHiddenCellsLabel;
    private getHiddenCellHintButton;
    updateInternalLayoutNow(element: MarkupCellViewModel): void;
}
