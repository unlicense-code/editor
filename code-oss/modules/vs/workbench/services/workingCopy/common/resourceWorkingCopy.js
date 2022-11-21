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
import { timeout } from 'vs/base/common/async';
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IFileService } from 'vs/platform/files/common/files';
let ResourceWorkingCopy = class ResourceWorkingCopy extends Disposable {
    resource;
    fileService;
    constructor(resource, fileService) {
        super();
        this.resource = resource;
        this.fileService = fileService;
        this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
    }
    //#region Orphaned Tracking
    _onDidChangeOrphaned = this._register(new Emitter());
    onDidChangeOrphaned = this._onDidChangeOrphaned.event;
    orphaned = false;
    isOrphaned() {
        return this.orphaned;
    }
    async onDidFilesChange(e) {
        let fileEventImpactsUs = false;
        let newInOrphanModeGuess;
        // If we are currently orphaned, we check if the file was added back
        if (this.orphaned) {
            const fileWorkingCopyResourceAdded = e.contains(this.resource, 1 /* FileChangeType.ADDED */);
            if (fileWorkingCopyResourceAdded) {
                newInOrphanModeGuess = false;
                fileEventImpactsUs = true;
            }
        }
        // Otherwise we check if the file was deleted
        else {
            const fileWorkingCopyResourceDeleted = e.contains(this.resource, 2 /* FileChangeType.DELETED */);
            if (fileWorkingCopyResourceDeleted) {
                newInOrphanModeGuess = true;
                fileEventImpactsUs = true;
            }
        }
        if (fileEventImpactsUs && this.orphaned !== newInOrphanModeGuess) {
            let newInOrphanModeValidated = false;
            if (newInOrphanModeGuess) {
                // We have received reports of users seeing delete events even though the file still
                // exists (network shares issue: https://github.com/microsoft/vscode/issues/13665).
                // Since we do not want to mark the working copy as orphaned, we have to check if the
                // file is really gone and not just a faulty file event.
                await timeout(100);
                if (this.isDisposed()) {
                    newInOrphanModeValidated = true;
                }
                else {
                    const exists = await this.fileService.exists(this.resource);
                    newInOrphanModeValidated = !exists;
                }
            }
            if (this.orphaned !== newInOrphanModeValidated && !this.isDisposed()) {
                this.setOrphaned(newInOrphanModeValidated);
            }
        }
    }
    setOrphaned(orphaned) {
        if (this.orphaned !== orphaned) {
            this.orphaned = orphaned;
            this._onDidChangeOrphaned.fire();
        }
    }
    //#endregion
    //#region Dispose
    _onWillDispose = this._register(new Emitter());
    onWillDispose = this._onWillDispose.event;
    disposed = false;
    isDisposed() {
        return this.disposed;
    }
    dispose() {
        // State
        this.disposed = true;
        this.orphaned = false;
        // Event
        this._onWillDispose.fire();
        super.dispose();
    }
};
ResourceWorkingCopy = __decorate([
    __param(1, IFileService)
], ResourceWorkingCopy);
export { ResourceWorkingCopy };
