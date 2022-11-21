/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { IModelService } from 'vs/editor/common/services/model';
import { ModelService } from 'vs/editor/common/services/modelService';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ITextResourcePropertiesService } from 'vs/editor/common/services/textResourceConfiguration';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ILogService } from 'vs/platform/log/common/log';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IUndoRedoService } from 'vs/platform/undoRedo/common/undoRedo';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { ILanguageFeatureDebounceService } from 'vs/editor/common/services/languageFeatureDebounce';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
let WorkbenchModelService = class WorkbenchModelService extends ModelService {
    _pathService;
    constructor(configurationService, resourcePropertiesService, themeService, logService, undoRedoService, languageConfigurationService, languageService, languageFeatureDebounceService, languageFeaturesService, _pathService) {
        super(configurationService, resourcePropertiesService, themeService, logService, undoRedoService, languageService, languageConfigurationService, languageFeatureDebounceService, languageFeaturesService);
        this._pathService = _pathService;
    }
    _schemaShouldMaintainUndoRedoElements(resource) {
        return (super._schemaShouldMaintainUndoRedoElements(resource)
            || resource.scheme === this._pathService.defaultUriScheme);
    }
};
WorkbenchModelService = __decorate([
    __param(0, IConfigurationService),
    __param(1, ITextResourcePropertiesService),
    __param(2, IThemeService),
    __param(3, ILogService),
    __param(4, IUndoRedoService),
    __param(5, ILanguageConfigurationService),
    __param(6, ILanguageService),
    __param(7, ILanguageFeatureDebounceService),
    __param(8, ILanguageFeaturesService),
    __param(9, IPathService)
], WorkbenchModelService);
export { WorkbenchModelService };
registerSingleton(IModelService, WorkbenchModelService, 1 /* InstantiationType.Delayed */);
