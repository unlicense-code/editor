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
import { VSBuffer } from 'vs/base/common/buffer';
import { Event } from 'vs/base/common/event';
import * as paths from 'vs/base/common/path';
import { isEqual } from 'vs/base/common/resources';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { IInteractiveDocumentService } from 'vs/workbench/contrib/interactive/browser/interactiveDocumentService';
import { IInteractiveHistoryService } from 'vs/workbench/contrib/interactive/browser/interactiveHistoryService';
import { NotebookEditorInput } from 'vs/workbench/contrib/notebook/common/notebookEditorInput';
let InteractiveEditorInput = class InteractiveEditorInput extends EditorInput {
    static create(instantiationService, resource, inputResource, title) {
        return instantiationService.createInstance(InteractiveEditorInput, resource, inputResource, title);
    }
    static ID = 'workbench.input.interactive';
    get editorId() {
        return InteractiveEditorInput.ID;
    }
    get typeId() {
        return InteractiveEditorInput.ID;
    }
    _initTitle;
    _notebookEditorInput;
    get notebookEditorInput() {
        return this._notebookEditorInput;
    }
    get editorInputs() {
        return [this._notebookEditorInput];
    }
    _resource;
    get resource() {
        return this._resource;
    }
    _inputResource;
    get inputResource() {
        return this._inputResource;
    }
    _inputResolver;
    _editorModelReference;
    _inputModelRef;
    get primary() {
        return this._notebookEditorInput;
    }
    _textModelService;
    _interactiveDocumentService;
    _historyService;
    constructor(resource, inputResource, title, instantiationService, textModelService, interactiveDocumentService, historyService) {
        const input = NotebookEditorInput.create(instantiationService, resource, 'interactive', {});
        super();
        this._notebookEditorInput = input;
        this._register(this._notebookEditorInput);
        this._initTitle = title;
        this._resource = resource;
        this._inputResource = inputResource;
        this._inputResolver = null;
        this._editorModelReference = null;
        this._inputModelRef = null;
        this._textModelService = textModelService;
        this._interactiveDocumentService = interactiveDocumentService;
        this._historyService = historyService;
        this._registerListeners();
    }
    _registerListeners() {
        const oncePrimaryDisposed = Event.once(this.primary.onWillDispose);
        this._register(oncePrimaryDisposed(() => {
            if (!this.isDisposed()) {
                this.dispose();
            }
        }));
        // Re-emit some events from the primary side to the outside
        this._register(this.primary.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
        this._register(this.primary.onDidChangeLabel(() => this._onDidChangeLabel.fire()));
        // Re-emit some events from both sides to the outside
        this._register(this.primary.onDidChangeCapabilities(() => this._onDidChangeCapabilities.fire()));
    }
    isDirty() {
        return false;
    }
    async _resolveEditorModel() {
        if (!this._editorModelReference) {
            this._editorModelReference = await this._notebookEditorInput.resolve();
        }
        return this._editorModelReference;
    }
    async resolve() {
        if (this._editorModelReference) {
            return this._editorModelReference;
        }
        if (this._inputResolver) {
            return this._inputResolver;
        }
        this._inputResolver = this._resolveEditorModel().then(editorModel => {
            if (this._data) {
                editorModel?.notebook.reset(this._data.notebookData.cells.map((cell) => deserializeCell(cell)), this._data.notebookData.metadata, this._data.notebookData.transientOptions);
            }
            return editorModel;
        });
        return this._inputResolver;
    }
    async resolveInput(language) {
        if (this._inputModelRef) {
            return this._inputModelRef.object.textEditorModel;
        }
        this._interactiveDocumentService.willCreateInteractiveDocument(this.resource, this.inputResource, language);
        this._inputModelRef = await this._textModelService.createModelReference(this.inputResource);
        if (this._data && this._data.inputData) {
            this._inputModelRef.object.textEditorModel.setValue(this._data.inputData.value);
        }
        return this._inputModelRef.object.textEditorModel;
    }
    matches(otherInput) {
        if (super.matches(otherInput)) {
            return true;
        }
        if (otherInput instanceof InteractiveEditorInput) {
            return isEqual(this.resource, otherInput.resource) && isEqual(this.inputResource, otherInput.inputResource);
        }
        return false;
    }
    getName() {
        if (this._initTitle) {
            return this._initTitle;
        }
        const p = this.primary.resource.path;
        const basename = paths.basename(p);
        return basename.substr(0, basename.length - paths.extname(p).length);
    }
    getSerialization() {
        return {
            notebookData: this._serializeNotebook(this._editorModelReference?.notebook),
            inputData: this._inputModelRef ? {
                value: this._inputModelRef.object.textEditorModel.getValue(),
                language: this._inputModelRef.object.textEditorModel.getLanguageId()
            } : undefined
        };
    }
    _data;
    async restoreSerialization(data) {
        this._data = data;
    }
    _serializeNotebook(notebook) {
        if (!notebook) {
            return undefined;
        }
        const cells = notebook.cells.map(cell => serializeCell(cell));
        return {
            cells: cells,
            metadata: notebook.metadata,
            transientOptions: notebook.transientOptions
        };
    }
    dispose() {
        // we support closing the interactive window without prompt, so the editor model should not be dirty
        this._editorModelReference?.revert({ soft: true });
        this._notebookEditorInput?.dispose();
        this._editorModelReference?.dispose();
        this._editorModelReference = null;
        this._interactiveDocumentService.willRemoveInteractiveDocument(this.resource, this.inputResource);
        this._inputModelRef?.dispose();
        this._inputModelRef = null;
        super.dispose();
    }
    get historyService() {
        return this._historyService;
    }
};
InteractiveEditorInput = __decorate([
    __param(3, IInstantiationService),
    __param(4, ITextModelService),
    __param(5, IInteractiveDocumentService),
    __param(6, IInteractiveHistoryService)
], InteractiveEditorInput);
export { InteractiveEditorInput };
function serializeCell(cell) {
    return {
        cellKind: cell.cellKind,
        language: cell.language,
        metadata: cell.metadata,
        mime: cell.mime,
        outputs: cell.outputs.map(output => serializeCellOutput(output)),
        source: cell.getValue()
    };
}
function deserializeCell(cell) {
    return {
        cellKind: cell.cellKind,
        source: cell.source,
        language: cell.language,
        metadata: cell.metadata,
        mime: cell.mime,
        outputs: cell.outputs.map((output) => deserializeCellOutput(output))
    };
}
function serializeCellOutput(output) {
    return {
        outputId: output.outputId,
        outputs: output.outputs.map(ot => ({
            mime: ot.mime,
            data: ot.data.buffer ? Array.from(ot.data.buffer) : []
        })),
        metadata: output.metadata
    };
}
function deserializeCellOutput(output) {
    return {
        outputId: output.outputId,
        outputs: output.outputs.map(ot => ({
            mime: ot.mime,
            data: VSBuffer.fromByteArray(ot.data)
        })),
        metadata: output.metadata
    };
}
