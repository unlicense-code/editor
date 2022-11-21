import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { NotebookCellTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookCellTextModel';
import { INotebookTextModel, IOutputDto, IOutputItemDto } from 'vs/workbench/contrib/notebook/common/notebookCommon';
export declare enum CellExecutionUpdateType {
    Output = 1,
    OutputItems = 2,
    ExecutionState = 3
}
export interface ICellExecuteOutputEdit {
    editType: CellExecutionUpdateType.Output;
    cellHandle: number;
    append?: boolean;
    outputs: IOutputDto[];
}
export interface ICellExecuteOutputItemEdit {
    editType: CellExecutionUpdateType.OutputItems;
    append?: boolean;
    outputId: string;
    items: IOutputItemDto[];
}
export declare const INotebookExecutionService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<INotebookExecutionService>;
export interface INotebookExecutionService {
    _serviceBrand: undefined;
    executeNotebookCells(notebook: INotebookTextModel, cells: Iterable<NotebookCellTextModel>, contextKeyService: IContextKeyService): Promise<void>;
    cancelNotebookCells(notebook: INotebookTextModel, cells: Iterable<NotebookCellTextModel>): Promise<void>;
    cancelNotebookCellHandles(notebook: INotebookTextModel, cells: Iterable<number>): Promise<void>;
}
