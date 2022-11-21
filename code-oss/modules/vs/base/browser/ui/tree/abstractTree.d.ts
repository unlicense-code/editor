import { IContextViewProvider } from 'vs/base/browser/ui/contextview/contextview';
import { IFindInputStyles } from 'vs/base/browser/ui/findinput/findInput';
import { IIdentityProvider, IListRenderer, IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { IListOptions, IListStyles, List, MouseController, TypeNavigationMode } from 'vs/base/browser/ui/list/listWidget';
import { Toggle } from 'vs/base/browser/ui/toggle/toggle';
import { ICollapseStateChangeEvent, ITreeContextMenuEvent, ITreeDragAndDrop, ITreeEvent, ITreeFilter, ITreeModel, ITreeModelSpliceEvent, ITreeMouseEvent, ITreeNavigator, ITreeNode, ITreeRenderer } from 'vs/base/browser/ui/tree/tree';
import { Color } from 'vs/base/common/color';
import { Event } from 'vs/base/common/event';
import { FuzzyScore } from 'vs/base/common/filters';
import { DisposableStore, IDisposable } from 'vs/base/common/lifecycle';
import { ScrollEvent } from 'vs/base/common/scrollable';
import { ISpliceable } from 'vs/base/common/sequence';
import 'vs/css!./media/tree';
export declare class ComposedTreeDelegate<T, N extends {
    element: T;
}> implements IListVirtualDelegate<N> {
    private delegate;
    constructor(delegate: IListVirtualDelegate<T>);
    getHeight(element: N): number;
    getTemplateId(element: N): string;
    hasDynamicHeight(element: N): boolean;
    setDynamicHeight(element: N, height: number): void;
}
export interface IAbstractTreeViewState {
    readonly focus: Iterable<string>;
    readonly selection: Iterable<string>;
    readonly expanded: {
        [id: string]: 1 | 0;
    };
    readonly scrollTop: number;
}
export declare class AbstractTreeViewState implements IAbstractTreeViewState {
    readonly focus: Set<string>;
    readonly selection: Set<string>;
    readonly expanded: {
        [id: string]: 1 | 0;
    };
    scrollTop: number;
    static lift(state: IAbstractTreeViewState): AbstractTreeViewState;
    static empty(scrollTop?: number): AbstractTreeViewState;
    protected constructor(state: IAbstractTreeViewState);
    toJSON(): IAbstractTreeViewState;
}
export declare enum RenderIndentGuides {
    None = "none",
    OnHover = "onHover",
    Always = "always"
}
interface ITreeRendererOptions {
    readonly indent?: number;
    readonly renderIndentGuides?: RenderIndentGuides;
    readonly hideTwistiesOfChildlessElements?: boolean;
}
export declare type LabelFuzzyScore = {
    label: string;
    score: FuzzyScore;
};
export interface ICaseSensitiveToggleOpts {
    readonly isChecked: boolean;
    readonly inputActiveOptionBorder?: Color;
    readonly inputActiveOptionForeground?: Color;
    readonly inputActiveOptionBackground?: Color;
}
export declare class ModeToggle extends Toggle {
    constructor(opts?: ICaseSensitiveToggleOpts);
}
export interface IFindWidgetStyles extends IFindInputStyles, IListStyles {
}
export interface IFindWidgetOpts extends IFindWidgetStyles {
}
export declare enum TreeFindMode {
    Highlight = 0,
    Filter = 1
}
export interface IAbstractTreeOptionsUpdate extends ITreeRendererOptions {
    readonly multipleSelectionSupport?: boolean;
    readonly typeNavigationEnabled?: boolean;
    readonly typeNavigationMode?: TypeNavigationMode;
    readonly defaultFindMode?: TreeFindMode;
    readonly showNotFoundMessage?: boolean;
    readonly smoothScrolling?: boolean;
    readonly horizontalScrolling?: boolean;
    readonly mouseWheelScrollSensitivity?: number;
    readonly fastScrollSensitivity?: number;
    readonly expandOnDoubleClick?: boolean;
    readonly expandOnlyOnTwistieClick?: boolean | ((e: any) => boolean);
}
export interface IAbstractTreeOptions<T, TFilterData = void> extends IAbstractTreeOptionsUpdate, IListOptions<T> {
    readonly contextViewProvider?: IContextViewProvider;
    readonly collapseByDefault?: boolean;
    readonly filter?: ITreeFilter<T, TFilterData>;
    readonly dnd?: ITreeDragAndDrop<T>;
    readonly additionalScrollHeight?: number;
    readonly findWidgetEnabled?: boolean;
}
/**
 * The trait concept needs to exist at the tree level, because collapsed
 * tree nodes will not be known by the list.
 */
declare class Trait<T> {
    private getFirstViewElementWithTrait;
    private identityProvider?;
    private nodes;
    private elements;
    private readonly _onDidChange;
    readonly onDidChange: Event<ITreeEvent<T>>;
    private _nodeSet;
    private get nodeSet();
    constructor(getFirstViewElementWithTrait: () => ITreeNode<T, any> | undefined, identityProvider?: IIdentityProvider<T> | undefined);
    set(nodes: ITreeNode<T, any>[], browserEvent?: UIEvent): void;
    private _set;
    get(): T[];
    getNodes(): readonly ITreeNode<T, any>[];
    has(node: ITreeNode<T, any>): boolean;
    onDidModelSplice({ insertedNodes, deletedNodes }: ITreeModelSpliceEvent<T, any>): void;
    private createNodeSet;
}
interface ITreeNodeListOptions<T, TFilterData, TRef> extends IListOptions<ITreeNode<T, TFilterData>> {
    readonly tree: AbstractTree<T, TFilterData, TRef>;
}
/**
 * We use this List subclass to restore selection and focus as nodes
 * get rendered in the list, possibly due to a node expand() call.
 */
declare class TreeNodeList<T, TFilterData, TRef> extends List<ITreeNode<T, TFilterData>> {
    private focusTrait;
    private selectionTrait;
    private anchorTrait;
    constructor(user: string, container: HTMLElement, virtualDelegate: IListVirtualDelegate<ITreeNode<T, TFilterData>>, renderers: IListRenderer<any, any>[], focusTrait: Trait<T>, selectionTrait: Trait<T>, anchorTrait: Trait<T>, options: ITreeNodeListOptions<T, TFilterData, TRef>);
    protected createMouseController(options: ITreeNodeListOptions<T, TFilterData, TRef>): MouseController<ITreeNode<T, TFilterData>>;
    splice(start: number, deleteCount: number, elements?: ITreeNode<T, TFilterData>[]): void;
    setFocus(indexes: number[], browserEvent?: UIEvent, fromAPI?: boolean): void;
    setSelection(indexes: number[], browserEvent?: UIEvent, fromAPI?: boolean): void;
    setAnchor(index: number | undefined, fromAPI?: boolean): void;
}
export declare abstract class AbstractTree<T, TFilterData, TRef> implements IDisposable {
    private readonly _user;
    private _options;
    protected view: TreeNodeList<T, TFilterData, TRef>;
    private renderers;
    model: ITreeModel<T, TFilterData, TRef>;
    private focus;
    private selection;
    private anchor;
    private eventBufferer;
    private findController?;
    readonly onDidChangeFindOpenState: Event<boolean>;
    private focusNavigationFilter;
    private styleElement;
    protected readonly disposables: DisposableStore;
    get onDidScroll(): Event<ScrollEvent>;
    get onDidChangeFocus(): Event<ITreeEvent<T>>;
    get onDidChangeSelection(): Event<ITreeEvent<T>>;
    get onMouseClick(): Event<ITreeMouseEvent<T>>;
    get onMouseDblClick(): Event<ITreeMouseEvent<T>>;
    get onContextMenu(): Event<ITreeContextMenuEvent<T>>;
    get onTap(): Event<ITreeMouseEvent<T>>;
    get onPointer(): Event<ITreeMouseEvent<T>>;
    get onKeyDown(): Event<KeyboardEvent>;
    get onKeyUp(): Event<KeyboardEvent>;
    get onKeyPress(): Event<KeyboardEvent>;
    get onDidFocus(): Event<void>;
    get onDidBlur(): Event<void>;
    get onDidChangeModel(): Event<void>;
    get onDidChangeCollapseState(): Event<ICollapseStateChangeEvent<T, TFilterData>>;
    get onDidChangeRenderNodeCount(): Event<ITreeNode<T, TFilterData>>;
    private readonly _onWillRefilter;
    readonly onWillRefilter: Event<void>;
    get findMode(): TreeFindMode;
    set findMode(findMode: TreeFindMode);
    readonly onDidChangeFindMode: Event<TreeFindMode>;
    get onDidChangeFindPattern(): Event<string>;
    get expandOnDoubleClick(): boolean;
    get expandOnlyOnTwistieClick(): boolean | ((e: T) => boolean);
    private readonly _onDidUpdateOptions;
    readonly onDidUpdateOptions: Event<IAbstractTreeOptions<T, TFilterData>>;
    get onDidDispose(): Event<void>;
    constructor(_user: string, container: HTMLElement, delegate: IListVirtualDelegate<T>, renderers: ITreeRenderer<T, TFilterData, any>[], _options?: IAbstractTreeOptions<T, TFilterData>);
    updateOptions(optionsUpdate?: IAbstractTreeOptionsUpdate): void;
    get options(): IAbstractTreeOptions<T, TFilterData>;
    updateWidth(element: TRef): void;
    getHTMLElement(): HTMLElement;
    get contentHeight(): number;
    get onDidChangeContentHeight(): Event<number>;
    get scrollTop(): number;
    set scrollTop(scrollTop: number);
    get scrollLeft(): number;
    set scrollLeft(scrollLeft: number);
    get scrollHeight(): number;
    get renderHeight(): number;
    get firstVisibleElement(): T | undefined;
    get lastVisibleElement(): T;
    get ariaLabel(): string;
    set ariaLabel(value: string);
    domFocus(): void;
    isDOMFocused(): boolean;
    layout(height?: number, width?: number): void;
    style(styles: IListStyles): void;
    getParentElement(location: TRef): T;
    getFirstElementChild(location: TRef): T | undefined;
    getNode(location?: TRef): ITreeNode<T, TFilterData>;
    collapse(location: TRef, recursive?: boolean): boolean;
    expand(location: TRef, recursive?: boolean): boolean;
    toggleCollapsed(location: TRef, recursive?: boolean): boolean;
    expandAll(): void;
    collapseAll(): void;
    isCollapsible(location: TRef): boolean;
    setCollapsible(location: TRef, collapsible?: boolean): boolean;
    isCollapsed(location: TRef): boolean;
    triggerTypeNavigation(): void;
    openFind(): void;
    closeFind(): void;
    refilter(): void;
    setAnchor(element: TRef | undefined): void;
    getAnchor(): T | undefined;
    setSelection(elements: TRef[], browserEvent?: UIEvent): void;
    getSelection(): T[];
    setFocus(elements: TRef[], browserEvent?: UIEvent): void;
    focusNext(n?: number, loop?: boolean, browserEvent?: UIEvent, filter?: ((node: ITreeNode<T, TFilterData>) => boolean) | undefined): void;
    focusPrevious(n?: number, loop?: boolean, browserEvent?: UIEvent, filter?: ((node: ITreeNode<T, TFilterData>) => boolean) | undefined): void;
    focusNextPage(browserEvent?: UIEvent, filter?: ((node: ITreeNode<T, TFilterData>) => boolean) | undefined): Promise<void>;
    focusPreviousPage(browserEvent?: UIEvent, filter?: ((node: ITreeNode<T, TFilterData>) => boolean) | undefined): Promise<void>;
    focusLast(browserEvent?: UIEvent, filter?: ((node: ITreeNode<T, TFilterData>) => boolean) | undefined): void;
    focusFirst(browserEvent?: UIEvent, filter?: ((node: ITreeNode<T, TFilterData>) => boolean) | undefined): void;
    getFocus(): T[];
    reveal(location: TRef, relativeTop?: number): void;
    /**
     * Returns the relative position of an element rendered in the list.
     * Returns `null` if the element isn't *entirely* in the visible viewport.
     */
    getRelativeTop(location: TRef): number | null;
    getViewState(identityProvider?: IIdentityProvider<T> | undefined): AbstractTreeViewState;
    private onLeftArrow;
    private onRightArrow;
    private onSpace;
    protected abstract createModel(user: string, view: ISpliceable<ITreeNode<T, TFilterData>>, options: IAbstractTreeOptions<T, TFilterData>): ITreeModel<T, TFilterData, TRef>;
    navigate(start?: TRef): ITreeNavigator<T>;
    dispose(): void;
}
export {};
