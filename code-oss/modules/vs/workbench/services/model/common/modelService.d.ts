import { URI } from 'vs/base/common/uri';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { ModelService } from 'vs/editor/common/services/modelService';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ITextResourcePropertiesService } from 'vs/editor/common/services/textResourceConfiguration';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILogService } from 'vs/platform/log/common/log';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IUndoRedoService } from 'vs/platform/undoRedo/common/undoRedo';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { ILanguageFeatureDebounceService } from 'vs/editor/common/services/languageFeatureDebounce';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
export declare class WorkbenchModelService extends ModelService {
    private readonly _pathService;
    constructor(configurationService: IConfigurationService, resourcePropertiesService: ITextResourcePropertiesService, themeService: IThemeService, logService: ILogService, undoRedoService: IUndoRedoService, languageConfigurationService: ILanguageConfigurationService, languageService: ILanguageService, languageFeatureDebounceService: ILanguageFeatureDebounceService, languageFeaturesService: ILanguageFeaturesService, _pathService: IPathService);
    protected _schemaShouldMaintainUndoRedoElements(resource: URI): boolean;
}
