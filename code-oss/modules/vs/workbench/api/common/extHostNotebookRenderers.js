/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { MainContext } from 'vs/workbench/api/common/extHost.protocol';
import { ExtHostNotebookEditor } from 'vs/workbench/api/common/extHostNotebookEditor';
export class ExtHostNotebookRenderers {
    _extHostNotebook;
    _rendererMessageEmitters = new Map();
    proxy;
    constructor(mainContext, _extHostNotebook) {
        this._extHostNotebook = _extHostNotebook;
        this.proxy = mainContext.getProxy(MainContext.MainThreadNotebookRenderers);
    }
    $postRendererMessage(editorId, rendererId, message) {
        const editor = this._extHostNotebook.getEditorById(editorId);
        this._rendererMessageEmitters.get(rendererId)?.fire({ editor: editor.apiEditor, message });
    }
    createRendererMessaging(manifest, rendererId) {
        if (!manifest.contributes?.notebookRenderer?.some(r => r.id === rendererId)) {
            throw new Error(`Extensions may only call createRendererMessaging() for renderers they contribute (got ${rendererId})`);
        }
        const messaging = {
            onDidReceiveMessage: (listener, thisArg, disposables) => {
                return this.getOrCreateEmitterFor(rendererId).event(listener, thisArg, disposables);
            },
            postMessage: (message, editorOrAlias) => {
                if (ExtHostNotebookEditor.apiEditorsToExtHost.has(message)) { // back compat for swapped args
                    [message, editorOrAlias] = [editorOrAlias, message];
                }
                const extHostEditor = editorOrAlias && ExtHostNotebookEditor.apiEditorsToExtHost.get(editorOrAlias);
                return this.proxy.$postMessage(extHostEditor?.id, rendererId, message);
            },
        };
        return messaging;
    }
    getOrCreateEmitterFor(rendererId) {
        let emitter = this._rendererMessageEmitters.get(rendererId);
        if (emitter) {
            return emitter;
        }
        emitter = new Emitter({
            onDidRemoveLastListener: () => {
                emitter?.dispose();
                this._rendererMessageEmitters.delete(rendererId);
            }
        });
        this._rendererMessageEmitters.set(rendererId, emitter);
        return emitter;
    }
}
