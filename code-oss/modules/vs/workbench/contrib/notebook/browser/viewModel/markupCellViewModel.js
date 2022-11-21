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
import * as UUID from 'vs/base/common/uuid';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { CellEditState, CellLayoutContext, CellLayoutState } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { BaseCellViewModel } from 'vs/workbench/contrib/notebook/browser/viewModel/baseCellViewModel';
import { CellKind } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IUndoRedoService } from 'vs/platform/undoRedo/common/undoRedo';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { NotebookCellStateChangedEvent } from 'vs/workbench/contrib/notebook/browser/notebookViewEvents';
let MarkupCellViewModel = class MarkupCellViewModel extends BaseCellViewModel {
    foldingDelegate;
    viewContext;
    cellKind = CellKind.Markup;
    _layoutInfo;
    _renderedHtml;
    get renderedHtml() { return this._renderedHtml; }
    set renderedHtml(value) {
        if (this._renderedHtml !== value) {
            this._renderedHtml = value;
            this._onDidChangeState.fire({ contentChanged: true });
        }
    }
    get layoutInfo() {
        return this._layoutInfo;
    }
    _previewHeight = 0;
    set renderedMarkdownHeight(newHeight) {
        this._previewHeight = newHeight;
        this._updateTotalHeight(this._computeTotalHeight());
    }
    _editorHeight = 0;
    _statusBarHeight = 0;
    set editorHeight(newHeight) {
        this._editorHeight = newHeight;
        this._statusBarHeight = this.viewContext.notebookOptions.computeStatusBarHeight();
        this._updateTotalHeight(this._computeTotalHeight());
    }
    get editorHeight() {
        throw new Error('MarkdownCellViewModel.editorHeight is write only');
    }
    _onDidChangeLayout = this._register(new Emitter());
    onDidChangeLayout = this._onDidChangeLayout.event;
    get foldingState() {
        return this.foldingDelegate.getFoldingState(this.foldingDelegate.getCellIndex(this));
    }
    _hoveringOutput = false;
    get outputIsHovered() {
        return this._hoveringOutput;
    }
    set outputIsHovered(v) {
        this._hoveringOutput = v;
    }
    _focusOnOutput = false;
    get outputIsFocused() {
        return this._focusOnOutput;
    }
    set outputIsFocused(v) {
        this._focusOnOutput = v;
    }
    _hoveringCell = false;
    get cellIsHovered() {
        return this._hoveringCell;
    }
    set cellIsHovered(v) {
        this._hoveringCell = v;
        this._onDidChangeState.fire({ cellIsHoveredChanged: true });
    }
    constructor(viewType, model, initialNotebookLayoutInfo, foldingDelegate, viewContext, configurationService, textModelService, undoRedoService, codeEditorService) {
        super(viewType, model, UUID.generateUuid(), viewContext, configurationService, textModelService, undoRedoService, codeEditorService);
        this.foldingDelegate = foldingDelegate;
        this.viewContext = viewContext;
        const { bottomToolbarGap } = this.viewContext.notebookOptions.computeBottomToolbarDimensions(this.viewType);
        this._layoutInfo = {
            editorHeight: 0,
            previewHeight: 0,
            fontInfo: initialNotebookLayoutInfo?.fontInfo || null,
            editorWidth: initialNotebookLayoutInfo?.width
                ? this.viewContext.notebookOptions.computeMarkdownCellEditorWidth(initialNotebookLayoutInfo.width)
                : 0,
            bottomToolbarOffset: bottomToolbarGap,
            totalHeight: 100,
            layoutState: CellLayoutState.Uninitialized,
            foldHintHeight: 0,
            statusBarHeight: 0
        };
        this._register(this.onDidChangeState(e => {
            this.viewContext.eventDispatcher.emit([new NotebookCellStateChangedEvent(e, this.model)]);
            if (e.foldingStateChanged) {
                this._updateTotalHeight(this._computeTotalHeight(), CellLayoutContext.Fold);
            }
        }));
    }
    _computeTotalHeight() {
        const layoutConfiguration = this.viewContext.notebookOptions.getLayoutConfiguration();
        const { bottomToolbarGap } = this.viewContext.notebookOptions.computeBottomToolbarDimensions(this.viewType);
        const foldHintHeight = this._computeFoldHintHeight();
        if (this.getEditState() === CellEditState.Editing) {
            return this._editorHeight
                + layoutConfiguration.markdownCellTopMargin
                + layoutConfiguration.markdownCellBottomMargin
                + bottomToolbarGap
                + this._statusBarHeight;
        }
        else {
            // @rebornix
            // On file open, the previewHeight + bottomToolbarGap for a cell out of viewport can be 0
            // When it's 0, the list view will never try to render it anymore even if we scroll the cell into view.
            // Thus we make sure it's greater than 0
            return Math.max(1, this._previewHeight + bottomToolbarGap + foldHintHeight);
        }
    }
    _computeFoldHintHeight() {
        return (this.getEditState() === CellEditState.Editing || this.foldingState !== 2 /* CellFoldingState.Collapsed */) ?
            0 : this.viewContext.notebookOptions.getLayoutConfiguration().markdownFoldHintHeight;
    }
    updateOptions(e) {
        if (e.cellStatusBarVisibility || e.insertToolbarPosition || e.cellToolbarLocation) {
            this._updateTotalHeight(this._computeTotalHeight());
        }
    }
    /**
     * we put outputs stuff here to make compiler happy
     */
    outputsViewModels = [];
    getOutputOffset(index) {
        // throw new Error('Method not implemented.');
        return -1;
    }
    updateOutputHeight(index, height) {
        // throw new Error('Method not implemented.');
    }
    triggerFoldingStateChange() {
        this._onDidChangeState.fire({ foldingStateChanged: true });
    }
    _updateTotalHeight(newHeight, context) {
        if (newHeight !== this.layoutInfo.totalHeight) {
            this.layoutChange({ totalHeight: newHeight, context });
        }
    }
    layoutChange(state) {
        // recompute
        const foldHintHeight = this._computeFoldHintHeight();
        if (!this.isInputCollapsed) {
            const editorWidth = state.outerWidth !== undefined
                ? this.viewContext.notebookOptions.computeMarkdownCellEditorWidth(state.outerWidth)
                : this._layoutInfo.editorWidth;
            const totalHeight = state.totalHeight === undefined
                ? (this._layoutInfo.layoutState === CellLayoutState.Uninitialized ? 100 : this._layoutInfo.totalHeight)
                : state.totalHeight;
            const previewHeight = this._previewHeight;
            this._layoutInfo = {
                fontInfo: state.font || this._layoutInfo.fontInfo,
                editorWidth,
                previewHeight,
                editorHeight: this._editorHeight,
                statusBarHeight: this._statusBarHeight,
                bottomToolbarOffset: this.viewContext.notebookOptions.computeBottomToolbarOffset(totalHeight, this.viewType),
                totalHeight,
                layoutState: CellLayoutState.Measured,
                foldHintHeight
            };
        }
        else {
            const editorWidth = state.outerWidth !== undefined
                ? this.viewContext.notebookOptions.computeMarkdownCellEditorWidth(state.outerWidth)
                : this._layoutInfo.editorWidth;
            const totalHeight = this.viewContext.notebookOptions.computeCollapsedMarkdownCellHeight(this.viewType);
            state.totalHeight = totalHeight;
            this._layoutInfo = {
                fontInfo: state.font || this._layoutInfo.fontInfo,
                editorWidth,
                editorHeight: this._editorHeight,
                statusBarHeight: this._statusBarHeight,
                previewHeight: this._previewHeight,
                bottomToolbarOffset: this.viewContext.notebookOptions.computeBottomToolbarOffset(totalHeight, this.viewType),
                totalHeight,
                layoutState: CellLayoutState.Measured,
                foldHintHeight: 0
            };
        }
        this._onDidChangeLayout.fire(state);
    }
    restoreEditorViewState(editorViewStates, totalHeight) {
        super.restoreEditorViewState(editorViewStates);
        // we might already warmup the viewport so the cell has a total height computed
        if (totalHeight !== undefined && this.layoutInfo.layoutState === CellLayoutState.Uninitialized) {
            this._layoutInfo = {
                fontInfo: this._layoutInfo.fontInfo,
                editorWidth: this._layoutInfo.editorWidth,
                previewHeight: this._layoutInfo.previewHeight,
                bottomToolbarOffset: this._layoutInfo.bottomToolbarOffset,
                totalHeight: totalHeight,
                editorHeight: this._editorHeight,
                statusBarHeight: this._statusBarHeight,
                layoutState: CellLayoutState.FromCache,
                foldHintHeight: this._layoutInfo.foldHintHeight
            };
            this.layoutChange({});
        }
    }
    hasDynamicHeight() {
        return false;
    }
    getDynamicHeight() {
        return null;
    }
    getHeight(lineHeight) {
        if (this._layoutInfo.layoutState === CellLayoutState.Uninitialized) {
            return 100;
        }
        else {
            return this._layoutInfo.totalHeight;
        }
    }
    onDidChangeTextModelContent() {
        this._onDidChangeState.fire({ contentChanged: true });
    }
    onDeselect() {
    }
    _hasFindResult = this._register(new Emitter());
    hasFindResult = this._hasFindResult.event;
    startFind(value, options) {
        const matches = super.cellStartFind(value, options);
        if (matches === null) {
            return null;
        }
        return {
            cell: this,
            matches,
            modelMatchCount: matches.length
        };
    }
    dispose() {
        super.dispose();
        this.foldingDelegate = null;
    }
};
MarkupCellViewModel = __decorate([
    __param(5, IConfigurationService),
    __param(6, ITextModelService),
    __param(7, IUndoRedoService),
    __param(8, ICodeEditorService)
], MarkupCellViewModel);
export { MarkupCellViewModel };
