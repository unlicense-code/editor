import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { ISingleEditOperation } from 'vs/editor/common/core/editOperation';
import { ITextBuffer, ITextBufferFactory, ITextModel, ITextModelCreationOptions } from 'vs/editor/common/model';
import { ILanguageSelection, ILanguageService } from 'vs/editor/common/languages/language';
import { IModelService, DocumentTokensProvider } from 'vs/editor/common/services/model';
import { ITextResourcePropertiesService } from 'vs/editor/common/services/textResourceConfiguration';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ILogService } from 'vs/platform/log/common/log';
import { IUndoRedoService } from 'vs/platform/undoRedo/common/undoRedo';
import { SemanticTokensProviderStyling } from 'vs/editor/common/services/semanticTokensProviderStyling';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { ILanguageFeatureDebounceService } from 'vs/editor/common/services/languageFeatureDebounce';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
export interface IEditorSemanticHighlightingOptions {
    enabled: true | false | 'configuredByTheme';
}
export declare class ModelService extends Disposable implements IModelService {
    private readonly _configurationService;
    private readonly _resourcePropertiesService;
    private readonly _themeService;
    private readonly _logService;
    private readonly _undoRedoService;
    private readonly _languageService;
    private readonly _languageConfigurationService;
    private readonly _languageFeatureDebounceService;
    static MAX_MEMORY_FOR_CLOSED_FILES_UNDO_STACK: number;
    _serviceBrand: undefined;
    private readonly _onModelAdded;
    readonly onModelAdded: Event<ITextModel>;
    private readonly _onModelRemoved;
    readonly onModelRemoved: Event<ITextModel>;
    private readonly _onModelModeChanged;
    readonly onModelLanguageChanged: Event<{
        model: ITextModel;
        oldLanguageId: string;
    }>;
    private _modelCreationOptionsByLanguageAndResource;
    /**
     * All the models known in the system.
     */
    private readonly _models;
    private readonly _disposedModels;
    private _disposedModelsHeapSize;
    private readonly _semanticStyling;
    constructor(_configurationService: IConfigurationService, _resourcePropertiesService: ITextResourcePropertiesService, _themeService: IThemeService, _logService: ILogService, _undoRedoService: IUndoRedoService, _languageService: ILanguageService, _languageConfigurationService: ILanguageConfigurationService, _languageFeatureDebounceService: ILanguageFeatureDebounceService, languageFeaturesService: ILanguageFeaturesService);
    private static _readModelOptions;
    private _getEOL;
    private _shouldRestoreUndoStack;
    getCreationOptions(language: string, resource: URI | undefined, isForSimpleWidget: boolean): ITextModelCreationOptions;
    private _updateModelOptions;
    private static _setModelOptionsForModel;
    private _insertDisposedModel;
    private _removeDisposedModel;
    private _ensureDisposedModelsHeapSize;
    private _createModelData;
    updateModel(model: ITextModel, value: string | ITextBufferFactory): void;
    private static _commonPrefix;
    private static _commonSuffix;
    /**
     * Compute edits to bring `model` to the state of `textSource`.
     */
    static _computeEdits(model: ITextModel, textBuffer: ITextBuffer): ISingleEditOperation[];
    createModel(value: string | ITextBufferFactory, languageSelection: ILanguageSelection | null, resource?: URI, isForSimpleWidget?: boolean): ITextModel;
    setMode(model: ITextModel, languageSelection: ILanguageSelection, source?: string): void;
    destroyModel(resource: URI): void;
    getModels(): ITextModel[];
    getModel(resource: URI): ITextModel | null;
    getSemanticTokensProviderStyling(provider: DocumentTokensProvider): SemanticTokensProviderStyling;
    protected _schemaShouldMaintainUndoRedoElements(resource: URI): boolean;
    private _onWillDispose;
    private _onDidChangeLanguage;
}
export declare const SEMANTIC_HIGHLIGHTING_SETTING_ID = "editor.semanticHighlighting";
export declare function isSemanticColoringEnabled(model: ITextModel, themeService: IThemeService, configurationService: IConfigurationService): boolean;
