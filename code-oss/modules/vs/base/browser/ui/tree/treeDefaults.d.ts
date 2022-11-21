import { AsyncDataTree } from 'vs/base/browser/ui/tree/asyncDataTree';
import { Action } from 'vs/base/common/actions';
export declare class CollapseAllAction<TInput, T, TFilterData = void> extends Action {
    private viewer;
    constructor(viewer: AsyncDataTree<TInput, T, TFilterData>, enabled: boolean);
    run(): Promise<any>;
}
