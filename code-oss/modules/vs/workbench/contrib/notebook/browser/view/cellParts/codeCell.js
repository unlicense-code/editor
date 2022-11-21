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
import { raceCancellation } from 'vs/base/common/async';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { Codicon, CSSIcon } from 'vs/base/common/codicons';
import { Event } from 'vs/base/common/event';
import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { tokenizeToStringSync } from 'vs/editor/common/languages/textToHtmlTokenizer';
import { localize } from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { CellFocusMode, EXPAND_CELL_INPUT_COMMAND_ID } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { CellEditorOptions } from 'vs/workbench/contrib/notebook/browser/view/cellParts/cellEditorOptions';
import { CellOutputContainer } from 'vs/workbench/contrib/notebook/browser/view/cellParts/cellOutput';
import { CollapsedCodeCellExecutionIcon } from 'vs/workbench/contrib/notebook/browser/view/cellParts/codeCellExecutionIcon';
import { INotebookCellStatusBarService } from 'vs/workbench/contrib/notebook/common/notebookCellStatusBarService';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
let CodeCell = class CodeCell extends Disposable {
    notebookEditor;
    viewCell;
    templateData;
    instantiationService;
    notebookCellStatusBarService;
    keybindingService;
    openerService;
    languageService;
    configurationService;
    _outputContainerRenderer;
    _renderedInputCollapseState;
    _renderedOutputCollapseState;
    _isDisposed = false;
    cellParts;
    _collapsedExecutionIcon;
    constructor(notebookEditor, viewCell, templateData, instantiationService, notebookCellStatusBarService, keybindingService, openerService, languageService, configurationService, notebookExecutionStateService) {
        super();
        this.notebookEditor = notebookEditor;
        this.viewCell = viewCell;
        this.templateData = templateData;
        this.instantiationService = instantiationService;
        this.notebookCellStatusBarService = notebookCellStatusBarService;
        this.keybindingService = keybindingService;
        this.openerService = openerService;
        this.languageService = languageService;
        this.configurationService = configurationService;
        const cellEditorOptions = this._register(new CellEditorOptions(this.notebookEditor.getBaseCellEditorOptions(viewCell.language), this.notebookEditor.notebookOptions, this.configurationService));
        this._outputContainerRenderer = this.instantiationService.createInstance(CellOutputContainer, notebookEditor, viewCell, templateData, { limit: 500 });
        this.cellParts = this._register(templateData.cellParts.concatContentPart([cellEditorOptions, this._outputContainerRenderer]));
        const editorHeight = this.calculateInitEditorHeight();
        this.initializeEditor(editorHeight);
        this.registerViewCellLayoutChange();
        this.registerCellEditorEventListeners();
        this.registerDecorations();
        this.registerMouseListener();
        this._register(notebookExecutionStateService.onDidChangeCellExecution(e => {
            if (e.affectsCell(this.viewCell.uri)) {
                this.cellParts.updateForExecutionState(this.viewCell, e);
            }
        }));
        this._register(this.viewCell.onDidChangeState(e => {
            this.cellParts.updateState(this.viewCell, e);
            if (e.outputIsHoveredChanged) {
                this.updateForOutputHover();
            }
            if (e.outputIsFocusedChanged) {
                this.updateForOutputFocus();
            }
            if (e.metadataChanged || e.internalMetadataChanged) {
                this.updateEditorOptions();
            }
            if (e.inputCollapsedChanged || e.outputCollapsedChanged) {
                this.viewCell.pauseLayout();
                const updated = this.updateForCollapseState();
                this.viewCell.resumeLayout();
                if (updated) {
                    this.relayoutCell();
                }
            }
            if (e.focusModeChanged) {
                this.updateEditorForFocusModeChange();
            }
        }));
        this.cellParts.scheduleRenderCell(this.viewCell);
        this._register(toDisposable(() => {
            this.cellParts.unrenderCell(this.viewCell);
        }));
        this.updateEditorOptions();
        this.updateEditorForFocusModeChange();
        this.updateForOutputHover();
        this.updateForOutputFocus();
        // Render Outputs
        this._outputContainerRenderer.render(editorHeight);
        // Need to do this after the intial renderOutput
        if (this.viewCell.isOutputCollapsed === undefined && this.viewCell.isInputCollapsed === undefined) {
            this.initialViewUpdateExpanded();
            this.viewCell.layoutChange({});
        }
        this._register(this.viewCell.onLayoutInfoRead(() => {
            this.cellParts.prepareLayout();
        }));
        const executionItemElement = DOM.append(this.templateData.cellInputCollapsedContainer, DOM.$('.collapsed-execution-icon'));
        this._register(toDisposable(() => {
            executionItemElement.parentElement?.removeChild(executionItemElement);
        }));
        this._collapsedExecutionIcon = this._register(this.instantiationService.createInstance(CollapsedCodeCellExecutionIcon, this.notebookEditor, this.viewCell, executionItemElement));
        this.updateForCollapseState();
        this._register(Event.runAndSubscribe(viewCell.onDidChangeOutputs, this.updateForOutputs.bind(this)));
        this._register(Event.runAndSubscribe(viewCell.onDidChangeLayout, this.updateForLayout.bind(this)));
        this._register(cellEditorOptions.onDidChange(() => templateData.editor.updateOptions(cellEditorOptions.getUpdatedValue(this.viewCell.internalMetadata, this.viewCell.uri))));
        templateData.editor.updateOptions(cellEditorOptions.getUpdatedValue(this.viewCell.internalMetadata, this.viewCell.uri));
        cellEditorOptions.setLineNumbers(this.viewCell.lineNumbers);
    }
    _pendingLayout;
    updateForLayout() {
        this._pendingLayout?.dispose();
        this._pendingLayout = DOM.modify(() => {
            this.cellParts.updateInternalLayoutNow(this.viewCell);
        });
    }
    updateForOutputHover() {
        this.templateData.container.classList.toggle('cell-output-hover', this.viewCell.outputIsHovered);
    }
    updateForOutputFocus() {
        this.templateData.container.classList.toggle('cell-output-focus', this.viewCell.outputIsFocused);
    }
    calculateInitEditorHeight() {
        const lineNum = this.viewCell.lineCount;
        const lineHeight = this.viewCell.layoutInfo.fontInfo?.lineHeight || 17;
        const editorPadding = this.notebookEditor.notebookOptions.computeEditorPadding(this.viewCell.internalMetadata, this.viewCell.uri);
        const editorHeight = this.viewCell.layoutInfo.editorHeight === 0
            ? lineNum * lineHeight + editorPadding.top + editorPadding.bottom
            : this.viewCell.layoutInfo.editorHeight;
        return editorHeight;
    }
    initializeEditor(initEditorHeight) {
        const width = this.viewCell.layoutInfo.editorWidth;
        this.layoutEditor({
            width: width,
            height: initEditorHeight
        });
        const cts = new CancellationTokenSource();
        this._register({ dispose() { cts.dispose(true); } });
        raceCancellation(this.viewCell.resolveTextModel(), cts.token).then(model => {
            if (this._isDisposed) {
                return;
            }
            if (model && this.templateData.editor) {
                this.templateData.editor.setModel(model);
                this.viewCell.attachTextEditor(this.templateData.editor, this.viewCell.layoutInfo.estimatedHasHorizontalScrolling);
                const focusEditorIfNeeded = () => {
                    if (this.notebookEditor.getActiveCell() === this.viewCell &&
                        this.viewCell.focusMode === CellFocusMode.Editor &&
                        (this.notebookEditor.hasEditorFocus() || document.activeElement === document.body)) // Don't steal focus from other workbench parts, but if body has focus, we can take it
                     {
                        this.templateData.editor?.focus();
                    }
                };
                focusEditorIfNeeded();
                const realContentHeight = this.templateData.editor?.getContentHeight();
                if (realContentHeight !== undefined && realContentHeight !== initEditorHeight) {
                    this.onCellEditorHeightChange(realContentHeight);
                }
                focusEditorIfNeeded();
            }
        });
    }
    updateForOutputs() {
        if (this.viewCell.outputsViewModels.length) {
            DOM.show(this.templateData.focusSinkElement);
        }
        else {
            DOM.hide(this.templateData.focusSinkElement);
        }
    }
    updateEditorOptions() {
        const editor = this.templateData.editor;
        if (!editor) {
            return;
        }
        const isReadonly = this.notebookEditor.isReadOnly;
        const padding = this.notebookEditor.notebookOptions.computeEditorPadding(this.viewCell.internalMetadata, this.viewCell.uri);
        const options = editor.getOptions();
        if (options.get(82 /* EditorOption.readOnly */) !== isReadonly || options.get(76 /* EditorOption.padding */) !== padding) {
            editor.updateOptions({ readOnly: this.notebookEditor.isReadOnly, padding: this.notebookEditor.notebookOptions.computeEditorPadding(this.viewCell.internalMetadata, this.viewCell.uri) });
        }
    }
    registerViewCellLayoutChange() {
        this._register(this.viewCell.onDidChangeLayout((e) => {
            if (e.outerWidth !== undefined) {
                const layoutInfo = this.templateData.editor.getLayoutInfo();
                if (layoutInfo.width !== this.viewCell.layoutInfo.editorWidth) {
                    this.onCellWidthChange();
                }
            }
            if (e.totalHeight) {
                this.relayoutCell();
            }
        }));
    }
    registerCellEditorEventListeners() {
        this._register(this.templateData.editor.onDidContentSizeChange((e) => {
            if (e.contentHeightChanged) {
                if (this.viewCell.layoutInfo.editorHeight !== e.contentHeight) {
                    this.onCellEditorHeightChange(e.contentHeight);
                }
            }
        }));
        this._register(this.templateData.editor.onDidChangeCursorSelection((e) => {
            if (e.source === 'restoreState' || e.oldModelVersionId === 0) {
                // do not reveal the cell into view if this selection change was caused by restoring editors...
                return;
            }
            const selections = this.templateData.editor.getSelections();
            if (selections?.length) {
                const lastSelection = selections[selections.length - 1];
                this.notebookEditor.revealLineInViewAsync(this.viewCell, lastSelection.positionLineNumber);
            }
        }));
    }
    registerDecorations() {
        // Apply decorations
        this._register(this.viewCell.onCellDecorationsChanged((e) => {
            e.added.forEach(options => {
                if (options.className) {
                    this.templateData.rootContainer.classList.add(options.className);
                }
                if (options.outputClassName) {
                    this.notebookEditor.deltaCellContainerClassNames(this.viewCell.id, [options.outputClassName], []);
                }
            });
            e.removed.forEach(options => {
                if (options.className) {
                    this.templateData.rootContainer.classList.remove(options.className);
                }
                if (options.outputClassName) {
                    this.notebookEditor.deltaCellContainerClassNames(this.viewCell.id, [], [options.outputClassName]);
                }
            });
        }));
        this.viewCell.getCellDecorations().forEach(options => {
            if (options.className) {
                this.templateData.rootContainer.classList.add(options.className);
            }
            if (options.outputClassName) {
                this.notebookEditor.deltaCellContainerClassNames(this.viewCell.id, [options.outputClassName], []);
            }
        });
    }
    registerMouseListener() {
        this._register(this.templateData.editor.onMouseDown(e => {
            // prevent default on right mouse click, otherwise it will trigger unexpected focus changes
            // the catch is, it means we don't allow customization of right button mouse down handlers other than the built in ones.
            if (e.event.rightButton) {
                e.event.preventDefault();
            }
        }));
    }
    shouldUpdateDOMFocus() {
        // The DOM focus needs to be adjusted:
        // when a cell editor should be focused
        // the document active element is inside the notebook editor or the document body (cell editor being disposed previously)
        return this.notebookEditor.getActiveCell() === this.viewCell
            && this.viewCell.focusMode === CellFocusMode.Editor
            && (this.notebookEditor.hasEditorFocus() || document.activeElement === document.body);
    }
    updateEditorForFocusModeChange() {
        if (this.shouldUpdateDOMFocus()) {
            this.templateData.editor?.focus();
        }
        this.templateData.container.classList.toggle('cell-editor-focus', this.viewCell.focusMode === CellFocusMode.Editor);
        this.templateData.container.classList.toggle('cell-output-focus', this.viewCell.focusMode === CellFocusMode.Output);
    }
    updateForCollapseState() {
        if (this.viewCell.isOutputCollapsed === this._renderedOutputCollapseState &&
            this.viewCell.isInputCollapsed === this._renderedInputCollapseState) {
            return false;
        }
        this.viewCell.layoutChange({ editorHeight: true });
        if (this.viewCell.isInputCollapsed) {
            this._collapseInput();
        }
        else {
            this._showInput();
        }
        if (this.viewCell.isOutputCollapsed) {
            this._collapseOutput();
        }
        else {
            this._showOutput(false);
        }
        this.relayoutCell();
        this._renderedOutputCollapseState = this.viewCell.isOutputCollapsed;
        this._renderedInputCollapseState = this.viewCell.isInputCollapsed;
        return true;
    }
    _collapseInput() {
        // hide the editor and execution label, keep the run button
        DOM.hide(this.templateData.editorPart);
        this.templateData.container.classList.toggle('input-collapsed', true);
        // remove input preview
        this._removeInputCollapsePreview();
        this._collapsedExecutionIcon.setVisibility(true);
        // update preview
        const richEditorText = this._getRichText(this.viewCell.textBuffer, this.viewCell.language);
        const element = DOM.$('div.cell-collapse-preview');
        DOM.safeInnerHtml(element, richEditorText);
        this.templateData.cellInputCollapsedContainer.appendChild(element);
        const expandIcon = DOM.$('span.expandInputIcon');
        const keybinding = this.keybindingService.lookupKeybinding(EXPAND_CELL_INPUT_COMMAND_ID);
        if (keybinding) {
            element.title = localize('cellExpandInputButtonLabelWithDoubleClick', "Double click to expand cell input ({0})", keybinding.getLabel());
            expandIcon.title = localize('cellExpandInputButtonLabel', "Expand Cell Input ({0})", keybinding.getLabel());
        }
        expandIcon.classList.add(...CSSIcon.asClassNameArray(Codicon.more));
        element.appendChild(expandIcon);
        DOM.show(this.templateData.cellInputCollapsedContainer);
    }
    _showInput() {
        this._collapsedExecutionIcon.setVisibility(false);
        DOM.show(this.templateData.editorPart);
        DOM.hide(this.templateData.cellInputCollapsedContainer);
    }
    _getRichText(buffer, language) {
        return tokenizeToStringSync(this.languageService, buffer.getLineContent(1), language);
    }
    _removeInputCollapsePreview() {
        const children = this.templateData.cellInputCollapsedContainer.children;
        const elements = [];
        for (let i = 0; i < children.length; i++) {
            if (children[i].classList.contains('cell-collapse-preview')) {
                elements.push(children[i]);
            }
        }
        elements.forEach(element => {
            element.parentElement?.removeChild(element);
        });
    }
    _updateOutputInnerContainer(hide) {
        const children = this.templateData.outputContainer.domNode.children;
        for (let i = 0; i < children.length; i++) {
            if (children[i].classList.contains('output-inner-container')) {
                if (hide) {
                    DOM.hide(children[i]);
                }
                else {
                    DOM.show(children[i]);
                }
            }
        }
    }
    _collapseOutput() {
        this.templateData.container.classList.toggle('output-collapsed', true);
        DOM.show(this.templateData.cellOutputCollapsedContainer);
        this._updateOutputInnerContainer(true);
        this._outputContainerRenderer.viewUpdateHideOuputs();
    }
    _showOutput(initRendering) {
        this.templateData.container.classList.toggle('output-collapsed', false);
        DOM.hide(this.templateData.cellOutputCollapsedContainer);
        this._updateOutputInnerContainer(false);
        this._outputContainerRenderer.viewUpdateShowOutputs(initRendering);
    }
    initialViewUpdateExpanded() {
        this.templateData.container.classList.toggle('input-collapsed', false);
        this._showInput();
        this.templateData.container.classList.toggle('output-collapsed', false);
        this._showOutput(true);
        this.relayoutCell();
    }
    layoutEditor(dimension) {
        this.templateData.editor?.layout(dimension);
    }
    onCellWidthChange() {
        if (!this.templateData.editor.hasModel()) {
            return;
        }
        const realContentHeight = this.templateData.editor.getContentHeight();
        this.viewCell.editorHeight = realContentHeight;
        this.relayoutCell();
        this.layoutEditor({
            width: this.viewCell.layoutInfo.editorWidth,
            height: realContentHeight
        });
    }
    onCellEditorHeightChange(newHeight) {
        const viewLayout = this.templateData.editor.getLayoutInfo();
        this.viewCell.editorHeight = newHeight;
        this.relayoutCell();
        this.layoutEditor({
            width: viewLayout.width,
            height: newHeight
        });
    }
    relayoutCell() {
        this.notebookEditor.layoutNotebookCell(this.viewCell, this.viewCell.layoutInfo.totalHeight);
    }
    dispose() {
        this._isDisposed = true;
        // move focus back to the cell list otherwise the focus goes to body
        if (this.shouldUpdateDOMFocus()) {
            this.notebookEditor.focusContainer();
        }
        this.viewCell.detachTextEditor();
        this._removeInputCollapsePreview();
        this._outputContainerRenderer.dispose();
        this._pendingLayout?.dispose();
        super.dispose();
    }
};
CodeCell = __decorate([
    __param(3, IInstantiationService),
    __param(4, INotebookCellStatusBarService),
    __param(5, IKeybindingService),
    __param(6, IOpenerService),
    __param(7, ILanguageService),
    __param(8, IConfigurationService),
    __param(9, INotebookExecutionStateService)
], CodeCell);
export { CodeCell };
