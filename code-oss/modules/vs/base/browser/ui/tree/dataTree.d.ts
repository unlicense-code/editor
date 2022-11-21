import { IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { AbstractTree, AbstractTreeViewState, IAbstractTreeOptions } from 'vs/base/browser/ui/tree/abstractTree';
import { IList } from 'vs/base/browser/ui/tree/indexTreeModel';
import { ObjectTreeModel } from 'vs/base/browser/ui/tree/objectTreeModel';
import { IDataSource, ITreeModel, ITreeNode, ITreeRenderer, ITreeSorter } from 'vs/base/browser/ui/tree/tree';
export interface IDataTreeOptions<T, TFilterData = void> extends IAbstractTreeOptions<T, TFilterData> {
    readonly sorter?: ITreeSorter<T>;
}
export declare class DataTree<TInput, T, TFilterData = void> extends AbstractTree<T | null, TFilterData, T | null> {
    private user;
    private dataSource;
    model: ObjectTreeModel<T, TFilterData>;
    private input;
    private identityProvider;
    private nodesByIdentity;
    constructor(user: string, container: HTMLElement, delegate: IListVirtualDelegate<T>, renderers: ITreeRenderer<T, TFilterData, any>[], dataSource: IDataSource<TInput, T>, options?: IDataTreeOptions<T, TFilterData>);
    getInput(): TInput | undefined;
    setInput(input: TInput | undefined, viewState?: AbstractTreeViewState): void;
    updateChildren(element?: TInput | T): void;
    resort(element?: T | TInput, recursive?: boolean): void;
    refresh(element?: T): void;
    private _refresh;
    private iterate;
    protected createModel(user: string, view: IList<ITreeNode<T, TFilterData>>, options: IDataTreeOptions<T, TFilterData>): ITreeModel<T | null, TFilterData, T | null>;
}
