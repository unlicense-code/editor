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
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { Disposable, dispose } from 'vs/base/common/lifecycle';
import { IUndoRedoService } from 'vs/platform/undoRedo/common/undoRedo';
import { MultiModelEditStackElement } from 'vs/editor/common/model/editStack';
let ModelUndoRedoParticipant = class ModelUndoRedoParticipant extends Disposable {
    _modelService;
    _textModelService;
    _undoRedoService;
    constructor(_modelService, _textModelService, _undoRedoService) {
        super();
        this._modelService = _modelService;
        this._textModelService = _textModelService;
        this._undoRedoService = _undoRedoService;
        this._register(this._modelService.onModelRemoved((model) => {
            // a model will get disposed, so let's check if the undo redo stack is maintained
            const elements = this._undoRedoService.getElements(model.uri);
            if (elements.past.length === 0 && elements.future.length === 0) {
                return;
            }
            for (const element of elements.past) {
                if (element instanceof MultiModelEditStackElement) {
                    element.setDelegate(this);
                }
            }
            for (const element of elements.future) {
                if (element instanceof MultiModelEditStackElement) {
                    element.setDelegate(this);
                }
            }
        }));
    }
    prepareUndoRedo(element) {
        // Load all the needed text models
        const missingModels = element.getMissingModels();
        if (missingModels.length === 0) {
            // All models are available!
            return Disposable.None;
        }
        const disposablesPromises = missingModels.map(async (uri) => {
            try {
                const reference = await this._textModelService.createModelReference(uri);
                return reference;
            }
            catch (err) {
                // This model could not be loaded, maybe it was deleted in the meantime?
                return Disposable.None;
            }
        });
        return Promise.all(disposablesPromises).then(disposables => {
            return {
                dispose: () => dispose(disposables)
            };
        });
    }
};
ModelUndoRedoParticipant = __decorate([
    __param(0, IModelService),
    __param(1, ITextModelService),
    __param(2, IUndoRedoService)
], ModelUndoRedoParticipant);
export { ModelUndoRedoParticipant };
