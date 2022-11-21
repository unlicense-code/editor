import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { ICellExecutionStateChangedEvent, INotebookCellExecution, INotebookExecutionStateService, INotebookFailStateChangedEvent } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
import { INotebookService } from 'vs/workbench/contrib/notebook/common/notebookService';
export declare class NotebookExecutionStateService extends Disposable implements INotebookExecutionStateService {
    private readonly _instantiationService;
    private readonly _logService;
    private readonly _notebookService;
    _serviceBrand: undefined;
    private readonly _executions;
    private readonly _notebookListeners;
    private readonly _cellListeners;
    private readonly _lastFailedCells;
    private readonly _onDidChangeCellExecution;
    onDidChangeCellExecution: import("vs/base/common/event").Event<ICellExecutionStateChangedEvent>;
    private readonly _onDidChangeLastRunFailState;
    onDidChangeLastRunFailState: import("vs/base/common/event").Event<INotebookFailStateChangedEvent>;
    constructor(_instantiationService: IInstantiationService, _logService: ILogService, _notebookService: INotebookService);
    getLastFailedCellForNotebook(notebook: URI): number | undefined;
    forceCancelNotebookExecutions(notebookUri: URI): void;
    getCellExecution(cellUri: URI): INotebookCellExecution | undefined;
    getCellExecutionsForNotebook(notebook: URI): INotebookCellExecution[];
    getCellExecutionsByHandleForNotebook(notebook: URI): Map<number, INotebookCellExecution> | undefined;
    private _onCellExecutionDidChange;
    private _onCellExecutionDidComplete;
    createCellExecution(notebookUri: URI, cellHandle: number): INotebookCellExecution;
    private _createNotebookCellExecution;
    private _setLastFailedCell;
    private _setLastFailedCellVisibility;
    private _clearLastFailedCell;
    private _getFailedCellListener;
    dispose(): void;
}