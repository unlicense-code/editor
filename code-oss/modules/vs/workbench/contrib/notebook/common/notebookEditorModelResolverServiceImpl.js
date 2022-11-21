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
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { URI } from 'vs/base/common/uri';
import { CellUri, NotebookWorkingCopyTypeIdentifier } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { ComplexNotebookEditorModel, NotebookFileWorkingCopyModelFactory, SimpleNotebookEditorModel } from 'vs/workbench/contrib/notebook/common/notebookEditorModel';
import { combinedDisposable, DisposableStore, dispose, ReferenceCollection, toDisposable } from 'vs/base/common/lifecycle';
import { ComplexNotebookProviderInfo, INotebookService, SimpleNotebookProviderInfo } from 'vs/workbench/contrib/notebook/common/notebookService';
import { ILogService } from 'vs/platform/log/common/log';
import { AsyncEmitter, Emitter } from 'vs/base/common/event';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { ResourceMap } from 'vs/base/common/map';
import { FileWorkingCopyManager } from 'vs/workbench/services/workingCopy/common/fileWorkingCopyManager';
import { Schemas } from 'vs/base/common/network';
import { NotebookProviderInfo } from 'vs/workbench/contrib/notebook/common/notebookProvider';
import { assertIsDefined } from 'vs/base/common/types';
import { CancellationToken } from 'vs/base/common/cancellation';
let NotebookModelReferenceCollection = class NotebookModelReferenceCollection extends ReferenceCollection {
    _instantiationService;
    _notebookService;
    _logService;
    _disposables = new DisposableStore();
    _workingCopyManagers = new Map();
    _modelListener = new Map();
    _onDidSaveNotebook = new Emitter();
    onDidSaveNotebook = this._onDidSaveNotebook.event;
    _onDidChangeDirty = new Emitter();
    onDidChangeDirty = this._onDidChangeDirty.event;
    _dirtyStates = new ResourceMap();
    constructor(_instantiationService, _notebookService, _logService) {
        super();
        this._instantiationService = _instantiationService;
        this._notebookService = _notebookService;
        this._logService = _logService;
        this._disposables.add(_notebookService.onWillRemoveViewType(viewType => {
            const manager = this._workingCopyManagers.get(NotebookWorkingCopyTypeIdentifier.create(viewType));
            manager?.destroy().catch(err => _logService.error(err));
        }));
    }
    dispose() {
        this._disposables.dispose();
        this._onDidSaveNotebook.dispose();
        this._onDidChangeDirty.dispose();
        dispose(this._modelListener.values());
        dispose(this._workingCopyManagers.values());
    }
    isDirty(resource) {
        return this._dirtyStates.get(resource) ?? false;
    }
    async createReferencedObject(key, viewType, hasAssociatedFilePath) {
        const uri = URI.parse(key);
        const info = await this._notebookService.withNotebookDataProvider(viewType);
        let result;
        if (info instanceof ComplexNotebookProviderInfo) {
            const model = this._instantiationService.createInstance(ComplexNotebookEditorModel, uri, viewType, info.controller);
            result = await model.load();
        }
        else if (info instanceof SimpleNotebookProviderInfo) {
            const workingCopyTypeId = NotebookWorkingCopyTypeIdentifier.create(viewType);
            let workingCopyManager = this._workingCopyManagers.get(workingCopyTypeId);
            if (!workingCopyManager) {
                const factory = new NotebookFileWorkingCopyModelFactory(viewType, this._notebookService);
                workingCopyManager = this._instantiationService.createInstance(FileWorkingCopyManager, workingCopyTypeId, factory, factory);
                this._workingCopyManagers.set(workingCopyTypeId, workingCopyManager);
            }
            const model = this._instantiationService.createInstance(SimpleNotebookEditorModel, uri, hasAssociatedFilePath, viewType, workingCopyManager);
            result = await model.load();
        }
        else {
            throw new Error(`CANNOT open ${key}, no provider found`);
        }
        // Whenever a notebook model is dirty we automatically reference it so that
        // we can ensure that at least one reference exists. That guarantees that
        // a model with unsaved changes is never disposed.
        let onDirtyAutoReference;
        this._modelListener.set(result, combinedDisposable(result.onDidSave(() => this._onDidSaveNotebook.fire(result.resource)), result.onDidChangeDirty(() => {
            const isDirty = result.isDirty();
            this._dirtyStates.set(result.resource, isDirty);
            // isDirty -> add reference
            // !isDirty -> free reference
            if (isDirty && !onDirtyAutoReference) {
                onDirtyAutoReference = this.acquire(key, viewType);
            }
            else if (onDirtyAutoReference) {
                onDirtyAutoReference.dispose();
                onDirtyAutoReference = undefined;
            }
            this._onDidChangeDirty.fire(result);
        }), toDisposable(() => onDirtyAutoReference?.dispose())));
        return result;
    }
    destroyReferencedObject(_key, object) {
        object.then(model => {
            this._modelListener.get(model)?.dispose();
            this._modelListener.delete(model);
            model.dispose();
        }).catch(err => {
            this._logService.error('FAILED to destory notebook', err);
        });
    }
};
NotebookModelReferenceCollection = __decorate([
    __param(0, IInstantiationService),
    __param(1, INotebookService),
    __param(2, ILogService)
], NotebookModelReferenceCollection);
let NotebookModelResolverServiceImpl = class NotebookModelResolverServiceImpl {
    _notebookService;
    _extensionService;
    _uriIdentService;
    _serviceBrand;
    _data;
    onDidSaveNotebook;
    onDidChangeDirty;
    _onWillFailWithConflict = new AsyncEmitter();
    onWillFailWithConflict = this._onWillFailWithConflict.event;
    constructor(instantiationService, _notebookService, _extensionService, _uriIdentService) {
        this._notebookService = _notebookService;
        this._extensionService = _extensionService;
        this._uriIdentService = _uriIdentService;
        this._data = instantiationService.createInstance(NotebookModelReferenceCollection);
        this.onDidSaveNotebook = this._data.onDidSaveNotebook;
        this.onDidChangeDirty = this._data.onDidChangeDirty;
    }
    dispose() {
        this._data.dispose();
    }
    isDirty(resource) {
        return this._data.isDirty(resource);
    }
    async resolve(arg0, viewType) {
        let resource;
        let hasAssociatedFilePath = false;
        if (URI.isUri(arg0)) {
            resource = arg0;
        }
        else {
            if (!arg0.untitledResource) {
                const info = this._notebookService.getContributedNotebookType(assertIsDefined(viewType));
                if (!info) {
                    throw new Error('UNKNOWN view type: ' + viewType);
                }
                const suffix = NotebookProviderInfo.possibleFileEnding(info.selectors) ?? '';
                for (let counter = 1;; counter++) {
                    const candidate = URI.from({ scheme: Schemas.untitled, path: `Untitled-${counter}${suffix}`, query: viewType });
                    if (!this._notebookService.getNotebookTextModel(candidate)) {
                        resource = candidate;
                        break;
                    }
                }
            }
            else if (arg0.untitledResource.scheme === Schemas.untitled) {
                resource = arg0.untitledResource;
            }
            else {
                resource = arg0.untitledResource.with({ scheme: Schemas.untitled });
                hasAssociatedFilePath = true;
            }
        }
        if (resource.scheme === CellUri.scheme) {
            throw new Error(`CANNOT open a cell-uri as notebook. Tried with ${resource.toString()}`);
        }
        resource = this._uriIdentService.asCanonicalUri(resource);
        const existingViewType = this._notebookService.getNotebookTextModel(resource)?.viewType;
        if (!viewType) {
            if (existingViewType) {
                viewType = existingViewType;
            }
            else {
                await this._extensionService.whenInstalledExtensionsRegistered();
                const providers = this._notebookService.getContributedNotebookTypes(resource);
                const exclusiveProvider = providers.find(provider => provider.exclusive);
                viewType = exclusiveProvider?.id || providers[0]?.id;
            }
        }
        if (!viewType) {
            throw new Error(`Missing viewType for '${resource}'`);
        }
        if (existingViewType && existingViewType !== viewType) {
            await this._onWillFailWithConflict.fireAsync({ resource, viewType }, CancellationToken.None);
            // check again, listener should have done cleanup
            const existingViewType2 = this._notebookService.getNotebookTextModel(resource)?.viewType;
            if (existingViewType2 && existingViewType2 !== viewType) {
                throw new Error(`A notebook with view type '${existingViewType2}' already exists for '${resource}', CANNOT create another notebook with view type ${viewType}`);
            }
        }
        const reference = this._data.acquire(resource.toString(), viewType, hasAssociatedFilePath);
        try {
            const model = await reference.object;
            return {
                object: model,
                dispose() { reference.dispose(); }
            };
        }
        catch (err) {
            reference.dispose();
            throw err;
        }
    }
};
NotebookModelResolverServiceImpl = __decorate([
    __param(0, IInstantiationService),
    __param(1, INotebookService),
    __param(2, IExtensionService),
    __param(3, IUriIdentityService)
], NotebookModelResolverServiceImpl);
export { NotebookModelResolverServiceImpl };
