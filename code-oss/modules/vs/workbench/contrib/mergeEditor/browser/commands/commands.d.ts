import { Action2, IAction2Options } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { IEditorIdentifier } from 'vs/workbench/common/editor';
import { MergeEditorInput } from 'vs/workbench/contrib/mergeEditor/browser/mergeEditorInput';
import { IMergeEditorInputModel } from 'vs/workbench/contrib/mergeEditor/browser/mergeEditorInputModel';
import { MergeEditorViewModel } from 'vs/workbench/contrib/mergeEditor/browser/view/viewModel';
declare abstract class MergeEditorAction extends Action2 {
    constructor(desc: Readonly<IAction2Options>);
    run(accessor: ServicesAccessor): void;
    abstract runWithViewModel(viewModel: MergeEditorViewModel, accessor: ServicesAccessor): void;
}
interface MergeEditorAction2Args {
    inputModel: IMergeEditorInputModel;
    viewModel: MergeEditorViewModel;
    input: MergeEditorInput;
    editorIdentifier: IEditorIdentifier;
}
declare abstract class MergeEditorAction2 extends Action2 {
    constructor(desc: Readonly<IAction2Options>);
    run(accessor: ServicesAccessor, ...args: any[]): void;
    abstract runWithMergeEditor(context: MergeEditorAction2Args, accessor: ServicesAccessor, ...args: any[]): unknown;
}
export declare class OpenMergeEditor extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): void;
}
export declare class SetMixedLayout extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class SetColumnLayout extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class ShowNonConflictingChanges extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class ShowHideBase extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class ShowHideTopBase extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class ShowHideCenterBase extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class OpenResultResource extends MergeEditorAction {
    constructor();
    runWithViewModel(viewModel: MergeEditorViewModel, accessor: ServicesAccessor): void;
}
export declare class GoToNextUnhandledConflict extends MergeEditorAction {
    constructor();
    runWithViewModel(viewModel: MergeEditorViewModel): void;
}
export declare class GoToPreviousUnhandledConflict extends MergeEditorAction {
    constructor();
    runWithViewModel(viewModel: MergeEditorViewModel): void;
}
export declare class ToggleActiveConflictInput1 extends MergeEditorAction {
    constructor();
    runWithViewModel(viewModel: MergeEditorViewModel): void;
}
export declare class ToggleActiveConflictInput2 extends MergeEditorAction {
    constructor();
    runWithViewModel(viewModel: MergeEditorViewModel): void;
}
export declare class CompareInput1WithBaseCommand extends MergeEditorAction {
    constructor();
    runWithViewModel(viewModel: MergeEditorViewModel, accessor: ServicesAccessor): void;
}
export declare class CompareInput2WithBaseCommand extends MergeEditorAction {
    constructor();
    runWithViewModel(viewModel: MergeEditorViewModel, accessor: ServicesAccessor): void;
}
export declare class OpenBaseFile extends MergeEditorAction {
    constructor();
    runWithViewModel(viewModel: MergeEditorViewModel, accessor: ServicesAccessor): void;
}
export declare class AcceptAllInput1 extends MergeEditorAction {
    constructor();
    runWithViewModel(viewModel: MergeEditorViewModel): void;
}
export declare class AcceptAllInput2 extends MergeEditorAction {
    constructor();
    runWithViewModel(viewModel: MergeEditorViewModel): void;
}
export declare class ResetToBaseAndAutoMergeCommand extends MergeEditorAction {
    constructor();
    runWithViewModel(viewModel: MergeEditorViewModel, accessor: ServicesAccessor): void;
}
export declare class AcceptMerge extends MergeEditorAction2 {
    constructor();
    runWithMergeEditor({ inputModel, editorIdentifier, viewModel }: MergeEditorAction2Args, accessor: ServicesAccessor): Promise<{
        successful: boolean;
    }>;
}
export {};
