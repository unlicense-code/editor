import { IAction } from 'vs/base/common/actions';
import { IMenu, IMenuService } from 'vs/platform/actions/common/actions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ICellViewModel, INotebookEditorDelegate } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { CellContentPart } from 'vs/workbench/contrib/notebook/browser/view/cellPart';
export declare class RunToolbar extends CellContentPart {
    readonly notebookEditor: INotebookEditorDelegate;
    readonly contextKeyService: IContextKeyService;
    readonly cellContainer: HTMLElement;
    readonly runButtonContainer: HTMLElement;
    readonly menuService: IMenuService;
    readonly keybindingService: IKeybindingService;
    readonly contextMenuService: IContextMenuService;
    readonly instantiationService: IInstantiationService;
    private toolbar;
    private primaryMenu;
    private secondaryMenu;
    constructor(notebookEditor: INotebookEditorDelegate, contextKeyService: IContextKeyService, cellContainer: HTMLElement, runButtonContainer: HTMLElement, menuService: IMenuService, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService);
    didRenderCell(element: ICellViewModel): void;
    getCellToolbarActions(menu: IMenu): {
        primary: IAction[];
        secondary: IAction[];
    };
    private createRunCellToolbar;
}
export declare function getCodeCellExecutionContextKeyService(contextKeyService: IContextKeyService): IContextKeyService;
