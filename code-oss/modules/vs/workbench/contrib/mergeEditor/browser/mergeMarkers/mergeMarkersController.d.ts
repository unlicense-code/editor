import { Disposable } from 'vs/base/common/lifecycle';
import { IObservable } from 'vs/base/common/observable';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { MergeEditorViewModel } from 'vs/workbench/contrib/mergeEditor/browser/view/viewModel';
export declare const conflictMarkers: {
    start: string;
    end: string;
};
export declare class MergeMarkersController extends Disposable {
    readonly editor: ICodeEditor;
    readonly mergeEditorViewModel: IObservable<MergeEditorViewModel | undefined>;
    private readonly viewZoneIds;
    private readonly disposableStore;
    constructor(editor: ICodeEditor, mergeEditorViewModel: IObservable<MergeEditorViewModel | undefined>);
    private updateDecorations;
}
