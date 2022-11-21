import { IIdentityProvider } from 'vs/base/browser/ui/list/list';
import { ICollapseStateChangeEvent, ITreeElement, ITreeFilter, ITreeFilterDataResult, ITreeModel, ITreeModelSpliceEvent, ITreeNode, TreeVisibility } from 'vs/base/browser/ui/tree/tree';
import { Event } from 'vs/base/common/event';
import { ISpliceable } from 'vs/base/common/sequence';
export interface IIndexTreeNode<T, TFilterData = void> extends ITreeNode<T, TFilterData> {
    readonly parent: IIndexTreeNode<T, TFilterData> | undefined;
    readonly children: IIndexTreeNode<T, TFilterData>[];
    visibleChildrenCount: number;
    visibleChildIndex: number;
    collapsible: boolean;
    collapsed: boolean;
    renderNodeCount: number;
    visibility: TreeVisibility;
    visible: boolean;
    filterData: TFilterData | undefined;
    lastDiffIds?: string[];
}
export declare function isFilterResult<T>(obj: any): obj is ITreeFilterDataResult<T>;
export declare function getVisibleState(visibility: boolean | TreeVisibility): TreeVisibility;
export interface IIndexTreeModelOptions<T, TFilterData> {
    readonly collapseByDefault?: boolean;
    readonly filter?: ITreeFilter<T, TFilterData>;
    readonly autoExpandSingleChildren?: boolean;
}
export interface IIndexTreeModelSpliceOptions<T, TFilterData> {
    /**
     * If set, child updates will recurse the given number of levels even if
     * items in the splice operation are unchanged. `Infinity` is a valid value.
     */
    readonly diffDepth?: number;
    /**
     * Identity provider used to optimize splice() calls in the IndexTree. If
     * this is not present, optimized splicing is not enabled.
     *
     * Warning: if this is present, calls to `setChildren()` will not replace
     * or update nodes if their identity is the same, even if the elements are
     * different. For this, you should call `rerender()`.
     */
    readonly diffIdentityProvider?: IIdentityProvider<T>;
    /**
     * Callback for when a node is created.
     */
    onDidCreateNode?: (node: ITreeNode<T, TFilterData>) => void;
    /**
     * Callback for when a node is deleted.
     */
    onDidDeleteNode?: (node: ITreeNode<T, TFilterData>) => void;
}
export interface IList<T> extends ISpliceable<T> {
    updateElementHeight(index: number, height: number | undefined): void;
}
export declare class IndexTreeModel<T extends Exclude<any, undefined>, TFilterData = void> implements ITreeModel<T, TFilterData, number[]> {
    private user;
    private list;
    readonly rootRef: never[];
    private root;
    private eventBufferer;
    private readonly _onDidChangeCollapseState;
    readonly onDidChangeCollapseState: Event<ICollapseStateChangeEvent<T, TFilterData>>;
    private readonly _onDidChangeRenderNodeCount;
    readonly onDidChangeRenderNodeCount: Event<ITreeNode<T, TFilterData>>;
    private collapseByDefault;
    private filter?;
    private autoExpandSingleChildren;
    private readonly _onDidSplice;
    readonly onDidSplice: Event<ITreeModelSpliceEvent<T, TFilterData>>;
    private readonly refilterDelayer;
    constructor(user: string, list: IList<ITreeNode<T, TFilterData>>, rootElement: T, options?: IIndexTreeModelOptions<T, TFilterData>);
    splice(location: number[], deleteCount: number, toInsert?: Iterable<ITreeElement<T>>, options?: IIndexTreeModelSpliceOptions<T, TFilterData>): void;
    private spliceSmart;
    private spliceSimple;
    rerender(location: number[]): void;
    updateElementHeight(location: number[], height: number | undefined): void;
    has(location: number[]): boolean;
    getListIndex(location: number[]): number;
    getListRenderCount(location: number[]): number;
    isCollapsible(location: number[]): boolean;
    setCollapsible(location: number[], collapsible?: boolean): boolean;
    isCollapsed(location: number[]): boolean;
    setCollapsed(location: number[], collapsed?: boolean, recursive?: boolean): boolean;
    private _setCollapseState;
    private _setListNodeCollapseState;
    private _setNodeCollapseState;
    expandTo(location: number[]): void;
    refilter(): void;
    private createTreeNode;
    private updateNodeAfterCollapseChange;
    private _updateNodeAfterCollapseChange;
    private updateNodeAfterFilterChange;
    private _updateNodeAfterFilterChange;
    private _updateAncestorsRenderNodeCount;
    private _filterNode;
    private hasTreeNode;
    private getTreeNode;
    private getTreeNodeWithListIndex;
    private getParentNodeWithListIndex;
    getNode(location?: number[]): ITreeNode<T, TFilterData>;
    getNodeLocation(node: ITreeNode<T, TFilterData>): number[];
    getParentNodeLocation(location: number[]): number[] | undefined;
    getFirstElementChild(location: number[]): T | undefined;
    getLastElementAncestor(location?: number[]): T | undefined;
    private _getLastElementAncestor;
}
