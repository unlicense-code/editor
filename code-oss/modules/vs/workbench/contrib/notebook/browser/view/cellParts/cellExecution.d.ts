import { ICellViewModel, INotebookEditorDelegate } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { CellViewModelStateChangeEvent } from 'vs/workbench/contrib/notebook/browser/notebookViewEvents';
import { CellContentPart } from 'vs/workbench/contrib/notebook/browser/view/cellPart';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
export declare class CellExecutionPart extends CellContentPart {
    private readonly _notebookEditor;
    private readonly _executionOrderLabel;
    private readonly _notebookExecutionStateService;
    private kernelDisposables;
    constructor(_notebookEditor: INotebookEditorDelegate, _executionOrderLabel: HTMLElement, _notebookExecutionStateService: INotebookExecutionStateService);
    protected didRenderCell(element: ICellViewModel): void;
    private updateExecutionOrder;
    updateState(element: ICellViewModel, e: CellViewModelStateChangeEvent): void;
    updateInternalLayoutNow(element: ICellViewModel): void;
}
