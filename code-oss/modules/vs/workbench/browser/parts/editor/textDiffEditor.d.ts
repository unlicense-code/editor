import { ICodeEditor, IDiffEditor } from 'vs/editor/browser/editorBrowser';
import { IDiffEditorOptions, IEditorOptions as ICodeEditorOptions } from 'vs/editor/common/config/editorOptions';
import { AbstractTextEditor, IEditorConfiguration } from 'vs/workbench/browser/parts/editor/textEditor';
import { ITextDiffEditorPane, IEditorOpenContext } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { DiffEditorInput } from 'vs/workbench/common/editor/diffEditorInput';
import { DiffNavigator } from 'vs/editor/browser/widget/diffNavigator';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IDiffEditorViewState, IDiffEditorModel } from 'vs/editor/common/editorCommon';
import { URI } from 'vs/base/common/uri';
import { IEditorGroup, IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { CancellationToken } from 'vs/base/common/cancellation';
import { ITextEditorOptions } from 'vs/platform/editor/common/editor';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { Dimension } from 'vs/base/browser/dom';
import { IFileService } from 'vs/platform/files/common/files';
/**
 * The text editor that leverages the diff text editor for the editing experience.
 */
export declare class TextDiffEditor extends AbstractTextEditor<IDiffEditorViewState> implements ITextDiffEditorPane {
    static readonly ID = "workbench.editors.textDiffEditor";
    private diffEditorControl;
    private diffNavigator;
    private readonly diffNavigatorDisposables;
    get scopedContextKeyService(): IContextKeyService | undefined;
    constructor(telemetryService: ITelemetryService, instantiationService: IInstantiationService, storageService: IStorageService, configurationService: ITextResourceConfigurationService, editorService: IEditorService, themeService: IThemeService, editorGroupService: IEditorGroupsService, fileService: IFileService);
    getTitle(): string;
    protected createEditorControl(parent: HTMLElement, configuration: ICodeEditorOptions): void;
    protected updateEditorControlOptions(options: ICodeEditorOptions): void;
    protected getMainControl(): ICodeEditor | undefined;
    setInput(input: DiffEditorInput, options: ITextEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    private restoreTextDiffEditorViewState;
    private openAsBinary;
    setOptions(options: ITextEditorOptions | undefined): void;
    protected computeConfiguration(configuration: IEditorConfiguration): ICodeEditorOptions;
    protected getConfigurationOverrides(): IDiffEditorOptions;
    protected updateReadonly(input: EditorInput): void;
    private isFileBinaryError;
    clearInput(): void;
    getDiffNavigator(): DiffNavigator | undefined;
    getControl(): IDiffEditor | undefined;
    focus(): void;
    hasFocus(): boolean;
    protected setEditorVisible(visible: boolean, group: IEditorGroup | undefined): void;
    layout(dimension: Dimension): void;
    protected tracksEditorViewState(input: EditorInput): boolean;
    protected computeEditorViewState(resource: URI): IDiffEditorViewState | undefined;
    protected toEditorViewStateResource(modelOrInput: IDiffEditorModel | EditorInput): URI | undefined;
}
