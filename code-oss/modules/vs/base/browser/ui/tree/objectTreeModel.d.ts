import { IIdentityProvider } from 'vs/base/browser/ui/list/list';
import { IIndexTreeModelOptions, IIndexTreeModelSpliceOptions, IList } from 'vs/base/browser/ui/tree/indexTreeModel';
import { ICollapseStateChangeEvent, ITreeElement, ITreeModel, ITreeModelSpliceEvent, ITreeNode, ITreeSorter } from 'vs/base/browser/ui/tree/tree';
import { Event } from 'vs/base/common/event';
export declare type ITreeNodeCallback<T, TFilterData> = (node: ITreeNode<T, TFilterData>) => void;
export interface IObjectTreeModel<T extends NonNullable<any>, TFilterData extends NonNullable<any> = void> extends ITreeModel<T | null, TFilterData, T | null> {
    setChildren(element: T | null, children: Iterable<ITreeElement<T>> | undefined, options?: IObjectTreeModelSetChildrenOptions<T, TFilterData>): void;
    resort(element?: T | null, recursive?: boolean): void;
    updateElementHeight(element: T, height: number | undefined): void;
}
export interface IObjectTreeModelSetChildrenOptions<T, TFilterData> extends IIndexTreeModelSpliceOptions<T, TFilterData> {
}
export interface IObjectTreeModelOptions<T, TFilterData> extends IIndexTreeModelOptions<T, TFilterData> {
    readonly sorter?: ITreeSorter<T>;
    readonly identityProvider?: IIdentityProvider<T>;
}
export declare class ObjectTreeModel<T extends NonNullable<any>, TFilterData extends NonNullable<any> = void> implements IObjectTreeModel<T, TFilterData> {
    private user;
    readonly rootRef: null;
    private model;
    private nodes;
    private readonly nodesByIdentity;
    private readonly identityProvider?;
    private sorter?;
    readonly onDidSplice: Event<ITreeModelSpliceEvent<T | null, TFilterData>>;
    readonly onDidChangeCollapseState: Event<ICollapseStateChangeEvent<T, TFilterData>>;
    readonly onDidChangeRenderNodeCount: Event<ITreeNode<T, TFilterData>>;
    get size(): number;
    constructor(user: string, list: IList<ITreeNode<T, TFilterData>>, options?: IObjectTreeModelOptions<T, TFilterData>);
    setChildren(element: T | null, children?: Iterable<ITreeElement<T>>, options?: IObjectTreeModelSetChildrenOptions<T, TFilterData>): void;
    private _setChildren;
    private preserveCollapseState;
    rerender(element: T | null): void;
    updateElementHeight(element: T, height: number | undefined): void;
    resort(element?: T | null, recursive?: boolean): void;
    private resortChildren;
    getFirstElementChild(ref?: T | null): T | null | undefined;
    getLastElementAncestor(ref?: T | null): T | null | undefined;
    has(element: T | null): boolean;
    getListIndex(element: T | null): number;
    getListRenderCount(element: T | null): number;
    isCollapsible(element: T | null): boolean;
    setCollapsible(element: T | null, collapsible?: boolean): boolean;
    isCollapsed(element: T | null): boolean;
    setCollapsed(element: T | null, collapsed?: boolean, recursive?: boolean): boolean;
    expandTo(element: T | null): void;
    refilter(): void;
    getNode(element?: T | null): ITreeNode<T | null, TFilterData>;
    getNodeLocation(node: ITreeNode<T, TFilterData>): T | null;
    getParentNodeLocation(element: T | null): T | null;
    private getElementLocation;
}
