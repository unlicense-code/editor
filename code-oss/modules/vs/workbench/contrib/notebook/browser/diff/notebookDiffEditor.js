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
import * as nls from 'vs/nls';
import * as DOM from 'vs/base/browser/dom';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService, registerThemingParticipant } from 'vs/platform/theme/common/themeService';
import { getDefaultNotebookCreationOptions } from 'vs/workbench/contrib/notebook/browser/notebookEditorWidget';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { SideBySideDiffElementViewModel, SingleSideDiffElementViewModel } from 'vs/workbench/contrib/notebook/browser/diff/diffElementViewModel';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { CellDiffSideBySideRenderer, CellDiffSingleSideRenderer, NotebookCellTextDiffListDelegate, NotebookTextDiffList } from 'vs/workbench/contrib/notebook/browser/diff/notebookDiffList';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { diffDiagonalFill, editorBackground, focusBorder, foreground } from 'vs/platform/theme/common/colorRegistry';
import { INotebookEditorWorkerService } from 'vs/workbench/contrib/notebook/common/services/notebookWorkerService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { BareFontInfo } from 'vs/editor/common/config/fontInfo';
import { PixelRatio } from 'vs/base/browser/browser';
import { DiffSide, DIFF_CELL_MARGIN } from 'vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser';
import { Emitter, Event } from 'vs/base/common/event';
import { DisposableStore, toDisposable } from 'vs/base/common/lifecycle';
import { EditorPane } from 'vs/workbench/browser/parts/editor/editorPane';
import { CellUri, NOTEBOOK_DIFF_EDITOR_ID } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { SequencerByKey } from 'vs/base/common/async';
import { generateUuid } from 'vs/base/common/uuid';
import { DiffNestedCellViewModel } from 'vs/workbench/contrib/notebook/browser/diff/diffNestedCellViewModel';
import { BackLayerWebView } from 'vs/workbench/contrib/notebook/browser/view/renderers/backLayerWebView';
import { NotebookDiffEditorEventDispatcher, NotebookDiffLayoutChangedEvent } from 'vs/workbench/contrib/notebook/browser/diff/eventDispatcher';
import { FontMeasurements } from 'vs/editor/browser/config/fontMeasurements';
import { NotebookOptions } from 'vs/workbench/contrib/notebook/common/notebookOptions';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
import { cellIndexesToRanges, cellRangesToIndexes } from 'vs/workbench/contrib/notebook/common/notebookRange';
import { NotebookDiffOverviewRuler } from 'vs/workbench/contrib/notebook/browser/diff/notebookDiffOverviewRuler';
import { registerZIndex, ZIndex } from 'vs/platform/layout/browser/zIndexRegistry';
const $ = DOM.$;
class NotebookDiffEditorSelection {
    selections;
    constructor(selections) {
        this.selections = selections;
    }
    compare(other) {
        if (!(other instanceof NotebookDiffEditorSelection)) {
            return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
        }
        if (this.selections.length !== other.selections.length) {
            return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
        }
        for (let i = 0; i < this.selections.length; i++) {
            if (this.selections[i] !== other.selections[i]) {
                return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
            }
        }
        return 1 /* EditorPaneSelectionCompareResult.IDENTICAL */;
    }
    restore(options) {
        const notebookOptions = {
            cellSelections: cellIndexesToRanges(this.selections)
        };
        Object.assign(notebookOptions, options);
        return notebookOptions;
    }
}
let NotebookTextDiffEditor = class NotebookTextDiffEditor extends EditorPane {
    instantiationService;
    contextKeyService;
    notebookEditorWorkerService;
    configurationService;
    static ENTIRE_DIFF_OVERVIEW_WIDTH = 30;
    creationOptions = getDefaultNotebookCreationOptions();
    static ID = NOTEBOOK_DIFF_EDITOR_ID;
    _rootElement;
    _listViewContainer;
    _overflowContainer;
    _overviewRulerContainer;
    _overviewRuler;
    _dimension = null;
    _diffElementViewModels = [];
    _list;
    _modifiedWebview = null;
    _originalWebview = null;
    _webviewTransparentCover = null;
    _fontInfo;
    _onMouseUp = this._register(new Emitter());
    onMouseUp = this._onMouseUp.event;
    _onDidScroll = this._register(new Emitter());
    onDidScroll = this._onDidScroll.event;
    _eventDispatcher;
    _scopeContextKeyService;
    _model = null;
    _modifiedResourceDisposableStore = this._register(new DisposableStore());
    get textModel() {
        return this._model?.modified.notebook;
    }
    _revealFirst;
    _insetModifyQueueByOutputId = new SequencerByKey();
    _onDidDynamicOutputRendered = this._register(new Emitter());
    onDidDynamicOutputRendered = this._onDidDynamicOutputRendered.event;
    _notebookOptions;
    get notebookOptions() {
        return this._notebookOptions;
    }
    _localStore = this._register(new DisposableStore());
    _layoutCancellationTokenSource;
    _onDidChangeSelection = this._register(new Emitter());
    onDidChangeSelection = this._onDidChangeSelection.event;
    _isDisposed = false;
    get isDisposed() {
        return this._isDisposed;
    }
    constructor(instantiationService, themeService, contextKeyService, notebookEditorWorkerService, configurationService, telemetryService, storageService, notebookExecutionStateService) {
        super(NotebookTextDiffEditor.ID, telemetryService, themeService, storageService);
        this.instantiationService = instantiationService;
        this.contextKeyService = contextKeyService;
        this.notebookEditorWorkerService = notebookEditorWorkerService;
        this.configurationService = configurationService;
        this._notebookOptions = new NotebookOptions(this.configurationService, notebookExecutionStateService);
        this._register(this._notebookOptions);
        const editorOptions = this.configurationService.getValue('editor');
        this._fontInfo = FontMeasurements.readFontInfo(BareFontInfo.createFromRawSettings(editorOptions, PixelRatio.value));
        this._revealFirst = true;
    }
    isOverviewRulerEnabled() {
        return this.configurationService.getValue('notebook.experimental.diffOverviewRuler.enabled') ?? false;
    }
    getSelection() {
        const selections = this._list.getFocus();
        return new NotebookDiffEditorSelection(selections);
    }
    toggleNotebookCellSelection(cell) {
        // throw new Error('Method not implemented.');
    }
    async focusNotebookCell(cell, focus) {
        // throw new Error('Method not implemented.');
    }
    async focusNextNotebookCell(cell, focus) {
        // throw new Error('Method not implemented.');
    }
    getScrollTop() {
        return this._list?.scrollTop ?? 0;
    }
    getScrollHeight() {
        return this._list?.scrollHeight ?? 0;
    }
    delegateVerticalScrollbarPointerDown(browserEvent) {
        this._list?.delegateVerticalScrollbarPointerDown(browserEvent);
    }
    updateOutputHeight(cellInfo, output, outputHeight, isInit) {
        const diffElement = cellInfo.diffElement;
        const cell = this.getCellByInfo(cellInfo);
        const outputIndex = cell.outputsViewModels.indexOf(output);
        if (diffElement instanceof SideBySideDiffElementViewModel) {
            const info = CellUri.parse(cellInfo.cellUri);
            if (!info) {
                return;
            }
            diffElement.updateOutputHeight(info.notebook.toString() === this._model?.original.resource.toString() ? DiffSide.Original : DiffSide.Modified, outputIndex, outputHeight);
        }
        else {
            diffElement.updateOutputHeight(diffElement.type === 'insert' ? DiffSide.Modified : DiffSide.Original, outputIndex, outputHeight);
        }
        if (isInit) {
            this._onDidDynamicOutputRendered.fire({ cell, output });
        }
    }
    setMarkupCellEditState(cellId, editState) {
        // throw new Error('Method not implemented.');
    }
    didStartDragMarkupCell(cellId, event) {
        // throw new Error('Method not implemented.');
    }
    didDragMarkupCell(cellId, event) {
        // throw new Error('Method not implemented.');
    }
    didEndDragMarkupCell(cellId) {
        // throw new Error('Method not implemented.');
    }
    didDropMarkupCell(cellId) {
        // throw new Error('Method not implemented.');
    }
    didResizeOutput(cellId) {
        // throw new Error('Method not implemented.');
    }
    createEditor(parent) {
        this._rootElement = DOM.append(parent, DOM.$('.notebook-text-diff-editor'));
        this._overflowContainer = document.createElement('div');
        this._overflowContainer.classList.add('notebook-overflow-widget-container', 'monaco-editor');
        DOM.append(parent, this._overflowContainer);
        const renderers = [
            this.instantiationService.createInstance(CellDiffSingleSideRenderer, this),
            this.instantiationService.createInstance(CellDiffSideBySideRenderer, this),
        ];
        this._listViewContainer = DOM.append(this._rootElement, DOM.$('.notebook-diff-list-view'));
        this._list = this.instantiationService.createInstance(NotebookTextDiffList, 'NotebookTextDiff', this._listViewContainer, this.instantiationService.createInstance(NotebookCellTextDiffListDelegate), renderers, this.contextKeyService, {
            setRowLineHeight: false,
            setRowHeight: false,
            supportDynamicHeights: true,
            horizontalScrolling: false,
            keyboardSupport: false,
            mouseSupport: true,
            multipleSelectionSupport: false,
            typeNavigationEnabled: true,
            additionalScrollHeight: 0,
            // transformOptimization: (isMacintosh && isNative) || getTitleBarStyle(this.configurationService, this.environmentService) === 'native',
            styleController: (_suffix) => { return this._list; },
            overrideStyles: {
                listBackground: editorBackground,
                listActiveSelectionBackground: editorBackground,
                listActiveSelectionForeground: foreground,
                listFocusAndSelectionBackground: editorBackground,
                listFocusAndSelectionForeground: foreground,
                listFocusBackground: editorBackground,
                listFocusForeground: foreground,
                listHoverForeground: foreground,
                listHoverBackground: editorBackground,
                listHoverOutline: focusBorder,
                listFocusOutline: focusBorder,
                listInactiveSelectionBackground: editorBackground,
                listInactiveSelectionForeground: foreground,
                listInactiveFocusBackground: editorBackground,
                listInactiveFocusOutline: editorBackground,
            },
            accessibilityProvider: {
                getAriaLabel() { return null; },
                getWidgetAriaLabel() {
                    return nls.localize('notebookTreeAriaLabel', "Notebook Text Diff");
                }
            },
            // focusNextPreviousDelegate: {
            // 	onFocusNext: (applyFocusNext: () => void) => this._updateForCursorNavigationMode(applyFocusNext),
            // 	onFocusPrevious: (applyFocusPrevious: () => void) => this._updateForCursorNavigationMode(applyFocusPrevious),
            // }
        });
        this._register(this._list);
        this._register(this._list.onMouseUp(e => {
            if (e.element) {
                this._onMouseUp.fire({ event: e.browserEvent, target: e.element });
            }
        }));
        this._register(this._list.onDidScroll(() => {
            this._onDidScroll.fire();
        }));
        this._register(this._list.onDidChangeFocus(() => this._onDidChangeSelection.fire({ reason: 2 /* EditorPaneSelectionChangeReason.USER */ })));
        this._overviewRulerContainer = document.createElement('div');
        this._overviewRulerContainer.classList.add('notebook-overview-ruler-container');
        this._rootElement.appendChild(this._overviewRulerContainer);
        this._registerOverviewRuler();
        // transparent cover
        this._webviewTransparentCover = DOM.append(this._list.rowsContainer, $('.webview-cover'));
        this._webviewTransparentCover.style.display = 'none';
        this._register(DOM.addStandardDisposableGenericMouseDownListener(this._overflowContainer, (e) => {
            if (e.target.classList.contains('slider') && this._webviewTransparentCover) {
                this._webviewTransparentCover.style.display = 'block';
            }
        }));
        this._register(DOM.addStandardDisposableGenericMouseUpListener(this._overflowContainer, () => {
            if (this._webviewTransparentCover) {
                // no matter when
                this._webviewTransparentCover.style.display = 'none';
            }
        }));
        this._register(this._list.onDidScroll(e => {
            this._webviewTransparentCover.style.top = `${e.scrollTop}px`;
        }));
    }
    _registerOverviewRuler() {
        this._overviewRuler = this._register(this.instantiationService.createInstance(NotebookDiffOverviewRuler, this, NotebookTextDiffEditor.ENTIRE_DIFF_OVERVIEW_WIDTH, this._overviewRulerContainer));
    }
    _updateOutputsOffsetsInWebview(scrollTop, scrollHeight, activeWebview, getActiveNestedCell, diffSide) {
        activeWebview.element.style.height = `${scrollHeight}px`;
        if (activeWebview.insetMapping) {
            const updateItems = [];
            const removedItems = [];
            activeWebview.insetMapping.forEach((value, key) => {
                const cell = getActiveNestedCell(value.cellInfo.diffElement);
                if (!cell) {
                    return;
                }
                const viewIndex = this._list.indexOf(value.cellInfo.diffElement);
                if (viewIndex === undefined) {
                    return;
                }
                if (cell.outputsViewModels.indexOf(key) < 0) {
                    // output is already gone
                    removedItems.push(key);
                }
                else {
                    const cellTop = this._list.getAbsoluteTopOfElement(value.cellInfo.diffElement);
                    const outputIndex = cell.outputsViewModels.indexOf(key);
                    const outputOffset = value.cellInfo.diffElement.getOutputOffsetInCell(diffSide, outputIndex);
                    updateItems.push({
                        cell,
                        output: key,
                        cellTop: cellTop,
                        outputOffset: outputOffset,
                        forceDisplay: false
                    });
                }
            });
            activeWebview.removeInsets(removedItems);
            if (updateItems.length) {
                activeWebview.updateScrollTops(updateItems, []);
            }
        }
    }
    async setInput(input, options, context, token) {
        await super.setInput(input, options, context, token);
        const model = await input.resolve();
        if (this._model !== model) {
            this._detachModel();
            this._model = model;
            this._attachModel();
        }
        this._model = model;
        if (this._model === null) {
            return;
        }
        this._revealFirst = true;
        this._modifiedResourceDisposableStore.clear();
        this._layoutCancellationTokenSource = new CancellationTokenSource();
        this._modifiedResourceDisposableStore.add(Event.any(this._model.original.notebook.onDidChangeContent, this._model.modified.notebook.onDidChangeContent)(e => {
            if (this._model !== null) {
                this._layoutCancellationTokenSource?.dispose();
                this._layoutCancellationTokenSource = new CancellationTokenSource();
                this.updateLayout(this._layoutCancellationTokenSource.token);
            }
        }));
        await this._createOriginalWebview(generateUuid(), this._model.original.viewType, this._model.original.resource);
        if (this._originalWebview) {
            this._modifiedResourceDisposableStore.add(this._originalWebview);
        }
        await this._createModifiedWebview(generateUuid(), this._model.modified.viewType, this._model.modified.resource);
        if (this._modifiedWebview) {
            this._modifiedResourceDisposableStore.add(this._modifiedWebview);
        }
        await this.updateLayout(this._layoutCancellationTokenSource.token, options?.cellSelections ? cellRangesToIndexes(options.cellSelections) : undefined);
    }
    _detachModel() {
        this._localStore.clear();
        this._originalWebview?.dispose();
        this._originalWebview?.element.remove();
        this._originalWebview = null;
        this._modifiedWebview?.dispose();
        this._modifiedWebview?.element.remove();
        this._modifiedWebview = null;
        this._modifiedResourceDisposableStore.clear();
        this._list.clear();
    }
    _attachModel() {
        this._eventDispatcher = new NotebookDiffEditorEventDispatcher();
        const updateInsets = () => {
            DOM.scheduleAtNextAnimationFrame(() => {
                if (this._isDisposed) {
                    return;
                }
                if (this._modifiedWebview) {
                    this._updateOutputsOffsetsInWebview(this._list.scrollTop, this._list.scrollHeight, this._modifiedWebview, (diffElement) => {
                        return diffElement.modified;
                    }, DiffSide.Modified);
                }
                if (this._originalWebview) {
                    this._updateOutputsOffsetsInWebview(this._list.scrollTop, this._list.scrollHeight, this._originalWebview, (diffElement) => {
                        return diffElement.original;
                    }, DiffSide.Original);
                }
            });
        };
        this._localStore.add(this._list.onDidChangeContentHeight(() => {
            updateInsets();
        }));
        this._localStore.add(this._eventDispatcher.onDidChangeCellLayout(() => {
            updateInsets();
        }));
    }
    async _createModifiedWebview(id, viewType, resource) {
        this._modifiedWebview?.dispose();
        this._modifiedWebview = this.instantiationService.createInstance(BackLayerWebView, this, id, viewType, resource, {
            ...this._notebookOptions.computeDiffWebviewOptions(),
            fontFamily: this._generateFontFamily()
        }, undefined);
        // attach the webview container to the DOM tree first
        this._list.rowsContainer.insertAdjacentElement('afterbegin', this._modifiedWebview.element);
        await this._modifiedWebview.createWebview();
        this._modifiedWebview.element.style.width = `calc(50% - 16px)`;
        this._modifiedWebview.element.style.left = `calc(50%)`;
    }
    _generateFontFamily() {
        return this._fontInfo?.fontFamily ?? `"SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace`;
    }
    async _createOriginalWebview(id, viewType, resource) {
        this._originalWebview?.dispose();
        this._originalWebview = this.instantiationService.createInstance(BackLayerWebView, this, id, viewType, resource, {
            ...this._notebookOptions.computeDiffWebviewOptions(),
            fontFamily: this._generateFontFamily()
        }, undefined);
        // attach the webview container to the DOM tree first
        this._list.rowsContainer.insertAdjacentElement('afterbegin', this._originalWebview.element);
        await this._originalWebview.createWebview();
        this._originalWebview.element.style.width = `calc(50% - 16px)`;
        this._originalWebview.element.style.left = `16px`;
    }
    setOptions(options) {
        const selections = options?.cellSelections ? cellRangesToIndexes(options.cellSelections) : undefined;
        if (selections) {
            this._list.setFocus(selections);
        }
    }
    async updateLayout(token, selections) {
        if (!this._model) {
            return;
        }
        const diffResult = await this.notebookEditorWorkerService.computeDiff(this._model.original.resource, this._model.modified.resource);
        if (token.isCancellationRequested) {
            // after await the editor might be disposed.
            return;
        }
        NotebookTextDiffEditor.prettyChanges(this._model, diffResult.cellsDiff);
        const { viewModels, firstChangeIndex } = NotebookTextDiffEditor.computeDiff(this.instantiationService, this.configurationService, this._model, this._eventDispatcher, diffResult);
        const isSame = this._isViewModelTheSame(viewModels);
        if (!isSame) {
            this._originalWebview?.removeInsets([...this._originalWebview?.insetMapping.keys()]);
            this._modifiedWebview?.removeInsets([...this._modifiedWebview?.insetMapping.keys()]);
            this._setViewModel(viewModels);
        }
        // this._diffElementViewModels = viewModels;
        // this._list.splice(0, this._list.length, this._diffElementViewModels);
        if (this._revealFirst && firstChangeIndex !== -1 && firstChangeIndex < this._list.length) {
            this._revealFirst = false;
            this._list.setFocus([firstChangeIndex]);
            this._list.reveal(firstChangeIndex, 0.3);
        }
        if (selections) {
            this._list.setFocus(selections);
        }
    }
    _isViewModelTheSame(viewModels) {
        let isSame = true;
        if (this._diffElementViewModels.length === viewModels.length) {
            for (let i = 0; i < viewModels.length; i++) {
                const a = this._diffElementViewModels[i];
                const b = viewModels[i];
                if (a.original?.textModel.getHashValue() !== b.original?.textModel.getHashValue()
                    || a.modified?.textModel.getHashValue() !== b.modified?.textModel.getHashValue()) {
                    isSame = false;
                    break;
                }
            }
        }
        else {
            isSame = false;
        }
        return isSame;
    }
    _setViewModel(viewModels) {
        this._diffElementViewModels = viewModels;
        this._list.splice(0, this._list.length, this._diffElementViewModels);
        if (this.isOverviewRulerEnabled()) {
            this._overviewRuler.updateViewModels(this._diffElementViewModels, this._eventDispatcher);
        }
    }
    /**
     * making sure that swapping cells are always translated to `insert+delete`.
     */
    static prettyChanges(model, diffResult) {
        const changes = diffResult.changes;
        for (let i = 0; i < diffResult.changes.length - 1; i++) {
            // then we know there is another change after current one
            const curr = changes[i];
            const next = changes[i + 1];
            const x = curr.originalStart;
            const y = curr.modifiedStart;
            if (curr.originalLength === 1
                && curr.modifiedLength === 0
                && next.originalStart === x + 2
                && next.originalLength === 0
                && next.modifiedStart === y + 1
                && next.modifiedLength === 1
                && model.original.notebook.cells[x].getHashValue() === model.modified.notebook.cells[y + 1].getHashValue()
                && model.original.notebook.cells[x + 1].getHashValue() === model.modified.notebook.cells[y].getHashValue()) {
                // this is a swap
                curr.originalStart = x;
                curr.originalLength = 0;
                curr.modifiedStart = y;
                curr.modifiedLength = 1;
                next.originalStart = x + 1;
                next.originalLength = 1;
                next.modifiedStart = y + 2;
                next.modifiedLength = 0;
                i++;
            }
        }
    }
    static computeDiff(instantiationService, configurationService, model, eventDispatcher, diffResult) {
        const cellChanges = diffResult.cellsDiff.changes;
        const diffElementViewModels = [];
        const originalModel = model.original.notebook;
        const modifiedModel = model.modified.notebook;
        let originalCellIndex = 0;
        let modifiedCellIndex = 0;
        let firstChangeIndex = -1;
        const initData = {
            metadataStatusHeight: configurationService.getValue('notebook.diff.ignoreMetadata') ? 0 : 25,
            outputStatusHeight: configurationService.getValue('notebook.diff.ignoreOutputs') || !!(modifiedModel.transientOptions.transientOutputs) ? 0 : 25
        };
        for (let i = 0; i < cellChanges.length; i++) {
            const change = cellChanges[i];
            // common cells
            for (let j = 0; j < change.originalStart - originalCellIndex; j++) {
                const originalCell = originalModel.cells[originalCellIndex + j];
                const modifiedCell = modifiedModel.cells[modifiedCellIndex + j];
                if (originalCell.getHashValue() === modifiedCell.getHashValue()) {
                    diffElementViewModels.push(new SideBySideDiffElementViewModel(model.modified.notebook, model.original.notebook, instantiationService.createInstance(DiffNestedCellViewModel, originalCell), instantiationService.createInstance(DiffNestedCellViewModel, modifiedCell), 'unchanged', eventDispatcher, initData));
                }
                else {
                    if (firstChangeIndex === -1) {
                        firstChangeIndex = diffElementViewModels.length;
                    }
                    diffElementViewModels.push(new SideBySideDiffElementViewModel(model.modified.notebook, model.original.notebook, instantiationService.createInstance(DiffNestedCellViewModel, originalCell), instantiationService.createInstance(DiffNestedCellViewModel, modifiedCell), 'modified', eventDispatcher, initData));
                }
            }
            const modifiedLCS = NotebookTextDiffEditor.computeModifiedLCS(instantiationService, change, originalModel, modifiedModel, eventDispatcher, initData);
            if (modifiedLCS.length && firstChangeIndex === -1) {
                firstChangeIndex = diffElementViewModels.length;
            }
            diffElementViewModels.push(...modifiedLCS);
            originalCellIndex = change.originalStart + change.originalLength;
            modifiedCellIndex = change.modifiedStart + change.modifiedLength;
        }
        for (let i = originalCellIndex; i < originalModel.cells.length; i++) {
            diffElementViewModels.push(new SideBySideDiffElementViewModel(model.modified.notebook, model.original.notebook, instantiationService.createInstance(DiffNestedCellViewModel, originalModel.cells[i]), instantiationService.createInstance(DiffNestedCellViewModel, modifiedModel.cells[i - originalCellIndex + modifiedCellIndex]), 'unchanged', eventDispatcher, initData));
        }
        return {
            viewModels: diffElementViewModels,
            firstChangeIndex
        };
    }
    static computeModifiedLCS(instantiationService, change, originalModel, modifiedModel, eventDispatcher, initData) {
        const result = [];
        // modified cells
        const modifiedLen = Math.min(change.originalLength, change.modifiedLength);
        for (let j = 0; j < modifiedLen; j++) {
            const isTheSame = originalModel.cells[change.originalStart + j].equal(modifiedModel.cells[change.modifiedStart + j]);
            result.push(new SideBySideDiffElementViewModel(modifiedModel, originalModel, instantiationService.createInstance(DiffNestedCellViewModel, originalModel.cells[change.originalStart + j]), instantiationService.createInstance(DiffNestedCellViewModel, modifiedModel.cells[change.modifiedStart + j]), isTheSame ? 'unchanged' : 'modified', eventDispatcher, initData));
        }
        for (let j = modifiedLen; j < change.originalLength; j++) {
            // deletion
            result.push(new SingleSideDiffElementViewModel(originalModel, modifiedModel, instantiationService.createInstance(DiffNestedCellViewModel, originalModel.cells[change.originalStart + j]), undefined, 'delete', eventDispatcher, initData));
        }
        for (let j = modifiedLen; j < change.modifiedLength; j++) {
            // insertion
            result.push(new SingleSideDiffElementViewModel(modifiedModel, originalModel, undefined, instantiationService.createInstance(DiffNestedCellViewModel, modifiedModel.cells[change.modifiedStart + j]), 'insert', eventDispatcher, initData));
        }
        return result;
    }
    scheduleOutputHeightAck(cellInfo, outputId, height) {
        const diffElement = cellInfo.diffElement;
        // const activeWebview = diffSide === DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
        let diffSide = DiffSide.Original;
        if (diffElement instanceof SideBySideDiffElementViewModel) {
            const info = CellUri.parse(cellInfo.cellUri);
            if (!info) {
                return;
            }
            diffSide = info.notebook.toString() === this._model?.original.resource.toString() ? DiffSide.Original : DiffSide.Modified;
        }
        else {
            diffSide = diffElement.type === 'insert' ? DiffSide.Modified : DiffSide.Original;
        }
        const webview = diffSide === DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
        DOM.scheduleAtNextAnimationFrame(() => {
            webview?.ackHeight([{ cellId: cellInfo.cellId, outputId, height }]);
        }, 10);
    }
    pendingLayouts = new WeakMap();
    layoutNotebookCell(cell, height) {
        const relayout = (cell, height) => {
            this._list.updateElementHeight2(cell, height);
        };
        if (this.pendingLayouts.has(cell)) {
            this.pendingLayouts.get(cell).dispose();
        }
        let r;
        const layoutDisposable = DOM.scheduleAtNextAnimationFrame(() => {
            this.pendingLayouts.delete(cell);
            relayout(cell, height);
            r();
        });
        this.pendingLayouts.set(cell, toDisposable(() => {
            layoutDisposable.dispose();
            r();
        }));
        return new Promise(resolve => { r = resolve; });
    }
    setScrollTop(scrollTop) {
        this._list.scrollTop = scrollTop;
    }
    triggerScroll(event) {
        this._list.triggerScrollFromMouseWheelEvent(event);
    }
    createOutput(cellDiffViewModel, cellViewModel, output, getOffset, diffSide) {
        this._insetModifyQueueByOutputId.queue(output.source.model.outputId + (diffSide === DiffSide.Modified ? '-right' : 'left'), async () => {
            const activeWebview = diffSide === DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
            if (!activeWebview) {
                return;
            }
            if (!activeWebview.insetMapping.has(output.source)) {
                const cellTop = this._list.getAbsoluteTopOfElement(cellDiffViewModel);
                await activeWebview.createOutput({ diffElement: cellDiffViewModel, cellHandle: cellViewModel.handle, cellId: cellViewModel.id, cellUri: cellViewModel.uri }, output, cellTop, getOffset());
            }
            else {
                const cellTop = this._list.getAbsoluteTopOfElement(cellDiffViewModel);
                const outputIndex = cellViewModel.outputsViewModels.indexOf(output.source);
                const outputOffset = cellDiffViewModel.getOutputOffsetInCell(diffSide, outputIndex);
                activeWebview.updateScrollTops([{
                        cell: cellViewModel,
                        output: output.source,
                        cellTop,
                        outputOffset,
                        forceDisplay: true
                    }], []);
            }
        });
    }
    updateMarkupCellHeight() {
        // TODO
    }
    getCellByInfo(cellInfo) {
        return cellInfo.diffElement.getCellByUri(cellInfo.cellUri);
    }
    getCellById(cellId) {
        throw new Error('Not implemented');
    }
    removeInset(cellDiffViewModel, cellViewModel, displayOutput, diffSide) {
        this._insetModifyQueueByOutputId.queue(displayOutput.model.outputId + (diffSide === DiffSide.Modified ? '-right' : 'left'), async () => {
            const activeWebview = diffSide === DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
            if (!activeWebview) {
                return;
            }
            if (!activeWebview.insetMapping.has(displayOutput)) {
                return;
            }
            activeWebview.removeInsets([displayOutput]);
        });
    }
    showInset(cellDiffViewModel, cellViewModel, displayOutput, diffSide) {
        this._insetModifyQueueByOutputId.queue(displayOutput.model.outputId + (diffSide === DiffSide.Modified ? '-right' : 'left'), async () => {
            const activeWebview = diffSide === DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
            if (!activeWebview) {
                return;
            }
            if (!activeWebview.insetMapping.has(displayOutput)) {
                return;
            }
            const cellTop = this._list.getAbsoluteTopOfElement(cellDiffViewModel);
            const outputIndex = cellViewModel.outputsViewModels.indexOf(displayOutput);
            const outputOffset = cellDiffViewModel.getOutputOffsetInCell(diffSide, outputIndex);
            activeWebview.updateScrollTops([{
                    cell: cellViewModel,
                    output: displayOutput,
                    cellTop,
                    outputOffset,
                    forceDisplay: true,
                }], []);
        });
    }
    hideInset(cellDiffViewModel, cellViewModel, output) {
        this._modifiedWebview?.hideInset(output);
        this._originalWebview?.hideInset(output);
    }
    // private async _resolveWebview(rightEditor: boolean): Promise<BackLayerWebView | null> {
    // 	if (rightEditor) {
    // 	}
    // }
    getDomNode() {
        return this._rootElement;
    }
    getOverflowContainerDomNode() {
        return this._overflowContainer;
    }
    getControl() {
        return undefined;
    }
    setEditorVisible(visible, group) {
        super.setEditorVisible(visible, group);
    }
    focus() {
        super.focus();
    }
    clearInput() {
        super.clearInput();
        this._modifiedResourceDisposableStore.clear();
        this._list?.splice(0, this._list?.length || 0);
        this._model = null;
        this._diffElementViewModels.forEach(vm => vm.dispose());
        this._diffElementViewModels = [];
    }
    deltaCellOutputContainerClassNames(diffSide, cellId, added, removed) {
        if (diffSide === DiffSide.Original) {
            this._originalWebview?.deltaCellContainerClassNames(cellId, added, removed);
        }
        else {
            this._modifiedWebview?.deltaCellContainerClassNames(cellId, added, removed);
        }
    }
    getLayoutInfo() {
        if (!this._list) {
            throw new Error('Editor is not initalized successfully');
        }
        return {
            width: this._dimension.width,
            height: this._dimension.height,
            fontInfo: this._fontInfo,
            scrollHeight: this._list?.getScrollHeight() ?? 0,
        };
    }
    getCellOutputLayoutInfo(nestedCell) {
        if (!this._model) {
            throw new Error('Editor is not attached to model yet');
        }
        const documentModel = CellUri.parse(nestedCell.uri);
        if (!documentModel) {
            throw new Error('Nested cell in the diff editor has wrong Uri');
        }
        const belongToOriginalDocument = this._model.original.notebook.uri.toString() === documentModel.notebook.toString();
        const viewModel = this._diffElementViewModels.find(element => {
            const textModel = belongToOriginalDocument ? element.original : element.modified;
            if (!textModel) {
                return false;
            }
            if (textModel.uri.toString() === nestedCell.uri.toString()) {
                return true;
            }
            return false;
        });
        if (!viewModel) {
            throw new Error('Nested cell in the diff editor does not match any diff element');
        }
        if (viewModel.type === 'unchanged') {
            return this.getLayoutInfo();
        }
        if (viewModel.type === 'insert' || viewModel.type === 'delete') {
            return {
                width: this._dimension.width / 2,
                height: this._dimension.height / 2,
                fontInfo: this._fontInfo
            };
        }
        if (viewModel.checkIfOutputsModified()) {
            return {
                width: this._dimension.width / 2,
                height: this._dimension.height / 2,
                fontInfo: this._fontInfo
            };
        }
        else {
            return this.getLayoutInfo();
        }
    }
    layout(dimension) {
        this._rootElement.classList.toggle('mid-width', dimension.width < 1000 && dimension.width >= 600);
        this._rootElement.classList.toggle('narrow-width', dimension.width < 600);
        const overviewRulerEnabled = this.isOverviewRulerEnabled();
        this._dimension = dimension.with(dimension.width - (overviewRulerEnabled ? NotebookTextDiffEditor.ENTIRE_DIFF_OVERVIEW_WIDTH : 0));
        this._listViewContainer.style.height = `${dimension.height}px`;
        this._listViewContainer.style.width = `${this._dimension.width}px`;
        this._list?.layout(this._dimension.height, this._dimension.width);
        if (this._modifiedWebview) {
            this._modifiedWebview.element.style.width = `calc(50% - 16px)`;
            this._modifiedWebview.element.style.left = `calc(50%)`;
        }
        if (this._originalWebview) {
            this._originalWebview.element.style.width = `calc(50% - 16px)`;
            this._originalWebview.element.style.left = `16px`;
        }
        if (this._webviewTransparentCover) {
            this._webviewTransparentCover.style.height = `${this._dimension.height}px`;
            this._webviewTransparentCover.style.width = `${this._dimension.width}px`;
        }
        if (overviewRulerEnabled) {
            this._overviewRuler.layout();
        }
        this._eventDispatcher?.emit([new NotebookDiffLayoutChangedEvent({ width: true, fontInfo: true }, this.getLayoutInfo())]);
    }
    dispose() {
        this._isDisposed = true;
        this._layoutCancellationTokenSource?.dispose();
        this._detachModel();
        super.dispose();
    }
};
NotebookTextDiffEditor = __decorate([
    __param(0, IInstantiationService),
    __param(1, IThemeService),
    __param(2, IContextKeyService),
    __param(3, INotebookEditorWorkerService),
    __param(4, IConfigurationService),
    __param(5, ITelemetryService),
    __param(6, IStorageService),
    __param(7, INotebookExecutionStateService)
], NotebookTextDiffEditor);
export { NotebookTextDiffEditor };
registerZIndex(ZIndex.Base, 10, 'notebook-diff-view-viewport-slider');
registerThemingParticipant((theme, collector) => {
    const diffDiagonalFillColor = theme.getColor(diffDiagonalFill);
    collector.addRule(`
	.notebook-text-diff-editor .diagonal-fill {
		background-image: linear-gradient(
			-45deg,
			${diffDiagonalFillColor} 12.5%,
			#0000 12.5%, #0000 50%,
			${diffDiagonalFillColor} 50%, ${diffDiagonalFillColor} 62.5%,
			#0000 62.5%, #0000 100%
		);
		background-size: 8px 8px;
	}
	`);
    collector.addRule(`.notebook-text-diff-editor .cell-body { margin: ${DIFF_CELL_MARGIN}px; }`);
});
