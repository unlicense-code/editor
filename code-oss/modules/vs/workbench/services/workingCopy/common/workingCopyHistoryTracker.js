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
import { localize } from 'vs/nls';
import { IdleValue, Limiter } from 'vs/base/common/async';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { Disposable } from 'vs/base/common/lifecycle';
import { ResourceMap } from 'vs/base/common/map';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IUndoRedoService } from 'vs/platform/undoRedo/common/undoRedo';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { SaveSourceRegistry } from 'vs/workbench/common/editor';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { isStoredFileWorkingCopySaveEvent } from 'vs/workbench/services/workingCopy/common/storedFileWorkingCopy';
import { IWorkingCopyHistoryService, MAX_PARALLEL_HISTORY_IO_OPS } from 'vs/workbench/services/workingCopy/common/workingCopyHistory';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { Schemas } from 'vs/base/common/network';
import { ResourceGlobMatcher } from 'vs/workbench/common/resources';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IFileService } from 'vs/platform/files/common/files';
let WorkingCopyHistoryTracker = class WorkingCopyHistoryTracker extends Disposable {
    workingCopyService;
    workingCopyHistoryService;
    uriIdentityService;
    pathService;
    configurationService;
    undoRedoService;
    contextService;
    fileService;
    static SETTINGS = {
        ENABLED: 'workbench.localHistory.enabled',
        SIZE_LIMIT: 'workbench.localHistory.maxFileSize',
        EXCLUDES: 'workbench.localHistory.exclude'
    };
    static UNDO_REDO_SAVE_SOURCE = SaveSourceRegistry.registerSource('undoRedo.source', localize('undoRedo.source', "Undo / Redo"));
    limiter = this._register(new Limiter(MAX_PARALLEL_HISTORY_IO_OPS));
    resourceExcludeMatcher = this._register(new IdleValue(() => {
        const matcher = this._register(new ResourceGlobMatcher(root => this.configurationService.getValue(WorkingCopyHistoryTracker.SETTINGS.EXCLUDES, { resource: root }), event => event.affectsConfiguration(WorkingCopyHistoryTracker.SETTINGS.EXCLUDES), this.contextService, this.configurationService));
        return matcher;
    }));
    pendingAddHistoryEntryOperations = new ResourceMap(resource => this.uriIdentityService.extUri.getComparisonKey(resource));
    workingCopyContentVersion = new ResourceMap(resource => this.uriIdentityService.extUri.getComparisonKey(resource));
    historyEntryContentVersion = new ResourceMap(resource => this.uriIdentityService.extUri.getComparisonKey(resource));
    constructor(workingCopyService, workingCopyHistoryService, uriIdentityService, pathService, configurationService, undoRedoService, contextService, fileService) {
        super();
        this.workingCopyService = workingCopyService;
        this.workingCopyHistoryService = workingCopyHistoryService;
        this.uriIdentityService = uriIdentityService;
        this.pathService = pathService;
        this.configurationService = configurationService;
        this.undoRedoService = undoRedoService;
        this.contextService = contextService;
        this.fileService = fileService;
        this.registerListeners();
    }
    registerListeners() {
        // File Events
        this._register(this.fileService.onDidRunOperation(e => this.onDidRunFileOperation(e)));
        // Working Copy Events
        this._register(this.workingCopyService.onDidChangeContent(workingCopy => this.onDidChangeContent(workingCopy)));
        this._register(this.workingCopyService.onDidSave(e => this.onDidSave(e)));
    }
    async onDidRunFileOperation(e) {
        if (!this.shouldTrackHistoryFromFileOperationEvent(e)) {
            return; // return early for working copies we are not interested in
        }
        const source = e.resource;
        const target = e.target.resource;
        // Move working copy history entries for this file move event
        const resources = await this.workingCopyHistoryService.moveEntries(source, target);
        // Make sure to track the content version of each entry that
        // was moved in our map. This ensures that a subsequent save
        // without a content change does not add a redundant entry
        // (https://github.com/microsoft/vscode/issues/145881)
        for (const resource of resources) {
            const contentVersion = this.getContentVersion(resource);
            this.historyEntryContentVersion.set(resource, contentVersion);
        }
    }
    onDidChangeContent(workingCopy) {
        // Increment content version ID for resource
        const contentVersionId = this.getContentVersion(workingCopy.resource);
        this.workingCopyContentVersion.set(workingCopy.resource, contentVersionId + 1);
    }
    getContentVersion(resource) {
        return this.workingCopyContentVersion.get(resource) || 0;
    }
    onDidSave(e) {
        if (!this.shouldTrackHistoryFromSaveEvent(e)) {
            return; // return early for working copies we are not interested in
        }
        const contentVersion = this.getContentVersion(e.workingCopy.resource);
        if (this.historyEntryContentVersion.get(e.workingCopy.resource) === contentVersion) {
            return; // return early when content version already has associated history entry
        }
        // Cancel any previous operation for this resource
        this.pendingAddHistoryEntryOperations.get(e.workingCopy.resource)?.dispose(true);
        // Create new cancellation token support and remember
        const cts = new CancellationTokenSource();
        this.pendingAddHistoryEntryOperations.set(e.workingCopy.resource, cts);
        // Queue new operation to add to history
        this.limiter.queue(async () => {
            if (cts.token.isCancellationRequested) {
                return;
            }
            const contentVersion = this.getContentVersion(e.workingCopy.resource);
            // Figure out source of save operation if not provided already
            let source = e.source;
            if (!e.source) {
                source = this.resolveSourceFromUndoRedo(e);
            }
            // Add entry
            await this.workingCopyHistoryService.addEntry({ resource: e.workingCopy.resource, source, timestamp: e.stat.mtime }, cts.token);
            // Remember content version as being added to history
            this.historyEntryContentVersion.set(e.workingCopy.resource, contentVersion);
            if (cts.token.isCancellationRequested) {
                return;
            }
            // Finally remove from pending operations
            this.pendingAddHistoryEntryOperations.delete(e.workingCopy.resource);
        });
    }
    resolveSourceFromUndoRedo(e) {
        const lastStackElement = this.undoRedoService.getLastElement(e.workingCopy.resource);
        if (lastStackElement) {
            if (lastStackElement.code === 'undoredo.textBufferEdit') {
                return undefined; // ignore any unspecific stack element that resulted just from typing
            }
            return lastStackElement.label;
        }
        const allStackElements = this.undoRedoService.getElements(e.workingCopy.resource);
        if (allStackElements.future.length > 0 || allStackElements.past.length > 0) {
            return WorkingCopyHistoryTracker.UNDO_REDO_SAVE_SOURCE;
        }
        return undefined;
    }
    shouldTrackHistoryFromSaveEvent(e) {
        if (!isStoredFileWorkingCopySaveEvent(e)) {
            return false; // only support working copies that are backed by stored files
        }
        return this.shouldTrackHistory(e.workingCopy.resource, e.stat);
    }
    shouldTrackHistoryFromFileOperationEvent(e) {
        if (!e.isOperation(2 /* FileOperation.MOVE */)) {
            return false; // only interested in move operations
        }
        return this.shouldTrackHistory(e.target.resource, e.target);
    }
    shouldTrackHistory(resource, stat) {
        if (resource.scheme !== this.pathService.defaultUriScheme && // track history for all workspace resources
            resource.scheme !== Schemas.vscodeUserData && // track history for all settings
            resource.scheme !== Schemas.inMemory // track history for tests that use in-memory
        ) {
            return false; // do not support unknown resources
        }
        const configuredMaxFileSizeInBytes = 1024 * this.configurationService.getValue(WorkingCopyHistoryTracker.SETTINGS.SIZE_LIMIT, { resource });
        if (stat.size > configuredMaxFileSizeInBytes) {
            return false; // only track files that are not too large
        }
        if (this.configurationService.getValue(WorkingCopyHistoryTracker.SETTINGS.ENABLED, { resource }) === false) {
            return false; // do not track when history is disabled
        }
        // Finally check for exclude setting
        return !this.resourceExcludeMatcher.value.matches(resource);
    }
};
WorkingCopyHistoryTracker = __decorate([
    __param(0, IWorkingCopyService),
    __param(1, IWorkingCopyHistoryService),
    __param(2, IUriIdentityService),
    __param(3, IPathService),
    __param(4, IConfigurationService),
    __param(5, IUndoRedoService),
    __param(6, IWorkspaceContextService),
    __param(7, IFileService)
], WorkingCopyHistoryTracker);
export { WorkingCopyHistoryTracker };
