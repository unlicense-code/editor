import { Event } from 'vs/base/common/event';
import { IMenuService, MenuId } from 'vs/platform/actions/common/actions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ICellViewModel, INotebookEditorDelegate } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { CellOverlayPart } from 'vs/workbench/contrib/notebook/browser/view/cellPart';
export declare class BetweenCellToolbar extends CellOverlayPart {
    private readonly _notebookEditor;
    private readonly _bottomCellToolbarContainer;
    private readonly instantiationService;
    private readonly contextMenuService;
    private readonly contextKeyService;
    private readonly menuService;
    private _betweenCellToolbar;
    constructor(_notebookEditor: INotebookEditorDelegate, _titleToolbarContainer: HTMLElement, _bottomCellToolbarContainer: HTMLElement, instantiationService: IInstantiationService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, menuService: IMenuService);
    private _initialize;
    protected didRenderCell(element: ICellViewModel): void;
    updateInternalLayoutNow(element: ICellViewModel): void;
}
export interface ICssClassDelegate {
    toggle: (className: string, force?: boolean) => void;
}
export declare class CellTitleToolbarPart extends CellOverlayPart {
    private readonly toolbarContainer;
    private readonly _rootClassDelegate;
    private readonly toolbarId;
    private readonly deleteToolbarId;
    private readonly _notebookEditor;
    private readonly contextKeyService;
    private readonly menuService;
    private readonly instantiationService;
    private _model;
    private _view;
    private readonly _onDidUpdateActions;
    readonly onDidUpdateActions: Event<void>;
    get hasActions(): boolean;
    constructor(toolbarContainer: HTMLElement, _rootClassDelegate: ICssClassDelegate, toolbarId: MenuId, deleteToolbarId: MenuId, _notebookEditor: INotebookEditorDelegate, contextKeyService: IContextKeyService, menuService: IMenuService, instantiationService: IInstantiationService);
    private _initializeModel;
    private _initialize;
    prepareRenderCell(element: ICellViewModel): void;
    didRenderCell(element: ICellViewModel): void;
    private updateContext;
    private setupChangeListeners;
    private updateActions;
}
