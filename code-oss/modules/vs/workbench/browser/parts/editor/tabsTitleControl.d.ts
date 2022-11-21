import 'vs/css!./media/tabstitlecontrol';
import { IEditorPartOptions } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { ITitleControlDimensions, IToolbarActions, TitleControl } from 'vs/workbench/browser/parts/editor/titleControl';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { Dimension } from 'vs/base/browser/dom';
import { IEditorGroupsAccessor, IEditorGroupView, EditorServiceImpl, IEditorGroupTitleHeight } from 'vs/workbench/browser/parts/editor/editor';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IFileService } from 'vs/platform/files/common/files';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { ITreeViewsService } from 'vs/workbench/services/views/browser/treeViewsService';
interface ITabsTitleControlLayoutOptions {
    /**
     * Whether to force revealing the active tab, even when
     * the dimensions have not changed. This can be the case
     * when a tab was made active and needs to be revealed.
     */
    forceRevealActiveTab?: true;
}
export declare class TabsTitleControl extends TitleControl {
    private readonly editorService;
    private readonly pathService;
    private readonly editorGroupService;
    private readonly treeViewsDragAndDropService;
    private static readonly SCROLLBAR_SIZES;
    private static readonly TAB_WIDTH;
    private static readonly TAB_HEIGHT;
    private static readonly DRAG_OVER_OPEN_TAB_THRESHOLD;
    private static readonly MOUSE_WHEEL_EVENT_THRESHOLD;
    private static readonly MOUSE_WHEEL_DISTANCE_THRESHOLD;
    private titleContainer;
    private tabsAndActionsContainer;
    private tabsContainer;
    private editorToolbarContainer;
    private tabsScrollbar;
    private readonly closeEditorAction;
    private readonly unpinEditorAction;
    private readonly tabResourceLabels;
    private tabLabels;
    private tabActionBars;
    private tabDisposables;
    private dimensions;
    private readonly layoutScheduler;
    private blockRevealActiveTab;
    private path;
    private lastMouseWheelEventTime;
    constructor(parent: HTMLElement, accessor: IEditorGroupsAccessor, group: IEditorGroupView, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService, notificationService: INotificationService, menuService: IMenuService, quickInputService: IQuickInputService, themeService: IThemeService, configurationService: IConfigurationService, fileService: IFileService, editorService: EditorServiceImpl, pathService: IPathService, editorGroupService: IEditorGroupsService, treeViewsDragAndDropService: ITreeViewsService);
    protected create(parent: HTMLElement): void;
    private createTabsScrollbar;
    private updateTabsScrollbarSizing;
    private getTabsScrollbarSizing;
    private registerTabsContainerListeners;
    private doHandleDecorationsChange;
    protected updateEditorActionsToolbar(): void;
    openEditor(editor: EditorInput): void;
    openEditors(editors: EditorInput[]): void;
    private handleOpenedEditors;
    closeEditor(editor: EditorInput, index: number | undefined): void;
    closeEditors(editors: EditorInput[]): void;
    private handleClosedEditors;
    moveEditor(editor: EditorInput, fromIndex: number, targetIndex: number): void;
    pinEditor(editor: EditorInput): void;
    stickEditor(editor: EditorInput): void;
    unstickEditor(editor: EditorInput): void;
    private doHandleStickyEditorChange;
    setActive(isGroupActive: boolean): void;
    private updateEditorLabelScheduler;
    updateEditorLabel(editor: EditorInput): void;
    private doUpdateEditorLabels;
    updateEditorDirty(editor: EditorInput): void;
    updateOptions(oldOptions: IEditorPartOptions, newOptions: IEditorPartOptions): void;
    updateStyles(): void;
    private forEachTab;
    private withTab;
    private doWithTab;
    private createTab;
    private registerTabListeners;
    private isSupportedDropTransfer;
    private updateDropFeedback;
    private computeTabLabels;
    private shortenTabLabels;
    private getLabelConfigFlags;
    private redraw;
    private redrawTab;
    private redrawTabLabel;
    private redrawTabActiveAndDirty;
    private doRedrawTabActive;
    private doRedrawTabDirty;
    private redrawTabBorders;
    protected prepareEditorActions(editorActions: IToolbarActions): IToolbarActions;
    getHeight(): IEditorGroupTitleHeight;
    private computeHeight;
    layout(dimensions: ITitleControlDimensions, options?: ITabsTitleControlLayoutOptions): Dimension;
    private doLayout;
    protected handleBreadcrumbsEnablementChange(): void;
    private doLayoutBreadcrumbs;
    private doLayoutTabs;
    private doLayoutTabsWrapping;
    private doLayoutTabsNonWrapping;
    private getTabAndIndex;
    private getTabAtIndex;
    private getLastTab;
    private blockRevealActiveTabOnce;
    private originatesFromTabActionBar;
    private onDrop;
    private isMoveOperation;
    dispose(): void;
}
export {};
