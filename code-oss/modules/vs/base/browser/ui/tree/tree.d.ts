import { IDragAndDropData } from 'vs/base/browser/dnd';
import { IListDragAndDrop, IListDragOverReaction, IListRenderer } from 'vs/base/browser/ui/list/list';
import { Event } from 'vs/base/common/event';
export declare const enum TreeVisibility {
    /**
     * The tree node should be hidden.
     */
    Hidden = 0,
    /**
     * The tree node should be visible.
     */
    Visible = 1,
    /**
     * The tree node should be visible if any of its descendants is visible.
     */
    Recurse = 2
}
/**
 * A composed filter result containing the visibility result as well as
 * metadata.
 */
export interface ITreeFilterDataResult<TFilterData> {
    /**
     * Whether the node should be visible.
     */
    visibility: boolean | TreeVisibility;
    /**
     * Metadata about the element's visibility which gets forwarded to the
     * renderer once the element gets rendered.
     */
    data: TFilterData;
}
/**
 * The result of a filter call can be a boolean value indicating whether
 * the element should be visible or not, a value of type `TreeVisibility` or
 * an object composed of the visibility result as well as additional metadata
 * which gets forwarded to the renderer once the element gets rendered.
 */
export declare type TreeFilterResult<TFilterData> = boolean | TreeVisibility | ITreeFilterDataResult<TFilterData>;
/**
 * A tree filter is responsible for controlling the visibility of
 * elements in a tree.
 */
export interface ITreeFilter<T, TFilterData = void> {
    /**
     * Returns whether this elements should be visible and, if affirmative,
     * additional metadata which gets forwarded to the renderer once the element
     * gets rendered.
     *
     * @param element The tree element.
     */
    filter(element: T, parentVisibility: TreeVisibility): TreeFilterResult<TFilterData>;
}
export interface ITreeSorter<T> {
    compare(element: T, otherElement: T): number;
}
export interface ITreeElement<T> {
    readonly element: T;
    readonly children?: Iterable<ITreeElement<T>>;
    readonly collapsible?: boolean;
    readonly collapsed?: boolean;
}
export interface ITreeNode<T, TFilterData = void> {
    readonly element: T;
    readonly children: ITreeNode<T, TFilterData>[];
    readonly depth: number;
    readonly visibleChildrenCount: number;
    readonly visibleChildIndex: number;
    readonly collapsible: boolean;
    readonly collapsed: boolean;
    readonly visible: boolean;
    readonly filterData: TFilterData | undefined;
}
export interface ICollapseStateChangeEvent<T, TFilterData> {
    node: ITreeNode<T, TFilterData>;
    deep: boolean;
}
export interface ITreeModelSpliceEvent<T, TFilterData> {
    insertedNodes: ITreeNode<T, TFilterData>[];
    deletedNodes: ITreeNode<T, TFilterData>[];
}
export interface ITreeModel<T, TFilterData, TRef> {
    readonly rootRef: TRef;
    readonly onDidSplice: Event<ITreeModelSpliceEvent<T, TFilterData>>;
    readonly onDidChangeCollapseState: Event<ICollapseStateChangeEvent<T, TFilterData>>;
    readonly onDidChangeRenderNodeCount: Event<ITreeNode<T, TFilterData>>;
    has(location: TRef): boolean;
    getListIndex(location: TRef): number;
    getListRenderCount(location: TRef): number;
    getNode(location?: TRef): ITreeNode<T, any>;
    getNodeLocation(node: ITreeNode<T, any>): TRef;
    getParentNodeLocation(location: TRef): TRef | undefined;
    getFirstElementChild(location: TRef): T | undefined;
    getLastElementAncestor(location?: TRef): T | undefined;
    isCollapsible(location: TRef): boolean;
    setCollapsible(location: TRef, collapsible?: boolean): boolean;
    isCollapsed(location: TRef): boolean;
    setCollapsed(location: TRef, collapsed?: boolean, recursive?: boolean): boolean;
    expandTo(location: TRef): void;
    rerender(location: TRef): void;
    refilter(): void;
}
export interface ITreeRenderer<T, TFilterData = void, TTemplateData = void> extends IListRenderer<ITreeNode<T, TFilterData>, TTemplateData> {
    renderTwistie?(element: T, twistieElement: HTMLElement): boolean;
    onDidChangeTwistieState?: Event<T>;
}
export interface ITreeEvent<T> {
    elements: T[];
    browserEvent?: UIEvent;
}
export declare enum TreeMouseEventTarget {
    Unknown = 0,
    Twistie = 1,
    Element = 2,
    Filter = 3
}
export interface ITreeMouseEvent<T> {
    browserEvent: MouseEvent;
    element: T | null;
    target: TreeMouseEventTarget;
}
export interface ITreeContextMenuEvent<T> {
    browserEvent: UIEvent;
    element: T | null;
    anchor: HTMLElement | {
        x: number;
        y: number;
    };
}
export interface ITreeNavigator<T> {
    current(): T | null;
    previous(): T | null;
    first(): T | null;
    last(): T | null;
    next(): T | null;
}
export interface IDataSource<TInput, T> {
    hasChildren?(element: TInput | T): boolean;
    getChildren(element: TInput | T): Iterable<T>;
}
export interface IAsyncDataSource<TInput, T> {
    hasChildren(element: TInput | T): boolean;
    getChildren(element: TInput | T): Iterable<T> | Promise<Iterable<T>>;
}
export declare const enum TreeDragOverBubble {
    Down = 0,
    Up = 1
}
export interface ITreeDragOverReaction extends IListDragOverReaction {
    bubble?: TreeDragOverBubble;
    autoExpand?: boolean;
}
export declare const TreeDragOverReactions: {
    acceptBubbleUp(): ITreeDragOverReaction;
    acceptBubbleDown(autoExpand?: boolean): ITreeDragOverReaction;
    acceptCopyBubbleUp(): ITreeDragOverReaction;
    acceptCopyBubbleDown(autoExpand?: boolean): ITreeDragOverReaction;
};
export interface ITreeDragAndDrop<T> extends IListDragAndDrop<T> {
    onDragOver(data: IDragAndDropData, targetElement: T | undefined, targetIndex: number | undefined, originalEvent: DragEvent): boolean | ITreeDragOverReaction;
}
export declare class TreeError extends Error {
    constructor(user: string, message: string);
}
export declare class WeakMapper<K extends object, V> {
    private fn;
    constructor(fn: (k: K) => V);
    private _map;
    map(key: K): V;
}
