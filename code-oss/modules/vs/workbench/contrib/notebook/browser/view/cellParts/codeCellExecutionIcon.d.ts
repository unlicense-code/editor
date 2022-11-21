import { Disposable } from 'vs/base/common/lifecycle';
import { ICellViewModel, INotebookEditorDelegate } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
export declare class CollapsedCodeCellExecutionIcon extends Disposable {
    private readonly _cell;
    private readonly _element;
    private _executionStateService;
    private _visible;
    constructor(_notebookEditor: INotebookEditorDelegate, _cell: ICellViewModel, _element: HTMLElement, _executionStateService: INotebookExecutionStateService);
    setVisibility(visible: boolean): void;
    private _update;
    private _getItemForState;
}
