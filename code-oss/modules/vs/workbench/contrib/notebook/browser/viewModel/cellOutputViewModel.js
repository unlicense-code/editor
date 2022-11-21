/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { RENDERER_NOT_AVAILABLE } from 'vs/workbench/contrib/notebook/common/notebookCommon';
let handle = 0;
export class CellOutputViewModel extends Disposable {
    cellViewModel;
    _outputRawData;
    _notebookService;
    _onDidResetRendererEmitter = this._register(new Emitter());
    onDidResetRenderer = this._onDidResetRendererEmitter.event;
    outputHandle = handle++;
    get model() {
        return this._outputRawData;
    }
    _pickedMimeType;
    get pickedMimeType() {
        return this._pickedMimeType;
    }
    set pickedMimeType(value) {
        this._pickedMimeType = value;
    }
    constructor(cellViewModel, _outputRawData, _notebookService) {
        super();
        this.cellViewModel = cellViewModel;
        this._outputRawData = _outputRawData;
        this._notebookService = _notebookService;
    }
    hasMultiMimeType() {
        if (this._outputRawData.outputs.length < 2) {
            return false;
        }
        const firstMimeType = this._outputRawData.outputs[0].mime;
        return this._outputRawData.outputs.some(output => output.mime !== firstMimeType);
    }
    resolveMimeTypes(textModel, kernelProvides) {
        const mimeTypes = this._notebookService.getOutputMimeTypeInfo(textModel, kernelProvides, this.model);
        let index = -1;
        if (this._pickedMimeType) {
            index = mimeTypes.findIndex(mimeType => mimeType.rendererId === this._pickedMimeType.rendererId && mimeType.mimeType === this._pickedMimeType.mimeType && mimeType.isTrusted);
        }
        // there is at least one mimetype which is safe and can be rendered by the core
        if (index === -1) {
            index = mimeTypes.findIndex(mimeType => mimeType.rendererId !== RENDERER_NOT_AVAILABLE && mimeType.isTrusted);
        }
        return [mimeTypes, Math.max(index, 0)];
    }
    resetRenderer() {
        // reset the output renderer
        this._pickedMimeType = undefined;
        this._onDidResetRendererEmitter.fire();
    }
    toRawJSON() {
        return {
            outputs: this._outputRawData.outputs,
            // TODO@rebronix, no id, right?
        };
    }
}
