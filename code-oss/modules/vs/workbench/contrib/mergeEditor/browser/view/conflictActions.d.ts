import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IObservable } from 'vs/base/common/observable';
import { ICodeEditor, IViewZoneChangeAccessor } from 'vs/editor/browser/editorBrowser';
import { ModifiedBaseRange } from 'vs/workbench/contrib/mergeEditor/browser/model/modifiedBaseRange';
import { MergeEditorViewModel } from 'vs/workbench/contrib/mergeEditor/browser/view/viewModel';
export declare class ConflictActionsFactory extends Disposable {
    private readonly _editor;
    private readonly _styleClassName;
    private readonly _styleElement;
    constructor(_editor: ICodeEditor);
    private _updateLensStyle;
    private _getLayoutInfo;
    createWidget(viewZoneChangeAccessor: IViewZoneChangeAccessor, lineNumber: number, items: IObservable<IContentWidgetAction[]>, viewZoneIdsToCleanUp: string[]): IDisposable;
}
export declare class ActionsSource {
    private readonly viewModel;
    private readonly modifiedBaseRange;
    constructor(viewModel: MergeEditorViewModel, modifiedBaseRange: ModifiedBaseRange);
    private getItemsInput;
    readonly itemsInput1: IObservable<IContentWidgetAction[], void>;
    readonly itemsInput2: IObservable<IContentWidgetAction[], void>;
    readonly resultItems: IObservable<IContentWidgetAction[], void>;
    readonly isEmpty: IObservable<boolean, void>;
    readonly inputIsEmpty: IObservable<boolean, void>;
}
export interface IContentWidgetAction {
    text: string;
    tooltip?: string;
    action?: () => Promise<void>;
}
