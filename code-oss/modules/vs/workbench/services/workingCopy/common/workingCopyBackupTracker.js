/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable, dispose, toDisposable } from 'vs/base/common/lifecycle';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { Promises } from 'vs/base/common/async';
/**
 * The working copy backup tracker deals with:
 * - restoring backups that exist
 * - creating backups for dirty working copies
 * - deleting backups for saved working copies
 * - handling backups on shutdown
 */
export class WorkingCopyBackupTracker extends Disposable {
    workingCopyBackupService;
    workingCopyService;
    logService;
    lifecycleService;
    filesConfigurationService;
    workingCopyEditorService;
    editorService;
    editorGroupService;
    constructor(workingCopyBackupService, workingCopyService, logService, lifecycleService, filesConfigurationService, workingCopyEditorService, editorService, editorGroupService) {
        super();
        this.workingCopyBackupService = workingCopyBackupService;
        this.workingCopyService = workingCopyService;
        this.logService = logService;
        this.lifecycleService = lifecycleService;
        this.filesConfigurationService = filesConfigurationService;
        this.workingCopyEditorService = workingCopyEditorService;
        this.editorService = editorService;
        this.editorGroupService = editorGroupService;
        // Fill in initial dirty working copies
        for (const workingCopy of this.workingCopyService.dirtyWorkingCopies) {
            this.onDidRegister(workingCopy);
        }
        this.registerListeners();
    }
    registerListeners() {
        // Working Copy events
        this._register(this.workingCopyService.onDidRegister(workingCopy => this.onDidRegister(workingCopy)));
        this._register(this.workingCopyService.onDidUnregister(workingCopy => this.onDidUnregister(workingCopy)));
        this._register(this.workingCopyService.onDidChangeDirty(workingCopy => this.onDidChangeDirty(workingCopy)));
        this._register(this.workingCopyService.onDidChangeContent(workingCopy => this.onDidChangeContent(workingCopy)));
        // Lifecycle
        this.lifecycleService.onBeforeShutdown(event => event.finalVeto(() => this.onFinalBeforeShutdown(event.reason), 'veto.backups'));
        this.lifecycleService.onWillShutdown(() => this.onWillShutdown());
        // Once a handler registers, restore backups
        this._register(this.workingCopyEditorService.onDidRegisterHandler(handler => this.restoreBackups(handler)));
    }
    onWillShutdown() {
        // Here we know that we will shutdown. Any backup operation that is
        // already scheduled or being scheduled from this moment on runs
        // at the risk of corrupting a backup because the backup operation
        // might terminate at any given time now. As such, we need to disable
        // this tracker from performing more backups by cancelling pending
        // operations and suspending the tracker without resuming.
        this.cancelBackupOperations();
        this.suspendBackupOperations();
    }
    //#region Backup Creator
    // Delay creation of backups when content changes to avoid too much
    // load on the backup service when the user is typing into the editor
    // Since we always schedule a backup, even when auto save is on, we
    // have different scheduling delays based on auto save. This helps to
    // avoid a (not critical but also not really wanted) race between saving
    // (after 1s per default) and making a backup of the working copy.
    static BACKUP_SCHEDULE_DELAYS = {
        [0 /* AutoSaveMode.OFF */]: 1000,
        [3 /* AutoSaveMode.ON_FOCUS_CHANGE */]: 1000,
        [4 /* AutoSaveMode.ON_WINDOW_CHANGE */]: 1000,
        [1 /* AutoSaveMode.AFTER_SHORT_DELAY */]: 2000,
        [2 /* AutoSaveMode.AFTER_LONG_DELAY */]: 1000
    };
    // A map from working copy to a version ID we compute on each content
    // change. This version ID allows to e.g. ask if a backup for a specific
    // content has been made before closing.
    mapWorkingCopyToContentVersion = new Map();
    // A map of scheduled pending backup operations for working copies
    // Given https://github.com/microsoft/vscode/issues/158038, we explicitly
    // do not store `IWorkingCopy` but the identifier in the map, since it
    // looks like GC is not runnin for the working copy otherwise.
    pendingBackupOperations = new Map();
    suspended = false;
    onDidRegister(workingCopy) {
        if (this.suspended) {
            this.logService.warn(`[backup tracker] suspended, ignoring register event`, workingCopy.resource.toString(), workingCopy.typeId);
            return;
        }
        if (workingCopy.isDirty()) {
            this.scheduleBackup(workingCopy);
        }
    }
    onDidUnregister(workingCopy) {
        // Remove from content version map
        this.mapWorkingCopyToContentVersion.delete(workingCopy);
        // Check suspended
        if (this.suspended) {
            this.logService.warn(`[backup tracker] suspended, ignoring unregister event`, workingCopy.resource.toString(), workingCopy.typeId);
            return;
        }
        // Discard backup
        this.discardBackup(workingCopy);
    }
    onDidChangeDirty(workingCopy) {
        if (this.suspended) {
            this.logService.warn(`[backup tracker] suspended, ignoring dirty change event`, workingCopy.resource.toString(), workingCopy.typeId);
            return;
        }
        if (workingCopy.isDirty()) {
            this.scheduleBackup(workingCopy);
        }
        else {
            this.discardBackup(workingCopy);
        }
    }
    onDidChangeContent(workingCopy) {
        // Increment content version ID
        const contentVersionId = this.getContentVersion(workingCopy);
        this.mapWorkingCopyToContentVersion.set(workingCopy, contentVersionId + 1);
        // Check suspended
        if (this.suspended) {
            this.logService.warn(`[backup tracker] suspended, ignoring content change event`, workingCopy.resource.toString(), workingCopy.typeId);
            return;
        }
        // Schedule backup if dirty
        if (workingCopy.isDirty()) {
            // this listener will make sure that the backup is
            // pushed out for as long as the user is still changing
            // the content of the working copy.
            this.scheduleBackup(workingCopy);
        }
    }
    scheduleBackup(workingCopy) {
        // Clear any running backup operation
        this.cancelBackupOperation(workingCopy);
        this.logService.trace(`[backup tracker] scheduling backup`, workingCopy.resource.toString(), workingCopy.typeId);
        // Schedule new backup
        const workingCopyIdentifier = { resource: workingCopy.resource, typeId: workingCopy.typeId };
        const cts = new CancellationTokenSource();
        const handle = setTimeout(async () => {
            if (cts.token.isCancellationRequested) {
                return;
            }
            // Backup if dirty
            if (workingCopy.isDirty()) {
                this.logService.trace(`[backup tracker] creating backup`, workingCopy.resource.toString(), workingCopy.typeId);
                try {
                    const backup = await workingCopy.backup(cts.token);
                    if (cts.token.isCancellationRequested) {
                        return;
                    }
                    if (workingCopy.isDirty()) {
                        this.logService.trace(`[backup tracker] storing backup`, workingCopy.resource.toString(), workingCopy.typeId);
                        await this.workingCopyBackupService.backup(workingCopy, backup.content, this.getContentVersion(workingCopy), backup.meta, cts.token);
                    }
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
            // Clear disposable unless we got canceled which would
            // indicate another operation has started meanwhile
            if (!cts.token.isCancellationRequested) {
                this.pendingBackupOperations.delete(workingCopyIdentifier);
            }
        }, this.getBackupScheduleDelay(workingCopy));
        // Keep in map for disposal as needed
        this.pendingBackupOperations.set(workingCopyIdentifier, toDisposable(() => {
            this.logService.trace(`[backup tracker] clearing pending backup creation`, workingCopy.resource.toString(), workingCopy.typeId);
            cts.dispose(true);
            clearTimeout(handle);
        }));
    }
    getBackupScheduleDelay(workingCopy) {
        let autoSaveMode = this.filesConfigurationService.getAutoSaveMode();
        if (workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */) {
            autoSaveMode = 0 /* AutoSaveMode.OFF */; // auto-save is never on for untitled working copies
        }
        return WorkingCopyBackupTracker.BACKUP_SCHEDULE_DELAYS[autoSaveMode];
    }
    getContentVersion(workingCopy) {
        return this.mapWorkingCopyToContentVersion.get(workingCopy) || 0;
    }
    discardBackup(workingCopy) {
        // Clear any running backup operation
        this.cancelBackupOperation(workingCopy);
        // Schedule backup discard asap
        const workingCopyIdentifier = { resource: workingCopy.resource, typeId: workingCopy.typeId };
        const cts = new CancellationTokenSource();
        this.doDiscardBackup(workingCopyIdentifier, cts);
        // Keep in map for disposal as needed
        this.pendingBackupOperations.set(workingCopyIdentifier, toDisposable(() => {
            this.logService.trace(`[backup tracker] clearing pending backup discard`, workingCopy.resource.toString(), workingCopy.typeId);
            cts.dispose(true);
        }));
    }
    async doDiscardBackup(workingCopyIdentifier, cts) {
        this.logService.trace(`[backup tracker] discarding backup`, workingCopyIdentifier.resource.toString(), workingCopyIdentifier.typeId);
        // Discard backup
        try {
            await this.workingCopyBackupService.discardBackup(workingCopyIdentifier, cts.token);
        }
        catch (error) {
            this.logService.error(error);
        }
        // Clear disposable unless we got canceled which would
        // indicate another operation has started meanwhile
        if (!cts.token.isCancellationRequested) {
            this.pendingBackupOperations.delete(workingCopyIdentifier);
        }
    }
    cancelBackupOperation(workingCopy) {
        // Given a working copy we want to find the matching
        // identifier in our pending operations map because
        // we cannot use the working copy directly, as the
        // identifier might have different object identity.
        let workingCopyIdentifier = undefined;
        for (const [identifier] of this.pendingBackupOperations) {
            if (identifier.resource.toString() === workingCopy.resource.toString() && identifier.typeId === workingCopy.typeId) {
                workingCopyIdentifier = identifier;
                break;
            }
        }
        if (workingCopyIdentifier) {
            dispose(this.pendingBackupOperations.get(workingCopyIdentifier));
            this.pendingBackupOperations.delete(workingCopyIdentifier);
        }
    }
    cancelBackupOperations() {
        for (const [, disposable] of this.pendingBackupOperations) {
            dispose(disposable);
        }
        this.pendingBackupOperations.clear();
    }
    suspendBackupOperations() {
        this.suspended = true;
        return { resume: () => this.suspended = false };
    }
    //#endregion
    //#region Backup Restorer
    unrestoredBackups = new Set();
    whenReady = this.resolveBackupsToRestore();
    _isReady = false;
    get isReady() { return this._isReady; }
    async resolveBackupsToRestore() {
        // Wait for resolving backups until we are restored to reduce startup pressure
        await this.lifecycleService.when(3 /* LifecyclePhase.Restored */);
        // Remember each backup that needs to restore
        for (const backup of await this.workingCopyBackupService.getBackups()) {
            this.unrestoredBackups.add(backup);
        }
        this._isReady = true;
    }
    async restoreBackups(handler) {
        // Wait for backups to be resolved
        await this.whenReady;
        // Figure out already opened editors for backups vs
        // non-opened.
        const openedEditorsForBackups = new Set();
        const nonOpenedEditorsForBackups = new Set();
        // Ensure each backup that can be handled has an
        // associated editor.
        const restoredBackups = new Set();
        for (const unrestoredBackup of this.unrestoredBackups) {
            const canHandleUnrestoredBackup = handler.handles(unrestoredBackup);
            if (!canHandleUnrestoredBackup) {
                continue;
            }
            // Collect already opened editors for backup
            let hasOpenedEditorForBackup = false;
            for (const { editor } of this.editorService.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */)) {
                const isUnrestoredBackupOpened = handler.isOpen(unrestoredBackup, editor);
                if (isUnrestoredBackupOpened) {
                    openedEditorsForBackups.add(editor);
                    hasOpenedEditorForBackup = true;
                }
            }
            // Otherwise, make sure to create at least one editor
            // for the backup to show
            if (!hasOpenedEditorForBackup) {
                nonOpenedEditorsForBackups.add(await handler.createEditor(unrestoredBackup));
            }
            // Remember as (potentially) restored
            restoredBackups.add(unrestoredBackup);
        }
        // Ensure editors are opened for each backup without editor
        // in the background without stealing focus
        if (nonOpenedEditorsForBackups.size > 0) {
            await this.editorGroupService.activeGroup.openEditors([...nonOpenedEditorsForBackups].map(nonOpenedEditorForBackup => ({
                editor: nonOpenedEditorForBackup,
                options: {
                    pinned: true,
                    preserveFocus: true,
                    inactive: true
                }
            })));
            for (const nonOpenedEditorForBackup of nonOpenedEditorsForBackups) {
                openedEditorsForBackups.add(nonOpenedEditorForBackup);
            }
        }
        // Then, resolve each opened editor to make sure the working copy
        // is loaded and the dirty editor appears properly
        // We only do that for editors that are not active in a group
        // already to prevent calling `resolve` twice!
        await Promises.settled([...openedEditorsForBackups].map(async (openedEditorForBackup) => {
            if (this.editorService.isVisible(openedEditorForBackup)) {
                return;
            }
            return openedEditorForBackup.resolve();
        }));
        // Finally, remove all handled backups from the list
        for (const restoredBackup of restoredBackups) {
            this.unrestoredBackups.delete(restoredBackup);
        }
    }
}