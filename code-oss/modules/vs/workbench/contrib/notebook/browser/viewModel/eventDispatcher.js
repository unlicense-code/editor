/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { NotebookViewEventType } from 'vs/workbench/contrib/notebook/browser/notebookViewEvents';
export class NotebookEventDispatcher extends Disposable {
    _onDidChangeLayout = this._register(new Emitter());
    onDidChangeLayout = this._onDidChangeLayout.event;
    _onDidChangeMetadata = this._register(new Emitter());
    onDidChangeMetadata = this._onDidChangeMetadata.event;
    _onDidChangeCellState = this._register(new Emitter());
    onDidChangeCellState = this._onDidChangeCellState.event;
    emit(events) {
        for (let i = 0, len = events.length; i < len; i++) {
            const e = events[i];
            switch (e.type) {
                case NotebookViewEventType.LayoutChanged:
                    this._onDidChangeLayout.fire(e);
                    break;
                case NotebookViewEventType.MetadataChanged:
                    this._onDidChangeMetadata.fire(e);
                    break;
                case NotebookViewEventType.CellStateChanged:
                    this._onDidChangeCellState.fire(e);
                    break;
            }
        }
    }
}
