/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable } from 'vs/base/common/lifecycle';
import { Emitter } from 'vs/base/common/event';
export class NotebookFindFilters extends Disposable {
    _onDidChange = this._register(new Emitter());
    onDidChange = this._onDidChange.event;
    _markupInput = true;
    get markupInput() {
        return this._markupInput;
    }
    set markupInput(value) {
        if (this._markupInput !== value) {
            this._markupInput = value;
            this._markupPreview = !value;
            this._onDidChange.fire({ markupInput: value, markupPreview: this._markupPreview });
        }
    }
    _markupPreview = true;
    get markupPreview() {
        return this._markupPreview;
    }
    set markupPreview(value) {
        if (this._markupPreview !== value) {
            this._markupPreview = value;
            this._markupInput = !value;
            this._onDidChange.fire({ markupPreview: value, markupInput: this._markupInput });
        }
    }
    _codeInput = true;
    get codeInput() {
        return this._codeInput;
    }
    set codeInput(value) {
        if (this._codeInput !== value) {
            this._codeInput = value;
            this._onDidChange.fire({ codeInput: value });
        }
    }
    _codeOutput = true;
    get codeOutput() {
        return this._codeOutput;
    }
    set codeOutput(value) {
        if (this._codeOutput !== value) {
            this._codeOutput = value;
            this._onDidChange.fire({ codeOutput: value });
        }
    }
    constructor(markupInput, markupPreview, codeInput, codeOutput) {
        super();
        this._markupInput = markupInput;
        this._markupPreview = markupPreview;
        this._codeInput = codeInput;
        this._codeOutput = codeOutput;
    }
    update(v) {
        this._markupInput = v.markupInput;
        this._markupPreview = v.markupPreview;
        this._codeInput = v.codeInput;
        this._codeOutput = v.codeOutput;
    }
}
