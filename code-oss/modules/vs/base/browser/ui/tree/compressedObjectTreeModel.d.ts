import { IList } from 'vs/base/browser/ui/tree/indexTreeModel';
import { IObjectTreeModel, IObjectTreeModelOptions, IObjectTreeModelSetChildrenOptions } from 'vs/base/browser/ui/tree/objectTreeModel';
import { ICollapseStateChangeEvent, ITreeElement, ITreeModel, ITreeModelSpliceEvent, ITreeNode } from 'vs/base/browser/ui/tree/tree';
import { Event } from 'vs/base/common/event';
export interface ICompressedTreeElement<T> extends ITreeElement<T> {
    readonly children?: Iterable<ICompressedTreeElement<T>>;
    readonly incompressible?: boolean;
}
export interface ICompressedTreeNode<T> {
    readonly elements: T[];
    readonly incompressible: boolean;
}
export declare function compress<T>(element: ICompressedTreeElement<T>): ITreeElement<ICompressedTreeNode<T>>;
export declare function decompress<T>(element: ITreeElement<ICompressedTreeNode<T>>): ICompressedTreeElement<T>;
interface ICompressedObjectTreeModelOptions<T, TFilterData> extends IObjectTreeModelOptions<ICompressedTreeNode<T>, TFilterData> {
    readonly compressionEnabled?: boolean;
}
export declare class CompressedObjectTreeModel<T extends NonNullable<any>, TFilterData extends NonNullable<any> = void> implements ITreeModel<ICompressedTreeNode<T> | null, TFilterData, T | null> {
    private user;
    readonly rootRef: null;
    get onDidSplice(): Event<ITreeModelSpliceEvent<ICompressedTreeNode<T> | null, TFilterData>>;
    get onDidChangeCollapseState(): Event<ICollapseStateChangeEvent<ICompressedTreeNode<T>, TFilterData>>;
    get onDidChangeRenderNodeCount(): Event<ITreeNode<ICompressedTreeNode<T>, TFilterData>>;
    private model;
    private nodes;
    private enabled;
    private readonly identityProvider?;
    get size(): number;
    constructor(user: string, list: IList<ITreeNode<ICompressedTreeNode<T>, TFilterData>>, options?: ICompressedObjectTreeModelOptions<T, TFilterData>);
    setChildren(element: T | null, children: Iterable<ICompressedTreeElement<T>> | undefined, options: IObjectTreeModelSetChildrenOptions<T, TFilterData>): void;
    isCompressionEnabled(): boolean;
    setCompressionEnabled(enabled: boolean): void;
    private _setChildren;
    has(element: T | null): boolean;
    getListIndex(location: T | null): number;
    getListRenderCount(location: T | null): number;
    getNode(location?: T | null | undefined): ITreeNode<ICompressedTreeNode<T> | null, TFilterData>;
    getNodeLocation(node: ITreeNode<ICompressedTreeNode<T>, TFilterData>): T | null;
    getParentNodeLocation(location: T | null): T | null;
    getFirstElementChild(location: T | null): ICompressedTreeNode<T> | null | undefined;
    getLastElementAncestor(location?: T | null | undefined): ICompressedTreeNode<T> | null | undefined;
    isCollapsible(location: T | null): boolean;
    setCollapsible(location: T | null, collapsible?: boolean): boolean;
    isCollapsed(location: T | null): boolean;
    setCollapsed(location: T | null, collapsed?: boolean | undefined, recursive?: boolean | undefined): boolean;
    expandTo(location: T | null): void;
    rerender(location: T | null): void;
    updateElementHeight(element: T, height: number): void;
    refilter(): void;
    resort(location?: T | null, recursive?: boolean): void;
    getCompressedNode(element: T | null): ICompressedTreeNode<T> | null;
}
export declare type ElementMapper<T> = (elements: T[]) => T;
export declare const DefaultElementMapper: ElementMapper<any>;
export declare type CompressedNodeUnwrapper<T> = (node: ICompressedTreeNode<T>) => T;
export interface ICompressibleObjectTreeModelOptions<T, TFilterData> extends IObjectTreeModelOptions<T, TFilterData> {
    readonly compressionEnabled?: boolean;
    readonly elementMapper?: ElementMapper<T>;
}
export declare class CompressibleObjectTreeModel<T extends NonNullable<any>, TFilterData extends NonNullable<any> = void> implements IObjectTreeModel<T, TFilterData> {
    readonly rootRef: null;
    get onDidSplice(): Event<ITreeModelSpliceEvent<T | null, TFilterData>>;
    get onDidChangeCollapseState(): Event<ICollapseStateChangeEvent<T | null, TFilterData>>;
    get onDidChangeRenderNodeCount(): Event<ITreeNode<T | null, TFilterData>>;
    private elementMapper;
    private nodeMapper;
    private model;
    constructor(user: string, list: IList<ITreeNode<T, TFilterData>>, options?: ICompressibleObjectTreeModelOptions<T, TFilterData>);
    setChildren(element: T | null, children?: Iterable<ICompressedTreeElement<T>>, options?: IObjectTreeModelSetChildrenOptions<T, TFilterData>): void;
    isCompressionEnabled(): boolean;
    setCompressionEnabled(enabled: boolean): void;
    has(location: T | null): boolean;
    getListIndex(location: T | null): number;
    getListRenderCount(location: T | null): number;
    getNode(location?: T | null | undefined): ITreeNode<T | null, any>;
    getNodeLocation(node: ITreeNode<T | null, any>): T | null;
    getParentNodeLocation(location: T | null): T | null;
    getFirstElementChild(location: T | null): T | null | undefined;
    getLastElementAncestor(location?: T | null | undefined): T | null | undefined;
    isCollapsible(location: T | null): boolean;
    setCollapsible(location: T | null, collapsed?: boolean): boolean;
    isCollapsed(location: T | null): boolean;
    setCollapsed(location: T | null, collapsed?: boolean | undefined, recursive?: boolean | undefined): boolean;
    expandTo(location: T | null): void;
    rerender(location: T | null): void;
    updateElementHeight(element: T, height: number): void;
    refilter(): void;
    resort(element?: T | null, recursive?: boolean): void;
    getCompressedTreeNode(location?: T | null): ITreeNode<ICompressedTreeNode<T> | null, TFilterData>;
}
export {};
