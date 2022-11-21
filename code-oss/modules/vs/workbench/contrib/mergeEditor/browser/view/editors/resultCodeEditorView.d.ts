import { IObservable } from 'vs/base/common/observable';
import { IEditorContributionDescription } from 'vs/editor/browser/editorExtensions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILabelService } from 'vs/platform/label/common/label';
import { MergeEditorViewModel } from 'vs/workbench/contrib/mergeEditor/browser/view/viewModel';
import { CodeEditorView } from './codeEditorView';
export declare class ResultCodeEditorView extends CodeEditorView {
    private readonly _labelService;
    constructor(viewModel: IObservable<MergeEditorViewModel | undefined>, instantiationService: IInstantiationService, _labelService: ILabelService, configurationService: IConfigurationService);
    private readonly decorations;
    protected getEditorContributions(): IEditorContributionDescription[] | undefined;
}
