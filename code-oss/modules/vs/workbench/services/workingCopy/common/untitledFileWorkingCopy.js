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
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { CancellationToken } from 'vs/base/common/cancellation';
import { raceCancellation } from 'vs/base/common/async';
import { ILogService } from 'vs/platform/log/common/log';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { emptyStream } from 'vs/base/common/stream';
let UntitledFileWorkingCopy = class UntitledFileWorkingCopy extends Disposable {
    typeId;
    resource;
    name;
    hasAssociatedFilePath;
    initialContents;
    modelFactory;
    saveDelegate;
    workingCopyBackupService;
    logService;
    capabilities = 2 /* WorkingCopyCapabilities.Untitled */;
    _model = undefined;
    get model() { return this._model; }
    //#region Events
    _onDidChangeContent = this._register(new Emitter());
    onDidChangeContent = this._onDidChangeContent.event;
    _onDidChangeDirty = this._register(new Emitter());
    onDidChangeDirty = this._onDidChangeDirty.event;
    _onDidSave = this._register(new Emitter());
    onDidSave = this._onDidSave.event;
    _onDidRevert = this._register(new Emitter());
    onDidRevert = this._onDidRevert.event;
    _onWillDispose = this._register(new Emitter());
    onWillDispose = this._onWillDispose.event;
    //#endregion
    constructor(typeId, resource, name, hasAssociatedFilePath, initialContents, modelFactory, saveDelegate, workingCopyService, workingCopyBackupService, logService) {
        super();
        this.typeId = typeId;
        this.resource = resource;
        this.name = name;
        this.hasAssociatedFilePath = hasAssociatedFilePath;
        this.initialContents = initialContents;
        this.modelFactory = modelFactory;
        this.saveDelegate = saveDelegate;
        this.workingCopyBackupService = workingCopyBackupService;
        this.logService = logService;
        // Make known to working copy service
        this._register(workingCopyService.registerWorkingCopy(this));
    }
    //#region Dirty
    dirty = this.hasAssociatedFilePath || Boolean(this.initialContents && this.initialContents.markDirty !== false);
    isDirty() {
        return this.dirty;
    }
    setDirty(dirty) {
        if (this.dirty === dirty) {
            return;
        }
        this.dirty = dirty;
        this._onDidChangeDirty.fire();
    }
    //#endregion
    //#region Resolve
    async resolve() {
        this.trace('resolve()');
        if (this.isResolved()) {
            this.trace('resolve() - exit (already resolved)');
            // return early if the untitled file working copy is already
            // resolved assuming that the contents have meanwhile changed
            // in the underlying model. we only resolve untitled once.
            return;
        }
        let untitledContents;
        // Check for backups or use initial value or empty
        const backup = await this.workingCopyBackupService.resolve(this);
        if (backup) {
            this.trace('resolve() - with backup');
            untitledContents = backup.value;
        }
        else if (this.initialContents?.value) {
            this.trace('resolve() - with initial contents');
            untitledContents = this.initialContents.value;
        }
        else {
            this.trace('resolve() - empty');
            untitledContents = emptyStream();
        }
        // Create model
        await this.doCreateModel(untitledContents);
        // Untitled associated to file path are dirty right away as well as untitled with content
        this.setDirty(this.hasAssociatedFilePath || !!backup || Boolean(this.initialContents && this.initialContents.markDirty !== false));
        // If we have initial contents, make sure to emit this
        // as the appropriate events to the outside.
        if (!!backup || this.initialContents) {
            this._onDidChangeContent.fire();
        }
    }
    async doCreateModel(contents) {
        this.trace('doCreateModel()');
        // Create model and dispose it when we get disposed
        this._model = this._register(await this.modelFactory.createModel(this.resource, contents, CancellationToken.None));
        // Model listeners
        this.installModelListeners(this._model);
    }
    installModelListeners(model) {
        // Content Change
        this._register(model.onDidChangeContent(e => this.onModelContentChanged(e)));
        // Lifecycle
        this._register(model.onWillDispose(() => this.dispose()));
    }
    onModelContentChanged(e) {
        // Mark the untitled file working copy as non-dirty once its
        // in case provided by the change event and in case we do not
        // have an associated path set
        if (!this.hasAssociatedFilePath && e.isInitial) {
            this.setDirty(false);
        }
        // Turn dirty otherwise
        else {
            this.setDirty(true);
        }
        // Emit as general content change event
        this._onDidChangeContent.fire();
    }
    isResolved() {
        return !!this.model;
    }
    //#endregion
    //#region Backup
    async backup(token) {
        let content = undefined;
        // Make sure to check whether this working copy has been
        // resolved or not and fallback to the initial value -
        // if any - to prevent backing up an unresolved working
        // copy and loosing the initial value.
        if (this.isResolved()) {
            content = await raceCancellation(this.model.snapshot(token), token);
        }
        else if (this.initialContents) {
            content = this.initialContents.value;
        }
        return { content };
    }
    //#endregion
    //#region Save
    async save(options) {
        this.trace('save()');
        const result = await this.saveDelegate(this, options);
        // Emit Save Event
        if (result) {
            this._onDidSave.fire({ reason: options?.reason, source: options?.source });
        }
        return result;
    }
    //#endregion
    //#region Revert
    async revert() {
        this.trace('revert()');
        // No longer dirty
        this.setDirty(false);
        // Emit as event
        this._onDidRevert.fire();
        // A reverted untitled file working copy is invalid
        // because it has no actual source on disk to revert to.
        // As such we dispose the model.
        this.dispose();
    }
    //#endregion
    dispose() {
        this.trace('dispose()');
        this._onWillDispose.fire();
        super.dispose();
    }
    trace(msg) {
        this.logService.trace(`[untitled file working copy] ${msg}`, this.resource.toString(), this.typeId);
    }
};
UntitledFileWorkingCopy = __decorate([
    __param(7, IWorkingCopyService),
    __param(8, IWorkingCopyBackupService),
    __param(9, ILogService)
], UntitledFileWorkingCopy);
export { UntitledFileWorkingCopy };
