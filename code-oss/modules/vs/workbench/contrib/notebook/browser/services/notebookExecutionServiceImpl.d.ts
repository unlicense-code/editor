import { IDisposable } from 'vs/base/common/lifecycle';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { ILogService } from 'vs/platform/log/common/log';
import { IWorkspaceTrustRequestService } from 'vs/platform/workspace/common/workspaceTrust';
import { NotebookCellTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookCellTextModel';
import { INotebookTextModel } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { INotebookExecutionService } from 'vs/workbench/contrib/notebook/common/notebookExecutionService';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
import { INotebookKernelService } from 'vs/workbench/contrib/notebook/common/notebookKernelService';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
export declare class NotebookExecutionService implements INotebookExecutionService, IDisposable {
    private readonly _commandService;
    private readonly _notebookKernelService;
    private readonly _workspaceTrustRequestService;
    private readonly _logService;
    private readonly _notebookExecutionStateService;
    _serviceBrand: undefined;
    private _activeProxyKernelExecutionToken;
    constructor(_commandService: ICommandService, _notebookKernelService: INotebookKernelService, _workspaceTrustRequestService: IWorkspaceTrustRequestService, _logService: ILogService, _notebookExecutionStateService: INotebookExecutionStateService);
    executeNotebookCells(notebook: INotebookTextModel, cells: Iterable<NotebookCellTextModel>, contextKeyService: IContextKeyService): Promise<void>;
    private resolveKernelFromKernelPicker;
    private resolveSourceActions;
    cancelNotebookCellHandles(notebook: INotebookTextModel, cells: Iterable<number>): Promise<void>;
    cancelNotebookCells(notebook: INotebookTextModel, cells: Iterable<NotebookCellTextModel>): Promise<void>;
    dispose(): void;
}
