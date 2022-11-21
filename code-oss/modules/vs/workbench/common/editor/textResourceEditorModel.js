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
import { BaseTextEditorModel } from 'vs/workbench/common/editor/textEditorModel';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageDetectionService } from 'vs/workbench/services/languageDetection/common/languageDetectionWorkerService';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
/**
 * An editor model for in-memory, readonly text content that
 * is backed by an existing editor model.
 */
let TextResourceEditorModel = class TextResourceEditorModel extends BaseTextEditorModel {
    constructor(resource, languageService, modelService, languageDetectionService, accessibilityService) {
        super(modelService, languageService, languageDetectionService, accessibilityService, resource);
    }
    dispose() {
        // force this class to dispose the underlying model
        if (this.textEditorModelHandle) {
            this.modelService.destroyModel(this.textEditorModelHandle);
        }
        super.dispose();
    }
};
TextResourceEditorModel = __decorate([
    __param(1, ILanguageService),
    __param(2, IModelService),
    __param(3, ILanguageDetectionService),
    __param(4, IAccessibilityService)
], TextResourceEditorModel);
export { TextResourceEditorModel };
