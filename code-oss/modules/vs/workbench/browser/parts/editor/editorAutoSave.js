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
import { IFilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { withNullAsUndefined } from 'vs/base/common/types';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { ILogService } from 'vs/platform/log/common/log';
let EditorAutoSave = class EditorAutoSave extends Disposable {
    filesConfigurationService;
    hostService;
    editorService;
    editorGroupService;
    workingCopyService;
    logService;
    // Auto save: after delay
    autoSaveAfterDelay;
    pendingAutoSavesAfterDelay = new Map();
    // Auto save: focus change & window change
    lastActiveEditor = undefined;
    lastActiveGroupId = undefined;
    lastActiveEditorControlDisposable = this._register(new DisposableStore());
    constructor(filesConfigurationService, hostService, editorService, editorGroupService, workingCopyService, logService) {
        super();
        this.filesConfigurationService = filesConfigurationService;
        this.hostService = hostService;
        this.editorService = editorService;
        this.editorGroupService = editorGroupService;
        this.workingCopyService = workingCopyService;
        this.logService = logService;
        // Figure out initial auto save config
        this.onAutoSaveConfigurationChange(filesConfigurationService.getAutoSaveConfiguration(), false);
        // Fill in initial dirty working copies
        for (const dirtyWorkingCopy of this.workingCopyService.dirtyWorkingCopies) {
            this.onDidRegister(dirtyWorkingCopy);
        }
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.hostService.onDidChangeFocus(focused => this.onWindowFocusChange(focused)));
        this._register(this.editorService.onDidActiveEditorChange(() => this.onDidActiveEditorChange()));
        this._register(this.filesConfigurationService.onAutoSaveConfigurationChange(config => this.onAutoSaveConfigurationChange(config, true)));
        // Working Copy events
        this._register(this.workingCopyService.onDidRegister(workingCopy => this.onDidRegister(workingCopy)));
        this._register(this.workingCopyService.onDidUnregister(workingCopy => this.onDidUnregister(workingCopy)));
        this._register(this.workingCopyService.onDidChangeDirty(workingCopy => this.onDidChangeDirty(workingCopy)));
        this._register(this.workingCopyService.onDidChangeContent(workingCopy => this.onDidChangeContent(workingCopy)));
    }
    onWindowFocusChange(focused) {
        if (!focused) {
            this.maybeTriggerAutoSave(4 /* SaveReason.WINDOW_CHANGE */);
        }
    }
    onDidActiveEditorChange() {
        // Treat editor change like a focus change for our last active editor if any
        if (this.lastActiveEditor && typeof this.lastActiveGroupId === 'number') {
            this.maybeTriggerAutoSave(3 /* SaveReason.FOCUS_CHANGE */, { groupId: this.lastActiveGroupId, editor: this.lastActiveEditor });
        }
        // Remember as last active
        const activeGroup = this.editorGroupService.activeGroup;
        const activeEditor = this.lastActiveEditor = withNullAsUndefined(activeGroup.activeEditor);
        this.lastActiveGroupId = activeGroup.id;
        // Dispose previous active control listeners
        this.lastActiveEditorControlDisposable.clear();
        // Listen to focus changes on control for auto save
        const activeEditorPane = this.editorService.activeEditorPane;
        if (activeEditor && activeEditorPane) {
            this.lastActiveEditorControlDisposable.add(activeEditorPane.onDidBlur(() => {
                this.maybeTriggerAutoSave(3 /* SaveReason.FOCUS_CHANGE */, { groupId: activeGroup.id, editor: activeEditor });
            }));
        }
    }
    maybeTriggerAutoSave(reason, editorIdentifier) {
        if (editorIdentifier?.editor.hasCapability(2 /* EditorInputCapabilities.Readonly */) || editorIdentifier?.editor.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
            return; // no auto save for readonly or untitled editors
        }
        // Determine if we need to save all. In case of a window focus change we also save if
        // auto save mode is configured to be ON_FOCUS_CHANGE (editor focus change)
        const mode = this.filesConfigurationService.getAutoSaveMode();
        if ((reason === 4 /* SaveReason.WINDOW_CHANGE */ && (mode === 3 /* AutoSaveMode.ON_FOCUS_CHANGE */ || mode === 4 /* AutoSaveMode.ON_WINDOW_CHANGE */)) ||
            (reason === 3 /* SaveReason.FOCUS_CHANGE */ && mode === 3 /* AutoSaveMode.ON_FOCUS_CHANGE */)) {
            this.logService.trace(`[editor auto save] triggering auto save with reason ${reason}`);
            if (editorIdentifier) {
                this.editorService.save(editorIdentifier, { reason });
            }
            else {
                this.saveAllDirty({ reason });
            }
        }
    }
    onAutoSaveConfigurationChange(config, fromEvent) {
        // Update auto save after delay config
        this.autoSaveAfterDelay = (typeof config.autoSaveDelay === 'number') && config.autoSaveDelay >= 0 ? config.autoSaveDelay : undefined;
        // Trigger a save-all when auto save is enabled
        if (fromEvent) {
            let reason = undefined;
            switch (this.filesConfigurationService.getAutoSaveMode()) {
                case 3 /* AutoSaveMode.ON_FOCUS_CHANGE */:
                    reason = 3 /* SaveReason.FOCUS_CHANGE */;
                    break;
                case 4 /* AutoSaveMode.ON_WINDOW_CHANGE */:
                    reason = 4 /* SaveReason.WINDOW_CHANGE */;
                    break;
                case 1 /* AutoSaveMode.AFTER_SHORT_DELAY */:
                case 2 /* AutoSaveMode.AFTER_LONG_DELAY */:
                    reason = 2 /* SaveReason.AUTO */;
                    break;
            }
            if (reason) {
                this.saveAllDirty({ reason });
            }
        }
    }
    saveAllDirty(options) {
        for (const workingCopy of this.workingCopyService.dirtyWorkingCopies) {
            if (!(workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */)) {
                workingCopy.save(options);
            }
        }
    }
    onDidRegister(workingCopy) {
        if (workingCopy.isDirty()) {
            this.scheduleAutoSave(workingCopy);
        }
    }
    onDidUnregister(workingCopy) {
        this.discardAutoSave(workingCopy);
    }
    onDidChangeDirty(workingCopy) {
        if (workingCopy.isDirty()) {
            this.scheduleAutoSave(workingCopy);
        }
        else {
            this.discardAutoSave(workingCopy);
        }
    }
    onDidChangeContent(workingCopy) {
        if (workingCopy.isDirty()) {
            // this listener will make sure that the auto save is
            // pushed out for as long as the user is still changing
            // the content of the working copy.
            this.scheduleAutoSave(workingCopy);
        }
    }
    scheduleAutoSave(workingCopy) {
        if (typeof this.autoSaveAfterDelay !== 'number') {
            return; // auto save after delay must be enabled
        }
        if (workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */) {
            return; // we never auto save untitled working copies
        }
        // Clear any running auto save operation
        this.discardAutoSave(workingCopy);
        this.logService.trace(`[editor auto save] scheduling auto save after ${this.autoSaveAfterDelay}ms`, workingCopy.resource.toString(), workingCopy.typeId);
        // Schedule new auto save
        const handle = setTimeout(() => {
            // Clear disposable
            this.pendingAutoSavesAfterDelay.delete(workingCopy);
            // Save if dirty
            if (workingCopy.isDirty()) {
                this.logService.trace(`[editor auto save] running auto save`, workingCopy.resource.toString(), workingCopy.typeId);
                workingCopy.save({ reason: 2 /* SaveReason.AUTO */ });
            }
        }, this.autoSaveAfterDelay);
        // Keep in map for disposal as needed
        this.pendingAutoSavesAfterDelay.set(workingCopy, toDisposable(() => {
            this.logService.trace(`[editor auto save] clearing pending auto save`, workingCopy.resource.toString(), workingCopy.typeId);
            clearTimeout(handle);
        }));
    }
    discardAutoSave(workingCopy) {
        dispose(this.pendingAutoSavesAfterDelay.get(workingCopy));
        this.pendingAutoSavesAfterDelay.delete(workingCopy);
    }
};
EditorAutoSave = __decorate([
    __param(0, IFilesConfigurationService),
    __param(1, IHostService),
    __param(2, IEditorService),
    __param(3, IEditorGroupsService),
    __param(4, IWorkingCopyService),
    __param(5, ILogService)
], EditorAutoSave);
export { EditorAutoSave };
