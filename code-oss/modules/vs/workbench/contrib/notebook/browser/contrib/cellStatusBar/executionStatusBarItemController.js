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
import { disposableTimeout, RunOnceScheduler } from 'vs/base/common/async';
import { Disposable, dispose, MutableDisposable } from 'vs/base/common/lifecycle';
import { localize } from 'vs/nls';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { themeColorFromId, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { NotebookVisibleCellObserver } from 'vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/notebookVisibleCellObserver';
import { registerNotebookContribution } from 'vs/workbench/contrib/notebook/browser/notebookEditorExtensions';
import { cellStatusIconError, cellStatusIconSuccess } from 'vs/workbench/contrib/notebook/browser/notebookEditorWidget';
import { errorStateIcon, executingStateIcon, pendingStateIcon, successStateIcon } from 'vs/workbench/contrib/notebook/browser/notebookIcons';
import { NotebookCellExecutionState } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
export function formatCellDuration(duration) {
    const minutes = Math.floor(duration / 1000 / 60);
    const seconds = Math.floor(duration / 1000) % 60;
    const tenths = String(duration - minutes * 60 * 1000 - seconds * 1000).charAt(0);
    if (minutes > 0) {
        return `${minutes}m ${seconds}.${tenths}s`;
    }
    else {
        return `${seconds}.${tenths}s`;
    }
}
export class NotebookStatusBarController extends Disposable {
    _notebookEditor;
    _itemFactory;
    _visibleCells = new Map();
    _observer;
    constructor(_notebookEditor, _itemFactory) {
        super();
        this._notebookEditor = _notebookEditor;
        this._itemFactory = _itemFactory;
        this._observer = this._register(new NotebookVisibleCellObserver(this._notebookEditor));
        this._register(this._observer.onDidChangeVisibleCells(this._updateVisibleCells, this));
        this._updateEverything();
    }
    _updateEverything() {
        this._visibleCells.forEach(dispose);
        this._visibleCells.clear();
        this._updateVisibleCells({ added: this._observer.visibleCells, removed: [] });
    }
    _updateVisibleCells(e) {
        const vm = this._notebookEditor._getViewModel();
        if (!vm) {
            return;
        }
        for (const oldCell of e.removed) {
            this._visibleCells.get(oldCell.handle)?.dispose();
            this._visibleCells.delete(oldCell.handle);
        }
        for (const newCell of e.added) {
            this._visibleCells.set(newCell.handle, this._itemFactory(vm, newCell));
        }
    }
    dispose() {
        super.dispose();
        this._visibleCells.forEach(dispose);
        this._visibleCells.clear();
    }
}
let ExecutionStateCellStatusBarContrib = class ExecutionStateCellStatusBarContrib extends Disposable {
    static id = 'workbench.notebook.statusBar.execState';
    constructor(notebookEditor, instantiationService) {
        super();
        this._register(new NotebookStatusBarController(notebookEditor, (vm, cell) => instantiationService.createInstance(ExecutionStateCellStatusBarItem, vm, cell)));
    }
};
ExecutionStateCellStatusBarContrib = __decorate([
    __param(1, IInstantiationService)
], ExecutionStateCellStatusBarContrib);
export { ExecutionStateCellStatusBarContrib };
registerNotebookContribution(ExecutionStateCellStatusBarContrib.id, ExecutionStateCellStatusBarContrib);
/**
 * Shows the cell's execution state in the cell status bar. When the "executing" state is shown, it will be shown for a minimum brief time.
 */
let ExecutionStateCellStatusBarItem = class ExecutionStateCellStatusBarItem extends Disposable {
    _notebookViewModel;
    _cell;
    _executionStateService;
    static MIN_SPINNER_TIME = 500;
    _currentItemIds = [];
    _showedExecutingStateTime;
    _clearExecutingStateTimer = this._register(new MutableDisposable());
    constructor(_notebookViewModel, _cell, _executionStateService) {
        super();
        this._notebookViewModel = _notebookViewModel;
        this._cell = _cell;
        this._executionStateService = _executionStateService;
        this._update();
        this._register(this._executionStateService.onDidChangeCellExecution(e => {
            if (e.affectsCell(this._cell.uri)) {
                this._update();
            }
        }));
        this._register(this._cell.model.onDidChangeInternalMetadata(() => this._update()));
    }
    async _update() {
        const items = this._getItemsForCell();
        if (Array.isArray(items)) {
            this._currentItemIds = this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items }]);
        }
    }
    /**
     *	Returns undefined if there should be no change, and an empty array if all items should be removed.
     */
    _getItemsForCell() {
        const runState = this._executionStateService.getCellExecution(this._cell.uri);
        // Show the execution spinner for a minimum time
        if (runState?.state === NotebookCellExecutionState.Executing && typeof this._showedExecutingStateTime !== 'number') {
            this._showedExecutingStateTime = Date.now();
        }
        else if (runState?.state !== NotebookCellExecutionState.Executing && typeof this._showedExecutingStateTime === 'number') {
            const timeUntilMin = ExecutionStateCellStatusBarItem.MIN_SPINNER_TIME - (Date.now() - this._showedExecutingStateTime);
            if (timeUntilMin > 0) {
                if (!this._clearExecutingStateTimer.value) {
                    this._clearExecutingStateTimer.value = disposableTimeout(() => {
                        this._showedExecutingStateTime = undefined;
                        this._clearExecutingStateTimer.clear();
                        this._update();
                    }, timeUntilMin);
                }
                return undefined;
            }
            else {
                this._showedExecutingStateTime = undefined;
            }
        }
        const item = this._getItemForState(runState, this._cell.internalMetadata);
        return item ? [item] : [];
    }
    _getItemForState(runState, internalMetadata) {
        const state = runState?.state;
        const { lastRunSuccess } = internalMetadata;
        if (!state && lastRunSuccess) {
            return {
                text: `$(${successStateIcon.id})`,
                color: themeColorFromId(cellStatusIconSuccess),
                tooltip: localize('notebook.cell.status.success', "Success"),
                alignment: 1 /* CellStatusbarAlignment.Left */,
                priority: Number.MAX_SAFE_INTEGER
            };
        }
        else if (!state && lastRunSuccess === false) {
            return {
                text: `$(${errorStateIcon.id})`,
                color: themeColorFromId(cellStatusIconError),
                tooltip: localize('notebook.cell.status.failed', "Failed"),
                alignment: 1 /* CellStatusbarAlignment.Left */,
                priority: Number.MAX_SAFE_INTEGER
            };
        }
        else if (state === NotebookCellExecutionState.Pending || state === NotebookCellExecutionState.Unconfirmed) {
            return {
                text: `$(${pendingStateIcon.id})`,
                tooltip: localize('notebook.cell.status.pending', "Pending"),
                alignment: 1 /* CellStatusbarAlignment.Left */,
                priority: Number.MAX_SAFE_INTEGER
            };
        }
        else if (state === NotebookCellExecutionState.Executing) {
            const icon = runState?.didPause ?
                executingStateIcon :
                ThemeIcon.modify(executingStateIcon, 'spin');
            return {
                text: `$(${icon.id})`,
                tooltip: localize('notebook.cell.status.executing', "Executing"),
                alignment: 1 /* CellStatusbarAlignment.Left */,
                priority: Number.MAX_SAFE_INTEGER
            };
        }
        return;
    }
    dispose() {
        super.dispose();
        this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items: [] }]);
    }
};
ExecutionStateCellStatusBarItem = __decorate([
    __param(2, INotebookExecutionStateService)
], ExecutionStateCellStatusBarItem);
let TimerCellStatusBarContrib = class TimerCellStatusBarContrib extends Disposable {
    static id = 'workbench.notebook.statusBar.execTimer';
    constructor(notebookEditor, instantiationService) {
        super();
        this._register(new NotebookStatusBarController(notebookEditor, (vm, cell) => instantiationService.createInstance(TimerCellStatusBarItem, vm, cell)));
    }
};
TimerCellStatusBarContrib = __decorate([
    __param(1, IInstantiationService)
], TimerCellStatusBarContrib);
export { TimerCellStatusBarContrib };
registerNotebookContribution(TimerCellStatusBarContrib.id, TimerCellStatusBarContrib);
const UPDATE_TIMER_GRACE_PERIOD = 200;
let TimerCellStatusBarItem = class TimerCellStatusBarItem extends Disposable {
    _notebookViewModel;
    _cell;
    _executionStateService;
    static UPDATE_INTERVAL = 100;
    _currentItemIds = [];
    _scheduler;
    _deferredUpdate;
    constructor(_notebookViewModel, _cell, _executionStateService) {
        super();
        this._notebookViewModel = _notebookViewModel;
        this._cell = _cell;
        this._executionStateService = _executionStateService;
        this._scheduler = this._register(new RunOnceScheduler(() => this._update(), TimerCellStatusBarItem.UPDATE_INTERVAL));
        this._update();
        this._register(this._cell.model.onDidChangeInternalMetadata(() => this._update()));
    }
    async _update() {
        let item;
        const runState = this._executionStateService.getCellExecution(this._cell.uri);
        const state = runState?.state;
        if (runState?.didPause) {
            item = undefined;
        }
        else if (state === NotebookCellExecutionState.Executing) {
            const startTime = this._cell.internalMetadata.runStartTime;
            const adjustment = this._cell.internalMetadata.runStartTimeAdjustment;
            if (typeof startTime === 'number') {
                item = this._getTimeItem(startTime, Date.now(), adjustment);
                this._scheduler.schedule();
            }
        }
        else if (!state) {
            const startTime = this._cell.internalMetadata.runStartTime;
            const endTime = this._cell.internalMetadata.runEndTime;
            if (typeof startTime === 'number' && typeof endTime === 'number') {
                item = this._getTimeItem(startTime, endTime);
            }
        }
        const items = item ? [item] : [];
        if (!items.length && !!runState) {
            if (!this._deferredUpdate) {
                this._deferredUpdate = disposableTimeout(() => {
                    this._deferredUpdate = undefined;
                    this._currentItemIds = this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items }]);
                }, UPDATE_TIMER_GRACE_PERIOD);
            }
        }
        else {
            this._deferredUpdate?.dispose();
            this._deferredUpdate = undefined;
            this._currentItemIds = this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items }]);
        }
    }
    _getTimeItem(startTime, endTime, adjustment = 0) {
        const duration = endTime - startTime + adjustment;
        return {
            text: formatCellDuration(duration),
            alignment: 1 /* CellStatusbarAlignment.Left */,
            priority: Number.MAX_SAFE_INTEGER - 1
        };
    }
    dispose() {
        super.dispose();
        this._deferredUpdate?.dispose();
        this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items: [] }]);
    }
};
TimerCellStatusBarItem = __decorate([
    __param(2, INotebookExecutionStateService)
], TimerCellStatusBarItem);
