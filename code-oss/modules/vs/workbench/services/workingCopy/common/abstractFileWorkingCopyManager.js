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
import { Disposable, dispose } from 'vs/base/common/lifecycle';
import { ResourceMap } from 'vs/base/common/map';
import { Promises } from 'vs/base/common/async';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
let BaseFileWorkingCopyManager = class BaseFileWorkingCopyManager extends Disposable {
    fileService;
    logService;
    workingCopyBackupService;
    _onDidCreate = this._register(new Emitter());
    onDidCreate = this._onDidCreate.event;
    mapResourceToWorkingCopy = new ResourceMap();
    mapResourceToDisposeListener = new ResourceMap();
    constructor(fileService, logService, workingCopyBackupService) {
        super();
        this.fileService = fileService;
        this.logService = logService;
        this.workingCopyBackupService = workingCopyBackupService;
    }
    has(resource) {
        return this.mapResourceToWorkingCopy.has(resource);
    }
    add(resource, workingCopy) {
        const knownWorkingCopy = this.get(resource);
        if (knownWorkingCopy === workingCopy) {
            return; // already cached
        }
        // Add to our working copy map
        this.mapResourceToWorkingCopy.set(resource, workingCopy);
        // Update our dispose listener to remove it on dispose
        this.mapResourceToDisposeListener.get(resource)?.dispose();
        this.mapResourceToDisposeListener.set(resource, workingCopy.onWillDispose(() => this.remove(resource)));
        // Signal creation event
        this._onDidCreate.fire(workingCopy);
    }
    remove(resource) {
        // Dispose any existing listener
        const disposeListener = this.mapResourceToDisposeListener.get(resource);
        if (disposeListener) {
            dispose(disposeListener);
            this.mapResourceToDisposeListener.delete(resource);
        }
        // Remove from our working copy map
        return this.mapResourceToWorkingCopy.delete(resource);
    }
    //#region Get / Get all
    get workingCopies() {
        return [...this.mapResourceToWorkingCopy.values()];
    }
    get(resource) {
        return this.mapResourceToWorkingCopy.get(resource);
    }
    //#endregion
    //#region Lifecycle
    dispose() {
        super.dispose();
        // Clear working copy caches
        //
        // Note: we are not explicitly disposing the working copies
        // known to the manager because this can have unwanted side
        // effects such as backups getting discarded once the working
        // copy unregisters. We have an explicit `destroy`
        // for that purpose (https://github.com/microsoft/vscode/pull/123555)
        //
        this.mapResourceToWorkingCopy.clear();
        // Dispose the dispose listeners
        dispose(this.mapResourceToDisposeListener.values());
        this.mapResourceToDisposeListener.clear();
    }
    async destroy() {
        // Make sure all dirty working copies are saved to disk
        try {
            await Promises.settled(this.workingCopies.map(async (workingCopy) => {
                if (workingCopy.isDirty()) {
                    await this.saveWithFallback(workingCopy);
                }
            }));
        }
        catch (error) {
            this.logService.error(error);
        }
        // Dispose all working copies
        dispose(this.mapResourceToWorkingCopy.values());
        // Finally dispose manager
        this.dispose();
    }
    async saveWithFallback(workingCopy) {
        // First try regular save
        let saveSuccess = false;
        try {
            saveSuccess = await workingCopy.save();
        }
        catch (error) {
            // Ignore
        }
        // Then fallback to backup if that exists
        if (!saveSuccess || workingCopy.isDirty()) {
            const backup = await this.workingCopyBackupService.resolve(workingCopy);
            if (backup) {
                await this.fileService.writeFile(workingCopy.resource, backup.value, { unlock: true });
            }
        }
    }
};
BaseFileWorkingCopyManager = __decorate([
    __param(0, IFileService),
    __param(1, ILogService),
    __param(2, IWorkingCopyBackupService)
], BaseFileWorkingCopyManager);
export { BaseFileWorkingCopyManager };
