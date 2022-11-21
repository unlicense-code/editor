/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
export class NotebookCellOutputTextModel extends Disposable {
    _rawOutput;
    _onDidChangeData = this._register(new Emitter());
    onDidChangeData = this._onDidChangeData.event;
    get outputs() {
        return this._rawOutput.outputs || [];
    }
    get metadata() {
        return this._rawOutput.metadata;
    }
    get outputId() {
        return this._rawOutput.outputId;
    }
    constructor(_rawOutput) {
        super();
        this._rawOutput = _rawOutput;
    }
    replaceData(items) {
        this._rawOutput.outputs = items;
        this._onDidChangeData.fire();
    }
    appendData(items) {
        this._rawOutput.outputs.push(...items);
        this._onDidChangeData.fire();
    }
    toJSON() {
        return {
            // data: this._data,
            metadata: this._rawOutput.metadata,
            outputs: this._rawOutput.outputs,
            outputId: this._rawOutput.outputId
        };
    }
}
