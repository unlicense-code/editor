import { Action2, IAction2Options } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { MergeEditorViewModel } from 'vs/workbench/contrib/mergeEditor/browser/view/viewModel';
import { MergeEditorContents } from 'vs/workbench/contrib/mergeEditor/common/mergeEditor';
export declare class MergeEditorOpenContentsFromJSON extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, args?: {
        data?: MergeEditorContents;
        resultState?: 'initial' | 'current';
    }): Promise<void>;
}
declare abstract class MergeEditorAction extends Action2 {
    constructor(desc: Readonly<IAction2Options>);
    run(accessor: ServicesAccessor): void;
    abstract runWithViewModel(viewModel: MergeEditorViewModel, accessor: ServicesAccessor): void;
}
export declare class OpenSelectionInTemporaryMergeEditor extends MergeEditorAction {
    constructor();
    runWithViewModel(viewModel: MergeEditorViewModel, accessor: ServicesAccessor): Promise<void>;
}
export {};
