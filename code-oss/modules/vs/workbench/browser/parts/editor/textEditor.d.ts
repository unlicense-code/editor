import { URI } from 'vs/base/common/uri';
import { Emitter, Event } from 'vs/base/common/event';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IEditorOpenContext, IEditorPaneSelection, EditorPaneSelectionCompareResult, IEditorPaneWithSelection, IEditorPaneSelectionChangeEvent } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { AbstractEditorWithViewState } from 'vs/workbench/browser/parts/editor/editorWithViewState';
import { IEditorViewState } from 'vs/editor/common/editorCommon';
import { Selection } from 'vs/editor/common/core/selection';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { IEditorOptions as ICodeEditorOptions } from 'vs/editor/common/config/editorOptions';
import { IEditorGroupsService, IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IEditorOptions, ITextEditorOptions } from 'vs/platform/editor/common/editor';
import { IFileService } from 'vs/platform/files/common/files';
export interface IEditorConfiguration {
    editor: object;
    diffEditor: object;
}
/**
 * The base class of editors that leverage any kind of text editor for the editing experience.
 */
export declare abstract class AbstractTextEditor<T extends IEditorViewState> extends AbstractEditorWithViewState<T> implements IEditorPaneWithSelection {
    protected readonly fileService: IFileService;
    private static readonly VIEW_STATE_PREFERENCE_KEY;
    protected readonly _onDidChangeSelection: Emitter<IEditorPaneSelectionChangeEvent>;
    readonly onDidChangeSelection: Event<IEditorPaneSelectionChangeEvent>;
    private editorContainer;
    private hasPendingConfigurationChange;
    private lastAppliedEditorOptions?;
    private readonly inputListener;
    constructor(id: string, telemetryService: ITelemetryService, instantiationService: IInstantiationService, storageService: IStorageService, textResourceConfigurationService: ITextResourceConfigurationService, themeService: IThemeService, editorService: IEditorService, editorGroupService: IEditorGroupsService, fileService: IFileService);
    private handleConfigurationChangeEvent;
    private consumePendingConfigurationChangeEvent;
    protected computeConfiguration(configuration: IEditorConfiguration): ICodeEditorOptions;
    private computeAriaLabel;
    private onDidChangeFileSystemProvider;
    private onDidChangeInputCapabilities;
    protected updateReadonly(input: EditorInput): void;
    protected getConfigurationOverrides(): ICodeEditorOptions;
    protected createEditor(parent: HTMLElement): void;
    private registerCodeEditorListeners;
    private toEditorPaneSelectionChangeReason;
    getSelection(): IEditorPaneSelection | undefined;
    /**
     * This method creates and returns the text editor control to be used.
     * Subclasses must override to provide their own editor control that
     * should be used (e.g. a text diff editor).
     *
     * The passed in configuration object should be passed to the editor
     * control when creating it.
     */
    protected abstract createEditorControl(parent: HTMLElement, initialOptions: ICodeEditorOptions): void;
    /**
     * The method asks to update the editor control options and is called
     * whenever there is change to the options.
     */
    protected abstract updateEditorControlOptions(options: ICodeEditorOptions): void;
    /**
     * This method returns the main, dominant instance of `ICodeEditor`
     * for the editor pane. E.g. for a diff editor, this is the right
     * hand (modified) side.
     */
    protected abstract getMainControl(): ICodeEditor | undefined;
    setInput(input: EditorInput, options: ITextEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    clearInput(): void;
    protected setEditorVisible(visible: boolean, group: IEditorGroup | undefined): void;
    protected toEditorViewStateResource(input: EditorInput): URI | undefined;
    private updateEditorConfiguration;
    private getActiveResource;
    dispose(): void;
}
export declare class TextEditorPaneSelection implements IEditorPaneSelection {
    private readonly textSelection;
    private static readonly TEXT_EDITOR_SELECTION_THRESHOLD;
    constructor(textSelection: Selection);
    compare(other: IEditorPaneSelection): EditorPaneSelectionCompareResult;
    restore(options: IEditorOptions): ITextEditorOptions;
    log(): string;
}
