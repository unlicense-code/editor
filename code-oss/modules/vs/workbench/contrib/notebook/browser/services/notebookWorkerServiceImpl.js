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
import { Disposable, DisposableStore, dispose, toDisposable } from 'vs/base/common/lifecycle';
import { SimpleWorkerClient } from 'vs/base/common/worker/simpleWorker';
import { DefaultWorkerFactory } from 'vs/base/browser/defaultWorkerFactory';
import { NotebookCellsChangeType } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { INotebookService } from 'vs/workbench/contrib/notebook/common/notebookService';
let NotebookEditorWorkerServiceImpl = class NotebookEditorWorkerServiceImpl extends Disposable {
    _workerManager;
    constructor(notebookService) {
        super();
        this._workerManager = this._register(new WorkerManager(notebookService));
    }
    canComputeDiff(original, modified) {
        throw new Error('Method not implemented.');
    }
    computeDiff(original, modified) {
        return this._workerManager.withWorker().then(client => {
            return client.computeDiff(original, modified);
        });
    }
};
NotebookEditorWorkerServiceImpl = __decorate([
    __param(0, INotebookService)
], NotebookEditorWorkerServiceImpl);
export { NotebookEditorWorkerServiceImpl };
class WorkerManager extends Disposable {
    _notebookService;
    _editorWorkerClient;
    // private _lastWorkerUsedTime: number;
    constructor(_notebookService) {
        super();
        this._notebookService = _notebookService;
        this._editorWorkerClient = null;
        // this._lastWorkerUsedTime = (new Date()).getTime();
    }
    withWorker() {
        // this._lastWorkerUsedTime = (new Date()).getTime();
        if (!this._editorWorkerClient) {
            this._editorWorkerClient = new NotebookWorkerClient(this._notebookService, 'notebookEditorWorkerService');
        }
        return Promise.resolve(this._editorWorkerClient);
    }
}
class NotebookEditorModelManager extends Disposable {
    _proxy;
    _notebookService;
    _syncedModels = Object.create(null);
    _syncedModelsLastUsedTime = Object.create(null);
    constructor(_proxy, _notebookService) {
        super();
        this._proxy = _proxy;
        this._notebookService = _notebookService;
    }
    ensureSyncedResources(resources) {
        for (const resource of resources) {
            const resourceStr = resource.toString();
            if (!this._syncedModels[resourceStr]) {
                this._beginModelSync(resource);
            }
            if (this._syncedModels[resourceStr]) {
                this._syncedModelsLastUsedTime[resourceStr] = (new Date()).getTime();
            }
        }
    }
    _beginModelSync(resource) {
        const model = this._notebookService.listNotebookDocuments().find(document => document.uri.toString() === resource.toString());
        if (!model) {
            return;
        }
        const modelUrl = resource.toString();
        this._proxy.acceptNewModel(model.uri.toString(), {
            cells: model.cells.map(cell => ({
                handle: cell.handle,
                uri: cell.uri,
                source: cell.getValue(),
                eol: cell.textBuffer.getEOL(),
                language: cell.language,
                mime: cell.mime,
                cellKind: cell.cellKind,
                outputs: cell.outputs.map(op => ({ outputId: op.outputId, outputs: op.outputs })),
                metadata: cell.metadata,
                internalMetadata: cell.internalMetadata,
            })),
            metadata: model.metadata
        });
        const toDispose = new DisposableStore();
        const cellToDto = (cell) => {
            return {
                handle: cell.handle,
                uri: cell.uri,
                source: cell.textBuffer.getLinesContent(),
                eol: cell.textBuffer.getEOL(),
                language: cell.language,
                cellKind: cell.cellKind,
                outputs: cell.outputs,
                metadata: cell.metadata,
                internalMetadata: cell.internalMetadata,
            };
        };
        toDispose.add(model.onDidChangeContent((event) => {
            const dto = event.rawEvents.map(e => {
                const data = e.kind === NotebookCellsChangeType.ModelChange || e.kind === NotebookCellsChangeType.Initialize
                    ? {
                        kind: e.kind,
                        versionId: event.versionId,
                        changes: e.changes.map(diff => [diff[0], diff[1], diff[2].map(cell => cellToDto(cell))])
                    }
                    : (e.kind === NotebookCellsChangeType.Move
                        ? {
                            kind: e.kind,
                            index: e.index,
                            length: e.length,
                            newIdx: e.newIdx,
                            versionId: event.versionId,
                            cells: e.cells.map(cell => cellToDto(cell))
                        }
                        : e);
                return data;
            });
            this._proxy.acceptModelChanged(modelUrl.toString(), {
                rawEvents: dto,
                versionId: event.versionId
            });
        }));
        toDispose.add(model.onWillDispose(() => {
            this._stopModelSync(modelUrl);
        }));
        toDispose.add(toDisposable(() => {
            this._proxy.acceptRemovedModel(modelUrl);
        }));
        this._syncedModels[modelUrl] = toDispose;
    }
    _stopModelSync(modelUrl) {
        const toDispose = this._syncedModels[modelUrl];
        delete this._syncedModels[modelUrl];
        delete this._syncedModelsLastUsedTime[modelUrl];
        dispose(toDispose);
    }
}
class NotebookWorkerHost {
    _workerClient;
    constructor(workerClient) {
        this._workerClient = workerClient;
    }
    // foreign host request
    fhr(method, args) {
        return this._workerClient.fhr(method, args);
    }
}
class NotebookWorkerClient extends Disposable {
    _notebookService;
    _worker;
    _workerFactory;
    _modelManager;
    constructor(_notebookService, label) {
        super();
        this._notebookService = _notebookService;
        this._workerFactory = new DefaultWorkerFactory(label);
        this._worker = null;
        this._modelManager = null;
    }
    // foreign host request
    fhr(method, args) {
        throw new Error(`Not implemented!`);
    }
    computeDiff(original, modified) {
        return this._withSyncedResources([original, modified]).then(proxy => {
            return proxy.computeDiff(original.toString(), modified.toString());
        });
    }
    _getOrCreateModelManager(proxy) {
        if (!this._modelManager) {
            this._modelManager = this._register(new NotebookEditorModelManager(proxy, this._notebookService));
        }
        return this._modelManager;
    }
    _withSyncedResources(resources) {
        return this._getProxy().then((proxy) => {
            this._getOrCreateModelManager(proxy).ensureSyncedResources(resources);
            return proxy;
        });
    }
    _getOrCreateWorker() {
        if (!this._worker) {
            try {
                this._worker = this._register(new SimpleWorkerClient(this._workerFactory, 'vs/workbench/contrib/notebook/common/services/notebookSimpleWorker', new NotebookWorkerHost(this)));
            }
            catch (err) {
                // logOnceWebWorkerWarning(err);
                // this._worker = new SynchronousWorkerClient(new EditorSimpleWorker(new EditorWorkerHost(this), null));
                throw (err);
            }
        }
        return this._worker;
    }
    _getProxy() {
        return this._getOrCreateWorker().getProxyObject().then(undefined, (err) => {
            // logOnceWebWorkerWarning(err);
            // this._worker = new SynchronousWorkerClient(new EditorSimpleWorker(new EditorWorkerHost(this), null));
            // return this._getOrCreateWorker().getProxyObject();
            throw (err);
        });
    }
}
