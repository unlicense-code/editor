import { Disposable } from 'vs/base/common/lifecycle';
import { INotebookEditor, INotebookEditorContribution } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { INotebookCellStatusBarService } from 'vs/workbench/contrib/notebook/common/notebookCellStatusBarService';
export declare class ContributedStatusBarItemController extends Disposable implements INotebookEditorContribution {
    private readonly _notebookEditor;
    private readonly _notebookCellStatusBarService;
    static id: string;
    private readonly _visibleCells;
    private readonly _observer;
    constructor(_notebookEditor: INotebookEditor, _notebookCellStatusBarService: INotebookCellStatusBarService);
    private _updateEverything;
    private _updateVisibleCells;
    dispose(): void;
}
