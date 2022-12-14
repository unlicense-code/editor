import { IDragAndDropData } from 'vs/base/browser/dnd';
import { ITreeDragAndDrop, ITreeDragOverReaction } from 'vs/base/browser/ui/tree/tree';
import { ActionRunner, IAction } from 'vs/base/common/actions';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import 'vs/css!./media/views';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ILabelService } from 'vs/platform/label/common/label';
import { ILogService } from 'vs/platform/log/common/log';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { IViewletViewOptions } from 'vs/workbench/browser/parts/views/viewsViewlet';
import { ITreeItem, ITreeView, ITreeViewDataProvider, ITreeViewDragAndDropController, IViewBadge, IViewDescriptorService, TreeViewItemHandleArg, TreeViewPaneHandleArg, ViewContainer, ViewContainerLocation } from 'vs/workbench/common/views';
import { IActivityService } from 'vs/workbench/services/activity/common/activity';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IHoverService } from 'vs/workbench/services/hover/browser/hover';
import { ITreeViewsService } from 'vs/workbench/services/views/browser/treeViewsService';
export declare class TreeViewPane extends ViewPane {
    protected readonly treeView: ITreeView;
    private _container;
    private _actionRunner;
    constructor(options: IViewletViewOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService, notificationService: INotificationService);
    focus(): void;
    renderBody(container: HTMLElement): void;
    shouldShowWelcome(): boolean;
    protected layoutBody(height: number, width: number): void;
    getOptimalWidth(): number;
    protected renderTreeView(container: HTMLElement): void;
    protected layoutTreeView(height: number, width: number): void;
    private updateTreeVisibility;
    getActionRunner(): MultipleSelectionActionRunner;
    getActionsContext(): TreeViewPaneHandleArg;
}
export declare const RawCustomTreeViewContextKey: RawContextKey<boolean>;
declare abstract class AbstractTreeView extends Disposable implements ITreeView {
    readonly id: string;
    private _title;
    private readonly themeService;
    private readonly instantiationService;
    private readonly commandService;
    private readonly configurationService;
    protected readonly progressService: IProgressService;
    private readonly contextMenuService;
    private readonly keybindingService;
    private readonly notificationService;
    private readonly viewDescriptorService;
    private readonly hoverService;
    private readonly contextKeyService;
    private readonly activityService;
    private readonly logService;
    private isVisible;
    private _hasIconForParentNode;
    private _hasIconForLeafNode;
    private collapseAllContextKey;
    private collapseAllContext;
    private collapseAllToggleContextKey;
    private collapseAllToggleContext;
    private refreshContextKey;
    private refreshContext;
    private focused;
    private domNode;
    private treeContainer;
    private _messageValue;
    private _canSelectMany;
    private messageElement;
    private tree;
    private treeLabels;
    private treeViewDnd;
    private _container;
    private root;
    private elementsToRefresh;
    private readonly _onDidExpandItem;
    readonly onDidExpandItem: Event<ITreeItem>;
    private readonly _onDidCollapseItem;
    readonly onDidCollapseItem: Event<ITreeItem>;
    private _onDidChangeSelection;
    readonly onDidChangeSelection: Event<ITreeItem[]>;
    private _onDidChangeFocus;
    readonly onDidChangeFocus: Event<ITreeItem>;
    private readonly _onDidChangeVisibility;
    readonly onDidChangeVisibility: Event<boolean>;
    private readonly _onDidChangeActions;
    readonly onDidChangeActions: Event<void>;
    private readonly _onDidChangeWelcomeState;
    readonly onDidChangeWelcomeState: Event<void>;
    private readonly _onDidChangeTitle;
    readonly onDidChangeTitle: Event<string>;
    private readonly _onDidChangeDescription;
    readonly onDidChangeDescription: Event<string | undefined>;
    private readonly _onDidChangeCheckboxState;
    readonly onDidChangeCheckboxState: Event<ITreeItem[]>;
    private readonly _onDidCompleteRefresh;
    constructor(id: string, _title: string, themeService: IThemeService, instantiationService: IInstantiationService, commandService: ICommandService, configurationService: IConfigurationService, progressService: IProgressService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, notificationService: INotificationService, viewDescriptorService: IViewDescriptorService, hoverService: IHoverService, contextKeyService: IContextKeyService, activityService: IActivityService, logService: ILogService);
    private _isInitialized;
    private initialize;
    get viewContainer(): ViewContainer;
    get viewLocation(): ViewContainerLocation;
    private _dragAndDropController;
    get dragAndDropController(): ITreeViewDragAndDropController | undefined;
    set dragAndDropController(dnd: ITreeViewDragAndDropController | undefined);
    private _dataProvider;
    get dataProvider(): ITreeViewDataProvider | undefined;
    set dataProvider(dataProvider: ITreeViewDataProvider | undefined);
    private _message;
    get message(): string | undefined;
    set message(message: string | undefined);
    get title(): string;
    set title(name: string);
    private _description;
    get description(): string | undefined;
    set description(description: string | undefined);
    private _badge;
    private _badgeActivity;
    get badge(): IViewBadge | undefined;
    set badge(badge: IViewBadge | undefined);
    get canSelectMany(): boolean;
    set canSelectMany(canSelectMany: boolean);
    get hasIconForParentNode(): boolean;
    get hasIconForLeafNode(): boolean;
    get visible(): boolean;
    private initializeShowCollapseAllAction;
    get showCollapseAllAction(): boolean;
    set showCollapseAllAction(showCollapseAllAction: boolean);
    private initializeShowRefreshAction;
    get showRefreshAction(): boolean;
    set showRefreshAction(showRefreshAction: boolean);
    private registerActions;
    setVisibility(isVisible: boolean): void;
    protected abstract activate(): void;
    focus(reveal?: boolean, revealItem?: ITreeItem): void;
    show(container: HTMLElement): void;
    private create;
    protected createTree(): void;
    private resolveCommand;
    private onContextMenu;
    protected updateMessage(): void;
    private showMessage;
    private hideMessage;
    private resetMessageElement;
    private _height;
    private _width;
    layout(height: number, width: number): void;
    getOptimalWidth(): number;
    refresh(elements?: ITreeItem[]): Promise<void>;
    expand(itemOrItems: ITreeItem | ITreeItem[]): Promise<void>;
    setSelection(items: ITreeItem[]): void;
    getSelection(): ITreeItem[];
    setFocus(item: ITreeItem): void;
    reveal(item: ITreeItem): Promise<void>;
    private refreshing;
    private doRefresh;
    private initializeCollapseAllToggle;
    private updateCollapseAllToggle;
    private updateContentAreas;
    get container(): HTMLElement | undefined;
}
declare class MultipleSelectionActionRunner extends ActionRunner {
    private getSelectedResources;
    constructor(notificationService: INotificationService, getSelectedResources: (() => ITreeItem[]));
    protected runAction(action: IAction, context: TreeViewItemHandleArg | TreeViewPaneHandleArg): Promise<void>;
}
export declare class CustomTreeView extends AbstractTreeView {
    private readonly extensionId;
    private readonly extensionService;
    private readonly telemetryService;
    private activated;
    constructor(id: string, title: string, extensionId: string, themeService: IThemeService, instantiationService: IInstantiationService, commandService: ICommandService, configurationService: IConfigurationService, progressService: IProgressService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, notificationService: INotificationService, viewDescriptorService: IViewDescriptorService, contextKeyService: IContextKeyService, hoverService: IHoverService, extensionService: IExtensionService, activityService: IActivityService, telemetryService: ITelemetryService, logService: ILogService);
    protected activate(): void;
}
export declare class TreeView extends AbstractTreeView {
    private activated;
    protected activate(): void;
}
export declare class CustomTreeViewDragAndDrop implements ITreeDragAndDrop<ITreeItem> {
    private readonly treeId;
    private readonly labelService;
    private readonly instantiationService;
    private readonly treeViewsDragAndDropService;
    private readonly logService;
    private readonly treeMimeType;
    private readonly treeItemsTransfer;
    private dragCancellationToken;
    constructor(treeId: string, labelService: ILabelService, instantiationService: IInstantiationService, treeViewsDragAndDropService: ITreeViewsService, logService: ILogService);
    private dndController;
    set controller(controller: ITreeViewDragAndDropController | undefined);
    private handleDragAndLog;
    private addExtensionProvidedTransferTypes;
    private addResourceInfoToTransfer;
    onDragStart(data: IDragAndDropData, originalEvent: DragEvent): void;
    private debugLog;
    onDragOver(data: IDragAndDropData, targetElement: ITreeItem, targetIndex: number, originalEvent: DragEvent): boolean | ITreeDragOverReaction;
    getDragURI(element: ITreeItem): string | null;
    getDragLabel?(elements: ITreeItem[]): string | undefined;
    drop(data: IDragAndDropData, targetNode: ITreeItem | undefined, targetIndex: number | undefined, originalEvent: DragEvent): Promise<void>;
    onDragEnd(originalEvent: DragEvent): void;
}
export {};
