import { ITextModel, ITextBufferFactory, ITextSnapshot } from 'vs/editor/common/model';
import { EditorModel } from 'vs/workbench/common/editor/editorModel';
import { ILanguageSupport } from 'vs/workbench/services/textfile/common/textfiles';
import { URI } from 'vs/base/common/uri';
import { ITextEditorModel, IResolvedTextEditorModel } from 'vs/editor/common/services/resolverService';
import { ILanguageService, ILanguageSelection } from 'vs/editor/common/languages/language';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageDetectionService } from 'vs/workbench/services/languageDetection/common/languageDetectionWorkerService';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
/**
 * The base text editor model leverages the code editor model. This class is only intended to be subclassed and not instantiated.
 */
export declare class BaseTextEditorModel extends EditorModel implements ITextEditorModel, ILanguageSupport {
    protected modelService: IModelService;
    protected languageService: ILanguageService;
    private readonly languageDetectionService;
    private readonly accessibilityService;
    private static readonly AUTO_DETECT_LANGUAGE_THROTTLE_DELAY;
    protected textEditorModelHandle: URI | undefined;
    private createdEditorModel;
    private readonly modelDisposeListener;
    private readonly autoDetectLanguageThrottler;
    constructor(modelService: IModelService, languageService: ILanguageService, languageDetectionService: ILanguageDetectionService, accessibilityService: IAccessibilityService, textEditorModelHandle?: URI);
    private handleExistingModel;
    private registerModelDisposeListener;
    get textEditorModel(): ITextModel | null;
    isReadonly(): boolean;
    private _hasLanguageSetExplicitly;
    get hasLanguageSetExplicitly(): boolean;
    setLanguageId(languageId: string, source?: string): void;
    private setLanguageIdInternal;
    protected installModelListeners(model: ITextModel): void;
    getLanguageId(): string | undefined;
    protected autoDetectLanguage(): Promise<void>;
    private doAutoDetectLanguage;
    /**
     * Creates the text editor model with the provided value, optional preferred language
     * (can be comma separated for multiple values) and optional resource URL.
     */
    protected createTextEditorModel(value: ITextBufferFactory, resource: URI | undefined, preferredLanguageId?: string): ITextModel;
    private doCreateTextEditorModel;
    protected getFirstLineText(value: ITextBufferFactory | ITextModel): string;
    /**
     * Gets the language for the given identifier. Subclasses can override to provide their own implementation of this lookup.
     *
     * @param firstLineText optional first line of the text buffer to set the language on. This can be used to guess a language from content.
     */
    protected getOrCreateLanguage(resource: URI | undefined, languageService: ILanguageService, preferredLanguage: string | undefined, firstLineText?: string): ILanguageSelection;
    /**
     * Updates the text editor model with the provided value. If the value is the same as the model has, this is a no-op.
     */
    updateTextEditorModel(newValue?: ITextBufferFactory, preferredLanguageId?: string): void;
    createSnapshot(this: IResolvedTextEditorModel): ITextSnapshot;
    createSnapshot(this: ITextEditorModel): ITextSnapshot | null;
    isResolved(): this is IResolvedTextEditorModel;
    dispose(): void;
}
