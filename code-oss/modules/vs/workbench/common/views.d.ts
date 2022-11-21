import { Command } from 'vs/editor/common/languages';
import { UriComponents, URI } from 'vs/base/common/uri';
import { Event } from 'vs/base/common/event';
import { ContextKeyExpression } from 'vs/platform/contextkey/common/contextkey';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
import { IKeybindings } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { IProgressIndicator } from 'vs/platform/progress/common/progress';
import Severity from 'vs/base/common/severity';
import { IPaneComposite } from 'vs/workbench/common/panecomposite';
import { IAccessibilityInformation } from 'vs/platform/accessibility/common/accessibility';
import { IMarkdownString } from 'vs/base/common/htmlContent';
import { CancellationToken } from 'vs/base/common/cancellation';
import { VSDataTransfer } from 'vs/base/common/dataTransfer';
import { ILocalizedString } from 'vs/platform/action/common/action';
export declare const defaultViewIcon: ThemeIcon;
export declare namespace Extensions {
    const ViewContainersRegistry = "workbench.registry.view.containers";
    const ViewsRegistry = "workbench.registry.view";
}
export declare const enum ViewContainerLocation {
    Sidebar = 0,
    Panel = 1,
    AuxiliaryBar = 2
}
export declare const ViewContainerLocations: ViewContainerLocation[];
export declare function ViewContainerLocationToString(viewContainerLocation: ViewContainerLocation): "sidebar" | "panel" | "auxiliarybar";
declare type OpenCommandActionDescriptor = {
    readonly id: string;
    readonly title?: ILocalizedString | string;
    readonly mnemonicTitle?: string;
    readonly order?: number;
    readonly keybindings?: IKeybindings & {
        when?: ContextKeyExpression;
    };
};
/**
 * View Container Contexts
 */
export interface IViewContainerDescriptor {
    /**
     * The id of the view container
     */
    readonly id: string;
    /**
     * The title of the view container
     */
    readonly title: ILocalizedString | string;
    /**
     * Icon representation of the View container
     */
    readonly icon?: ThemeIcon | URI;
    /**
     * Order of the view container.
     */
    readonly order?: number;
    /**
     * IViewPaneContainer Ctor to instantiate
     */
    readonly ctorDescriptor: SyncDescriptor<IViewPaneContainer>;
    /**
     * Descriptor for open view container command
     * If not provided, view container info (id, title) is used.
     *
     * Note: To prevent registering open command, use `doNotRegisterOpenCommand` flag while registering the view container
     */
    readonly openCommandActionDescriptor?: OpenCommandActionDescriptor;
    /**
     * Storage id to use to store the view container state.
     * If not provided, it will be derived.
     */
    readonly storageId?: string;
    /**
     * If enabled, view container is not shown if it has no active views.
     */
    readonly hideIfEmpty?: boolean;
    /**
     * Id of the extension that contributed the view container
     */
    readonly extensionId?: ExtensionIdentifier;
    readonly alwaysUseContainerInfo?: boolean;
    readonly viewOrderDelegate?: ViewOrderDelegate;
    readonly rejectAddedViews?: boolean;
    requestedIndex?: number;
}
export interface IViewContainersRegistry {
    /**
     * An event that is triggered when a view container is registered.
     */
    readonly onDidRegister: Event<{
        viewContainer: ViewContainer;
        viewContainerLocation: ViewContainerLocation;
    }>;
    /**
     * An event that is triggered when a view container is deregistered.
     */
    readonly onDidDeregister: Event<{
        viewContainer: ViewContainer;
        viewContainerLocation: ViewContainerLocation;
    }>;
    /**
     * All registered view containers
     */
    readonly all: ViewContainer[];
    /**
     * Registers a view container to given location.
     * No op if a view container is already registered.
     *
     * @param viewContainerDescriptor descriptor of view container
     * @param location location of the view container
     *
     * @returns the registered ViewContainer.
     */
    registerViewContainer(viewContainerDescriptor: IViewContainerDescriptor, location: ViewContainerLocation, options?: {
        isDefault?: boolean;
        doNotRegisterOpenCommand?: boolean;
    }): ViewContainer;
    /**
     * Deregisters the given view container
     * No op if the view container is not registered
     */
    deregisterViewContainer(viewContainer: ViewContainer): void;
    /**
     * Returns the view container with given id.
     *
     * @returns the view container with given id.
     */
    get(id: string): ViewContainer | undefined;
    /**
     * Returns all view containers in the given location
     */
    getViewContainers(location: ViewContainerLocation): ViewContainer[];
    /**
     * Returns the view container location
     */
    getViewContainerLocation(container: ViewContainer): ViewContainerLocation;
    /**
     * Return the default view container from the given location
     */
    getDefaultViewContainer(location: ViewContainerLocation): ViewContainer | undefined;
}
interface ViewOrderDelegate {
    getOrder(group?: string): number | undefined;
}
export interface ViewContainer extends IViewContainerDescriptor {
}
export interface IViewDescriptor {
    readonly type?: string;
    readonly id: string;
    readonly name: string;
    readonly ctorDescriptor: SyncDescriptor<IView>;
    readonly when?: ContextKeyExpression;
    readonly order?: number;
    readonly weight?: number;
    readonly collapsed?: boolean;
    readonly canToggleVisibility?: boolean;
    readonly canMoveView?: boolean;
    readonly containerIcon?: ThemeIcon | URI;
    readonly containerTitle?: string;
    readonly hideByDefault?: boolean;
    readonly workspace?: boolean;
    readonly focusCommand?: {
        id: string;
        keybindings?: IKeybindings;
    };
    readonly group?: string;
    readonly remoteAuthority?: string | string[];
    readonly openCommandActionDescriptor?: OpenCommandActionDescriptor;
}
export interface ICustomTreeViewDescriptor extends ITreeViewDescriptor {
    readonly extensionId: ExtensionIdentifier;
    readonly originalContainerId: string;
}
export interface ICustomWebviewViewDescriptor extends IViewDescriptor {
    readonly extensionId: ExtensionIdentifier;
    readonly originalContainerId: string;
}
export declare type ICustomViewDescriptor = ICustomTreeViewDescriptor | ICustomWebviewViewDescriptor;
export interface IViewDescriptorRef {
    viewDescriptor: IViewDescriptor;
    index: number;
}
export interface IAddedViewDescriptorRef extends IViewDescriptorRef {
    collapsed: boolean;
    size?: number;
}
export interface IAddedViewDescriptorState {
    viewDescriptor: IViewDescriptor;
    collapsed?: boolean;
    visible?: boolean;
}
export interface IViewContainerModel {
    readonly viewContainer: ViewContainer;
    readonly title: string;
    readonly icon: ThemeIcon | URI | undefined;
    readonly keybindingId: string | undefined;
    readonly onDidChangeContainerInfo: Event<{
        title?: boolean;
        icon?: boolean;
        keybindingId?: boolean;
    }>;
    readonly allViewDescriptors: ReadonlyArray<IViewDescriptor>;
    readonly onDidChangeAllViewDescriptors: Event<{
        added: ReadonlyArray<IViewDescriptor>;
        removed: ReadonlyArray<IViewDescriptor>;
    }>;
    readonly activeViewDescriptors: ReadonlyArray<IViewDescriptor>;
    readonly onDidChangeActiveViewDescriptors: Event<{
        added: ReadonlyArray<IViewDescriptor>;
        removed: ReadonlyArray<IViewDescriptor>;
    }>;
    readonly visibleViewDescriptors: ReadonlyArray<IViewDescriptor>;
    readonly onDidAddVisibleViewDescriptors: Event<IAddedViewDescriptorRef[]>;
    readonly onDidRemoveVisibleViewDescriptors: Event<IViewDescriptorRef[]>;
    readonly onDidMoveVisibleViewDescriptors: Event<{
        from: IViewDescriptorRef;
        to: IViewDescriptorRef;
    }>;
    isVisible(id: string): boolean;
    setVisible(id: string, visible: boolean): void;
    isCollapsed(id: string): boolean;
    setCollapsed(id: string, collapsed: boolean): void;
    getSize(id: string): number | undefined;
    setSizes(newSizes: readonly {
        id: string;
        size: number;
    }[]): void;
    move(from: string, to: string): void;
}
export declare enum ViewContentGroups {
    Open = "2_open",
    Debug = "4_debug",
    SCM = "5_scm",
    More = "9_more"
}
export interface IViewContentDescriptor {
    readonly content: string;
    readonly when?: ContextKeyExpression | 'default';
    readonly group?: string;
    readonly order?: number;
    readonly precondition?: ContextKeyExpression | undefined;
}
export interface IViewsRegistry {
    readonly onViewsRegistered: Event<{
        views: IViewDescriptor[];
        viewContainer: ViewContainer;
    }[]>;
    readonly onViewsDeregistered: Event<{
        views: IViewDescriptor[];
        viewContainer: ViewContainer;
    }>;
    readonly onDidChangeContainer: Event<{
        views: IViewDescriptor[];
        from: ViewContainer;
        to: ViewContainer;
    }>;
    registerViews(views: IViewDescriptor[], viewContainer: ViewContainer): void;
    registerViews2(views: {
        views: IViewDescriptor[];
        viewContainer: ViewContainer;
    }[]): void;
    deregisterViews(views: IViewDescriptor[], viewContainer: ViewContainer): void;
    moveViews(views: IViewDescriptor[], viewContainer: ViewContainer): void;
    getViews(viewContainer: ViewContainer): IViewDescriptor[];
    getView(id: string): IViewDescriptor | null;
    getViewContainer(id: string): ViewContainer | null;
    readonly onDidChangeViewWelcomeContent: Event<string>;
    registerViewWelcomeContent(id: string, viewContent: IViewContentDescriptor): IDisposable;
    registerViewWelcomeContent2<TKey>(id: string, viewContentMap: Map<TKey, IViewContentDescriptor>): Map<TKey, IDisposable>;
    getViewWelcomeContent(id: string): IViewContentDescriptor[];
}
export interface IView {
    readonly id: string;
    focus(): void;
    isVisible(): boolean;
    isBodyVisible(): boolean;
    setExpanded(expanded: boolean): boolean;
    getProgressIndicator(): IProgressIndicator | undefined;
}
export declare const IViewsService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IViewsService>;
export interface IViewsService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeViewContainerVisibility: Event<{
        id: string;
        visible: boolean;
        location: ViewContainerLocation;
    }>;
    isViewContainerVisible(id: string): boolean;
    openViewContainer(id: string, focus?: boolean): Promise<IPaneComposite | null>;
    closeViewContainer(id: string): void;
    getVisibleViewContainer(location: ViewContainerLocation): ViewContainer | null;
    getActiveViewPaneContainerWithId(viewContainerId: string): IViewPaneContainer | null;
    readonly onDidChangeViewVisibility: Event<{
        id: string;
        visible: boolean;
    }>;
    isViewVisible(id: string): boolean;
    openView<T extends IView>(id: string, focus?: boolean): Promise<T | null>;
    closeView(id: string): void;
    getActiveViewWithId<T extends IView>(id: string): T | null;
    getViewWithId<T extends IView>(id: string): T | null;
    getViewProgressIndicator(id: string): IProgressIndicator | undefined;
}
export declare const IViewDescriptorService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IViewDescriptorService>;
export declare enum ViewVisibilityState {
    Default = 0,
    Expand = 1
}
export interface IViewDescriptorService {
    readonly _serviceBrand: undefined;
    readonly viewContainers: ReadonlyArray<ViewContainer>;
    readonly onDidChangeViewContainers: Event<{
        added: ReadonlyArray<{
            container: ViewContainer;
            location: ViewContainerLocation;
        }>;
        removed: ReadonlyArray<{
            container: ViewContainer;
            location: ViewContainerLocation;
        }>;
    }>;
    getDefaultViewContainer(location: ViewContainerLocation): ViewContainer | undefined;
    getViewContainerById(id: string): ViewContainer | null;
    isViewContainerRemovedPermanently(id: string): boolean;
    getDefaultViewContainerLocation(viewContainer: ViewContainer): ViewContainerLocation | null;
    getViewContainerLocation(viewContainer: ViewContainer): ViewContainerLocation | null;
    getViewContainersByLocation(location: ViewContainerLocation): ViewContainer[];
    getViewContainerModel(viewContainer: ViewContainer): IViewContainerModel;
    readonly onDidChangeContainerLocation: Event<{
        viewContainer: ViewContainer;
        from: ViewContainerLocation;
        to: ViewContainerLocation;
    }>;
    moveViewContainerToLocation(viewContainer: ViewContainer, location: ViewContainerLocation, requestedIndex?: number): void;
    getViewDescriptorById(id: string): IViewDescriptor | null;
    getViewContainerByViewId(id: string): ViewContainer | null;
    getDefaultContainerById(id: string): ViewContainer | null;
    getViewLocationById(id: string): ViewContainerLocation | null;
    readonly onDidChangeContainer: Event<{
        views: IViewDescriptor[];
        from: ViewContainer;
        to: ViewContainer;
    }>;
    moveViewsToContainer(views: IViewDescriptor[], viewContainer: ViewContainer, visibilityState?: ViewVisibilityState): void;
    readonly onDidChangeLocation: Event<{
        views: IViewDescriptor[];
        from: ViewContainerLocation;
        to: ViewContainerLocation;
    }>;
    moveViewToLocation(view: IViewDescriptor, location: ViewContainerLocation): void;
    reset(): void;
}
export interface ITreeView extends IDisposable {
    dataProvider: ITreeViewDataProvider | undefined;
    dragAndDropController?: ITreeViewDragAndDropController;
    showCollapseAllAction: boolean;
    canSelectMany: boolean;
    message?: string;
    title: string;
    description: string | undefined;
    badge: IViewBadge | undefined;
    readonly visible: boolean;
    readonly onDidExpandItem: Event<ITreeItem>;
    readonly onDidCollapseItem: Event<ITreeItem>;
    readonly onDidChangeSelection: Event<ITreeItem[]>;
    readonly onDidChangeFocus: Event<ITreeItem>;
    readonly onDidChangeVisibility: Event<boolean>;
    readonly onDidChangeActions: Event<void>;
    readonly onDidChangeTitle: Event<string>;
    readonly onDidChangeDescription: Event<string | undefined>;
    readonly onDidChangeWelcomeState: Event<void>;
    readonly onDidChangeCheckboxState: Event<ITreeItem[]>;
    readonly container: any | undefined;
    refresh(treeItems?: ITreeItem[]): Promise<void>;
    setVisibility(visible: boolean): void;
    focus(): void;
    layout(height: number, width: number): void;
    getOptimalWidth(): number;
    reveal(item: ITreeItem): Promise<void>;
    expand(itemOrItems: ITreeItem | ITreeItem[]): Promise<void>;
    setSelection(items: ITreeItem[]): void;
    getSelection(): ITreeItem[];
    setFocus(item: ITreeItem): void;
    show(container: any): void;
}
export interface IRevealOptions {
    select?: boolean;
    focus?: boolean;
    expand?: boolean | number;
}
export interface ITreeViewDescriptor extends IViewDescriptor {
    treeView: ITreeView;
}
export declare type TreeViewPaneHandleArg = {
    $treeViewId: string;
    $selectedTreeItems?: boolean;
    $focusedTreeItem?: boolean;
};
export declare type TreeViewItemHandleArg = {
    $treeViewId: string;
    $treeItemHandle: string;
};
export declare enum TreeItemCollapsibleState {
    None = 0,
    Collapsed = 1,
    Expanded = 2
}
export interface ITreeItemLabel {
    label: string;
    highlights?: [number, number][];
    strikethrough?: boolean;
}
export declare type TreeCommand = Command & {
    originalId?: string;
};
export interface ITreeItemCheckboxState {
    isChecked: boolean;
    tooltip?: string;
}
export interface ITreeItem {
    handle: string;
    parentHandle?: string;
    collapsibleState: TreeItemCollapsibleState;
    label?: ITreeItemLabel;
    description?: string | boolean;
    icon?: UriComponents;
    iconDark?: UriComponents;
    themeIcon?: ThemeIcon;
    resourceUri?: UriComponents;
    tooltip?: string | IMarkdownString;
    contextValue?: string;
    command?: TreeCommand;
    children?: ITreeItem[];
    accessibilityInformation?: IAccessibilityInformation;
    checkbox?: ITreeItemCheckboxState;
}
export declare class ResolvableTreeItem implements ITreeItem {
    handle: string;
    parentHandle?: string;
    collapsibleState: TreeItemCollapsibleState;
    label?: ITreeItemLabel;
    description?: string | boolean;
    icon?: UriComponents;
    iconDark?: UriComponents;
    themeIcon?: ThemeIcon;
    resourceUri?: UriComponents;
    tooltip?: string | IMarkdownString;
    contextValue?: string;
    command?: Command & {
        originalId?: string;
    };
    children?: ITreeItem[];
    accessibilityInformation?: IAccessibilityInformation;
    resolve: (token: CancellationToken) => Promise<void>;
    private resolved;
    private _hasResolve;
    constructor(treeItem: ITreeItem, resolve?: ((token: CancellationToken) => Promise<ITreeItem | undefined>));
    get hasResolve(): boolean;
    resetResolve(): void;
    asTreeItem(): ITreeItem;
}
export interface ITreeViewDataProvider {
    readonly isTreeEmpty?: boolean;
    onDidChangeEmpty?: Event<void>;
    getChildren(element?: ITreeItem): Promise<ITreeItem[] | undefined>;
}
export interface ITreeViewDragAndDropController {
    readonly dropMimeTypes: string[];
    readonly dragMimeTypes: string[];
    handleDrag(sourceTreeItemHandles: string[], operationUuid: string, token: CancellationToken): Promise<VSDataTransfer | undefined>;
    handleDrop(elements: VSDataTransfer, target: ITreeItem | undefined, token: CancellationToken, operationUuid?: string, sourceTreeId?: string, sourceTreeItemHandles?: string[]): Promise<void>;
}
export interface IEditableData {
    validationMessage: (value: string) => {
        content: string;
        severity: Severity;
    } | null;
    placeholder?: string | null;
    startingValue?: string | null;
    onFinish: (value: string, success: boolean) => Promise<void>;
}
export interface IViewPaneContainer {
    onDidAddViews: Event<IView[]>;
    onDidRemoveViews: Event<IView[]>;
    onDidChangeViewVisibility: Event<IView>;
    readonly views: IView[];
    setVisible(visible: boolean): void;
    isVisible(): boolean;
    focus(): void;
    getActionsContext(): unknown;
    getView(viewId: string): IView | undefined;
    toggleViewVisibility(viewId: string): void;
    saveState(): void;
}
export interface IViewBadge {
    readonly tooltip: string;
    readonly value: number;
}
export {};
