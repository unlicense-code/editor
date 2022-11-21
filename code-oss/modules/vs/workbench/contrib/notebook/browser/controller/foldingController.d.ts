import { Disposable } from 'vs/base/common/lifecycle';
import { INotebookEditor, INotebookEditorMouseEvent, INotebookEditorContribution, CellFoldingState } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { ICellRange } from 'vs/workbench/contrib/notebook/common/notebookRange';
export declare class FoldingController extends Disposable implements INotebookEditorContribution {
    private readonly _notebookEditor;
    static id: string;
    private _foldingModel;
    private readonly _localStore;
    constructor(_notebookEditor: INotebookEditor);
    saveViewState(): ICellRange[];
    restoreViewState(state: ICellRange[] | undefined): void;
    setFoldingStateDown(index: number, state: CellFoldingState, levels: number): void;
    setFoldingStateUp(index: number, state: CellFoldingState, levels: number): void;
    private _updateEditorFoldingRanges;
    onMouseUp(e: INotebookEditorMouseEvent): void;
}
