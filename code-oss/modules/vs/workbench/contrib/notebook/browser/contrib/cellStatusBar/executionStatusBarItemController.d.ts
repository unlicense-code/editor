import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ICellViewModel, INotebookEditor, INotebookEditorContribution, INotebookViewModel } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
export declare function formatCellDuration(duration: number): string;
export declare class NotebookStatusBarController extends Disposable {
    private readonly _notebookEditor;
    private readonly _itemFactory;
    private readonly _visibleCells;
    private readonly _observer;
    constructor(_notebookEditor: INotebookEditor, _itemFactory: (vm: INotebookViewModel, cell: ICellViewModel) => IDisposable);
    private _updateEverything;
    private _updateVisibleCells;
    dispose(): void;
}
export declare class ExecutionStateCellStatusBarContrib extends Disposable implements INotebookEditorContribution {
    static id: string;
    constructor(notebookEditor: INotebookEditor, instantiationService: IInstantiationService);
}
export declare class TimerCellStatusBarContrib extends Disposable implements INotebookEditorContribution {
    static id: string;
    constructor(notebookEditor: INotebookEditor, instantiationService: IInstantiationService);
}
