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
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { Position } from 'vs/editor/common/core/position';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IModelService } from 'vs/editor/common/services/model';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
let TextResourceConfigurationService = class TextResourceConfigurationService extends Disposable {
    configurationService;
    modelService;
    languageService;
    _serviceBrand;
    _onDidChangeConfiguration = this._register(new Emitter());
    onDidChangeConfiguration = this._onDidChangeConfiguration.event;
    constructor(configurationService, modelService, languageService) {
        super();
        this.configurationService = configurationService;
        this.modelService = modelService;
        this.languageService = languageService;
        this._register(this.configurationService.onDidChangeConfiguration(e => this._onDidChangeConfiguration.fire(this.toResourceConfigurationChangeEvent(e))));
    }
    getValue(resource, arg2, arg3) {
        if (typeof arg3 === 'string') {
            return this._getValue(resource, Position.isIPosition(arg2) ? arg2 : null, arg3);
        }
        return this._getValue(resource, null, typeof arg2 === 'string' ? arg2 : undefined);
    }
    updateValue(resource, key, value, configurationTarget) {
        const language = this.getLanguage(resource, null);
        const configurationValue = this.configurationService.inspect(key, { resource, overrideIdentifier: language });
        if (configurationTarget === undefined) {
            configurationTarget = this.deriveConfigurationTarget(configurationValue, language);
        }
        switch (configurationTarget) {
            case 8 /* ConfigurationTarget.MEMORY */:
                return this._updateValue(key, value, configurationTarget, configurationValue.memory?.override, resource, language);
            case 6 /* ConfigurationTarget.WORKSPACE_FOLDER */:
                return this._updateValue(key, value, configurationTarget, configurationValue.workspaceFolder?.override, resource, language);
            case 5 /* ConfigurationTarget.WORKSPACE */:
                return this._updateValue(key, value, configurationTarget, configurationValue.workspace?.override, resource, language);
            case 4 /* ConfigurationTarget.USER_REMOTE */:
                return this._updateValue(key, value, configurationTarget, configurationValue.userRemote?.override, resource, language);
            default:
                return this._updateValue(key, value, configurationTarget, configurationValue.userLocal?.override, resource, language);
        }
    }
    _updateValue(key, value, configurationTarget, overriddenValue, resource, language) {
        if (language && overriddenValue !== undefined) {
            return this.configurationService.updateValue(key, value, { resource, overrideIdentifier: language }, configurationTarget);
        }
        else {
            return this.configurationService.updateValue(key, value, { resource }, configurationTarget);
        }
    }
    deriveConfigurationTarget(configurationValue, language) {
        if (language) {
            if (configurationValue.memory?.override !== undefined) {
                return 8 /* ConfigurationTarget.MEMORY */;
            }
            if (configurationValue.workspaceFolder?.override !== undefined) {
                return 6 /* ConfigurationTarget.WORKSPACE_FOLDER */;
            }
            if (configurationValue.workspace?.override !== undefined) {
                return 5 /* ConfigurationTarget.WORKSPACE */;
            }
            if (configurationValue.userRemote?.override !== undefined) {
                return 4 /* ConfigurationTarget.USER_REMOTE */;
            }
            if (configurationValue.userLocal?.override !== undefined) {
                return 3 /* ConfigurationTarget.USER_LOCAL */;
            }
        }
        if (configurationValue.memory?.value !== undefined) {
            return 8 /* ConfigurationTarget.MEMORY */;
        }
        if (configurationValue.workspaceFolder?.value !== undefined) {
            return 6 /* ConfigurationTarget.WORKSPACE_FOLDER */;
        }
        if (configurationValue.workspace?.value !== undefined) {
            return 5 /* ConfigurationTarget.WORKSPACE */;
        }
        if (configurationValue.userRemote?.value !== undefined) {
            return 4 /* ConfigurationTarget.USER_REMOTE */;
        }
        return 3 /* ConfigurationTarget.USER_LOCAL */;
    }
    _getValue(resource, position, section) {
        const language = resource ? this.getLanguage(resource, position) : undefined;
        if (typeof section === 'undefined') {
            return this.configurationService.getValue({ resource, overrideIdentifier: language });
        }
        return this.configurationService.getValue(section, { resource, overrideIdentifier: language });
    }
    getLanguage(resource, position) {
        const model = this.modelService.getModel(resource);
        if (model) {
            return position ? model.getLanguageIdAtPosition(position.lineNumber, position.column) : model.getLanguageId();
        }
        return this.languageService.guessLanguageIdByFilepathOrFirstLine(resource);
    }
    toResourceConfigurationChangeEvent(configurationChangeEvent) {
        return {
            affectedKeys: configurationChangeEvent.affectedKeys,
            affectsConfiguration: (resource, configuration) => {
                const overrideIdentifier = this.getLanguage(resource, null);
                return configurationChangeEvent.affectsConfiguration(configuration, { resource, overrideIdentifier });
            }
        };
    }
};
TextResourceConfigurationService = __decorate([
    __param(0, IConfigurationService),
    __param(1, IModelService),
    __param(2, ILanguageService)
], TextResourceConfigurationService);
export { TextResourceConfigurationService };
