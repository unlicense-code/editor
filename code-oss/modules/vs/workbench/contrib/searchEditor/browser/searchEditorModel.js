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
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { parseSavedSearchEditor, parseSerializedSearchEditor } from 'vs/workbench/contrib/searchEditor/browser/searchEditorSerialization';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { assertIsDefined } from 'vs/base/common/types';
import { createTextBufferFactoryFromStream } from 'vs/editor/common/model/textModel';
import { SearchEditorWorkingCopyTypeId } from 'vs/workbench/contrib/searchEditor/browser/constants';
import { Emitter } from 'vs/base/common/event';
import { ResourceMap } from 'vs/base/common/map';
export class SearchConfigurationModel {
    config;
    _onConfigDidUpdate = new Emitter();
    onConfigDidUpdate = this._onConfigDidUpdate.event;
    constructor(config) {
        this.config = config;
    }
    updateConfig(config) { this.config = config; this._onConfigDidUpdate.fire(config); }
}
let SearchEditorModel = class SearchEditorModel {
    resource;
    workingCopyBackupService;
    constructor(resource, workingCopyBackupService) {
        this.resource = resource;
        this.workingCopyBackupService = workingCopyBackupService;
    }
    async resolve() {
        return assertIsDefined(searchEditorModelFactory.models.get(this.resource)).resolve();
    }
};
SearchEditorModel = __decorate([
    __param(1, IWorkingCopyBackupService)
], SearchEditorModel);
export { SearchEditorModel };
class SearchEditorModelFactory {
    models = new ResourceMap();
    constructor() { }
    initializeModelFromExistingModel(accessor, resource, config) {
        if (this.models.has(resource)) {
            throw Error('Unable to contruct model for resource that already exists');
        }
        const languageService = accessor.get(ILanguageService);
        const modelService = accessor.get(IModelService);
        const instantiationService = accessor.get(IInstantiationService);
        const workingCopyBackupService = accessor.get(IWorkingCopyBackupService);
        let ongoingResolve;
        this.models.set(resource, {
            resolve: () => {
                if (!ongoingResolve) {
                    ongoingResolve = (async () => {
                        const backup = await this.tryFetchModelFromBackupService(resource, languageService, modelService, workingCopyBackupService, instantiationService);
                        if (backup) {
                            return backup;
                        }
                        return Promise.resolve({
                            resultsModel: modelService.getModel(resource) ?? modelService.createModel('', languageService.createById('search-result'), resource),
                            configurationModel: new SearchConfigurationModel(config)
                        });
                    })();
                }
                return ongoingResolve;
            }
        });
    }
    initializeModelFromRawData(accessor, resource, config, contents) {
        if (this.models.has(resource)) {
            throw Error('Unable to contruct model for resource that already exists');
        }
        const languageService = accessor.get(ILanguageService);
        const modelService = accessor.get(IModelService);
        const instantiationService = accessor.get(IInstantiationService);
        const workingCopyBackupService = accessor.get(IWorkingCopyBackupService);
        let ongoingResolve;
        this.models.set(resource, {
            resolve: () => {
                if (!ongoingResolve) {
                    ongoingResolve = (async () => {
                        const backup = await this.tryFetchModelFromBackupService(resource, languageService, modelService, workingCopyBackupService, instantiationService);
                        if (backup) {
                            return backup;
                        }
                        return Promise.resolve({
                            resultsModel: modelService.createModel(contents ?? '', languageService.createById('search-result'), resource),
                            configurationModel: new SearchConfigurationModel(config)
                        });
                    })();
                }
                return ongoingResolve;
            }
        });
    }
    initializeModelFromExistingFile(accessor, resource, existingFile) {
        if (this.models.has(resource)) {
            throw Error('Unable to contruct model for resource that already exists');
        }
        const languageService = accessor.get(ILanguageService);
        const modelService = accessor.get(IModelService);
        const instantiationService = accessor.get(IInstantiationService);
        const workingCopyBackupService = accessor.get(IWorkingCopyBackupService);
        let ongoingResolve;
        this.models.set(resource, {
            resolve: async () => {
                if (!ongoingResolve) {
                    ongoingResolve = (async () => {
                        const backup = await this.tryFetchModelFromBackupService(resource, languageService, modelService, workingCopyBackupService, instantiationService);
                        if (backup) {
                            return backup;
                        }
                        const { text, config } = await instantiationService.invokeFunction(parseSavedSearchEditor, existingFile);
                        return ({
                            resultsModel: modelService.createModel(text ?? '', languageService.createById('search-result'), resource),
                            configurationModel: new SearchConfigurationModel(config)
                        });
                    })();
                }
                return ongoingResolve;
            }
        });
    }
    async tryFetchModelFromBackupService(resource, languageService, modelService, workingCopyBackupService, instantiationService) {
        const backup = await workingCopyBackupService.resolve({ resource, typeId: SearchEditorWorkingCopyTypeId });
        let model = modelService.getModel(resource);
        if (!model && backup) {
            const factory = await createTextBufferFactoryFromStream(backup.value);
            model = modelService.createModel(factory, languageService.createById('search-result'), resource);
        }
        if (model) {
            const existingFile = model.getValue();
            const { text, config } = parseSerializedSearchEditor(existingFile);
            modelService.destroyModel(resource);
            return ({
                resultsModel: modelService.createModel(text ?? '', languageService.createById('search-result'), resource),
                configurationModel: new SearchConfigurationModel(config)
            });
        }
        else {
            return undefined;
        }
    }
}
export const searchEditorModelFactory = new SearchEditorModelFactory();
