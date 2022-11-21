import { IEditorOpenContext } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { AbstractTextResourceEditorInput } from 'vs/workbench/common/editor/textResourceEditorInput';
import { AbstractTextCodeEditor } from 'vs/workbench/browser/parts/editor/textCodeEditor';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ICodeEditorViewState } from 'vs/editor/common/editorCommon';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IEditorOptions as ICodeEditorOptions } from 'vs/editor/common/config/editorOptions';
import { ITextEditorOptions } from 'vs/platform/editor/common/editor';
import { IFileService } from 'vs/platform/files/common/files';
/**
 * An editor implementation that is capable of showing the contents of resource inputs. Uses
 * the TextEditor widget to show the contents.
 */
export declare abstract class AbstractTextResourceEditor extends AbstractTextCodeEditor<ICodeEditorViewState> {
    constructor(id: string, telemetryService: ITelemetryService, instantiationService: IInstantiationService, storageService: IStorageService, textResourceConfigurationService: ITextResourceConfigurationService, themeService: IThemeService, editorGroupService: IEditorGroupsService, editorService: IEditorService, fileService: IFileService);
    setInput(input: AbstractTextResourceEditorInput, options: ITextEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    /**
     * Reveals the last line of this editor if it has a model set.
     */
    revealLastLine(): void;
    clearInput(): void;
    protected tracksEditorViewState(input: EditorInput): boolean;
}
export declare class TextResourceEditor extends AbstractTextResourceEditor {
    private readonly modelService;
    private readonly languageService;
    static readonly ID = "workbench.editors.textResourceEditor";
    constructor(telemetryService: ITelemetryService, instantiationService: IInstantiationService, storageService: IStorageService, textResourceConfigurationService: ITextResourceConfigurationService, themeService: IThemeService, editorService: IEditorService, editorGroupService: IEditorGroupsService, modelService: IModelService, languageService: ILanguageService, fileService: IFileService);
    protected createEditorControl(parent: HTMLElement, configuration: ICodeEditorOptions): void;
    private onDidEditorPaste;
}
