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
import { RunOnceScheduler } from 'vs/base/common/async';
import { Disposable } from 'vs/base/common/lifecycle';
import { ResourceMap } from 'vs/base/common/map';
import { Schemas } from 'vs/base/common/network';
import { isEqual } from 'vs/base/common/resources';
import { URI } from 'vs/base/common/uri';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { getNotebookEditorFromEditorPane } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { CellUri, NotebookCellsChangeType } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { CellExecutionUpdateType } from 'vs/workbench/contrib/notebook/common/notebookExecutionService';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
import { INotebookService } from 'vs/workbench/contrib/notebook/common/notebookService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
let NotebookBreakpoints = class NotebookBreakpoints extends Disposable {
    _debugService;
    _editorService;
    constructor(_debugService, _notebookService, _editorService) {
        super();
        this._debugService = _debugService;
        this._editorService = _editorService;
        const listeners = new ResourceMap();
        this._register(_notebookService.onWillAddNotebookDocument(model => {
            listeners.set(model.uri, model.onWillAddRemoveCells(e => {
                // When deleting a cell, remove its breakpoints
                const debugModel = this._debugService.getModel();
                if (!debugModel.getBreakpoints().length) {
                    return;
                }
                if (e.rawEvent.kind !== NotebookCellsChangeType.ModelChange) {
                    return;
                }
                for (const change of e.rawEvent.changes) {
                    const [start, deleteCount] = change;
                    if (deleteCount > 0) {
                        const deleted = model.cells.slice(start, start + deleteCount);
                        for (const deletedCell of deleted) {
                            const cellBps = debugModel.getBreakpoints({ uri: deletedCell.uri });
                            cellBps.forEach(cellBp => this._debugService.removeBreakpoints(cellBp.getId()));
                        }
                    }
                }
            }));
        }));
        this._register(_notebookService.onWillRemoveNotebookDocument(model => {
            this.updateBreakpoints(model);
            listeners.get(model.uri)?.dispose();
            listeners.delete(model.uri);
        }));
        this._register(this._debugService.getModel().onDidChangeBreakpoints(e => {
            const newCellBp = e?.added?.find(bp => 'uri' in bp && bp.uri.scheme === Schemas.vscodeNotebookCell);
            if (newCellBp) {
                const parsed = CellUri.parse(newCellBp.uri);
                if (!parsed) {
                    return;
                }
                const editor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
                if (!editor || !editor.hasModel() || editor.textModel.uri.toString() !== parsed.notebook.toString()) {
                    return;
                }
                const cell = editor.getCellByHandle(parsed.handle);
                if (!cell) {
                    return;
                }
                editor.focusElement(cell);
            }
        }));
    }
    updateBreakpoints(model) {
        const bps = this._debugService.getModel().getBreakpoints();
        if (!bps.length || !model.cells.length) {
            return;
        }
        const idxMap = new ResourceMap();
        model.cells.forEach((cell, i) => {
            idxMap.set(cell.uri, i);
        });
        bps.forEach(bp => {
            const idx = idxMap.get(bp.uri);
            if (typeof idx !== 'number') {
                return;
            }
            const notebook = CellUri.parse(bp.uri)?.notebook;
            if (!notebook) {
                return;
            }
            const newUri = CellUri.generate(notebook, idx);
            if (isEqual(newUri, bp.uri)) {
                return;
            }
            this._debugService.removeBreakpoints(bp.getId());
            this._debugService.addBreakpoints(newUri, [
                {
                    column: bp.column,
                    condition: bp.condition,
                    enabled: bp.enabled,
                    hitCondition: bp.hitCondition,
                    logMessage: bp.logMessage,
                    lineNumber: bp.lineNumber
                }
            ]);
        });
    }
};
NotebookBreakpoints = __decorate([
    __param(0, IDebugService),
    __param(1, INotebookService),
    __param(2, IEditorService)
], NotebookBreakpoints);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(NotebookBreakpoints, 3 /* LifecyclePhase.Restored */);
let NotebookCellPausing = class NotebookCellPausing extends Disposable {
    _debugService;
    _notebookExecutionStateService;
    _pausedCells = new Set();
    _scheduler;
    constructor(_debugService, _notebookExecutionStateService) {
        super();
        this._debugService = _debugService;
        this._notebookExecutionStateService = _notebookExecutionStateService;
        this._register(_debugService.getModel().onDidChangeCallStack(() => {
            // First update using the stale callstack if the real callstack is empty, to reduce blinking while stepping.
            // After not pausing for 2s, update again with the latest callstack.
            this.onDidChangeCallStack(true);
            this._scheduler.schedule();
        }));
        this._scheduler = this._register(new RunOnceScheduler(() => this.onDidChangeCallStack(false), 2000));
    }
    async onDidChangeCallStack(fallBackOnStaleCallstack) {
        const newPausedCells = new Set();
        for (const session of this._debugService.getModel().getSessions()) {
            for (const thread of session.getAllThreads()) {
                let callStack = thread.getCallStack();
                if (fallBackOnStaleCallstack && !callStack.length) {
                    callStack = thread.getStaleCallStack();
                }
                callStack.forEach(sf => {
                    const parsed = CellUri.parse(sf.source.uri);
                    if (parsed) {
                        newPausedCells.add(sf.source.uri.toString());
                        this.editIsPaused(sf.source.uri, true);
                    }
                });
            }
        }
        for (const uri of this._pausedCells) {
            if (!newPausedCells.has(uri)) {
                this.editIsPaused(URI.parse(uri), false);
                this._pausedCells.delete(uri);
            }
        }
        newPausedCells.forEach(cell => this._pausedCells.add(cell));
    }
    editIsPaused(cellUri, isPaused) {
        const parsed = CellUri.parse(cellUri);
        if (parsed) {
            const exeState = this._notebookExecutionStateService.getCellExecution(cellUri);
            if (exeState && (exeState.isPaused !== isPaused || !exeState.didPause)) {
                exeState.update([{
                        editType: CellExecutionUpdateType.ExecutionState,
                        didPause: true,
                        isPaused
                    }]);
            }
        }
    }
};
NotebookCellPausing = __decorate([
    __param(0, IDebugService),
    __param(1, INotebookExecutionStateService)
], NotebookCellPausing);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(NotebookCellPausing, 3 /* LifecyclePhase.Restored */);
