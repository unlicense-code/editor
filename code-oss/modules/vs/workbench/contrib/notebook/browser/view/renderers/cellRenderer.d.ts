import { IListRenderer, IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ICellViewModel, INotebookEditorDelegate } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { CellDragAndDropController } from 'vs/workbench/contrib/notebook/browser/view/cellParts/cellDnd';
import { CellEditorOptions } from 'vs/workbench/contrib/notebook/browser/view/cellParts/cellEditorOptions';
import { CodeCellRenderTemplate, MarkdownCellRenderTemplate } from 'vs/workbench/contrib/notebook/browser/view/notebookRenderingCommon';
import { CodeCellViewModel } from 'vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel';
import { MarkupCellViewModel } from 'vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel';
import { CellViewModel } from 'vs/workbench/contrib/notebook/browser/viewModel/notebookViewModelImpl';
export declare class NotebookCellListDelegate extends Disposable implements IListVirtualDelegate<CellViewModel> {
    private readonly configurationService;
    private readonly lineHeight;
    constructor(configurationService: IConfigurationService);
    getHeight(element: CellViewModel): number;
    hasDynamicHeight(element: CellViewModel): boolean;
    getDynamicHeight(element: CellViewModel): number | null;
    getTemplateId(element: CellViewModel): string;
}
declare abstract class AbstractCellRenderer {
    protected readonly instantiationService: IInstantiationService;
    protected readonly notebookEditor: INotebookEditorDelegate;
    protected readonly contextMenuService: IContextMenuService;
    protected readonly menuService: IMenuService;
    protected readonly keybindingService: IKeybindingService;
    protected readonly notificationService: INotificationService;
    protected readonly contextKeyServiceProvider: (container: HTMLElement) => IContextKeyService;
    protected dndController: CellDragAndDropController | undefined;
    protected readonly editorOptions: CellEditorOptions;
    constructor(instantiationService: IInstantiationService, notebookEditor: INotebookEditorDelegate, contextMenuService: IContextMenuService, menuService: IMenuService, configurationService: IConfigurationService, keybindingService: IKeybindingService, notificationService: INotificationService, contextKeyServiceProvider: (container: HTMLElement) => IContextKeyService, language: string, dndController: CellDragAndDropController | undefined);
    dispose(): void;
}
export declare class MarkupCellRenderer extends AbstractCellRenderer implements IListRenderer<MarkupCellViewModel, MarkdownCellRenderTemplate> {
    private renderedEditors;
    static readonly TEMPLATE_ID = "markdown_cell";
    constructor(notebookEditor: INotebookEditorDelegate, dndController: CellDragAndDropController, renderedEditors: Map<ICellViewModel, ICodeEditor>, contextKeyServiceProvider: (container: HTMLElement) => IContextKeyService, configurationService: IConfigurationService, instantiationService: IInstantiationService, contextMenuService: IContextMenuService, menuService: IMenuService, keybindingService: IKeybindingService, notificationService: INotificationService);
    get templateId(): string;
    renderTemplate(rootContainer: HTMLElement): MarkdownCellRenderTemplate;
    renderElement(element: MarkupCellViewModel, index: number, templateData: MarkdownCellRenderTemplate, height: number | undefined): void;
    disposeTemplate(templateData: MarkdownCellRenderTemplate): void;
    disposeElement(_element: ICellViewModel, _index: number, templateData: MarkdownCellRenderTemplate): void;
}
export declare class CodeCellRenderer extends AbstractCellRenderer implements IListRenderer<CodeCellViewModel, CodeCellRenderTemplate> {
    private renderedEditors;
    static readonly TEMPLATE_ID = "code_cell";
    constructor(notebookEditor: INotebookEditorDelegate, renderedEditors: Map<ICellViewModel, ICodeEditor>, dndController: CellDragAndDropController, contextKeyServiceProvider: (container: HTMLElement) => IContextKeyService, configurationService: IConfigurationService, contextMenuService: IContextMenuService, menuService: IMenuService, instantiationService: IInstantiationService, keybindingService: IKeybindingService, notificationService: INotificationService);
    get templateId(): string;
    renderTemplate(rootContainer: HTMLElement): CodeCellRenderTemplate;
    renderElement(element: CodeCellViewModel, index: number, templateData: CodeCellRenderTemplate, height: number | undefined): void;
    disposeTemplate(templateData: CodeCellRenderTemplate): void;
    disposeElement(element: ICellViewModel, index: number, templateData: CodeCellRenderTemplate, height: number | undefined): void;
}
export {};
