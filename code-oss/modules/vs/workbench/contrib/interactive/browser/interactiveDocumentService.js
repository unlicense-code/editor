/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const IInteractiveDocumentService = createDecorator('IInteractiveDocumentService');
export class InteractiveDocumentService extends Disposable {
    _onWillAddInteractiveDocument = this._register(new Emitter());
    onWillAddInteractiveDocument = this._onWillAddInteractiveDocument.event;
    _onWillRemoveInteractiveDocument = this._register(new Emitter());
    onWillRemoveInteractiveDocument = this._onWillRemoveInteractiveDocument.event;
    constructor() {
        super();
    }
    willCreateInteractiveDocument(notebookUri, inputUri, languageId) {
        this._onWillAddInteractiveDocument.fire({
            notebookUri,
            inputUri,
            languageId
        });
    }
    willRemoveInteractiveDocument(notebookUri, inputUri) {
        this._onWillRemoveInteractiveDocument.fire({
            notebookUri,
            inputUri
        });
    }
}
