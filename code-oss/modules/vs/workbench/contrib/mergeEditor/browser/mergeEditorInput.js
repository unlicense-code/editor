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
import { assertFn } from 'vs/base/common/assert';
import { autorun } from 'vs/base/common/observable';
import { isEqual } from 'vs/base/common/resources';
import { isDefined } from 'vs/base/common/types';
import { localize } from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILabelService } from 'vs/platform/label/common/label';
import { DEFAULT_EDITOR_ASSOCIATION, isResourceMergeEditorInput } from 'vs/workbench/common/editor';
import { AbstractTextResourceEditorInput } from 'vs/workbench/common/editor/textResourceEditorInput';
import { TempFileMergeEditorModeFactory, WorkspaceMergeEditorModeFactory } from 'vs/workbench/contrib/mergeEditor/browser/mergeEditorInputModel';
import { MergeEditorTelemetry } from 'vs/workbench/contrib/mergeEditor/browser/telemetry';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
export class MergeEditorInputData {
    uri;
    title;
    detail;
    description;
    constructor(uri, title, detail, description) {
        this.uri = uri;
        this.title = title;
        this.detail = detail;
        this.description = description;
    }
}
let MergeEditorInput = class MergeEditorInput extends AbstractTextResourceEditorInput {
    base;
    input1;
    input2;
    result;
    _instaService;
    configurationService;
    static ID = 'mergeEditor.Input';
    _inputModel;
    closeHandler = {
        showConfirm: () => this._inputModel?.shouldConfirmClose() ?? false,
        confirm: async (editors) => {
            assertFn(() => editors.every(e => e.editor instanceof MergeEditorInput));
            const inputModels = editors.map(e => e.editor._inputModel).filter(isDefined);
            return await this._inputModel.confirmClose(inputModels);
        },
    };
    get useWorkingCopy() {
        return this.configurationService.getValue('mergeEditor.useWorkingCopy') ?? false;
    }
    constructor(base, input1, input2, result, _instaService, editorService, textFileService, labelService, fileService, configurationService) {
        super(result, undefined, editorService, textFileService, labelService, fileService);
        this.base = base;
        this.input1 = input1;
        this.input2 = input2;
        this.result = result;
        this._instaService = _instaService;
        this.configurationService = configurationService;
    }
    dispose() {
        super.dispose();
    }
    get typeId() {
        return MergeEditorInput.ID;
    }
    get editorId() {
        return DEFAULT_EDITOR_ASSOCIATION.id;
    }
    get capabilities() {
        let capabilities = super.capabilities | 256 /* EditorInputCapabilities.MultipleEditors */;
        if (this.useWorkingCopy) {
            capabilities |= 4 /* EditorInputCapabilities.Untitled */;
        }
        return capabilities;
    }
    getName() {
        return localize('name', "Merging: {0}", super.getName());
    }
    mergeEditorModeFactory = this._instaService.createInstance(this.useWorkingCopy
        ? TempFileMergeEditorModeFactory
        : WorkspaceMergeEditorModeFactory, this._instaService.createInstance(MergeEditorTelemetry));
    async resolve() {
        if (!this._inputModel) {
            const inputModel = this._register(await this.mergeEditorModeFactory.createInputModel({
                base: this.base,
                input1: this.input1,
                input2: this.input2,
                result: this.result,
            }));
            this._inputModel = inputModel;
            this._register(autorun('fire dirty event', (reader) => {
                inputModel.isDirty.read(reader);
                this._onDidChangeDirty.fire();
            }));
            await this._inputModel.model.onInitialized;
        }
        return this._inputModel;
    }
    async accept() {
        await this._inputModel?.accept();
    }
    async save(group, options) {
        await this._inputModel?.save(options);
        return undefined;
    }
    toUntyped() {
        return {
            input1: { resource: this.input1.uri, label: this.input1.title, description: this.input1.description, detail: this.input1.detail },
            input2: { resource: this.input2.uri, label: this.input2.title, description: this.input2.description, detail: this.input2.detail },
            base: { resource: this.base },
            result: { resource: this.result },
            options: {
                override: this.typeId
            }
        };
    }
    matches(otherInput) {
        if (this === otherInput) {
            return true;
        }
        if (otherInput instanceof MergeEditorInput) {
            return isEqual(this.base, otherInput.base)
                && isEqual(this.input1.uri, otherInput.input1.uri)
                && isEqual(this.input2.uri, otherInput.input2.uri)
                && isEqual(this.result, otherInput.result);
        }
        if (isResourceMergeEditorInput(otherInput)) {
            return (this.editorId === otherInput.options?.override || otherInput.options?.override === undefined)
                && isEqual(this.base, otherInput.base.resource)
                && isEqual(this.input1.uri, otherInput.input1.resource)
                && isEqual(this.input2.uri, otherInput.input2.resource)
                && isEqual(this.result, otherInput.result.resource);
        }
        return false;
    }
    async revert(group, options) {
        return this._inputModel?.revert(options);
    }
    // ---- FileEditorInput
    isDirty() {
        return this._inputModel?.isDirty.get() ?? false;
    }
    setLanguageId(languageId, source) {
        this._inputModel?.model.setLanguageId(languageId, source);
    }
};
MergeEditorInput = __decorate([
    __param(4, IInstantiationService),
    __param(5, IEditorService),
    __param(6, ITextFileService),
    __param(7, ILabelService),
    __param(8, IFileService),
    __param(9, IConfigurationService)
], MergeEditorInput);
export { MergeEditorInput };
