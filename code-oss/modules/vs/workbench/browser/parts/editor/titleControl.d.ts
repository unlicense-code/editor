import 'vs/css!./media/titlecontrol';
import { Dimension } from 'vs/base/browser/dom';
import { IAction, ActionRunner } from 'vs/base/common/actions';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IThemeService, Themable } from 'vs/platform/theme/common/themeService';
import { DraggedEditorGroupIdentifier, DraggedEditorIdentifier, DraggedTreeItemsIdentifier, LocalSelectionTransfer } from 'vs/workbench/browser/dnd';
import { BreadcrumbsControl, IBreadcrumbsControlOptions } from 'vs/workbench/browser/parts/editor/breadcrumbsControl';
import { IEditorGroupsAccessor, IEditorGroupTitleHeight, IEditorGroupView } from 'vs/workbench/browser/parts/editor/editor';
import { IEditorCommandsContext, IEditorPartOptions } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { IFileService } from 'vs/platform/files/common/files';
export interface IToolbarActions {
    primary: IAction[];
    secondary: IAction[];
}
export interface ITitleControlDimensions {
    /**
     * The size of the parent container the title control is layed out in.
     */
    container: Dimension;
    /**
     * The maximum size the title control is allowed to consume based on
     * other controls that are positioned inside the container.
     */
    available: Dimension;
}
export declare class EditorCommandsContextActionRunner extends ActionRunner {
    private context;
    constructor(context: IEditorCommandsContext);
    run(action: IAction, context?: {
        preserveFocus?: boolean;
    }): Promise<void>;
}
export declare abstract class TitleControl extends Themable {
    protected accessor: IEditorGroupsAccessor;
    protected group: IEditorGroupView;
    private readonly contextMenuService;
    protected instantiationService: IInstantiationService;
    private readonly contextKeyService;
    private readonly keybindingService;
    private readonly notificationService;
    private readonly menuService;
    protected quickInputService: IQuickInputService;
    protected configurationService: IConfigurationService;
    private readonly fileService;
    protected readonly editorTransfer: LocalSelectionTransfer<DraggedEditorIdentifier>;
    protected readonly groupTransfer: LocalSelectionTransfer<DraggedEditorGroupIdentifier>;
    protected readonly treeItemsTransfer: LocalSelectionTransfer<DraggedTreeItemsIdentifier>;
    protected breadcrumbsControl: BreadcrumbsControl | undefined;
    private editorActionsToolbar;
    private resourceContext;
    private editorPinnedContext;
    private editorIsFirstContext;
    private editorIsLastContext;
    private editorStickyContext;
    private editorCanSplitInGroupContext;
    private sideBySideEditorContext;
    private groupLockedContext;
    private readonly editorToolBarMenuDisposables;
    private renderDropdownAsChildElement;
    constructor(parent: HTMLElement, accessor: IEditorGroupsAccessor, group: IEditorGroupView, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService, notificationService: INotificationService, menuService: IMenuService, quickInputService: IQuickInputService, themeService: IThemeService, configurationService: IConfigurationService, fileService: IFileService);
    protected abstract create(parent: HTMLElement): void;
    protected createBreadcrumbsControl(container: HTMLElement, options: IBreadcrumbsControlOptions): void;
    protected abstract handleBreadcrumbsEnablementChange(): void;
    protected createEditorActionsToolBar(container: HTMLElement): void;
    private actionViewItemProvider;
    protected updateEditorActionsToolbar(): void;
    protected abstract prepareEditorActions(editorActions: IToolbarActions): IToolbarActions;
    private getEditorActions;
    private getEditorPaneAwareContextKeyService;
    protected clearEditorActionsToolbar(): void;
    protected enableGroupDragging(element: HTMLElement): void;
    protected doFillResourceDataTransfers(editors: readonly EditorInput[], e: DragEvent): boolean;
    protected onContextMenu(editor: EditorInput, e: Event, node: HTMLElement): void;
    private getKeybinding;
    protected getKeybindingLabel(action: IAction): string | undefined;
    abstract openEditor(editor: EditorInput): void;
    abstract openEditors(editors: EditorInput[]): void;
    abstract closeEditor(editor: EditorInput, index: number | undefined): void;
    abstract closeEditors(editors: EditorInput[]): void;
    abstract moveEditor(editor: EditorInput, fromIndex: number, targetIndex: number): void;
    abstract pinEditor(editor: EditorInput): void;
    abstract stickEditor(editor: EditorInput): void;
    abstract unstickEditor(editor: EditorInput): void;
    abstract setActive(isActive: boolean): void;
    abstract updateEditorLabel(editor: EditorInput): void;
    abstract updateEditorDirty(editor: EditorInput): void;
    abstract updateOptions(oldOptions: IEditorPartOptions, newOptions: IEditorPartOptions): void;
    abstract layout(dimensions: ITitleControlDimensions): Dimension;
    abstract getHeight(): IEditorGroupTitleHeight;
    dispose(): void;
}
