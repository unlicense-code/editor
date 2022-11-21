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
import { localize } from 'vs/nls';
import { process } from 'vs/base/parts/sandbox/electron-sandbox/globals';
import { AbstractTextFileService } from 'vs/workbench/services/textfile/browser/textFileService';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IFileService, ByteSize, getPlatformLimits } from 'vs/platform/files/common/files';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { IUntitledTextEditorService } from 'vs/workbench/services/untitled/common/untitledTextEditorService';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IModelService } from 'vs/editor/common/services/model';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IDialogService, IFileDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IFilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { IWorkingCopyFileService } from 'vs/workbench/services/workingCopy/common/workingCopyFileService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IElevatedFileService } from 'vs/workbench/services/files/common/elevatedFileService';
import { ILogService } from 'vs/platform/log/common/log';
import { Promises } from 'vs/base/common/async';
import { IDecorationsService } from 'vs/workbench/services/decorations/common/decorations';
let NativeTextFileService = class NativeTextFileService extends AbstractTextFileService {
    environmentService;
    constructor(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, elevatedFileService, logService, decorationsService) {
        super(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, logService, elevatedFileService, decorationsService);
        this.environmentService = environmentService;
        this.registerListeners();
    }
    registerListeners() {
        // Lifecycle
        this.lifecycleService.onWillShutdown(event => event.join(this.onWillShutdown(), { id: 'join.textFiles', label: localize('join.textFiles', "Saving text files") }));
    }
    async onWillShutdown() {
        let modelsPendingToSave;
        // As long as models are pending to be saved, we prolong the shutdown
        // until that has happened to ensure we are not shutting down in the
        // middle of writing to the file
        // (https://github.com/microsoft/vscode/issues/116600)
        while ((modelsPendingToSave = this.files.models.filter(model => model.hasState(2 /* TextFileEditorModelState.PENDING_SAVE */))).length > 0) {
            await Promises.settled(modelsPendingToSave.map(model => model.joinState(2 /* TextFileEditorModelState.PENDING_SAVE */)));
        }
    }
    async read(resource, options) {
        // ensure size & memory limits
        options = this.ensureLimits(options);
        return super.read(resource, options);
    }
    async readStream(resource, options) {
        // ensure size & memory limits
        options = this.ensureLimits(options);
        return super.readStream(resource, options);
    }
    ensureLimits(options) {
        let ensuredOptions;
        if (!options) {
            ensuredOptions = Object.create(null);
        }
        else {
            ensuredOptions = options;
        }
        let ensuredLimits;
        if (!ensuredOptions.limits) {
            ensuredLimits = Object.create(null);
            ensuredOptions.limits = ensuredLimits;
        }
        else {
            ensuredLimits = ensuredOptions.limits;
        }
        if (typeof ensuredLimits.size !== 'number') {
            ensuredLimits.size = getPlatformLimits(process.arch === 'ia32' ? 0 /* Arch.IA32 */ : 1 /* Arch.OTHER */).maxFileSize;
        }
        if (typeof ensuredLimits.memory !== 'number') {
            const maxMemory = this.environmentService.args['max-memory'];
            ensuredLimits.memory = Math.max(typeof maxMemory === 'string' ? parseInt(maxMemory) * ByteSize.MB || 0 : 0, getPlatformLimits(process.arch === 'ia32' ? 0 /* Arch.IA32 */ : 1 /* Arch.OTHER */).maxHeapSize);
        }
        return ensuredOptions;
    }
};
NativeTextFileService = __decorate([
    __param(0, IFileService),
    __param(1, IUntitledTextEditorService),
    __param(2, ILifecycleService),
    __param(3, IInstantiationService),
    __param(4, IModelService),
    __param(5, INativeWorkbenchEnvironmentService),
    __param(6, IDialogService),
    __param(7, IFileDialogService),
    __param(8, ITextResourceConfigurationService),
    __param(9, IFilesConfigurationService),
    __param(10, ICodeEditorService),
    __param(11, IPathService),
    __param(12, IWorkingCopyFileService),
    __param(13, IUriIdentityService),
    __param(14, ILanguageService),
    __param(15, IElevatedFileService),
    __param(16, ILogService),
    __param(17, IDecorationsService)
], NativeTextFileService);
export { NativeTextFileService };
registerSingleton(ITextFileService, NativeTextFileService, 0 /* InstantiationType.Eager */);
