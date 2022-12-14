import { IIdentityProvider, IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { IListStyles } from 'vs/base/browser/ui/list/listWidget';
import { TreeFindMode as TreeFindMode, IAbstractTreeOptions, IAbstractTreeOptionsUpdate } from 'vs/base/browser/ui/tree/abstractTree';
import { ICompressedTreeElement, ICompressedTreeNode } from 'vs/base/browser/ui/tree/compressedObjectTreeModel';
import { CompressibleObjectTree, ICompressibleKeyboardNavigationLabelProvider, ICompressibleTreeRenderer, IObjectTreeSetChildrenOptions, ObjectTree } from 'vs/base/browser/ui/tree/objectTree';
import { IAsyncDataSource, ICollapseStateChangeEvent, ITreeContextMenuEvent, ITreeElement, ITreeEvent, ITreeMouseEvent, ITreeNode, ITreeRenderer, ITreeSorter, WeakMapper } from 'vs/base/browser/ui/tree/tree';
import { Emitter, Event } from 'vs/base/common/event';
import { DisposableStore, IDisposable } from 'vs/base/common/lifecycle';
import { ScrollEvent } from 'vs/base/common/scrollable';
import { IThemable } from 'vs/base/common/styler';
interface IAsyncDataTreeNode<TInput, T> {
    element: TInput | T;
    readonly parent: IAsyncDataTreeNode<TInput, T> | null;
    readonly children: IAsyncDataTreeNode<TInput, T>[];
    readonly id?: string | null;
    refreshPromise: Promise<void> | undefined;
    hasChildren: boolean;
    stale: boolean;
    slow: boolean;
    collapsedByDefault: boolean | undefined;
}
declare type AsyncDataTreeNodeMapper<TInput, T, TFilterData> = WeakMapper<ITreeNode<IAsyncDataTreeNode<TInput, T> | null, TFilterData>, ITreeNode<TInput | T, TFilterData>>;
export interface IAsyncDataTreeOptionsUpdate extends IAbstractTreeOptionsUpdate {
}
export interface IAsyncDataTreeUpdateChildrenOptions<T> extends IObjectTreeSetChildrenOptions<T> {
}
export interface IAsyncDataTreeOptions<T, TFilterData = void> extends IAsyncDataTreeOptionsUpdate, Pick<IAbstractTreeOptions<T, TFilterData>, Exclude<keyof IAbstractTreeOptions<T, TFilterData>, 'collapseByDefault'>> {
    readonly collapseByDefault?: {
        (e: T): boolean;
    };
    readonly identityProvider?: IIdentityProvider<T>;
    readonly sorter?: ITreeSorter<T>;
    readonly autoExpandSingleChildren?: boolean;
}
export interface IAsyncDataTreeViewState {
    readonly focus?: string[];
    readonly selection?: string[];
    readonly expanded?: string[];
    readonly scrollTop?: number;
}
interface IAsyncDataTreeViewStateContext<TInput, T> {
    readonly viewState: IAsyncDataTreeViewState;
    readonly selection: IAsyncDataTreeNode<TInput, T>[];
    readonly focus: IAsyncDataTreeNode<TInput, T>[];
}
export declare class AsyncDataTree<TInput, T, TFilterData = void> implements IDisposable, IThemable {
    protected user: string;
    private dataSource;
    protected readonly tree: ObjectTree<IAsyncDataTreeNode<TInput, T>, TFilterData>;
    protected readonly root: IAsyncDataTreeNode<TInput, T>;
    private readonly nodes;
    private readonly sorter?;
    private readonly collapseByDefault?;
    private readonly subTreeRefreshPromises;
    private readonly refreshPromises;
    protected readonly identityProvider?: IIdentityProvider<T>;
    private readonly autoExpandSingleChildren;
    private readonly _onDidRender;
    protected readonly _onDidChangeNodeSlowState: Emitter<IAsyncDataTreeNode<TInput, T>>;
    protected readonly nodeMapper: AsyncDataTreeNodeMapper<TInput, T, TFilterData>;
    protected readonly disposables: DisposableStore;
    get onDidScroll(): Event<ScrollEvent>;
    get onDidChangeFocus(): Event<ITreeEvent<T>>;
    get onDidChangeSelection(): Event<ITreeEvent<T>>;
    get onKeyDown(): Event<KeyboardEvent>;
    get onMouseClick(): Event<ITreeMouseEvent<T>>;
    get onMouseDblClick(): Event<ITreeMouseEvent<T>>;
    get onContextMenu(): Event<ITreeContextMenuEvent<T>>;
    get onTap(): Event<ITreeMouseEvent<T>>;
    get onPointer(): Event<ITreeMouseEvent<T>>;
    get onDidFocus(): Event<void>;
    get onDidBlur(): Event<void>;
    get onDidChangeModel(): Event<void>;
    get onDidChangeCollapseState(): Event<ICollapseStateChangeEvent<IAsyncDataTreeNode<TInput, T> | null, TFilterData>>;
    get onDidUpdateOptions(): Event<IAsyncDataTreeOptionsUpdate>;
    get onDidChangeFindOpenState(): Event<boolean>;
    get findMode(): TreeFindMode;
    set findMode(mode: TreeFindMode);
    readonly onDidChangeFindMode: Event<TreeFindMode>;
    get expandOnlyOnTwistieClick(): boolean | ((e: T) => boolean);
    get onDidDispose(): Event<void>;
    constructor(user: string, container: HTMLElement, delegate: IListVirtualDelegate<T>, renderers: ITreeRenderer<T, TFilterData, any>[], dataSource: IAsyncDataSource<TInput, T>, options?: IAsyncDataTreeOptions<T, TFilterData>);
    protected createTree(user: string, container: HTMLElement, delegate: IListVirtualDelegate<T>, renderers: ITreeRenderer<T, TFilterData, any>[], options: IAsyncDataTreeOptions<T, TFilterData>): ObjectTree<IAsyncDataTreeNode<TInput, T>, TFilterData>;
    updateOptions(options?: IAsyncDataTreeOptionsUpdate): void;
    get options(): IAsyncDataTreeOptions<T, TFilterData>;
    getHTMLElement(): HTMLElement;
    get contentHeight(): number;
    get onDidChangeContentHeight(): Event<number>;
    get scrollTop(): number;
    set scrollTop(scrollTop: number);
    get scrollLeft(): number;
    set scrollLeft(scrollLeft: number);
    get scrollHeight(): number;
    get renderHeight(): number;
    get lastVisibleElement(): T;
    get ariaLabel(): string;
    set ariaLabel(value: string);
    domFocus(): void;
    layout(height?: number, width?: number): void;
    style(styles: IListStyles): void;
    getInput(): TInput | undefined;
    setInput(input: TInput, viewState?: IAsyncDataTreeViewState): Promise<void>;
    updateChildren(element?: TInput | T, recursive?: boolean, rerender?: boolean, options?: IAsyncDataTreeUpdateChildrenOptions<T>): Promise<void>;
    private _updateChildren;
    resort(element?: TInput | T, recursive?: boolean): void;
    hasNode(element: TInput | T): boolean;
    rerender(element?: T): void;
    updateWidth(element: T): void;
    getNode(element?: TInput | T): ITreeNode<TInput | T, TFilterData>;
    collapse(element: T, recursive?: boolean): boolean;
    expand(element: T, recursive?: boolean): Promise<boolean>;
    toggleCollapsed(element: T, recursive?: boolean): boolean;
    expandAll(): void;
    collapseAll(): void;
    isCollapsible(element: T): boolean;
    isCollapsed(element: TInput | T): boolean;
    triggerTypeNavigation(): void;
    openFind(): void;
    closeFind(): void;
    refilter(): void;
    setAnchor(element: T | undefined): void;
    getAnchor(): T | undefined;
    setSelection(elements: T[], browserEvent?: UIEvent): void;
    getSelection(): T[];
    setFocus(elements: T[], browserEvent?: UIEvent): void;
    focusNext(n?: number, loop?: boolean, browserEvent?: UIEvent): void;
    focusPrevious(n?: number, loop?: boolean, browserEvent?: UIEvent): void;
    focusNextPage(browserEvent?: UIEvent): Promise<void>;
    focusPreviousPage(browserEvent?: UIEvent): Promise<void>;
    focusLast(browserEvent?: UIEvent): void;
    focusFirst(browserEvent?: UIEvent): void;
    getFocus(): T[];
    reveal(element: T, relativeTop?: number): void;
    getRelativeTop(element: T): number | null;
    getParentElement(element: T): TInput | T;
    getFirstElementChild(element?: TInput | T): TInput | T | undefined;
    private getDataNode;
    private refreshAndRenderNode;
    private refreshNode;
    private doRefreshSubTree;
    private doRefreshNode;
    private doGetChildren;
    private _onDidChangeCollapseState;
    private setChildren;
    protected render(node: IAsyncDataTreeNode<TInput, T>, viewStateContext?: IAsyncDataTreeViewStateContext<TInput, T>, options?: IAsyncDataTreeUpdateChildrenOptions<T>): void;
    protected asTreeElement(node: IAsyncDataTreeNode<TInput, T>, viewStateContext?: IAsyncDataTreeViewStateContext<TInput, T>): ITreeElement<IAsyncDataTreeNode<TInput, T>>;
    protected processChildren(children: Iterable<T>): Iterable<T>;
    getViewState(): IAsyncDataTreeViewState;
    dispose(): void;
}
declare type CompressibleAsyncDataTreeNodeMapper<TInput, T, TFilterData> = WeakMapper<ITreeNode<ICompressedTreeNode<IAsyncDataTreeNode<TInput, T>>, TFilterData>, ITreeNode<ICompressedTreeNode<TInput | T>, TFilterData>>;
export interface ITreeCompressionDelegate<T> {
    isIncompressible(element: T): boolean;
}
export interface ICompressibleAsyncDataTreeOptions<T, TFilterData = void> extends IAsyncDataTreeOptions<T, TFilterData> {
    readonly compressionEnabled?: boolean;
    readonly keyboardNavigationLabelProvider?: ICompressibleKeyboardNavigationLabelProvider<T>;
}
export interface ICompressibleAsyncDataTreeOptionsUpdate extends IAsyncDataTreeOptionsUpdate {
    readonly compressionEnabled?: boolean;
}
export declare class CompressibleAsyncDataTree<TInput, T, TFilterData = void> extends AsyncDataTree<TInput, T, TFilterData> {
    private compressionDelegate;
    protected readonly tree: CompressibleObjectTree<IAsyncDataTreeNode<TInput, T>, TFilterData>;
    protected readonly compressibleNodeMapper: CompressibleAsyncDataTreeNodeMapper<TInput, T, TFilterData>;
    private filter?;
    constructor(user: string, container: HTMLElement, virtualDelegate: IListVirtualDelegate<T>, compressionDelegate: ITreeCompressionDelegate<T>, renderers: ICompressibleTreeRenderer<T, TFilterData, any>[], dataSource: IAsyncDataSource<TInput, T>, options?: ICompressibleAsyncDataTreeOptions<T, TFilterData>);
    protected createTree(user: string, container: HTMLElement, delegate: IListVirtualDelegate<T>, renderers: ICompressibleTreeRenderer<T, TFilterData, any>[], options: ICompressibleAsyncDataTreeOptions<T, TFilterData>): ObjectTree<IAsyncDataTreeNode<TInput, T>, TFilterData>;
    protected asTreeElement(node: IAsyncDataTreeNode<TInput, T>, viewStateContext?: IAsyncDataTreeViewStateContext<TInput, T>): ICompressedTreeElement<IAsyncDataTreeNode<TInput, T>>;
    updateOptions(options?: ICompressibleAsyncDataTreeOptionsUpdate): void;
    getViewState(): IAsyncDataTreeViewState;
    protected render(node: IAsyncDataTreeNode<TInput, T>, viewStateContext?: IAsyncDataTreeViewStateContext<TInput, T>): void;
    protected processChildren(children: Iterable<T>): Iterable<T>;
}
export {};
