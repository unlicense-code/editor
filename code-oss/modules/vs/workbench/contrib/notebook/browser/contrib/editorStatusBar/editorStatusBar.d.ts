import { Disposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { INotebookKernelService } from 'vs/workbench/contrib/notebook/common/notebookKernelService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
export declare class KernelStatus extends Disposable implements IWorkbenchContribution {
    private readonly _editorService;
    private readonly _statusbarService;
    private readonly _notebookKernelService;
    private readonly _instantiationService;
    private readonly _editorDisposables;
    private readonly _kernelInfoElement;
    constructor(_editorService: IEditorService, _statusbarService: IStatusbarService, _notebookKernelService: INotebookKernelService, _instantiationService: IInstantiationService);
    private _updateStatusbar;
    private _showKernelStatus;
}
export declare class ActiveCellStatus extends Disposable implements IWorkbenchContribution {
    private readonly _editorService;
    private readonly _statusbarService;
    private readonly _itemDisposables;
    private readonly _accessor;
    constructor(_editorService: IEditorService, _statusbarService: IStatusbarService);
    private _update;
    private _show;
    private _getSelectionsText;
}
