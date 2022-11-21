import { IView } from 'vs/base/browser/ui/grid/grid';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IObservable } from 'vs/base/common/observable';
import { IEditorContributionDescription } from 'vs/editor/browser/editorExtensions';
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';
import { IEditorOptions } from 'vs/editor/common/config/editorOptions';
import { Range } from 'vs/editor/common/core/range';
import { Selection } from 'vs/editor/common/core/selection';
import { MenuId } from 'vs/platform/actions/common/actions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { MergeEditorViewModel } from 'vs/workbench/contrib/mergeEditor/browser/view/viewModel';
export declare abstract class CodeEditorView extends Disposable {
    private readonly instantiationService;
    readonly viewModel: IObservable<undefined | MergeEditorViewModel>;
    private readonly configurationService;
    readonly model: IObservable<import("../../model/mergeEditorModel").MergeEditorModel | undefined, void>;
    protected readonly htmlElements: {
        title: HTMLSpanElement;
        root: HTMLSpanElement & HTMLDivElement;
        description: HTMLSpanElement;
        detail: HTMLSpanElement;
        toolbar: HTMLSpanElement;
        header: HTMLDivElement;
        gutterDiv: HTMLDivElement;
        editor: HTMLDivElement;
    };
    private readonly _onDidViewChange;
    readonly view: IView;
    protected readonly checkboxesVisible: IObservable<boolean, void>;
    protected readonly showDeletionMarkers: IObservable<boolean, void>;
    protected readonly useSimplifiedDecorations: IObservable<boolean, void>;
    readonly editor: CodeEditorWidget;
    updateOptions(newOptions: Readonly<IEditorOptions>): void;
    readonly isFocused: IObservable<boolean, void>;
    readonly cursorPosition: IObservable<import("../../../../../../editor/common/core/position").Position | null, void>;
    readonly selection: IObservable<Selection[] | null, void>;
    readonly cursorLineNumber: IObservable<number | undefined, void>;
    constructor(instantiationService: IInstantiationService, viewModel: IObservable<undefined | MergeEditorViewModel>, configurationService: IConfigurationService);
    protected getEditorContributions(): IEditorContributionDescription[] | undefined;
}
export declare function createSelectionsAutorun(codeEditorView: CodeEditorView, translateRange: (baseRange: Range, viewModel: MergeEditorViewModel) => Range): IDisposable;
export declare class TitleMenu extends Disposable {
    constructor(menuId: MenuId, targetHtmlElement: HTMLElement, instantiationService: IInstantiationService);
}
