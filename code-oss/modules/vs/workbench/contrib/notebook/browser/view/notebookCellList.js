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
import * as DOM from 'vs/base/browser/dom';
import { ListError } from 'vs/base/browser/ui/list/list';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable, DisposableStore, MutableDisposable } from 'vs/base/common/lifecycle';
import { isMacintosh } from 'vs/base/common/platform';
import { Range } from 'vs/editor/common/core/range';
import { PrefixSumComputer } from 'vs/editor/common/model/prefixSumComputer';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IListService, WorkbenchList } from 'vs/platform/list/browser/listService';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { CursorAtBoundary, CellEditState, CellFocusMode } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { diff, NOTEBOOK_EDITOR_CURSOR_BOUNDARY, CellKind, SelectionStateType } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { cellRangesToIndexes, reduceCellRanges, cellRangesEqual } from 'vs/workbench/contrib/notebook/common/notebookRange';
import { NOTEBOOK_CELL_LIST_FOCUSED } from 'vs/workbench/contrib/notebook/common/notebookContextKeys';
import { clamp } from 'vs/base/common/numbers';
import { FastDomNode } from 'vs/base/browser/fastDomNode';
import { MarkupCellViewModel } from 'vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
var CellRevealType;
(function (CellRevealType) {
    CellRevealType[CellRevealType["Line"] = 0] = "Line";
    CellRevealType[CellRevealType["Range"] = 1] = "Range";
})(CellRevealType || (CellRevealType = {}));
var CellRevealPosition;
(function (CellRevealPosition) {
    CellRevealPosition[CellRevealPosition["Top"] = 0] = "Top";
    CellRevealPosition[CellRevealPosition["Center"] = 1] = "Center";
    CellRevealPosition[CellRevealPosition["Bottom"] = 2] = "Bottom";
    CellRevealPosition[CellRevealPosition["NearTop"] = 3] = "NearTop";
})(CellRevealPosition || (CellRevealPosition = {}));
function getVisibleCells(cells, hiddenRanges) {
    if (!hiddenRanges.length) {
        return cells;
    }
    let start = 0;
    let hiddenRangeIndex = 0;
    const result = [];
    while (start < cells.length && hiddenRangeIndex < hiddenRanges.length) {
        if (start < hiddenRanges[hiddenRangeIndex].start) {
            result.push(...cells.slice(start, hiddenRanges[hiddenRangeIndex].start));
        }
        start = hiddenRanges[hiddenRangeIndex].end + 1;
        hiddenRangeIndex++;
    }
    if (start < cells.length) {
        result.push(...cells.slice(start));
    }
    return result;
}
export const NOTEBOOK_WEBVIEW_BOUNDARY = 5000;
function validateWebviewBoundary(element) {
    const webviewTop = 0 - (parseInt(element.style.top, 10) || 0);
    return webviewTop >= 0 && webviewTop <= NOTEBOOK_WEBVIEW_BOUNDARY * 2;
}
let NotebookCellList = class NotebookCellList extends WorkbenchList {
    listUser;
    get onWillScroll() { return this.view.onWillScroll; }
    get rowsContainer() {
        return this.view.containerDomNode;
    }
    get scrollableElement() {
        return this.view.scrollableElementDomNode;
    }
    _previousFocusedElements = [];
    _localDisposableStore = new DisposableStore();
    _viewModelStore = new DisposableStore();
    styleElement;
    _onDidRemoveOutputs = this._localDisposableStore.add(new Emitter());
    onDidRemoveOutputs = this._onDidRemoveOutputs.event;
    _onDidHideOutputs = this._localDisposableStore.add(new Emitter());
    onDidHideOutputs = this._onDidHideOutputs.event;
    _onDidRemoveCellsFromView = this._localDisposableStore.add(new Emitter());
    onDidRemoveCellsFromView = this._onDidRemoveCellsFromView.event;
    _viewModel = null;
    get viewModel() {
        return this._viewModel;
    }
    _hiddenRangeIds = [];
    hiddenRangesPrefixSum = null;
    _onDidChangeVisibleRanges = this._localDisposableStore.add(new Emitter());
    onDidChangeVisibleRanges = this._onDidChangeVisibleRanges.event;
    _visibleRanges = [];
    get visibleRanges() {
        return this._visibleRanges;
    }
    set visibleRanges(ranges) {
        if (cellRangesEqual(this._visibleRanges, ranges)) {
            return;
        }
        this._visibleRanges = ranges;
        this._onDidChangeVisibleRanges.fire();
    }
    _isDisposed = false;
    get isDisposed() {
        return this._isDisposed;
    }
    _isInLayout = false;
    _viewContext;
    _webviewElement = null;
    get webviewElement() {
        return this._webviewElement;
    }
    constructor(listUser, container, viewContext, delegate, renderers, contextKeyService, options, listService, themeService, configurationService, instantiationService) {
        super(listUser, container, delegate, renderers, options, contextKeyService, listService, themeService, configurationService, instantiationService);
        this.listUser = listUser;
        NOTEBOOK_CELL_LIST_FOCUSED.bindTo(this.contextKeyService).set(true);
        this._viewContext = viewContext;
        this._previousFocusedElements = this.getFocusedElements();
        this._localDisposableStore.add(this.onDidChangeFocus((e) => {
            this._previousFocusedElements.forEach(element => {
                if (e.elements.indexOf(element) < 0) {
                    element.onDeselect();
                }
            });
            this._previousFocusedElements = e.elements;
        }));
        const notebookEditorCursorAtBoundaryContext = NOTEBOOK_EDITOR_CURSOR_BOUNDARY.bindTo(contextKeyService);
        notebookEditorCursorAtBoundaryContext.set('none');
        const cursorSelectionListener = this._localDisposableStore.add(new MutableDisposable());
        const textEditorAttachListener = this._localDisposableStore.add(new MutableDisposable());
        const recomputeContext = (element) => {
            switch (element.cursorAtBoundary()) {
                case CursorAtBoundary.Both:
                    notebookEditorCursorAtBoundaryContext.set('both');
                    break;
                case CursorAtBoundary.Top:
                    notebookEditorCursorAtBoundaryContext.set('top');
                    break;
                case CursorAtBoundary.Bottom:
                    notebookEditorCursorAtBoundaryContext.set('bottom');
                    break;
                default:
                    notebookEditorCursorAtBoundaryContext.set('none');
                    break;
            }
            return;
        };
        // Cursor Boundary context
        this._localDisposableStore.add(this.onDidChangeFocus((e) => {
            if (e.elements.length) {
                // we only validate the first focused element
                const focusedElement = e.elements[0];
                cursorSelectionListener.value = focusedElement.onDidChangeState((e) => {
                    if (e.selectionChanged) {
                        recomputeContext(focusedElement);
                    }
                });
                textEditorAttachListener.value = focusedElement.onDidChangeEditorAttachState(() => {
                    if (focusedElement.editorAttached) {
                        recomputeContext(focusedElement);
                    }
                });
                recomputeContext(focusedElement);
                return;
            }
            // reset context
            notebookEditorCursorAtBoundaryContext.set('none');
        }));
        this._localDisposableStore.add(this.view.onMouseDblClick(() => {
            const focus = this.getFocusedElements()[0];
            if (focus && focus.cellKind === CellKind.Markup && !focus.isInputCollapsed && !this._viewModel?.options.isReadOnly) {
                // scroll the cell into view if out of viewport
                this.revealElementInView(focus);
                focus.updateEditState(CellEditState.Editing, 'dbclick');
                focus.focusMode = CellFocusMode.Editor;
            }
        }));
        // update visibleRanges
        const updateVisibleRanges = () => {
            if (!this.view.length) {
                return;
            }
            const top = this.getViewScrollTop();
            const bottom = this.getViewScrollBottom();
            if (top >= bottom) {
                return;
            }
            const topViewIndex = clamp(this.view.indexAt(top), 0, this.view.length - 1);
            const topElement = this.view.element(topViewIndex);
            const topModelIndex = this._viewModel.getCellIndex(topElement);
            const bottomViewIndex = clamp(this.view.indexAt(bottom), 0, this.view.length - 1);
            const bottomElement = this.view.element(bottomViewIndex);
            const bottomModelIndex = this._viewModel.getCellIndex(bottomElement);
            if (bottomModelIndex - topModelIndex === bottomViewIndex - topViewIndex) {
                this.visibleRanges = [{ start: topModelIndex, end: bottomModelIndex + 1 }];
            }
            else {
                this.visibleRanges = this._getVisibleRangesFromIndex(topViewIndex, topModelIndex, bottomViewIndex, bottomModelIndex);
            }
        };
        this._localDisposableStore.add(this.view.onDidChangeContentHeight(() => {
            if (this._isInLayout) {
                DOM.scheduleAtNextAnimationFrame(() => {
                    updateVisibleRanges();
                });
            }
            updateVisibleRanges();
        }));
        this._localDisposableStore.add(this.view.onDidScroll(() => {
            if (this._isInLayout) {
                DOM.scheduleAtNextAnimationFrame(() => {
                    updateVisibleRanges();
                });
            }
            updateVisibleRanges();
        }));
    }
    attachWebview(element) {
        element.style.top = `-${NOTEBOOK_WEBVIEW_BOUNDARY}px`;
        this.rowsContainer.insertAdjacentElement('afterbegin', element);
        this._webviewElement = new FastDomNode(element);
    }
    elementAt(position) {
        if (!this.view.length) {
            return undefined;
        }
        const idx = this.view.indexAt(position);
        const clamped = clamp(idx, 0, this.view.length - 1);
        return this.element(clamped);
    }
    elementHeight(element) {
        const index = this._getViewIndexUpperBound(element);
        if (index === undefined || index < 0 || index >= this.length) {
            this._getViewIndexUpperBound(element);
            throw new ListError(this.listUser, `Invalid index ${index}`);
        }
        return this.view.elementHeight(index);
    }
    detachViewModel() {
        this._viewModelStore.clear();
        this._viewModel = null;
        this.hiddenRangesPrefixSum = null;
    }
    attachViewModel(model) {
        this._viewModel = model;
        this._viewModelStore.add(model.onDidChangeViewCells((e) => {
            if (this._isDisposed) {
                return;
            }
            const currentRanges = this._hiddenRangeIds.map(id => this._viewModel.getTrackedRange(id)).filter(range => range !== null);
            const newVisibleViewCells = getVisibleCells(this._viewModel.viewCells, currentRanges);
            const oldVisibleViewCells = [];
            const oldViewCellMapping = new Set();
            for (let i = 0; i < this.length; i++) {
                oldVisibleViewCells.push(this.element(i));
                oldViewCellMapping.add(this.element(i).uri.toString());
            }
            const viewDiffs = diff(oldVisibleViewCells, newVisibleViewCells, a => {
                return oldViewCellMapping.has(a.uri.toString());
            });
            if (e.synchronous) {
                this._updateElementsInWebview(viewDiffs);
            }
            else {
                this._viewModelStore.add(DOM.scheduleAtNextAnimationFrame(() => {
                    if (this._isDisposed) {
                        return;
                    }
                    this._updateElementsInWebview(viewDiffs);
                }));
            }
        }));
        this._viewModelStore.add(model.onDidChangeSelection((e) => {
            if (e === 'view') {
                return;
            }
            // convert model selections to view selections
            const viewSelections = cellRangesToIndexes(model.getSelections()).map(index => model.cellAt(index)).filter(cell => !!cell).map(cell => this._getViewIndexUpperBound(cell));
            this.setSelection(viewSelections, undefined, true);
            const primary = cellRangesToIndexes([model.getFocus()]).map(index => model.cellAt(index)).filter(cell => !!cell).map(cell => this._getViewIndexUpperBound(cell));
            if (primary.length) {
                this.setFocus(primary, undefined, true);
            }
        }));
        const hiddenRanges = model.getHiddenRanges();
        this.setHiddenAreas(hiddenRanges, false);
        const newRanges = reduceCellRanges(hiddenRanges);
        const viewCells = model.viewCells.slice(0);
        newRanges.reverse().forEach(range => {
            const removedCells = viewCells.splice(range.start, range.end - range.start + 1);
            this._onDidRemoveCellsFromView.fire(removedCells);
        });
        this.splice2(0, 0, viewCells);
    }
    _updateElementsInWebview(viewDiffs) {
        viewDiffs.reverse().forEach((diff) => {
            const hiddenOutputs = [];
            const deletedOutputs = [];
            const removedMarkdownCells = [];
            for (let i = diff.start; i < diff.start + diff.deleteCount; i++) {
                const cell = this.element(i);
                if (cell.cellKind === CellKind.Code) {
                    if (this._viewModel.hasCell(cell)) {
                        hiddenOutputs.push(...cell?.outputsViewModels);
                    }
                    else {
                        deletedOutputs.push(...cell?.outputsViewModels);
                    }
                }
                else {
                    removedMarkdownCells.push(cell);
                }
            }
            this.splice2(diff.start, diff.deleteCount, diff.toInsert);
            this._onDidHideOutputs.fire(hiddenOutputs);
            this._onDidRemoveOutputs.fire(deletedOutputs);
            this._onDidRemoveCellsFromView.fire(removedMarkdownCells);
        });
    }
    clear() {
        super.splice(0, this.length);
    }
    setHiddenAreas(_ranges, triggerViewUpdate) {
        if (!this._viewModel) {
            return false;
        }
        const newRanges = reduceCellRanges(_ranges);
        // delete old tracking ranges
        const oldRanges = this._hiddenRangeIds.map(id => this._viewModel.getTrackedRange(id)).filter(range => range !== null);
        if (newRanges.length === oldRanges.length) {
            let hasDifference = false;
            for (let i = 0; i < newRanges.length; i++) {
                if (!(newRanges[i].start === oldRanges[i].start && newRanges[i].end === oldRanges[i].end)) {
                    hasDifference = true;
                    break;
                }
            }
            if (!hasDifference) {
                // they call 'setHiddenAreas' for a reason, even if the ranges are still the same, it's possible that the hiddenRangeSum is not update to date
                this._updateHiddenRangePrefixSum(newRanges);
                return false;
            }
        }
        this._hiddenRangeIds.forEach(id => this._viewModel.setTrackedRange(id, null, 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */));
        const hiddenAreaIds = newRanges.map(range => this._viewModel.setTrackedRange(null, range, 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */)).filter(id => id !== null);
        this._hiddenRangeIds = hiddenAreaIds;
        // set hidden ranges prefix sum
        this._updateHiddenRangePrefixSum(newRanges);
        if (triggerViewUpdate) {
            this.updateHiddenAreasInView(oldRanges, newRanges);
        }
        return true;
    }
    _updateHiddenRangePrefixSum(newRanges) {
        let start = 0;
        let index = 0;
        const ret = [];
        while (index < newRanges.length) {
            for (let j = start; j < newRanges[index].start - 1; j++) {
                ret.push(1);
            }
            ret.push(newRanges[index].end - newRanges[index].start + 1 + 1);
            start = newRanges[index].end + 1;
            index++;
        }
        for (let i = start; i < this._viewModel.length; i++) {
            ret.push(1);
        }
        const values = new Uint32Array(ret.length);
        for (let i = 0; i < ret.length; i++) {
            values[i] = ret[i];
        }
        this.hiddenRangesPrefixSum = new PrefixSumComputer(values);
    }
    /**
     * oldRanges and newRanges are all reduced and sorted.
     */
    updateHiddenAreasInView(oldRanges, newRanges) {
        const oldViewCellEntries = getVisibleCells(this._viewModel.viewCells, oldRanges);
        const oldViewCellMapping = new Set();
        oldViewCellEntries.forEach(cell => {
            oldViewCellMapping.add(cell.uri.toString());
        });
        const newViewCellEntries = getVisibleCells(this._viewModel.viewCells, newRanges);
        const viewDiffs = diff(oldViewCellEntries, newViewCellEntries, a => {
            return oldViewCellMapping.has(a.uri.toString());
        });
        this._updateElementsInWebview(viewDiffs);
    }
    splice2(start, deleteCount, elements = []) {
        // we need to convert start and delete count based on hidden ranges
        if (start < 0 || start > this.view.length) {
            return;
        }
        const focusInside = DOM.isAncestor(document.activeElement, this.rowsContainer);
        super.splice(start, deleteCount, elements);
        if (focusInside) {
            this.domFocus();
        }
        const selectionsLeft = [];
        this.getSelectedElements().forEach(el => {
            if (this._viewModel.hasCell(el)) {
                selectionsLeft.push(el.handle);
            }
        });
        if (!selectionsLeft.length && this._viewModel.viewCells.length) {
            // after splice, the selected cells are deleted
            this._viewModel.updateSelectionsState({ kind: SelectionStateType.Index, focus: { start: 0, end: 1 }, selections: [{ start: 0, end: 1 }] });
        }
    }
    getModelIndex(cell) {
        const viewIndex = this.indexOf(cell);
        return this.getModelIndex2(viewIndex);
    }
    getModelIndex2(viewIndex) {
        if (!this.hiddenRangesPrefixSum) {
            return viewIndex;
        }
        const modelIndex = this.hiddenRangesPrefixSum.getPrefixSum(viewIndex - 1);
        return modelIndex;
    }
    getViewIndex(cell) {
        const modelIndex = this._viewModel.getCellIndex(cell);
        return this.getViewIndex2(modelIndex);
    }
    getViewIndex2(modelIndex) {
        if (!this.hiddenRangesPrefixSum) {
            return modelIndex;
        }
        const viewIndexInfo = this.hiddenRangesPrefixSum.getIndexOf(modelIndex);
        if (viewIndexInfo.remainder !== 0) {
            if (modelIndex >= this.hiddenRangesPrefixSum.getTotalSum()) {
                // it's already after the last hidden range
                return modelIndex - (this.hiddenRangesPrefixSum.getTotalSum() - this.hiddenRangesPrefixSum.getCount());
            }
            return undefined;
        }
        else {
            return viewIndexInfo.index;
        }
    }
    _getVisibleRangesFromIndex(topViewIndex, topModelIndex, bottomViewIndex, bottomModelIndex) {
        const stack = [];
        const ranges = [];
        // there are hidden ranges
        let index = topViewIndex;
        let modelIndex = topModelIndex;
        while (index <= bottomViewIndex) {
            const accu = this.hiddenRangesPrefixSum.getPrefixSum(index);
            if (accu === modelIndex + 1) {
                // no hidden area after it
                if (stack.length) {
                    if (stack[stack.length - 1] === modelIndex - 1) {
                        ranges.push({ start: stack[stack.length - 1], end: modelIndex + 1 });
                    }
                    else {
                        ranges.push({ start: stack[stack.length - 1], end: stack[stack.length - 1] + 1 });
                    }
                }
                stack.push(modelIndex);
                index++;
                modelIndex++;
            }
            else {
                // there are hidden ranges after it
                if (stack.length) {
                    if (stack[stack.length - 1] === modelIndex - 1) {
                        ranges.push({ start: stack[stack.length - 1], end: modelIndex + 1 });
                    }
                    else {
                        ranges.push({ start: stack[stack.length - 1], end: stack[stack.length - 1] + 1 });
                    }
                }
                stack.push(modelIndex);
                index++;
                modelIndex = accu;
            }
        }
        if (stack.length) {
            ranges.push({ start: stack[stack.length - 1], end: stack[stack.length - 1] + 1 });
        }
        return reduceCellRanges(ranges);
    }
    getVisibleRangesPlusViewportAboveAndBelow() {
        if (this.view.length <= 0) {
            return [];
        }
        const top = Math.max(this.getViewScrollTop() - this.renderHeight, 0);
        const topViewIndex = this.view.indexAt(top);
        const topElement = this.view.element(topViewIndex);
        const topModelIndex = this._viewModel.getCellIndex(topElement);
        const bottom = clamp(this.getViewScrollBottom() + this.renderHeight, 0, this.scrollHeight);
        const bottomViewIndex = clamp(this.view.indexAt(bottom), 0, this.view.length - 1);
        const bottomElement = this.view.element(bottomViewIndex);
        const bottomModelIndex = this._viewModel.getCellIndex(bottomElement);
        if (bottomModelIndex - topModelIndex === bottomViewIndex - topViewIndex) {
            return [{ start: topModelIndex, end: bottomModelIndex }];
        }
        else {
            return this._getVisibleRangesFromIndex(topViewIndex, topModelIndex, bottomViewIndex, bottomModelIndex);
        }
    }
    _getViewIndexUpperBound(cell) {
        if (!this._viewModel) {
            return -1;
        }
        const modelIndex = this._viewModel.getCellIndex(cell);
        if (modelIndex === -1) {
            return -1;
        }
        if (!this.hiddenRangesPrefixSum) {
            return modelIndex;
        }
        const viewIndexInfo = this.hiddenRangesPrefixSum.getIndexOf(modelIndex);
        if (viewIndexInfo.remainder !== 0) {
            if (modelIndex >= this.hiddenRangesPrefixSum.getTotalSum()) {
                return modelIndex - (this.hiddenRangesPrefixSum.getTotalSum() - this.hiddenRangesPrefixSum.getCount());
            }
        }
        return viewIndexInfo.index;
    }
    _getViewIndexUpperBound2(modelIndex) {
        if (!this.hiddenRangesPrefixSum) {
            return modelIndex;
        }
        const viewIndexInfo = this.hiddenRangesPrefixSum.getIndexOf(modelIndex);
        if (viewIndexInfo.remainder !== 0) {
            if (modelIndex >= this.hiddenRangesPrefixSum.getTotalSum()) {
                return modelIndex - (this.hiddenRangesPrefixSum.getTotalSum() - this.hiddenRangesPrefixSum.getCount());
            }
        }
        return viewIndexInfo.index;
    }
    focusElement(cell) {
        const index = this._getViewIndexUpperBound(cell);
        if (index >= 0 && this._viewModel) {
            // update view model first, which will update both `focus` and `selection` in a single transaction
            const focusedElementHandle = this.element(index).handle;
            this._viewModel.updateSelectionsState({
                kind: SelectionStateType.Handle,
                primary: focusedElementHandle,
                selections: [focusedElementHandle]
            }, 'view');
            // update the view as previous model update will not trigger event
            this.setFocus([index], undefined, false);
        }
    }
    selectElements(elements) {
        const indices = elements.map(cell => this._getViewIndexUpperBound(cell)).filter(index => index >= 0);
        this.setSelection(indices);
    }
    setFocus(indexes, browserEvent, ignoreTextModelUpdate) {
        if (ignoreTextModelUpdate) {
            super.setFocus(indexes, browserEvent);
            return;
        }
        if (!indexes.length) {
            if (this._viewModel) {
                if (this.length) {
                    // Don't allow clearing focus, #121129
                    return;
                }
                this._viewModel.updateSelectionsState({
                    kind: SelectionStateType.Handle,
                    primary: null,
                    selections: []
                }, 'view');
            }
        }
        else {
            if (this._viewModel) {
                const focusedElementHandle = this.element(indexes[0]).handle;
                this._viewModel.updateSelectionsState({
                    kind: SelectionStateType.Handle,
                    primary: focusedElementHandle,
                    selections: this.getSelection().map(selection => this.element(selection).handle)
                }, 'view');
            }
        }
        super.setFocus(indexes, browserEvent);
    }
    setSelection(indexes, browserEvent, ignoreTextModelUpdate) {
        if (ignoreTextModelUpdate) {
            super.setSelection(indexes, browserEvent);
            return;
        }
        if (!indexes.length) {
            if (this._viewModel) {
                this._viewModel.updateSelectionsState({
                    kind: SelectionStateType.Handle,
                    primary: this.getFocusedElements()[0]?.handle ?? null,
                    selections: []
                }, 'view');
            }
        }
        else {
            if (this._viewModel) {
                this._viewModel.updateSelectionsState({
                    kind: SelectionStateType.Handle,
                    primary: this.getFocusedElements()[0]?.handle ?? null,
                    selections: indexes.map(index => this.element(index)).map(cell => cell.handle)
                }, 'view');
            }
        }
        super.setSelection(indexes, browserEvent);
    }
    /**
     * The range will be revealed with as little scrolling as possible.
     */
    revealElementsInView(range) {
        const startIndex = this._getViewIndexUpperBound2(range.start);
        if (startIndex < 0) {
            return;
        }
        const endIndex = this._getViewIndexUpperBound2(range.end - 1);
        const scrollTop = this.getViewScrollTop();
        const wrapperBottom = this.getViewScrollBottom();
        const elementTop = this.view.elementTop(startIndex);
        if (elementTop >= scrollTop
            && elementTop < wrapperBottom) {
            // start element is visible
            // check end
            const endElementTop = this.view.elementTop(endIndex);
            const endElementHeight = this.view.elementHeight(endIndex);
            if (endElementTop + endElementHeight <= wrapperBottom) {
                // fully visible
                return;
            }
            if (endElementTop >= wrapperBottom) {
                return this._revealInternal(endIndex, false, 2 /* CellRevealPosition.Bottom */);
            }
            if (endElementTop < wrapperBottom) {
                // end element partially visible
                if (endElementTop + endElementHeight - wrapperBottom < elementTop - scrollTop) {
                    // there is enough space to just scroll up a little bit to make the end element visible
                    return this.view.setScrollTop(scrollTop + endElementTop + endElementHeight - wrapperBottom);
                }
                else {
                    // don't even try it
                    return this._revealInternal(startIndex, false, 0 /* CellRevealPosition.Top */);
                }
            }
        }
        this._revealInView(startIndex);
    }
    isScrolledToBottom() {
        if (this.length === 0) {
            return true;
        }
        const last = this.length - 1;
        const bottom = this.view.elementHeight(last) + this.view.elementTop(last);
        const wrapperBottom = this.getViewScrollTop() + this.view.renderHeight;
        if (bottom <= wrapperBottom) {
            return true;
        }
        return false;
    }
    scrollToBottom() {
        const scrollHeight = this.view.scrollHeight;
        const scrollTop = this.getViewScrollTop();
        const wrapperBottom = this.getViewScrollBottom();
        const topInsertToolbarHeight = this._viewContext.notebookOptions.computeTopInsertToolbarHeight(this.viewModel?.viewType);
        this.view.setScrollTop(scrollHeight - (wrapperBottom - scrollTop) - topInsertToolbarHeight);
    }
    revealElementInView(cell) {
        const index = this._getViewIndexUpperBound(cell);
        if (index >= 0) {
            this._revealInView(index);
        }
    }
    revealElementInViewAtTop(cell) {
        const index = this._getViewIndexUpperBound(cell);
        if (index >= 0) {
            this._revealInternal(index, false, 0 /* CellRevealPosition.Top */);
        }
    }
    revealElementInCenterIfOutsideViewport(cell) {
        const index = this._getViewIndexUpperBound(cell);
        if (index >= 0) {
            this._revealInCenterIfOutsideViewport(index);
        }
    }
    revealElementInCenter(cell) {
        const index = this._getViewIndexUpperBound(cell);
        if (index >= 0) {
            this._revealInCenter(index);
        }
    }
    async revealElementInCenterIfOutsideViewportAsync(cell) {
        const index = this._getViewIndexUpperBound(cell);
        if (index >= 0) {
            return this._revealIfOutsideViewportAsync(index, 1 /* CellRevealPosition.Center */);
        }
    }
    async revealNearTopIfOutsideViewportAync(cell) {
        const index = this._getViewIndexUpperBound(cell);
        if (index >= 0) {
            return this._revealIfOutsideViewportAsync(index, 3 /* CellRevealPosition.NearTop */);
        }
    }
    async revealElementLineInViewAsync(cell, line) {
        const index = this._getViewIndexUpperBound(cell);
        if (index >= 0) {
            return this._revealLineInViewAsync(index, line);
        }
    }
    async revealElementLineInCenterAsync(cell, line) {
        const index = this._getViewIndexUpperBound(cell);
        if (index >= 0) {
            return this._revealLineInCenterAsync(index, line);
        }
    }
    async revealElementLineInCenterIfOutsideViewportAsync(cell, line) {
        const index = this._getViewIndexUpperBound(cell);
        if (index >= 0) {
            return this._revealLineInCenterIfOutsideViewportAsync(index, line);
        }
    }
    async revealElementRangeInViewAsync(cell, range) {
        const index = this._getViewIndexUpperBound(cell);
        if (index >= 0) {
            return this._revealRangeInView(index, range);
        }
    }
    async revealElementRangeInCenterAsync(cell, range) {
        const index = this._getViewIndexUpperBound(cell);
        if (index >= 0) {
            return this._revealRangeInCenterAsync(index, range);
        }
    }
    async revealElementRangeInCenterIfOutsideViewportAsync(cell, range) {
        const index = this._getViewIndexUpperBound(cell);
        if (index >= 0) {
            return this._revealRangeInCenterIfOutsideViewportAsync(index, range);
        }
    }
    async revealElementOffsetInCenterAsync(cell, offset) {
        const index = this._getViewIndexUpperBound(cell);
        if (index >= 0) {
            return this._revealOffset(index, offset);
        }
    }
    domElementOfElement(element) {
        const index = this._getViewIndexUpperBound(element);
        if (index >= 0) {
            return this.view.domElement(index);
        }
        return null;
    }
    focusView() {
        this.view.domNode.focus();
    }
    getAbsoluteTopOfElement(element) {
        const index = this._getViewIndexUpperBound(element);
        if (index === undefined || index < 0 || index >= this.length) {
            this._getViewIndexUpperBound(element);
            throw new ListError(this.listUser, `Invalid index ${index}`);
        }
        return this.view.elementTop(index);
    }
    triggerScrollFromMouseWheelEvent(browserEvent) {
        this.view.delegateScrollFromMouseWheelEvent(browserEvent);
    }
    delegateVerticalScrollbarPointerDown(browserEvent) {
        this.view.delegateVerticalScrollbarPointerDown(browserEvent);
    }
    isElementAboveViewport(index) {
        const elementTop = this.view.elementTop(index);
        const elementBottom = elementTop + this.view.elementHeight(index);
        return elementBottom < this.scrollTop;
    }
    updateElementHeight2(element, size) {
        const index = this._getViewIndexUpperBound(element);
        if (index === undefined || index < 0 || index >= this.length) {
            return;
        }
        if (this.isElementAboveViewport(index)) {
            // update element above viewport
            const oldHeight = this.elementHeight(element);
            const delta = oldHeight - size;
            if (this._webviewElement) {
                Event.once(this.view.onWillScroll)(() => {
                    const webviewTop = parseInt(this._webviewElement.domNode.style.top, 10);
                    if (validateWebviewBoundary(this._webviewElement.domNode)) {
                        this._webviewElement.setTop(webviewTop - delta);
                    }
                    else {
                        // When the webview top boundary is below the list view scrollable element top boundary, then we can't insert a markdown cell at the top
                        // or when its bottom boundary is above the list view bottom boundary, then we can't insert a markdown cell at the end
                        // thus we have to revert the webview element position to initial state `-NOTEBOOK_WEBVIEW_BOUNDARY`.
                        // this will trigger one visual flicker (as we need to update element offsets in the webview)
                        // but as long as NOTEBOOK_WEBVIEW_BOUNDARY is large enough, it will happen less often
                        this._webviewElement.setTop(-NOTEBOOK_WEBVIEW_BOUNDARY);
                    }
                });
            }
            this.view.updateElementHeight(index, size, null);
            return;
        }
        const focused = this.getFocus();
        if (!focused.length) {
            this.view.updateElementHeight(index, size, null);
            return;
        }
        const focus = focused[0];
        if (focus <= index) {
            this.view.updateElementHeight(index, size, focus);
            return;
        }
        // the `element` is in the viewport, it's very often that the height update is triggerred by user interaction (collapse, run cell)
        // then we should make sure that the `element`'s visual view position doesn't change.
        if (this.view.elementTop(index) >= this.view.scrollTop) {
            this.view.updateElementHeight(index, size, index);
            return;
        }
        this.view.updateElementHeight(index, size, focus);
    }
    // override
    domFocus() {
        const focused = this.getFocusedElements()[0];
        const focusedDomElement = focused && this.domElementOfElement(focused);
        if (document.activeElement && focusedDomElement && focusedDomElement.contains(document.activeElement)) {
            // for example, when focus goes into monaco editor, if we refocus the list view, the editor will lose focus.
            return;
        }
        if (!isMacintosh && document.activeElement && isContextMenuFocused()) {
            return;
        }
        super.domFocus();
    }
    focusContainer() {
        super.domFocus();
    }
    getViewScrollTop() {
        return this.view.getScrollTop();
    }
    getViewScrollBottom() {
        const topInsertToolbarHeight = this._viewContext.notebookOptions.computeTopInsertToolbarHeight(this.viewModel?.viewType);
        return this.getViewScrollTop() + this.view.renderHeight - topInsertToolbarHeight;
    }
    _revealOffset(viewIndex, offset) {
        const element = this.view.element(viewIndex);
        const elementTop = this.view.elementTop(viewIndex);
        if (element instanceof MarkupCellViewModel) {
            return this._revealInCenterIfOutsideViewport(viewIndex);
        }
        else {
            const rangeOffset = element.layoutInfo.outputContainerOffset + offset;
            this.view.setScrollTop(elementTop - this.view.renderHeight / 2);
            this.view.setScrollTop(elementTop + rangeOffset - this.view.renderHeight / 2);
        }
    }
    _revealRange(viewIndex, range, revealType, newlyCreated, alignToBottom) {
        const element = this.view.element(viewIndex);
        const scrollTop = this.getViewScrollTop();
        const wrapperBottom = this.getViewScrollBottom();
        const positionOffset = element.getPositionScrollTopOffset(range.startLineNumber, range.startColumn);
        const elementTop = this.view.elementTop(viewIndex);
        const positionTop = elementTop + positionOffset;
        // TODO@rebornix 30 ---> line height * 1.5
        if (positionTop < scrollTop) {
            this.view.setScrollTop(positionTop - 30);
        }
        else if (positionTop > wrapperBottom) {
            this.view.setScrollTop(scrollTop + positionTop - wrapperBottom + 30);
        }
        else if (newlyCreated) {
            // newly scrolled into view
            if (alignToBottom) {
                // align to the bottom
                this.view.setScrollTop(scrollTop + positionTop - wrapperBottom + 30);
            }
            else {
                // align to to top
                this.view.setScrollTop(positionTop - 30);
            }
        }
        if (revealType === 1 /* CellRevealType.Range */) {
            element.revealRangeInCenter(range);
        }
    }
    // List items have real dynamic heights, which means after we set `scrollTop` based on the `elementTop(index)`, the element at `index` might still be removed from the view once all relayouting tasks are done.
    // For example, we scroll item 10 into the view upwards, in the first round, items 7, 8, 9, 10 are all in the viewport. Then item 7 and 8 resize themselves to be larger and finally item 10 is removed from the view.
    // To ensure that item 10 is always there, we need to scroll item 10 to the top edge of the viewport.
    async _revealRangeInternalAsync(viewIndex, range, revealType) {
        const scrollTop = this.getViewScrollTop();
        const wrapperBottom = this.getViewScrollBottom();
        const elementTop = this.view.elementTop(viewIndex);
        const element = this.view.element(viewIndex);
        if (element.editorAttached) {
            this._revealRange(viewIndex, range, revealType, false, false);
        }
        else {
            const elementHeight = this.view.elementHeight(viewIndex);
            let upwards = false;
            if (elementTop + elementHeight < scrollTop) {
                // scroll downwards
                this.view.setScrollTop(elementTop);
                upwards = false;
            }
            else if (elementTop > wrapperBottom) {
                // scroll upwards
                this.view.setScrollTop(elementTop - this.view.renderHeight / 2);
                upwards = true;
            }
            const editorAttachedPromise = new Promise((resolve, reject) => {
                element.onDidChangeEditorAttachState(() => {
                    element.editorAttached ? resolve() : reject();
                });
            });
            return editorAttachedPromise.then(() => {
                this._revealRange(viewIndex, range, revealType, true, upwards);
            });
        }
    }
    async _revealLineInViewAsync(viewIndex, line) {
        return this._revealRangeInternalAsync(viewIndex, new Range(line, 1, line, 1), 0 /* CellRevealType.Line */);
    }
    async _revealRangeInView(viewIndex, range) {
        return this._revealRangeInternalAsync(viewIndex, range, 1 /* CellRevealType.Range */);
    }
    async _revealRangeInCenterInternalAsync(viewIndex, range, revealType) {
        const reveal = (viewIndex, range, revealType) => {
            const element = this.view.element(viewIndex);
            const positionOffset = element.getPositionScrollTopOffset(range.startLineNumber, range.startColumn);
            const positionOffsetInView = this.view.elementTop(viewIndex) + positionOffset;
            this.view.setScrollTop(positionOffsetInView - this.view.renderHeight / 2);
            if (revealType === 1 /* CellRevealType.Range */) {
                element.revealRangeInCenter(range);
            }
        };
        const elementTop = this.view.elementTop(viewIndex);
        const viewItemOffset = elementTop;
        this.view.setScrollTop(viewItemOffset - this.view.renderHeight / 2);
        const element = this.view.element(viewIndex);
        if (!element.editorAttached) {
            return getEditorAttachedPromise(element).then(() => reveal(viewIndex, range, revealType));
        }
        else {
            reveal(viewIndex, range, revealType);
        }
    }
    async _revealLineInCenterAsync(viewIndex, line) {
        return this._revealRangeInCenterInternalAsync(viewIndex, new Range(line, 1, line, 1), 0 /* CellRevealType.Line */);
    }
    _revealRangeInCenterAsync(viewIndex, range) {
        return this._revealRangeInCenterInternalAsync(viewIndex, range, 1 /* CellRevealType.Range */);
    }
    async _revealRangeInCenterIfOutsideViewportInternalAsync(viewIndex, range, revealType) {
        const reveal = (viewIndex, range, revealType) => {
            const element = this.view.element(viewIndex);
            const positionOffset = element.getPositionScrollTopOffset(range.startLineNumber, range.startColumn);
            const positionOffsetInView = this.view.elementTop(viewIndex) + positionOffset;
            this.view.setScrollTop(positionOffsetInView - this.view.renderHeight / 2);
            if (revealType === 1 /* CellRevealType.Range */) {
                element.revealRangeInCenter(range);
            }
        };
        const scrollTop = this.getViewScrollTop();
        const wrapperBottom = this.getViewScrollBottom();
        const elementTop = this.view.elementTop(viewIndex);
        const viewItemOffset = elementTop;
        const element = this.view.element(viewIndex);
        const positionOffset = viewItemOffset + element.getPositionScrollTopOffset(range.startLineNumber, range.startColumn);
        if (positionOffset < scrollTop || positionOffset > wrapperBottom) {
            // let it render
            this.view.setScrollTop(positionOffset - this.view.renderHeight / 2);
            // after rendering, it might be pushed down due to markdown cell dynamic height
            const newPositionOffset = this.view.elementTop(viewIndex) + element.getPositionScrollTopOffset(range.startLineNumber, range.startColumn);
            this.view.setScrollTop(newPositionOffset - this.view.renderHeight / 2);
            // reveal editor
            if (!element.editorAttached) {
                return getEditorAttachedPromise(element).then(() => reveal(viewIndex, range, revealType));
            }
            else {
                // for example markdown
            }
        }
        else {
            if (element.editorAttached) {
                element.revealRangeInCenter(range);
            }
            else {
                // for example, markdown cell in preview mode
                return getEditorAttachedPromise(element).then(() => reveal(viewIndex, range, revealType));
            }
        }
    }
    async _revealIfOutsideViewportAsync(viewIndex, revealPosition) {
        this._revealInternal(viewIndex, true, revealPosition);
        const element = this.view.element(viewIndex);
        // wait for the editor to be created only if the cell is in editing mode (meaning it has an editor and will focus the editor)
        if (element.getEditState() === CellEditState.Editing && !element.editorAttached) {
            return getEditorAttachedPromise(element);
        }
        return;
    }
    async _revealLineInCenterIfOutsideViewportAsync(viewIndex, line) {
        return this._revealRangeInCenterIfOutsideViewportInternalAsync(viewIndex, new Range(line, 1, line, 1), 0 /* CellRevealType.Line */);
    }
    async _revealRangeInCenterIfOutsideViewportAsync(viewIndex, range) {
        return this._revealRangeInCenterIfOutsideViewportInternalAsync(viewIndex, range, 1 /* CellRevealType.Range */);
    }
    _revealInternal(viewIndex, ignoreIfInsideViewport, revealPosition) {
        if (viewIndex >= this.view.length) {
            return;
        }
        const scrollTop = this.getViewScrollTop();
        const wrapperBottom = this.getViewScrollBottom();
        const elementTop = this.view.elementTop(viewIndex);
        const elementBottom = this.view.elementHeight(viewIndex) + elementTop;
        if (ignoreIfInsideViewport
            && elementTop >= scrollTop
            && elementBottom < wrapperBottom) {
            if (revealPosition === 1 /* CellRevealPosition.Center */
                && elementBottom > wrapperBottom
                && elementTop > (scrollTop + wrapperBottom) / 2) {
                // the element is partially visible and it's below the center of the viewport
            }
            else {
                return;
            }
        }
        switch (revealPosition) {
            case 0 /* CellRevealPosition.Top */:
                this.view.setScrollTop(elementTop);
                this.view.setScrollTop(this.view.elementTop(viewIndex));
                break;
            case 1 /* CellRevealPosition.Center */:
            case 3 /* CellRevealPosition.NearTop */:
                {
                    // reveal the cell top in the viewport center initially
                    this.view.setScrollTop(elementTop - this.view.renderHeight / 2);
                    // cell rendered already, we now have a more accurate cell height
                    const newElementTop = this.view.elementTop(viewIndex);
                    const newElementHeight = this.view.elementHeight(viewIndex);
                    const renderHeight = this.getViewScrollBottom() - this.getViewScrollTop();
                    if (newElementHeight >= renderHeight) {
                        // cell is larger than viewport, reveal top
                        this.view.setScrollTop(newElementTop);
                    }
                    else if (revealPosition === 1 /* CellRevealPosition.Center */) {
                        this.view.setScrollTop(newElementTop + (newElementHeight / 2) - (renderHeight / 2));
                    }
                    else if (revealPosition === 3 /* CellRevealPosition.NearTop */) {
                        this.view.setScrollTop(newElementTop - (renderHeight / 5));
                    }
                }
                break;
            case 2 /* CellRevealPosition.Bottom */:
                this.view.setScrollTop(this.scrollTop + (elementBottom - wrapperBottom));
                this.view.setScrollTop(this.scrollTop + (this.view.elementTop(viewIndex) + this.view.elementHeight(viewIndex) - this.getViewScrollBottom()));
                break;
            default:
                break;
        }
    }
    _revealInView(viewIndex) {
        const firstIndex = this.view.firstVisibleIndex;
        if (viewIndex <= firstIndex) {
            this._revealInternal(viewIndex, true, 0 /* CellRevealPosition.Top */);
        }
        else {
            this._revealInternal(viewIndex, true, 2 /* CellRevealPosition.Bottom */);
        }
    }
    _revealInCenter(viewIndex) {
        this._revealInternal(viewIndex, false, 1 /* CellRevealPosition.Center */);
    }
    _revealInCenterIfOutsideViewport(viewIndex) {
        this._revealInternal(viewIndex, true, 1 /* CellRevealPosition.Center */);
    }
    setCellSelection(cell, range) {
        const element = cell;
        if (element.editorAttached) {
            element.setSelection(range);
        }
        else {
            getEditorAttachedPromise(element).then(() => { element.setSelection(range); });
        }
    }
    style(styles) {
        const selectorSuffix = this.view.domId;
        if (!this.styleElement) {
            this.styleElement = DOM.createStyleSheet(this.view.domNode);
        }
        const suffix = selectorSuffix && `.${selectorSuffix}`;
        const content = [];
        if (styles.listBackground) {
            if (styles.listBackground.isOpaque()) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows { background: ${styles.listBackground}; }`);
            }
            else if (!isMacintosh) { // subpixel AA doesn't exist in macOS
                console.warn(`List with id '${selectorSuffix}' was styled with a non-opaque background color. This will break sub-pixel antialiasing.`);
            }
        }
        if (styles.listFocusBackground) {
            content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { background-color: ${styles.listFocusBackground}; }`);
            content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused:hover { background-color: ${styles.listFocusBackground}; }`); // overwrite :hover style in this case!
        }
        if (styles.listFocusForeground) {
            content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { color: ${styles.listFocusForeground}; }`);
        }
        if (styles.listActiveSelectionBackground) {
            content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { background-color: ${styles.listActiveSelectionBackground}; }`);
            content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected:hover { background-color: ${styles.listActiveSelectionBackground}; }`); // overwrite :hover style in this case!
        }
        if (styles.listActiveSelectionForeground) {
            content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { color: ${styles.listActiveSelectionForeground}; }`);
        }
        if (styles.listFocusAndSelectionBackground) {
            content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected.focused { background-color: ${styles.listFocusAndSelectionBackground}; }
			`);
        }
        if (styles.listFocusAndSelectionForeground) {
            content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected.focused { color: ${styles.listFocusAndSelectionForeground}; }
			`);
        }
        if (styles.listInactiveFocusBackground) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { background-color:  ${styles.listInactiveFocusBackground}; }`);
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused:hover { background-color:  ${styles.listInactiveFocusBackground}; }`); // overwrite :hover style in this case!
        }
        if (styles.listInactiveSelectionBackground) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { background-color:  ${styles.listInactiveSelectionBackground}; }`);
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected:hover { background-color:  ${styles.listInactiveSelectionBackground}; }`); // overwrite :hover style in this case!
        }
        if (styles.listInactiveSelectionForeground) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { color: ${styles.listInactiveSelectionForeground}; }`);
        }
        if (styles.listHoverBackground) {
            content.push(`.monaco-list${suffix}:not(.drop-target) > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover:not(.selected):not(.focused) { background-color:  ${styles.listHoverBackground}; }`);
        }
        if (styles.listHoverForeground) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover:not(.selected):not(.focused) { color:  ${styles.listHoverForeground}; }`);
        }
        if (styles.listSelectionOutline) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { outline: 1px dotted ${styles.listSelectionOutline}; outline-offset: -1px; }`);
        }
        if (styles.listFocusOutline) {
            content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }
			`);
        }
        if (styles.listInactiveFocusOutline) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { outline: 1px dotted ${styles.listInactiveFocusOutline}; outline-offset: -1px; }`);
        }
        if (styles.listHoverOutline) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover { outline: 1px dashed ${styles.listHoverOutline}; outline-offset: -1px; }`);
        }
        if (styles.listDropBackground) {
            content.push(`
				.monaco-list${suffix}.drop-target,
				.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows.drop-target,
				.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-row.drop-target { background-color: ${styles.listDropBackground} !important; color: inherit !important; }
			`);
        }
        const newStyles = content.join('\n');
        if (newStyles !== this.styleElement.textContent) {
            this.styleElement.textContent = newStyles;
        }
    }
    getRenderHeight() {
        return this.view.renderHeight;
    }
    getScrollHeight() {
        return this.view.scrollHeight;
    }
    layout(height, width) {
        this._isInLayout = true;
        super.layout(height, width);
        if (this.renderHeight === 0) {
            this.view.domNode.style.visibility = 'hidden';
        }
        else {
            this.view.domNode.style.visibility = 'initial';
        }
        this._isInLayout = false;
    }
    dispose() {
        this._isDisposed = true;
        this._viewModelStore.dispose();
        this._localDisposableStore.dispose();
        super.dispose();
        // un-ref
        this._previousFocusedElements = [];
        this._viewModel = null;
        this._hiddenRangeIds = [];
        this.hiddenRangesPrefixSum = null;
        this._visibleRanges = [];
    }
};
NotebookCellList = __decorate([
    __param(7, IListService),
    __param(8, IThemeService),
    __param(9, IConfigurationService),
    __param(10, IInstantiationService)
], NotebookCellList);
export { NotebookCellList };
export class ListViewInfoAccessor extends Disposable {
    list;
    constructor(list) {
        super();
        this.list = list;
    }
    setScrollTop(scrollTop) {
        this.list.scrollTop = scrollTop;
    }
    isScrolledToBottom() {
        return this.list.isScrolledToBottom();
    }
    scrollToBottom() {
        this.list.scrollToBottom();
    }
    revealCellRangeInView(range) {
        return this.list.revealElementsInView(range);
    }
    revealInView(cell) {
        this.list.revealElementInView(cell);
    }
    revealInViewAtTop(cell) {
        this.list.revealElementInViewAtTop(cell);
    }
    revealInCenterIfOutsideViewport(cell) {
        this.list.revealElementInCenterIfOutsideViewport(cell);
    }
    async revealInCenterIfOutsideViewportAsync(cell) {
        return this.list.revealElementInCenterIfOutsideViewportAsync(cell);
    }
    revealInCenter(cell) {
        this.list.revealElementInCenter(cell);
    }
    async revealNearTopIfOutsideViewportAync(cell) {
        return this.list.revealNearTopIfOutsideViewportAync(cell);
    }
    async revealLineInViewAsync(cell, line) {
        return this.list.revealElementLineInViewAsync(cell, line);
    }
    async revealLineInCenterAsync(cell, line) {
        return this.list.revealElementLineInCenterAsync(cell, line);
    }
    async revealLineInCenterIfOutsideViewportAsync(cell, line) {
        return this.list.revealElementLineInCenterIfOutsideViewportAsync(cell, line);
    }
    async revealRangeInViewAsync(cell, range) {
        return this.list.revealElementRangeInViewAsync(cell, range);
    }
    async revealRangeInCenterAsync(cell, range) {
        return this.list.revealElementRangeInCenterAsync(cell, range);
    }
    async revealRangeInCenterIfOutsideViewportAsync(cell, range) {
        return this.list.revealElementRangeInCenterIfOutsideViewportAsync(cell, range);
    }
    async revealCellOffsetInCenterAsync(cell, offset) {
        return this.list.revealElementOffsetInCenterAsync(cell, offset);
    }
    getViewIndex(cell) {
        return this.list.getViewIndex(cell) ?? -1;
    }
    getViewHeight(cell) {
        if (!this.list.viewModel) {
            return -1;
        }
        return this.list.elementHeight(cell);
    }
    getCellRangeFromViewRange(startIndex, endIndex) {
        if (!this.list.viewModel) {
            return undefined;
        }
        const modelIndex = this.list.getModelIndex2(startIndex);
        if (modelIndex === undefined) {
            throw new Error(`startIndex ${startIndex} out of boundary`);
        }
        if (endIndex >= this.list.length) {
            // it's the end
            const endModelIndex = this.list.viewModel.length;
            return { start: modelIndex, end: endModelIndex };
        }
        else {
            const endModelIndex = this.list.getModelIndex2(endIndex);
            if (endModelIndex === undefined) {
                throw new Error(`endIndex ${endIndex} out of boundary`);
            }
            return { start: modelIndex, end: endModelIndex };
        }
    }
    getCellsFromViewRange(startIndex, endIndex) {
        if (!this.list.viewModel) {
            return [];
        }
        const range = this.getCellRangeFromViewRange(startIndex, endIndex);
        if (!range) {
            return [];
        }
        return this.list.viewModel.getCellsInRange(range);
    }
    getCellsInRange(range) {
        return this.list.viewModel?.getCellsInRange(range) ?? [];
    }
    setCellEditorSelection(cell, range) {
        this.list.setCellSelection(cell, range);
    }
    setHiddenAreas(_ranges) {
        return this.list.setHiddenAreas(_ranges, true);
    }
    getVisibleRangesPlusViewportAboveAndBelow() {
        return this.list?.getVisibleRangesPlusViewportAboveAndBelow() ?? [];
    }
    triggerScroll(event) {
        this.list.triggerScrollFromMouseWheelEvent(event);
    }
}
function getEditorAttachedPromise(element) {
    return new Promise((resolve, reject) => {
        Event.once(element.onDidChangeEditorAttachState)(() => element.editorAttached ? resolve() : reject());
    });
}
function isContextMenuFocused() {
    return !!DOM.findParentWithClass(document.activeElement, 'context-view');
}
