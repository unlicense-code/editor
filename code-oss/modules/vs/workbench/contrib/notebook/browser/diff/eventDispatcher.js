/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
export var NotebookDiffViewEventType;
(function (NotebookDiffViewEventType) {
    NotebookDiffViewEventType[NotebookDiffViewEventType["LayoutChanged"] = 1] = "LayoutChanged";
    NotebookDiffViewEventType[NotebookDiffViewEventType["CellLayoutChanged"] = 2] = "CellLayoutChanged";
    // MetadataChanged = 2,
    // CellStateChanged = 3
})(NotebookDiffViewEventType || (NotebookDiffViewEventType = {}));
export class NotebookDiffLayoutChangedEvent {
    source;
    value;
    type = NotebookDiffViewEventType.LayoutChanged;
    constructor(source, value) {
        this.source = source;
        this.value = value;
    }
}
export class NotebookCellLayoutChangedEvent {
    source;
    type = NotebookDiffViewEventType.CellLayoutChanged;
    constructor(source) {
        this.source = source;
    }
}
export class NotebookDiffEditorEventDispatcher extends Disposable {
    _onDidChangeLayout = this._register(new Emitter());
    onDidChangeLayout = this._onDidChangeLayout.event;
    _onDidChangeCellLayout = this._register(new Emitter());
    onDidChangeCellLayout = this._onDidChangeCellLayout.event;
    emit(events) {
        for (let i = 0, len = events.length; i < len; i++) {
            const e = events[i];
            switch (e.type) {
                case NotebookDiffViewEventType.LayoutChanged:
                    this._onDidChangeLayout.fire(e);
                    break;
                case NotebookDiffViewEventType.CellLayoutChanged:
                    this._onDidChangeCellLayout.fire(e);
                    break;
            }
        }
    }
}
