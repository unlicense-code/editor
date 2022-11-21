import { Disposable } from 'vs/base/common/lifecycle';
import { IObservable } from 'vs/base/common/observable';
import { BaseCodeEditorView } from 'vs/workbench/contrib/mergeEditor/browser/view/editors/baseCodeEditorView';
import { IMergeEditorLayout } from 'vs/workbench/contrib/mergeEditor/browser/view/mergeEditor';
import { MergeEditorViewModel } from 'vs/workbench/contrib/mergeEditor/browser/view/viewModel';
import { InputCodeEditorView } from './editors/inputCodeEditorView';
import { ResultCodeEditorView } from './editors/resultCodeEditorView';
export declare class ScrollSynchronizer extends Disposable {
    private readonly viewModel;
    private readonly input1View;
    private readonly input2View;
    private readonly baseView;
    private readonly inputResultView;
    private readonly layout;
    private get model();
    private readonly reentrancyBarrier;
    readonly updateScrolling: () => void;
    private get shouldAlignResult();
    private get shouldAlignBase();
    constructor(viewModel: IObservable<MergeEditorViewModel | undefined>, input1View: InputCodeEditorView, input2View: InputCodeEditorView, baseView: IObservable<BaseCodeEditorView | undefined>, inputResultView: ResultCodeEditorView, layout: IObservable<IMergeEditorLayout>);
    private synchronizeScrolling;
}
