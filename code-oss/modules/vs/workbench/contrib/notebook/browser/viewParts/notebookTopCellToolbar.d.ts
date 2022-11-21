import { Disposable } from 'vs/base/common/lifecycle';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { INotebookEditorDelegate } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
export declare class ListTopCellToolbar extends Disposable {
    protected readonly notebookEditor: INotebookEditorDelegate;
    protected readonly instantiationService: IInstantiationService;
    protected readonly contextMenuService: IContextMenuService;
    protected readonly menuService: IMenuService;
    private topCellToolbar;
    private toolbar;
    private readonly _modelDisposables;
    constructor(notebookEditor: INotebookEditorDelegate, contextKeyService: IContextKeyService, insertionIndicatorContainer: HTMLElement, instantiationService: IInstantiationService, contextMenuService: IContextMenuService, menuService: IMenuService);
    private updateClass;
}
