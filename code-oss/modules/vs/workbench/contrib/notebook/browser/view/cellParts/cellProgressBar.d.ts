import { ICellViewModel } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { CellViewModelStateChangeEvent } from 'vs/workbench/contrib/notebook/browser/notebookViewEvents';
import { CellContentPart } from 'vs/workbench/contrib/notebook/browser/view/cellPart';
import { ICellExecutionStateChangedEvent, INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
export declare class CellProgressBar extends CellContentPart {
    private readonly _notebookExecutionStateService;
    private readonly _progressBar;
    private readonly _collapsedProgressBar;
    constructor(editorContainer: HTMLElement, collapsedInputContainer: HTMLElement, _notebookExecutionStateService: INotebookExecutionStateService);
    didRenderCell(element: ICellViewModel): void;
    updateForExecutionState(element: ICellViewModel, e: ICellExecutionStateChangedEvent): void;
    updateState(element: ICellViewModel, e: CellViewModelStateChangeEvent): void;
    private _updateForExecutionState;
}
