import { Disposable } from 'vs/base/common/lifecycle';
import { ICellViewModel, INotebookEditor } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
export interface ICellVisibilityChangeEvent {
    added: ICellViewModel[];
    removed: ICellViewModel[];
}
export declare class NotebookVisibleCellObserver extends Disposable {
    private readonly _notebookEditor;
    private readonly _onDidChangeVisibleCells;
    readonly onDidChangeVisibleCells: import("vs/base/common/event").Event<ICellVisibilityChangeEvent>;
    private readonly _viewModelDisposables;
    private _visibleCells;
    get visibleCells(): ICellViewModel[];
    constructor(_notebookEditor: INotebookEditor);
    private _onModelChange;
    protected updateEverything(): void;
    private _updateVisibleCells;
}
