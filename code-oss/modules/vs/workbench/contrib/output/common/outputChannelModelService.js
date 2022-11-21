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
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { createDecorator, IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IFileService } from 'vs/platform/files/common/files';
import { toLocalISOString } from 'vs/base/common/date';
import { joinPath } from 'vs/base/common/resources';
import { DelegatedOutputChannelModel, FileOutputChannelModel } from 'vs/workbench/contrib/output/common/outputChannelModel';
export const IOutputChannelModelService = createDecorator('outputChannelModelService');
let OutputChannelModelService = class OutputChannelModelService {
    fileService;
    instantiationService;
    outputLocation;
    constructor(fileService, instantiationService, environmentService) {
        this.fileService = fileService;
        this.instantiationService = instantiationService;
        this.outputLocation = joinPath(environmentService.windowLogsPath, `output_${toLocalISOString(new Date()).replace(/-|:|\.\d+Z$/g, '')}`);
    }
    createOutputChannelModel(id, modelUri, language, file) {
        return file ? this.instantiationService.createInstance(FileOutputChannelModel, modelUri, language, file) : this.instantiationService.createInstance(DelegatedOutputChannelModel, id, modelUri, language, this.outputDir);
    }
    _outputDir = null;
    get outputDir() {
        if (!this._outputDir) {
            this._outputDir = this.fileService.createFolder(this.outputLocation).then(() => this.outputLocation);
        }
        return this._outputDir;
    }
};
OutputChannelModelService = __decorate([
    __param(0, IFileService),
    __param(1, IInstantiationService),
    __param(2, IWorkbenchEnvironmentService)
], OutputChannelModelService);
export { OutputChannelModelService };
registerSingleton(IOutputChannelModelService, OutputChannelModelService, 1 /* InstantiationType.Delayed */);
