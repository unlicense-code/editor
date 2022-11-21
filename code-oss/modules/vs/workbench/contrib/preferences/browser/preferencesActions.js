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
import { Action } from 'vs/base/common/actions';
import { URI } from 'vs/base/common/uri';
import { getIconClasses } from 'vs/editor/common/services/getIconClasses';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import * as nls from 'vs/nls';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
let ConfigureLanguageBasedSettingsAction = class ConfigureLanguageBasedSettingsAction extends Action {
    modelService;
    languageService;
    quickInputService;
    preferencesService;
    static ID = 'workbench.action.configureLanguageBasedSettings';
    static LABEL = { value: nls.localize('configureLanguageBasedSettings', "Configure Language Specific Settings..."), original: 'Configure Language Specific Settings...' };
    constructor(id, label, modelService, languageService, quickInputService, preferencesService) {
        super(id, label);
        this.modelService = modelService;
        this.languageService = languageService;
        this.quickInputService = quickInputService;
        this.preferencesService = preferencesService;
    }
    async run() {
        const languages = this.languageService.getSortedRegisteredLanguageNames();
        const picks = languages.map(({ languageName, languageId }) => {
            const description = nls.localize('languageDescriptionConfigured', "({0})", languageId);
            // construct a fake resource to be able to show nice icons if any
            let fakeResource;
            const extensions = this.languageService.getExtensions(languageId);
            if (extensions.length) {
                fakeResource = URI.file(extensions[0]);
            }
            else {
                const filenames = this.languageService.getFilenames(languageId);
                if (filenames.length) {
                    fakeResource = URI.file(filenames[0]);
                }
            }
            return {
                label: languageName,
                iconClasses: getIconClasses(this.modelService, this.languageService, fakeResource),
                description
            };
        });
        await this.quickInputService.pick(picks, { placeHolder: nls.localize('pickLanguage', "Select Language") })
            .then(pick => {
            if (pick) {
                const languageId = this.languageService.getLanguageIdByLanguageName(pick.label);
                if (typeof languageId === 'string') {
                    return this.preferencesService.openLanguageSpecificSettings(languageId);
                }
            }
            return undefined;
        });
    }
};
ConfigureLanguageBasedSettingsAction = __decorate([
    __param(2, IModelService),
    __param(3, ILanguageService),
    __param(4, IQuickInputService),
    __param(5, IPreferencesService)
], ConfigureLanguageBasedSettingsAction);
export { ConfigureLanguageBasedSettingsAction };
