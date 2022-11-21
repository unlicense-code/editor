import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { NotebookCellExecutionState } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { CellExecutionUpdateType, ICellExecuteOutputEdit, ICellExecuteOutputItemEdit } from 'vs/workbench/contrib/notebook/common/notebookExecutionService';
export declare type ICellExecuteUpdate = ICellExecuteOutputEdit | ICellExecuteOutputItemEdit | ICellExecutionStateUpdate;
export interface ICellExecutionStateUpdate {
    editType: CellExecutionUpdateType.ExecutionState;
    executionOrder?: number;
    runStartTime?: number;
    didPause?: boolean;
    isPaused?: boolean;
}
export interface ICellExecutionComplete {
    runEndTime?: number;
    lastRunSuccess?: boolean;
}
export interface ICellExecutionStateChangedEvent {
    notebook: URI;
    cellHandle: number;
    changed?: INotebookCellExecution;
    affectsCell(cell: URI): boolean;
    affectsNotebook(notebook: URI): boolean;
}
export interface INotebookFailStateChangedEvent {
    visible: boolean;
    notebook: URI;
}
export interface IFailedCellInfo {
    cellHandle: number;
    disposable: IDisposable;
    visible: boolean;
}
export declare const INotebookExecutionStateService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<INotebookExecutionStateService>;
export interface INotebookExecutionStateService {
    _serviceBrand: undefined;
    onDidChangeCellExecution: Event<ICellExecutionStateChangedEvent>;
    onDidChangeLastRunFailState: Event<INotebookFailStateChangedEvent>;
    forceCancelNotebookExecutions(notebookUri: URI): void;
    getCellExecutionsForNotebook(notebook: URI): INotebookCellExecution[];
    getCellExecutionsByHandleForNotebook(notebook: URI): Map<number, INotebookCellExecution> | undefined;
    getCellExecution(cellUri: URI): INotebookCellExecution | undefined;
    createCellExecution(notebook: URI, cellHandle: number): INotebookCellExecution;
    getLastFailedCellForNotebook(notebook: URI): number | undefined;
}
export interface INotebookCellExecution {
    readonly notebook: URI;
    readonly cellHandle: number;
    readonly state: NotebookCellExecutionState;
    readonly didPause: boolean;
    readonly isPaused: boolean;
    confirm(): void;
    update(updates: ICellExecuteUpdate[]): void;
    complete(complete: ICellExecutionComplete): void;
}
