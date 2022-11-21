import 'vs/css!./notebookDiff';
import { IListMouseEvent, IListRenderer, IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { IListOptions, IListStyles, IStyleController, MouseController } from 'vs/base/browser/ui/list/listWidget';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IListService, IWorkbenchListOptions, WorkbenchList } from 'vs/platform/list/browser/listService';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { DiffElementViewModelBase, SideBySideDiffElementViewModel, SingleSideDiffElementViewModel } from 'vs/workbench/contrib/notebook/browser/diff/diffElementViewModel';
import { CellDiffSideBySideRenderTemplate, CellDiffSingleSideRenderTemplate, INotebookTextDiffEditor } from 'vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IMouseWheelEvent } from 'vs/base/browser/mouseEvent';
export declare class NotebookCellTextDiffListDelegate implements IListVirtualDelegate<DiffElementViewModelBase> {
    readonly configurationService: IConfigurationService;
    private readonly lineHeight;
    constructor(configurationService: IConfigurationService);
    getHeight(element: DiffElementViewModelBase): number;
    hasDynamicHeight(element: DiffElementViewModelBase): boolean;
    getTemplateId(element: DiffElementViewModelBase): string;
}
export declare class CellDiffSingleSideRenderer implements IListRenderer<SingleSideDiffElementViewModel, CellDiffSingleSideRenderTemplate | CellDiffSideBySideRenderTemplate> {
    readonly notebookEditor: INotebookTextDiffEditor;
    protected readonly instantiationService: IInstantiationService;
    static readonly TEMPLATE_ID = "cell_diff_single";
    constructor(notebookEditor: INotebookTextDiffEditor, instantiationService: IInstantiationService);
    get templateId(): string;
    renderTemplate(container: HTMLElement): CellDiffSingleSideRenderTemplate;
    private _buildSourceEditor;
    renderElement(element: SingleSideDiffElementViewModel, index: number, templateData: CellDiffSingleSideRenderTemplate, height: number | undefined): void;
    disposeTemplate(templateData: CellDiffSingleSideRenderTemplate): void;
    disposeElement(element: SingleSideDiffElementViewModel, index: number, templateData: CellDiffSingleSideRenderTemplate): void;
}
export declare class CellDiffSideBySideRenderer implements IListRenderer<SideBySideDiffElementViewModel, CellDiffSideBySideRenderTemplate> {
    readonly notebookEditor: INotebookTextDiffEditor;
    protected readonly instantiationService: IInstantiationService;
    protected readonly contextMenuService: IContextMenuService;
    protected readonly keybindingService: IKeybindingService;
    protected readonly menuService: IMenuService;
    protected readonly contextKeyService: IContextKeyService;
    protected readonly notificationService: INotificationService;
    protected readonly themeService: IThemeService;
    static readonly TEMPLATE_ID = "cell_diff_side_by_side";
    constructor(notebookEditor: INotebookTextDiffEditor, instantiationService: IInstantiationService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, menuService: IMenuService, contextKeyService: IContextKeyService, notificationService: INotificationService, themeService: IThemeService);
    get templateId(): string;
    renderTemplate(container: HTMLElement): CellDiffSideBySideRenderTemplate;
    private _buildSourceEditor;
    renderElement(element: SideBySideDiffElementViewModel, index: number, templateData: CellDiffSideBySideRenderTemplate, height: number | undefined): void;
    disposeTemplate(templateData: CellDiffSideBySideRenderTemplate): void;
    disposeElement(element: SideBySideDiffElementViewModel, index: number, templateData: CellDiffSideBySideRenderTemplate): void;
}
export declare class NotebookMouseController<T> extends MouseController<T> {
    protected onViewPointer(e: IListMouseEvent<T>): void;
}
export declare class NotebookTextDiffList extends WorkbenchList<DiffElementViewModelBase> implements IDisposable, IStyleController {
    private styleElement?;
    get rowsContainer(): HTMLElement;
    constructor(listUser: string, container: HTMLElement, delegate: IListVirtualDelegate<DiffElementViewModelBase>, renderers: IListRenderer<DiffElementViewModelBase, CellDiffSingleSideRenderTemplate | CellDiffSideBySideRenderTemplate>[], contextKeyService: IContextKeyService, options: IWorkbenchListOptions<DiffElementViewModelBase>, listService: IListService, themeService: IThemeService, configurationService: IConfigurationService, instantiationService: IInstantiationService);
    protected createMouseController(options: IListOptions<DiffElementViewModelBase>): MouseController<DiffElementViewModelBase>;
    getAbsoluteTopOfElement(element: DiffElementViewModelBase): number;
    getScrollHeight(): number;
    triggerScrollFromMouseWheelEvent(browserEvent: IMouseWheelEvent): void;
    delegateVerticalScrollbarPointerDown(browserEvent: PointerEvent): void;
    clear(): void;
    updateElementHeight2(element: DiffElementViewModelBase, size: number): void;
    style(styles: IListStyles): void;
}
