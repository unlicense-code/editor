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
import * as assert from 'vs/base/common/assert';
import { Emitter } from 'vs/base/common/event';
import { dispose } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { MainContext } from 'vs/workbench/api/common/extHost.protocol';
import { ExtHostDocumentData } from 'vs/workbench/api/common/extHostDocumentData';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { ExtHostTextEditor } from 'vs/workbench/api/common/extHostTextEditor';
import * as typeConverters from 'vs/workbench/api/common/extHostTypeConverters';
import { ILogService } from 'vs/platform/log/common/log';
import { ResourceMap } from 'vs/base/common/map';
import { Schemas } from 'vs/base/common/network';
import { Iterable } from 'vs/base/common/iterator';
import { Lazy } from 'vs/base/common/lazy';
class Reference {
    value;
    _count = 0;
    constructor(value) {
        this.value = value;
    }
    ref() {
        this._count++;
    }
    unref() {
        return --this._count === 0;
    }
}
let ExtHostDocumentsAndEditors = class ExtHostDocumentsAndEditors {
    _extHostRpc;
    _logService;
    _serviceBrand;
    _activeEditorId = null;
    _editors = new Map();
    _documents = new ResourceMap();
    _onDidAddDocuments = new Emitter();
    _onDidRemoveDocuments = new Emitter();
    _onDidChangeVisibleTextEditors = new Emitter();
    _onDidChangeActiveTextEditor = new Emitter();
    onDidAddDocuments = this._onDidAddDocuments.event;
    onDidRemoveDocuments = this._onDidRemoveDocuments.event;
    onDidChangeVisibleTextEditors = this._onDidChangeVisibleTextEditors.event;
    onDidChangeActiveTextEditor = this._onDidChangeActiveTextEditor.event;
    constructor(_extHostRpc, _logService) {
        this._extHostRpc = _extHostRpc;
        this._logService = _logService;
    }
    $acceptDocumentsAndEditorsDelta(delta) {
        this.acceptDocumentsAndEditorsDelta(delta);
    }
    acceptDocumentsAndEditorsDelta(delta) {
        const removedDocuments = [];
        const addedDocuments = [];
        const removedEditors = [];
        if (delta.removedDocuments) {
            for (const uriComponent of delta.removedDocuments) {
                const uri = URI.revive(uriComponent);
                const data = this._documents.get(uri);
                if (data?.unref()) {
                    this._documents.delete(uri);
                    removedDocuments.push(data.value);
                }
            }
        }
        if (delta.addedDocuments) {
            for (const data of delta.addedDocuments) {
                const resource = URI.revive(data.uri);
                let ref = this._documents.get(resource);
                // double check -> only notebook cell documents should be
                // referenced/opened more than once...
                if (ref) {
                    if (resource.scheme !== Schemas.vscodeNotebookCell && resource.scheme !== Schemas.vscodeInteractiveInput) {
                        throw new Error(`document '${resource} already exists!'`);
                    }
                }
                if (!ref) {
                    ref = new Reference(new ExtHostDocumentData(this._extHostRpc.getProxy(MainContext.MainThreadDocuments), resource, data.lines, data.EOL, data.versionId, data.languageId, data.isDirty, data.notebook));
                    this._documents.set(resource, ref);
                    addedDocuments.push(ref.value);
                }
                ref.ref();
            }
        }
        if (delta.removedEditors) {
            for (const id of delta.removedEditors) {
                const editor = this._editors.get(id);
                this._editors.delete(id);
                if (editor) {
                    removedEditors.push(editor);
                }
            }
        }
        if (delta.addedEditors) {
            for (const data of delta.addedEditors) {
                const resource = URI.revive(data.documentUri);
                assert.ok(this._documents.has(resource), `document '${resource}' does not exist`);
                assert.ok(!this._editors.has(data.id), `editor '${data.id}' already exists!`);
                const documentData = this._documents.get(resource).value;
                const editor = new ExtHostTextEditor(data.id, this._extHostRpc.getProxy(MainContext.MainThreadTextEditors), this._logService, new Lazy(() => documentData.document), data.selections.map(typeConverters.Selection.to), data.options, data.visibleRanges.map(range => typeConverters.Range.to(range)), typeof data.editorPosition === 'number' ? typeConverters.ViewColumn.to(data.editorPosition) : undefined);
                this._editors.set(data.id, editor);
            }
        }
        if (delta.newActiveEditor !== undefined) {
            assert.ok(delta.newActiveEditor === null || this._editors.has(delta.newActiveEditor), `active editor '${delta.newActiveEditor}' does not exist`);
            this._activeEditorId = delta.newActiveEditor;
        }
        dispose(removedDocuments);
        dispose(removedEditors);
        // now that the internal state is complete, fire events
        if (delta.removedDocuments) {
            this._onDidRemoveDocuments.fire(removedDocuments);
        }
        if (delta.addedDocuments) {
            this._onDidAddDocuments.fire(addedDocuments);
        }
        if (delta.removedEditors || delta.addedEditors) {
            this._onDidChangeVisibleTextEditors.fire(this.allEditors().map(editor => editor.value));
        }
        if (delta.newActiveEditor !== undefined) {
            this._onDidChangeActiveTextEditor.fire(this.activeEditor());
        }
    }
    getDocument(uri) {
        return this._documents.get(uri)?.value;
    }
    allDocuments() {
        return Iterable.map(this._documents.values(), ref => ref.value);
    }
    getEditor(id) {
        return this._editors.get(id);
    }
    activeEditor(internal) {
        if (!this._activeEditorId) {
            return undefined;
        }
        const editor = this._editors.get(this._activeEditorId);
        if (internal) {
            return editor;
        }
        else {
            return editor?.value;
        }
    }
    allEditors() {
        return [...this._editors.values()];
    }
};
ExtHostDocumentsAndEditors = __decorate([
    __param(0, IExtHostRpcService),
    __param(1, ILogService)
], ExtHostDocumentsAndEditors);
export { ExtHostDocumentsAndEditors };
export const IExtHostDocumentsAndEditors = createDecorator('IExtHostDocumentsAndEditors');
