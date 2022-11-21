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
import { disposableTimeout, Throttler } from 'vs/base/common/async';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import { NotebookVisibleCellObserver } from 'vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/notebookVisibleCellObserver';
import { registerNotebookContribution } from 'vs/workbench/contrib/notebook/browser/notebookEditorExtensions';
import { INotebookCellStatusBarService } from 'vs/workbench/contrib/notebook/common/notebookCellStatusBarService';
let ContributedStatusBarItemController = class ContributedStatusBarItemController extends Disposable {
    _notebookEditor;
    _notebookCellStatusBarService;
    static id = 'workbench.notebook.statusBar.contributed';
    _visibleCells = new Map();
    _observer;
    constructor(_notebookEditor, _notebookCellStatusBarService) {
        super();
        this._notebookEditor = _notebookEditor;
        this._notebookCellStatusBarService = _notebookCellStatusBarService;
        this._observer = this._register(new NotebookVisibleCellObserver(this._notebookEditor));
        this._register(this._observer.onDidChangeVisibleCells(this._updateVisibleCells, this));
        this._updateEverything();
        this._register(this._notebookCellStatusBarService.onDidChangeProviders(this._updateEverything, this));
        this._register(this._notebookCellStatusBarService.onDidChangeItems(this._updateEverything, this));
    }
    _updateEverything() {
        const newCells = this._observer.visibleCells.filter(cell => !this._visibleCells.has(cell.handle));
        const visibleCellHandles = new Set(this._observer.visibleCells.map(item => item.handle));
        const currentCellHandles = Array.from(this._visibleCells.keys());
        const removedCells = currentCellHandles.filter(handle => !visibleCellHandles.has(handle));
        const itemsToUpdate = currentCellHandles.filter(handle => visibleCellHandles.has(handle));
        this._updateVisibleCells({ added: newCells, removed: removedCells.map(handle => ({ handle })) });
        itemsToUpdate.forEach(handle => this._visibleCells.get(handle)?.update());
    }
    _updateVisibleCells(e) {
        const vm = this._notebookEditor._getViewModel();
        if (!vm) {
            return;
        }
        for (const newCell of e.added) {
            const helper = new CellStatusBarHelper(vm, newCell, this._notebookCellStatusBarService);
            this._visibleCells.set(newCell.handle, helper);
        }
        for (const oldCell of e.removed) {
            this._visibleCells.get(oldCell.handle)?.dispose();
            this._visibleCells.delete(oldCell.handle);
        }
    }
    dispose() {
        super.dispose();
        this._visibleCells.forEach(cell => cell.dispose());
        this._visibleCells.clear();
    }
};
ContributedStatusBarItemController = __decorate([
    __param(1, INotebookCellStatusBarService)
], ContributedStatusBarItemController);
export { ContributedStatusBarItemController };
class CellStatusBarHelper extends Disposable {
    _notebookViewModel;
    _cell;
    _notebookCellStatusBarService;
    _currentItemIds = [];
    _currentItemLists = [];
    _activeToken;
    _updateThrottler = new Throttler();
    constructor(_notebookViewModel, _cell, _notebookCellStatusBarService) {
        super();
        this._notebookViewModel = _notebookViewModel;
        this._cell = _cell;
        this._notebookCellStatusBarService = _notebookCellStatusBarService;
        this._register(toDisposable(() => this._activeToken?.dispose(true)));
        this._updateSoon();
        this._register(this._cell.model.onDidChangeContent(() => this._updateSoon()));
        this._register(this._cell.model.onDidChangeLanguage(() => this._updateSoon()));
        this._register(this._cell.model.onDidChangeMetadata(() => this._updateSoon()));
        this._register(this._cell.model.onDidChangeInternalMetadata(() => this._updateSoon()));
        this._register(this._cell.model.onDidChangeOutputs(() => this._updateSoon()));
    }
    update() {
        this._updateSoon();
    }
    _updateSoon() {
        // Wait a tick to make sure that the event is fired to the EH before triggering status bar providers
        this._register(disposableTimeout(() => {
            this._updateThrottler.queue(() => this._update());
        }, 0));
    }
    async _update() {
        const cellIndex = this._notebookViewModel.getCellIndex(this._cell);
        const docUri = this._notebookViewModel.notebookDocument.uri;
        const viewType = this._notebookViewModel.notebookDocument.viewType;
        this._activeToken?.dispose(true);
        const tokenSource = this._activeToken = new CancellationTokenSource();
        const itemLists = await this._notebookCellStatusBarService.getStatusBarItemsForCell(docUri, cellIndex, viewType, tokenSource.token);
        if (tokenSource.token.isCancellationRequested) {
            itemLists.forEach(itemList => itemList.dispose && itemList.dispose());
            return;
        }
        const items = itemLists.map(itemList => itemList.items).flat();
        const newIds = this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items }]);
        this._currentItemLists.forEach(itemList => itemList.dispose && itemList.dispose());
        this._currentItemLists = itemLists;
        this._currentItemIds = newIds;
    }
    dispose() {
        super.dispose();
        this._activeToken?.dispose(true);
        this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items: [] }]);
        this._currentItemLists.forEach(itemList => itemList.dispose && itemList.dispose());
    }
}
registerNotebookContribution(ContributedStatusBarItemController.id, ContributedStatusBarItemController);
