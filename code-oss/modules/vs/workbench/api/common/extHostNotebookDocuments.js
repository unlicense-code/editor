/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
export class ExtHostNotebookDocuments {
    _notebooksAndEditors;
    _onDidSaveNotebookDocument = new Emitter();
    onDidSaveNotebookDocument = this._onDidSaveNotebookDocument.event;
    _onDidChangeNotebookDocument = new Emitter();
    onDidChangeNotebookDocument = this._onDidChangeNotebookDocument.event;
    constructor(_notebooksAndEditors) {
        this._notebooksAndEditors = _notebooksAndEditors;
    }
    $acceptModelChanged(uri, event, isDirty, newMetadata) {
        const document = this._notebooksAndEditors.getNotebookDocument(URI.revive(uri));
        const e = document.acceptModelChanged(event.value, isDirty, newMetadata);
        this._onDidChangeNotebookDocument.fire(e);
    }
    $acceptDirtyStateChanged(uri, isDirty) {
        const document = this._notebooksAndEditors.getNotebookDocument(URI.revive(uri));
        document.acceptDirty(isDirty);
    }
    $acceptModelSaved(uri) {
        const document = this._notebooksAndEditors.getNotebookDocument(URI.revive(uri));
        this._onDidSaveNotebookDocument.fire(document.apiNotebook);
    }
}
