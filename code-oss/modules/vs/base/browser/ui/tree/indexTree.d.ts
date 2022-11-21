import { IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { AbstractTree, IAbstractTreeOptions } from 'vs/base/browser/ui/tree/abstractTree';
import { IList, IndexTreeModel } from 'vs/base/browser/ui/tree/indexTreeModel';
import { ITreeElement, ITreeModel, ITreeNode, ITreeRenderer } from 'vs/base/browser/ui/tree/tree';
import 'vs/css!./media/tree';
export interface IIndexTreeOptions<T, TFilterData = void> extends IAbstractTreeOptions<T, TFilterData> {
}
export declare class IndexTree<T, TFilterData = void> extends AbstractTree<T, TFilterData, number[]> {
    private rootElement;
    model: IndexTreeModel<T, TFilterData>;
    constructor(user: string, container: HTMLElement, delegate: IListVirtualDelegate<T>, renderers: ITreeRenderer<T, TFilterData, any>[], rootElement: T, options?: IIndexTreeOptions<T, TFilterData>);
    splice(location: number[], deleteCount: number, toInsert?: Iterable<ITreeElement<T>>): void;
    rerender(location?: number[]): void;
    updateElementHeight(location: number[], height: number): void;
    protected createModel(user: string, view: IList<ITreeNode<T, TFilterData>>, options: IIndexTreeOptions<T, TFilterData>): ITreeModel<T, TFilterData, number[]>;
}
