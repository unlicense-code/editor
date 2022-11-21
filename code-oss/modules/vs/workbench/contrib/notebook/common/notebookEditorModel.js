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
import * as nls from 'vs/nls';
import { EditorModel } from 'vs/workbench/common/editor/editorModel';
import { Emitter, Event } from 'vs/base/common/event';
import { NotebookCellsChangeType } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { INotebookService, SimpleNotebookProviderInfo } from 'vs/workbench/contrib/notebook/common/notebookService';
import { URI } from 'vs/base/common/uri';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { NO_TYPE_ID } from 'vs/workbench/services/workingCopy/common/workingCopy';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { Schemas } from 'vs/base/common/network';
import { IFileService } from 'vs/platform/files/common/files';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { ILabelService } from 'vs/platform/label/common/label';
import { ILogService } from 'vs/platform/log/common/log';
import { TaskSequentializer } from 'vs/base/common/async';
import { bufferToReadable, bufferToStream, streamToBuffer, VSBuffer } from 'vs/base/common/buffer';
import { assertType } from 'vs/base/common/types';
import { IUntitledTextEditorService } from 'vs/workbench/services/untitled/common/untitledTextEditorService';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { CancellationError } from 'vs/base/common/errors';
import { filter } from 'vs/base/common/objects';
//#region --- complex content provider
let ComplexNotebookEditorModel = class ComplexNotebookEditorModel extends EditorModel {
    resource;
    viewType;
    _contentProvider;
    _notebookService;
    _workingCopyService;
    _workingCopyBackupService;
    _fileService;
    _notificationService;
    _logService;
    untitledTextEditorService;
    _onDidSave = this._register(new Emitter());
    _onDidChangeDirty = this._register(new Emitter());
    _onDidChangeContent = this._register(new Emitter());
    onDidSave = this._onDidSave.event;
    onDidChangeDirty = this._onDidChangeDirty.event;
    onDidChangeOrphaned = Event.None;
    onDidChangeReadonly = Event.None;
    _lastResolvedFileStat;
    _name;
    _workingCopyIdentifier;
    _saveSequentializer = new TaskSequentializer();
    _dirty = false;
    constructor(resource, viewType, _contentProvider, _notebookService, _workingCopyService, _workingCopyBackupService, _fileService, _notificationService, _logService, untitledTextEditorService, labelService) {
        super();
        this.resource = resource;
        this.viewType = viewType;
        this._contentProvider = _contentProvider;
        this._notebookService = _notebookService;
        this._workingCopyService = _workingCopyService;
        this._workingCopyBackupService = _workingCopyBackupService;
        this._fileService = _fileService;
        this._notificationService = _notificationService;
        this._logService = _logService;
        this.untitledTextEditorService = untitledTextEditorService;
        this._name = labelService.getUriBasenameLabel(resource);
        const that = this;
        this._workingCopyIdentifier = {
            // TODO@jrieken TODO@rebornix consider to enable a `typeId` that is
            // specific for custom editors. Using a distinct `typeId` allows the
            // working copy to have any resource (including file based resources)
            // even if other working copies exist with the same resource.
            //
            // IMPORTANT: changing the `typeId` has an impact on backups for this
            // working copy. Any value that is not the empty string will be used
            // as seed to the backup. Only change the `typeId` if you have implemented
            // a fallback solution to resolve any existing backups that do not have
            // this seed.
            typeId: NO_TYPE_ID,
            resource: URI.from({ scheme: Schemas.vscodeNotebook, path: resource.toString() })
        };
        const workingCopyAdapter = new class {
            typeId = that._workingCopyIdentifier.typeId;
            resource = that._workingCopyIdentifier.resource;
            get name() { return that._name; }
            capabilities = that._isUntitled() ? 2 /* WorkingCopyCapabilities.Untitled */ : 0 /* WorkingCopyCapabilities.None */;
            onDidChangeDirty = that.onDidChangeDirty;
            onDidChangeContent = that._onDidChangeContent.event;
            onDidSave = that.onDidSave;
            isDirty() { return that.isDirty(); }
            backup(token) { return that.backup(token); }
            save() { return that.save(); }
            revert(options) { return that.revert(options); }
        };
        this._register(this._workingCopyService.registerWorkingCopy(workingCopyAdapter));
        this._register(this._fileService.onDidFilesChange(async (e) => {
            if (this.isDirty() || !this.isResolved() || this._saveSequentializer.hasPending()) {
                // skip when dirty, unresolved, or when saving
                return;
            }
            if (!e.affects(this.resource, 0 /* FileChangeType.UPDATED */)) {
                // no my file
                return;
            }
            const stats = await this._resolveStats(this.resource);
            if (stats && this._lastResolvedFileStat && stats.etag !== this._lastResolvedFileStat.etag) {
                this._logService.debug('[notebook editor model] trigger load after file event');
                this.load({ forceReadFromFile: true });
            }
        }));
    }
    isResolved() {
        return this.notebook !== undefined;
    }
    isDirty() {
        return this._dirty;
    }
    isReadonly() {
        if (this._fileService.hasCapability(this.resource, 2048 /* FileSystemProviderCapabilities.Readonly */)) {
            return true;
        }
        else {
            return false;
        }
    }
    isOrphaned() {
        return false;
    }
    hasAssociatedFilePath() {
        return false;
    }
    _isUntitled() {
        return this.resource.scheme === Schemas.untitled;
    }
    get notebook() {
        const candidate = this._notebookService.getNotebookTextModel(this.resource);
        return candidate && candidate.viewType === this.viewType ? candidate : undefined;
    }
    setDirty(newState) {
        if (this._dirty !== newState) {
            this._dirty = newState;
            this._onDidChangeDirty.fire();
        }
    }
    async backup(token) {
        if (!this.isResolved()) {
            return {};
        }
        const backup = await this._contentProvider.backup(this.resource, token);
        if (token.isCancellationRequested) {
            return {};
        }
        const stats = await this._resolveStats(this.resource);
        if (backup instanceof VSBuffer) {
            return {
                content: bufferToReadable(backup)
            };
        }
        else {
            return {
                meta: {
                    mtime: stats?.mtime ?? Date.now(),
                    viewType: this.notebook.viewType,
                    backupId: backup
                }
            };
        }
    }
    async revert(options) {
        if (options?.soft) {
            this.setDirty(false);
            return;
        }
        await this.load({ forceReadFromFile: true });
        const newStats = await this._resolveStats(this.resource);
        this._lastResolvedFileStat = newStats;
        this.setDirty(false);
        this._onDidChangeDirty.fire();
    }
    async load(options) {
        if (options?.forceReadFromFile) {
            this._logService.debug('[notebook editor model] load from provider (forceRead)', this.resource.toString());
            this._loadFromProvider(undefined);
            assertType(this.isResolved());
            return this;
        }
        if (this.isResolved()) {
            return this;
        }
        let backup = undefined;
        try {
            backup = await this._workingCopyBackupService.resolve(this._workingCopyIdentifier);
        }
        catch (_e) { }
        if (this.isResolved()) {
            return this; // Make sure meanwhile someone else did not succeed in loading
        }
        this._logService.debug('[notebook editor model] load from provider', this.resource.toString());
        await this._loadFromProvider(backup);
        assertType(this.isResolved());
        return this;
    }
    /**
     * @description Uses the textmodel resolver service to acquire the untitled file's content
     * @param resource The resource that is the untitled file
     * @returns The bytes
     */
    async getUntitledDocumentData(resource) {
        // If it's an untitled file we must populate the untitledDocumentData
        const untitledString = this.untitledTextEditorService.getValue(resource);
        const untitledDocumentData = untitledString ? VSBuffer.fromString(untitledString) : undefined;
        return untitledDocumentData;
    }
    async _loadFromProvider(backup) {
        const untitledData = await this.getUntitledDocumentData(this.resource);
        // If we're loading untitled file data we should ensure the model is dirty
        if (untitledData) {
            this._onDidChangeDirty.fire();
        }
        const data = await this._contentProvider.open(this.resource, backup?.meta?.backupId ?? (backup?.value
            ? await streamToBuffer(backup?.value)
            : undefined), untitledData, CancellationToken.None);
        this._lastResolvedFileStat = await this._resolveStats(this.resource);
        if (this.isDisposed()) {
            return;
        }
        if (!this.notebook) {
            this._logService.debug('[notebook editor model] loading NEW notebook', this.resource.toString());
            // FRESH there is no notebook yet and we are now creating it
            // UGLY
            // There might be another notebook for the URI which was created from a different
            // source (different viewType). In that case we simply dispose the
            // existing/conflicting model and proceed with a new notebook
            const conflictingNotebook = this._notebookService.getNotebookTextModel(this.resource);
            if (conflictingNotebook) {
                this._logService.warn('DISPOSING conflicting notebook with same URI but different view type', this.resource.toString(), this.viewType);
                conflictingNotebook.dispose();
            }
            // this creates and caches a new notebook model so that notebookService.getNotebookTextModel(...)
            // will return this one model
            const notebook = this._notebookService.createNotebookTextModel(this.viewType, this.resource, data.data, data.transientOptions);
            this._register(notebook);
            this._register(notebook.onDidChangeContent(e => {
                let triggerDirty = false;
                for (let i = 0; i < e.rawEvents.length; i++) {
                    if (e.rawEvents[i].kind !== NotebookCellsChangeType.Initialize) {
                        this._onDidChangeContent.fire();
                        triggerDirty = triggerDirty || !e.rawEvents[i].transient;
                    }
                }
                if (triggerDirty) {
                    this.setDirty(true);
                }
            }));
        }
        else {
            // UPDATE exitsing notebook with data that we have just fetched
            this._logService.debug('[notebook editor model] loading onto EXISTING notebook', this.resource.toString());
            this.notebook.reset(data.data.cells, data.data.metadata, data.transientOptions);
        }
        if (backup) {
            this.setDirty(true);
        }
        else {
            this.setDirty(false);
        }
    }
    async _assertStat() {
        this._logService.debug('[notebook editor model] start assert stat');
        const stats = await this._resolveStats(this.resource);
        if (this._lastResolvedFileStat && stats && stats.mtime > this._lastResolvedFileStat.mtime) {
            this._logService.debug(`[notebook editor model] noteboook file on disk is newer:\nLastResolvedStat: ${this._lastResolvedFileStat ? JSON.stringify(this._lastResolvedFileStat) : undefined}.\nCurrent stat: ${JSON.stringify(stats)}`);
            this._lastResolvedFileStat = stats;
            return new Promise(resolve => {
                const handle = this._notificationService.prompt(Severity.Info, nls.localize('notebook.staleSaveError', "The contents of the file has changed on disk. Would you like to open the updated version or overwrite the file with your changes?"), [{
                        label: nls.localize('notebook.staleSaveError.revert', "Revert"),
                        run: () => {
                            resolve('revert');
                        }
                    }, {
                        label: nls.localize('notebook.staleSaveError.overwrite.', "Overwrite"),
                        run: () => {
                            resolve('overwrite');
                        }
                    }], { sticky: true });
                Event.once(handle.onDidClose)(() => {
                    resolve('none');
                });
            });
        }
        else if (!this._lastResolvedFileStat && stats) {
            // finally get a stats
            this._lastResolvedFileStat = stats;
        }
        return 'overwrite';
    }
    async save() {
        if (!this.isResolved()) {
            return false;
        }
        const versionId = this.notebook.versionId;
        this._logService.debug(`[notebook editor model] save(${versionId}) - enter with versionId ${versionId}`, this.resource.toString(true));
        if (this._saveSequentializer.hasPending(versionId)) {
            this._logService.debug(`[notebook editor model] save(${versionId}) - exit - found a pending save for versionId ${versionId}`, this.resource.toString(true));
            return this._saveSequentializer.pending.then(() => {
                return true;
            });
        }
        if (this._saveSequentializer.hasPending()) {
            return this._saveSequentializer.setNext(async () => {
                await this.save();
            }).then(() => {
                return true;
            });
        }
        return this._saveSequentializer.setPending(versionId, (async () => {
            const result = await this._assertStat();
            if (result === 'none') {
                return;
            }
            if (result === 'revert') {
                await this.revert();
                return;
            }
            if (!this.isResolved()) {
                return;
            }
            const success = false;
            this._logService.debug(`[notebook editor model] save(${versionId}) - document saved saved, start updating file stats`, this.resource.toString(true), success);
            this._lastResolvedFileStat = await this._resolveStats(this.resource);
            if (success) {
                this.setDirty(false);
                this._onDidSave.fire({});
            }
        })()).then(() => {
            return true;
        });
    }
    async saveAs(targetResource) {
        if (!this.isResolved()) {
            return undefined;
        }
        this._logService.debug(`[notebook editor model] saveAs - enter`, this.resource.toString(true));
        const result = await this._assertStat();
        if (result === 'none') {
            return undefined;
        }
        if (result === 'revert') {
            await this.revert();
            return undefined;
        }
        const success = false;
        this._logService.debug(`[notebook editor model] saveAs - document saved, start updating file stats`, this.resource.toString(true), success);
        this._lastResolvedFileStat = await this._resolveStats(this.resource);
        if (!success) {
            return undefined;
        }
        this.setDirty(false);
        this._onDidSave.fire({});
        return { resource: targetResource };
    }
    async _resolveStats(resource) {
        if (resource.scheme === Schemas.untitled) {
            return undefined;
        }
        try {
            this._logService.debug(`[notebook editor model] _resolveStats`, this.resource.toString(true));
            const newStats = await this._fileService.stat(this.resource);
            this._logService.debug(`[notebook editor model] _resolveStats - latest file stats: ${JSON.stringify(newStats)}`, this.resource.toString(true));
            return newStats;
        }
        catch (e) {
            return undefined;
        }
    }
};
ComplexNotebookEditorModel = __decorate([
    __param(3, INotebookService),
    __param(4, IWorkingCopyService),
    __param(5, IWorkingCopyBackupService),
    __param(6, IFileService),
    __param(7, INotificationService),
    __param(8, ILogService),
    __param(9, IUntitledTextEditorService),
    __param(10, ILabelService)
], ComplexNotebookEditorModel);
export { ComplexNotebookEditorModel };
//#endregion
//#region --- simple content provider
let SimpleNotebookEditorModel = class SimpleNotebookEditorModel extends EditorModel {
    resource;
    _hasAssociatedFilePath;
    viewType;
    _workingCopyManager;
    _fileService;
    _onDidChangeDirty = this._register(new Emitter());
    _onDidSave = this._register(new Emitter());
    _onDidChangeOrphaned = this._register(new Emitter());
    _onDidChangeReadonly = this._register(new Emitter());
    onDidChangeDirty = this._onDidChangeDirty.event;
    onDidSave = this._onDidSave.event;
    onDidChangeOrphaned = this._onDidChangeOrphaned.event;
    onDidChangeReadonly = this._onDidChangeReadonly.event;
    _workingCopy;
    _workingCopyListeners = this._register(new DisposableStore());
    constructor(resource, _hasAssociatedFilePath, viewType, _workingCopyManager, _fileService) {
        super();
        this.resource = resource;
        this._hasAssociatedFilePath = _hasAssociatedFilePath;
        this.viewType = viewType;
        this._workingCopyManager = _workingCopyManager;
        this._fileService = _fileService;
    }
    dispose() {
        this._workingCopy?.dispose();
        super.dispose();
    }
    get notebook() {
        return this._workingCopy?.model?.notebookModel;
    }
    isResolved() {
        return Boolean(this._workingCopy?.model?.notebookModel);
    }
    isDirty() {
        return this._workingCopy?.isDirty() ?? false;
    }
    isOrphaned() {
        return SimpleNotebookEditorModel._isStoredFileWorkingCopy(this._workingCopy) && this._workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */);
    }
    hasAssociatedFilePath() {
        return !SimpleNotebookEditorModel._isStoredFileWorkingCopy(this._workingCopy) && !!this._workingCopy?.hasAssociatedFilePath;
    }
    isReadonly() {
        if (SimpleNotebookEditorModel._isStoredFileWorkingCopy(this._workingCopy)) {
            return this._workingCopy.isReadonly();
        }
        else if (this._fileService.hasCapability(this.resource, 2048 /* FileSystemProviderCapabilities.Readonly */)) {
            return true;
        }
        else {
            return false;
        }
    }
    revert(options) {
        assertType(this.isResolved());
        return this._workingCopy.revert(options);
    }
    save(options) {
        assertType(this.isResolved());
        return this._workingCopy.save(options);
    }
    async load(options) {
        if (!this._workingCopy) {
            if (this.resource.scheme === Schemas.untitled) {
                if (this._hasAssociatedFilePath) {
                    this._workingCopy = await this._workingCopyManager.resolve({ associatedResource: this.resource });
                }
                else {
                    this._workingCopy = await this._workingCopyManager.resolve({ untitledResource: this.resource });
                }
            }
            else {
                this._workingCopy = await this._workingCopyManager.resolve(this.resource, options?.forceReadFromFile ? { reload: { async: false, force: true } } : undefined);
                this._workingCopyListeners.add(this._workingCopy.onDidSave(e => this._onDidSave.fire(e)));
                this._workingCopyListeners.add(this._workingCopy.onDidChangeOrphaned(() => this._onDidChangeOrphaned.fire()));
                this._workingCopyListeners.add(this._workingCopy.onDidChangeReadonly(() => this._onDidChangeReadonly.fire()));
            }
            this._workingCopy.onDidChangeDirty(() => this._onDidChangeDirty.fire(), undefined, this._workingCopyListeners);
            this._workingCopyListeners.add(this._workingCopy.onWillDispose(() => {
                this._workingCopyListeners.clear();
                this._workingCopy?.model?.dispose();
            }));
        }
        else {
            await this._workingCopyManager.resolve(this.resource, {
                reload: {
                    async: !options?.forceReadFromFile,
                    force: options?.forceReadFromFile
                }
            });
        }
        assertType(this.isResolved());
        return this;
    }
    async saveAs(target) {
        const newWorkingCopy = await this._workingCopyManager.saveAs(this.resource, target);
        if (!newWorkingCopy) {
            return undefined;
        }
        // this is a little hacky because we leave the new working copy alone. BUT
        // the newly created editor input will pick it up and claim ownership of it.
        return { resource: newWorkingCopy.resource };
    }
    static _isStoredFileWorkingCopy(candidate) {
        const isUntitled = candidate && candidate.capabilities & 2 /* WorkingCopyCapabilities.Untitled */;
        return !isUntitled;
    }
};
SimpleNotebookEditorModel = __decorate([
    __param(4, IFileService)
], SimpleNotebookEditorModel);
export { SimpleNotebookEditorModel };
export class NotebookFileWorkingCopyModel extends Disposable {
    _notebookModel;
    _notebookSerializer;
    _onDidChangeContent = this._register(new Emitter());
    onDidChangeContent = this._onDidChangeContent.event;
    onWillDispose;
    constructor(_notebookModel, _notebookSerializer) {
        super();
        this._notebookModel = _notebookModel;
        this._notebookSerializer = _notebookSerializer;
        this.onWillDispose = _notebookModel.onWillDispose.bind(_notebookModel);
        this._register(_notebookModel.onDidChangeContent(e => {
            for (const rawEvent of e.rawEvents) {
                if (rawEvent.kind === NotebookCellsChangeType.Initialize) {
                    continue;
                }
                if (rawEvent.transient) {
                    continue;
                }
                this._onDidChangeContent.fire({
                    isRedoing: false,
                    isUndoing: false,
                    isInitial: false, //_notebookModel.cells.length === 0 // todo@jrieken non transient metadata?
                });
                break;
            }
        }));
    }
    dispose() {
        this._notebookModel.dispose();
        super.dispose();
    }
    get notebookModel() {
        return this._notebookModel;
    }
    async snapshot(token) {
        const data = {
            metadata: filter(this._notebookModel.metadata, key => !this._notebookSerializer.options.transientDocumentMetadata[key]),
            cells: [],
        };
        for (const cell of this._notebookModel.cells) {
            const cellData = {
                cellKind: cell.cellKind,
                language: cell.language,
                mime: cell.mime,
                source: cell.getValue(),
                outputs: [],
                internalMetadata: cell.internalMetadata
            };
            cellData.outputs = !this._notebookSerializer.options.transientOutputs ? cell.outputs : [];
            cellData.metadata = filter(cell.metadata, key => !this._notebookSerializer.options.transientCellMetadata[key]);
            data.cells.push(cellData);
        }
        const bytes = await this._notebookSerializer.notebookToData(data);
        if (token.isCancellationRequested) {
            throw new CancellationError();
        }
        return bufferToStream(bytes);
    }
    async update(stream, token) {
        const bytes = await streamToBuffer(stream);
        const data = await this._notebookSerializer.dataToNotebook(bytes);
        if (token.isCancellationRequested) {
            throw new CancellationError();
        }
        this._notebookModel.reset(data.cells, data.metadata, this._notebookSerializer.options);
    }
    get versionId() {
        return this._notebookModel.alternativeVersionId;
    }
    pushStackElement() {
        this._notebookModel.pushStackElement('save', undefined, undefined);
    }
}
let NotebookFileWorkingCopyModelFactory = class NotebookFileWorkingCopyModelFactory {
    _viewType;
    _notebookService;
    constructor(_viewType, _notebookService) {
        this._viewType = _viewType;
        this._notebookService = _notebookService;
    }
    async createModel(resource, stream, token) {
        const info = await this._notebookService.withNotebookDataProvider(this._viewType);
        if (!(info instanceof SimpleNotebookProviderInfo)) {
            throw new Error('CANNOT open file notebook with this provider');
        }
        const bytes = await streamToBuffer(stream);
        const data = await info.serializer.dataToNotebook(bytes);
        if (token.isCancellationRequested) {
            throw new CancellationError();
        }
        const notebookModel = this._notebookService.createNotebookTextModel(info.viewType, resource, data, info.serializer.options);
        return new NotebookFileWorkingCopyModel(notebookModel, info.serializer);
    }
};
NotebookFileWorkingCopyModelFactory = __decorate([
    __param(1, INotebookService)
], NotebookFileWorkingCopyModelFactory);
export { NotebookFileWorkingCopyModelFactory };
//#endregion
