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
import { isEqual } from 'vs/base/common/resources';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
let CustomTextEditorModel = class CustomTextEditorModel extends Disposable {
    viewType;
    _resource;
    _model;
    textFileService;
    static async create(instantiationService, viewType, resource) {
        return instantiationService.invokeFunction(async (accessor) => {
            const textModelResolverService = accessor.get(ITextModelService);
            const model = await textModelResolverService.createModelReference(resource);
            return instantiationService.createInstance(CustomTextEditorModel, viewType, resource, model);
        });
    }
    _textFileModel;
    _onDidChangeOrphaned = this._register(new Emitter());
    onDidChangeOrphaned = this._onDidChangeOrphaned.event;
    _onDidChangeReadonly = this._register(new Emitter());
    onDidChangeReadonly = this._onDidChangeReadonly.event;
    constructor(viewType, _resource, _model, textFileService) {
        super();
        this.viewType = viewType;
        this._resource = _resource;
        this._model = _model;
        this.textFileService = textFileService;
        this._register(_model);
        this._textFileModel = this.textFileService.files.get(_resource);
        if (this._textFileModel) {
            this._register(this._textFileModel.onDidChangeOrphaned(() => this._onDidChangeOrphaned.fire()));
            this._register(this._textFileModel.onDidChangeReadonly(() => this._onDidChangeReadonly.fire()));
        }
        this._register(this.textFileService.files.onDidChangeDirty(e => {
            if (isEqual(this.resource, e.resource)) {
                this._onDidChangeDirty.fire();
                this._onDidChangeContent.fire();
            }
        }));
    }
    get resource() {
        return this._resource;
    }
    isReadonly() {
        return this._model.object.isReadonly();
    }
    get backupId() {
        return undefined;
    }
    isDirty() {
        return this.textFileService.isDirty(this.resource);
    }
    isOrphaned() {
        return !!this._textFileModel?.hasState(4 /* TextFileEditorModelState.ORPHAN */);
    }
    _onDidChangeDirty = this._register(new Emitter());
    onDidChangeDirty = this._onDidChangeDirty.event;
    _onDidChangeContent = this._register(new Emitter());
    onDidChangeContent = this._onDidChangeContent.event;
    async revert(options) {
        return this.textFileService.revert(this.resource, options);
    }
    saveCustomEditor(options) {
        return this.textFileService.save(this.resource, options);
    }
    async saveCustomEditorAs(resource, targetResource, options) {
        return !!await this.textFileService.saveAs(resource, targetResource, options);
    }
};
CustomTextEditorModel = __decorate([
    __param(3, ITextFileService)
], CustomTextEditorModel);
export { CustomTextEditorModel };
