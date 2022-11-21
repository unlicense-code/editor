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
import { generateUuid } from 'vs/base/common/uuid';
import { PrefixSumComputer } from 'vs/editor/common/model/prefixSumComputer';
import { CellOutputViewModel } from 'vs/workbench/contrib/notebook/browser/viewModel/cellOutputViewModel';
import { INotebookService } from 'vs/workbench/contrib/notebook/common/notebookService';
let DiffNestedCellViewModel = class DiffNestedCellViewModel extends Disposable {
    textModel;
    _notebookService;
    _id;
    get id() {
        return this._id;
    }
    get outputs() {
        return this.textModel.outputs;
    }
    get language() {
        return this.textModel.language;
    }
    get metadata() {
        return this.textModel.metadata;
    }
    get uri() {
        return this.textModel.uri;
    }
    get handle() {
        return this.textModel.handle;
    }
    _onDidChangeState = this._register(new Emitter());
    _hoveringOutput = false;
    get outputIsHovered() {
        return this._hoveringOutput;
    }
    set outputIsHovered(v) {
        this._hoveringOutput = v;
        this._onDidChangeState.fire({ outputIsHoveredChanged: true });
    }
    _focusOnOutput = false;
    get outputIsFocused() {
        return this._focusOnOutput;
    }
    set outputIsFocused(v) {
        this._focusOnOutput = v;
        this._onDidChangeState.fire({ outputIsFocusedChanged: true });
    }
    _outputViewModels;
    get outputsViewModels() {
        return this._outputViewModels;
    }
    _outputCollection = [];
    _outputsTop = null;
    _onDidChangeOutputLayout = this._register(new Emitter());
    onDidChangeOutputLayout = this._onDidChangeOutputLayout.event;
    constructor(textModel, _notebookService) {
        super();
        this.textModel = textModel;
        this._notebookService = _notebookService;
        this._id = generateUuid();
        this._outputViewModels = this.textModel.outputs.map(output => new CellOutputViewModel(this, output, this._notebookService));
        this._register(this.textModel.onDidChangeOutputs((splice) => {
            this._outputCollection.splice(splice.start, splice.deleteCount, ...splice.newOutputs.map(() => 0));
            this._outputViewModels.splice(splice.start, splice.deleteCount, ...splice.newOutputs.map(output => new CellOutputViewModel(this, output, this._notebookService)));
            this._outputsTop = null;
            this._onDidChangeOutputLayout.fire();
        }));
        this._outputCollection = new Array(this.textModel.outputs.length);
    }
    _ensureOutputsTop() {
        if (!this._outputsTop) {
            const values = new Uint32Array(this._outputCollection.length);
            for (let i = 0; i < this._outputCollection.length; i++) {
                values[i] = this._outputCollection[i];
            }
            this._outputsTop = new PrefixSumComputer(values);
        }
    }
    getOutputOffset(index) {
        this._ensureOutputsTop();
        if (index >= this._outputCollection.length) {
            throw new Error('Output index out of range!');
        }
        return this._outputsTop.getPrefixSum(index - 1);
    }
    updateOutputHeight(index, height) {
        if (index >= this._outputCollection.length) {
            throw new Error('Output index out of range!');
        }
        this._ensureOutputsTop();
        this._outputCollection[index] = height;
        if (this._outputsTop.setValue(index, height)) {
            this._onDidChangeOutputLayout.fire();
        }
    }
    getOutputTotalHeight() {
        this._ensureOutputsTop();
        return this._outputsTop?.getTotalSum() ?? 0;
    }
};
DiffNestedCellViewModel = __decorate([
    __param(1, INotebookService)
], DiffNestedCellViewModel);
export { DiffNestedCellViewModel };
