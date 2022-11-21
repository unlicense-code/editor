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
import 'vs/css!./media/interactive';
import * as nls from 'vs/nls';
import * as DOM from 'vs/base/browser/dom';
import { Emitter } from 'vs/base/common/event';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { editorForeground, resolveColorValue } from 'vs/platform/theme/common/colorRegistry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { EditorPane } from 'vs/workbench/browser/parts/editor/editorPane';
import { getSimpleEditorOptions } from 'vs/workbench/contrib/codeEditor/browser/simpleEditorOptions';
import { InteractiveEditorInput } from 'vs/workbench/contrib/interactive/browser/interactiveEditorInput';
import { NotebookEditorExtensionsRegistry } from 'vs/workbench/contrib/notebook/browser/notebookEditorExtensions';
import { INotebookEditorService } from 'vs/workbench/contrib/notebook/browser/services/notebookEditorService';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { ExecutionStateCellStatusBarContrib, TimerCellStatusBarContrib } from 'vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/executionStatusBarItemController';
import { INotebookKernelService } from 'vs/workbench/contrib/notebook/common/notebookKernelService';
import { PLAINTEXT_LANGUAGE_ID } from 'vs/editor/common/languages/modesRegistry';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IMenuService, MenuId } from 'vs/platform/actions/common/actions';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { InteractiveWindowSetting, INTERACTIVE_INPUT_CURSOR_BOUNDARY } from 'vs/workbench/contrib/interactive/browser/interactiveCommon';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { NotebookOptions } from 'vs/workbench/contrib/notebook/common/notebookOptions';
import { ToolBar } from 'vs/base/browser/ui/toolbar/toolbar';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { createActionViewItem, createAndFillInActionBarActions } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { EditorExtensionsRegistry } from 'vs/editor/browser/editorExtensions';
import { MenuPreventer } from 'vs/workbench/contrib/codeEditor/browser/menuPreventer';
import { SelectionClipboardContributionID } from 'vs/workbench/contrib/codeEditor/browser/selectionClipboard';
import { ContextMenuController } from 'vs/editor/contrib/contextmenu/browser/contextmenu';
import { SuggestController } from 'vs/editor/contrib/suggest/browser/suggestController';
import { SnippetController2 } from 'vs/editor/contrib/snippet/browser/snippetController2';
import { TabCompletionController } from 'vs/workbench/contrib/snippets/browser/tabCompletion';
import { ModesHoverController } from 'vs/editor/contrib/hover/browser/hover';
import { MarkerController } from 'vs/editor/contrib/gotoError/browser/gotoError';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
import { NOTEBOOK_KERNEL } from 'vs/workbench/contrib/notebook/common/notebookContextKeys';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { isEqual } from 'vs/base/common/resources';
import { NotebookFindContrib } from 'vs/workbench/contrib/notebook/browser/contrib/find/notebookFindWidget';
import { INTERACTIVE_WINDOW_EDITOR_ID } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import 'vs/css!./interactiveEditor';
const DECORATION_KEY = 'interactiveInputDecoration';
const INTERACTIVE_EDITOR_VIEW_STATE_PREFERENCE_KEY = 'InteractiveEditorViewState';
const INPUT_CELL_VERTICAL_PADDING = 8;
const INPUT_CELL_HORIZONTAL_PADDING_RIGHT = 10;
const INPUT_EDITOR_PADDING = 8;
let InteractiveEditor = class InteractiveEditor extends EditorPane {
    configurationService;
    #rootElement;
    #styleElement;
    #notebookEditorContainer;
    #notebookWidget = { value: undefined };
    #inputCellContainer;
    #inputFocusIndicator;
    #inputRunButtonContainer;
    #inputEditorContainer;
    #codeEditorWidget;
    // #inputLineCount = 1;
    #notebookWidgetService;
    #instantiationService;
    #languageService;
    #contextKeyService;
    #notebookKernelService;
    #keybindingService;
    #menuService;
    #contextMenuService;
    #editorGroupService;
    #notebookExecutionStateService;
    #extensionService;
    #widgetDisposableStore = this._register(new DisposableStore());
    #dimension;
    #notebookOptions;
    #editorMemento;
    #groupListener = this._register(new DisposableStore());
    #runbuttonToolbar;
    #onDidFocusWidget = this._register(new Emitter());
    get onDidFocus() { return this.#onDidFocusWidget.event; }
    #onDidChangeSelection = this._register(new Emitter());
    onDidChangeSelection = this.#onDidChangeSelection.event;
    constructor(telemetryService, themeService, storageService, instantiationService, notebookWidgetService, contextKeyService, codeEditorService, notebookKernelService, languageService, keybindingService, configurationService, menuService, contextMenuService, editorGroupService, textResourceConfigurationService, notebookExecutionStateService, extensionService) {
        super(INTERACTIVE_WINDOW_EDITOR_ID, telemetryService, themeService, storageService);
        this.configurationService = configurationService;
        this.#instantiationService = instantiationService;
        this.#notebookWidgetService = notebookWidgetService;
        this.#contextKeyService = contextKeyService;
        this.#notebookKernelService = notebookKernelService;
        this.#languageService = languageService;
        this.#keybindingService = keybindingService;
        this.#menuService = menuService;
        this.#contextMenuService = contextMenuService;
        this.#editorGroupService = editorGroupService;
        this.#notebookExecutionStateService = notebookExecutionStateService;
        this.#extensionService = extensionService;
        this.#notebookOptions = new NotebookOptions(configurationService, notebookExecutionStateService, { cellToolbarInteraction: 'hover', globalToolbar: true, defaultCellCollapseConfig: { codeCell: { inputCollapsed: true } } });
        this.#editorMemento = this.getEditorMemento(editorGroupService, textResourceConfigurationService, INTERACTIVE_EDITOR_VIEW_STATE_PREFERENCE_KEY);
        codeEditorService.registerDecorationType('interactive-decoration', DECORATION_KEY, {});
        this._register(this.#keybindingService.onDidUpdateKeybindings(this.#updateInputDecoration, this));
        this._register(this.#notebookExecutionStateService.onDidChangeCellExecution((e) => {
            if (isEqual(e.notebook, this.#notebookWidget.value?.viewModel?.notebookDocument.uri)) {
                const cell = this.#notebookWidget.value?.getCellByHandle(e.cellHandle);
                if (cell && e.changed?.state) {
                    this.#scrollIfNecessary(cell);
                }
            }
        }));
    }
    get #inputCellContainerHeight() {
        return 19 + 2 + INPUT_CELL_VERTICAL_PADDING * 2 + INPUT_EDITOR_PADDING * 2;
    }
    get #inputCellEditorHeight() {
        return 19 + INPUT_EDITOR_PADDING * 2;
    }
    createEditor(parent) {
        this.#rootElement = DOM.append(parent, DOM.$('.interactive-editor'));
        this.#rootElement.style.position = 'relative';
        this.#notebookEditorContainer = DOM.append(this.#rootElement, DOM.$('.notebook-editor-container'));
        this.#inputCellContainer = DOM.append(this.#rootElement, DOM.$('.input-cell-container'));
        this.#inputCellContainer.style.position = 'absolute';
        this.#inputCellContainer.style.height = `${this.#inputCellContainerHeight}px`;
        this.#inputFocusIndicator = DOM.append(this.#inputCellContainer, DOM.$('.input-focus-indicator'));
        this.#inputRunButtonContainer = DOM.append(this.#inputCellContainer, DOM.$('.run-button-container'));
        this.#setupRunButtonToolbar(this.#inputRunButtonContainer);
        this.#inputEditorContainer = DOM.append(this.#inputCellContainer, DOM.$('.input-editor-container'));
        this.#createLayoutStyles();
    }
    #setupRunButtonToolbar(runButtonContainer) {
        const menu = this._register(this.#menuService.createMenu(MenuId.InteractiveInputExecute, this.#contextKeyService));
        this.#runbuttonToolbar = this._register(new ToolBar(runButtonContainer, this.#contextMenuService, {
            getKeyBinding: action => this.#keybindingService.lookupKeybinding(action.id),
            actionViewItemProvider: action => {
                return createActionViewItem(this.#instantiationService, action);
            },
            renderDropdownAsChildElement: true
        }));
        const primary = [];
        const secondary = [];
        const result = { primary, secondary };
        createAndFillInActionBarActions(menu, { shouldForwardArgs: true }, result);
        this.#runbuttonToolbar.setActions([...primary, ...secondary]);
    }
    #createLayoutStyles() {
        this.#styleElement = DOM.createStyleSheet(this.#rootElement);
        const styleSheets = [];
        const { focusIndicator, codeCellLeftMargin, cellRunGutter } = this.#notebookOptions.getLayoutConfiguration();
        const leftMargin = codeCellLeftMargin + cellRunGutter;
        styleSheets.push(`
			.interactive-editor .input-cell-container {
				padding: ${INPUT_CELL_VERTICAL_PADDING}px ${INPUT_CELL_HORIZONTAL_PADDING_RIGHT}px ${INPUT_CELL_VERTICAL_PADDING}px ${leftMargin}px;
			}
		`);
        if (focusIndicator === 'gutter') {
            styleSheets.push(`
				.interactive-editor .input-cell-container:focus-within .input-focus-indicator::before {
					border-color: var(--vscode-notebook-focusedCellBorder) !important;
				}
				.interactive-editor .input-focus-indicator::before {
					border-color: var(--vscode-notebook-inactiveFocusedCellBorder) !important;
				}
				.interactive-editor .input-cell-container .input-focus-indicator {
					display: block;
					top: ${INPUT_CELL_VERTICAL_PADDING}px;
				}
				.interactive-editor .input-cell-container {
					border-top: 1px solid var(--vscode-notebook-inactiveFocusedCellBorder);
				}
			`);
        }
        else {
            // border
            styleSheets.push(`
				.interactive-editor .input-cell-container {
					border-top: 1px solid var(--vscode-notebook-inactiveFocusedCellBorder);
				}
				.interactive-editor .input-cell-container .input-focus-indicator {
					display: none;
				}
			`);
        }
        styleSheets.push(`
			.interactive-editor .input-cell-container .run-button-container {
				width: ${cellRunGutter}px;
				left: ${codeCellLeftMargin}px;
				margin-top: ${INPUT_EDITOR_PADDING - 2}px;
			}
		`);
        this.#styleElement.textContent = styleSheets.join('\n');
    }
    saveState() {
        this.#saveEditorViewState(this.input);
        super.saveState();
    }
    getViewState() {
        const input = this.input;
        if (!(input instanceof InteractiveEditorInput)) {
            return undefined;
        }
        this.#saveEditorViewState(input);
        return this.#loadNotebookEditorViewState(input);
    }
    #saveEditorViewState(input) {
        if (this.group && this.#notebookWidget.value && input instanceof InteractiveEditorInput) {
            if (this.#notebookWidget.value.isDisposed) {
                return;
            }
            const state = this.#notebookWidget.value.getEditorViewState();
            const editorState = this.#codeEditorWidget.saveViewState();
            this.#editorMemento.saveEditorState(this.group, input.notebookEditorInput.resource, {
                notebook: state,
                input: editorState
            });
        }
    }
    #loadNotebookEditorViewState(input) {
        let result;
        if (this.group) {
            result = this.#editorMemento.loadEditorState(this.group, input.notebookEditorInput.resource);
        }
        if (result) {
            return result;
        }
        // when we don't have a view state for the group/input-tuple then we try to use an existing
        // editor for the same resource.
        for (const group of this.#editorGroupService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */)) {
            if (group.activeEditorPane !== this && group.activeEditorPane === this && group.activeEditor?.matches(input)) {
                const notebook = this.#notebookWidget.value?.getEditorViewState();
                const input = this.#codeEditorWidget.saveViewState();
                return {
                    notebook,
                    input
                };
            }
        }
        return;
    }
    async setInput(input, options, context, token) {
        const group = this.group;
        const notebookInput = input.notebookEditorInput;
        // there currently is a widget which we still own so
        // we need to hide it before getting a new widget
        this.#notebookWidget.value?.onWillHide();
        this.#codeEditorWidget?.dispose();
        this.#widgetDisposableStore.clear();
        this.#notebookWidget = this.#instantiationService.invokeFunction(this.#notebookWidgetService.retrieveWidget, group, notebookInput, {
            isEmbedded: true,
            isReadOnly: true,
            contributions: NotebookEditorExtensionsRegistry.getSomeEditorContributions([
                ExecutionStateCellStatusBarContrib.id,
                TimerCellStatusBarContrib.id,
                NotebookFindContrib.id
            ]),
            menuIds: {
                notebookToolbar: MenuId.InteractiveToolbar,
                cellTitleToolbar: MenuId.InteractiveCellTitle,
                cellDeleteToolbar: MenuId.InteractiveCellDelete,
                cellInsertToolbar: MenuId.NotebookCellBetween,
                cellTopInsertToolbar: MenuId.NotebookCellListTop,
                cellExecuteToolbar: MenuId.InteractiveCellExecute,
                cellExecutePrimary: undefined
            },
            cellEditorContributions: EditorExtensionsRegistry.getSomeEditorContributions([
                SelectionClipboardContributionID,
                ContextMenuController.ID,
                ModesHoverController.ID,
                MarkerController.ID
            ]),
            options: this.#notebookOptions
        });
        this.#codeEditorWidget = this.#instantiationService.createInstance(CodeEditorWidget, this.#inputEditorContainer, {
            ...getSimpleEditorOptions(),
            ...{
                glyphMargin: true,
                padding: {
                    top: INPUT_EDITOR_PADDING,
                    bottom: INPUT_EDITOR_PADDING
                },
                hover: {
                    enabled: true
                }
            }
        }, {
            ...{
                isSimpleWidget: false,
                contributions: EditorExtensionsRegistry.getSomeEditorContributions([
                    MenuPreventer.ID,
                    SelectionClipboardContributionID,
                    ContextMenuController.ID,
                    SuggestController.ID,
                    SnippetController2.ID,
                    TabCompletionController.ID,
                    ModesHoverController.ID,
                    MarkerController.ID
                ])
            }
        });
        if (this.#dimension) {
            this.#notebookEditorContainer.style.height = `${this.#dimension.height - this.#inputCellContainerHeight}px`;
            this.#notebookWidget.value.layout(this.#dimension.with(this.#dimension.width, this.#dimension.height - this.#inputCellContainerHeight), this.#notebookEditorContainer);
            const { codeCellLeftMargin, cellRunGutter } = this.#notebookOptions.getLayoutConfiguration();
            const leftMargin = codeCellLeftMargin + cellRunGutter;
            const maxHeight = Math.min(this.#dimension.height / 2, this.#inputCellEditorHeight);
            this.#codeEditorWidget.layout(this.#validateDimension(this.#dimension.width - leftMargin - INPUT_CELL_HORIZONTAL_PADDING_RIGHT, maxHeight));
            this.#inputFocusIndicator.style.height = `${this.#inputCellEditorHeight}px`;
            this.#inputCellContainer.style.top = `${this.#dimension.height - this.#inputCellContainerHeight}px`;
            this.#inputCellContainer.style.width = `${this.#dimension.width}px`;
        }
        await super.setInput(input, options, context, token);
        const model = await input.resolve();
        if (this.#runbuttonToolbar) {
            this.#runbuttonToolbar.context = input.resource;
        }
        if (model === null) {
            throw new Error('?');
        }
        this.#notebookWidget.value?.setParentContextKeyService(this.#contextKeyService);
        const viewState = options?.viewState ?? this.#loadNotebookEditorViewState(input);
        await this.#extensionService.whenInstalledExtensionsRegistered();
        await this.#notebookWidget.value.setModel(model.notebook, viewState?.notebook);
        model.notebook.setCellCollapseDefault(this.#notebookOptions.getCellCollapseDefault());
        this.#notebookWidget.value.setOptions({
            isReadOnly: true
        });
        this.#widgetDisposableStore.add(this.#notebookWidget.value.onDidResizeOutput((cvm) => {
            this.#scrollIfNecessary(cvm);
        }));
        this.#widgetDisposableStore.add(this.#notebookWidget.value.onDidFocusWidget(() => this.#onDidFocusWidget.fire()));
        this.#widgetDisposableStore.add(model.notebook.onDidChangeContent(() => {
            model.setDirty(false);
        }));
        this.#widgetDisposableStore.add(this.#notebookOptions.onDidChangeOptions(e => {
            if (e.compactView || e.focusIndicator) {
                // update the styling
                this.#styleElement?.remove();
                this.#createLayoutStyles();
            }
            if (this.#dimension && this.isVisible()) {
                this.layout(this.#dimension);
            }
            if (e.interactiveWindowCollapseCodeCells) {
                model.notebook.setCellCollapseDefault(this.#notebookOptions.getCellCollapseDefault());
            }
        }));
        const editorModel = await input.resolveInput(this.#notebookWidget.value?.activeKernel?.supportedLanguages[0] ?? PLAINTEXT_LANGUAGE_ID);
        this.#codeEditorWidget.setModel(editorModel);
        if (viewState?.input) {
            this.#codeEditorWidget.restoreViewState(viewState.input);
        }
        this.#widgetDisposableStore.add(this.#codeEditorWidget.onDidFocusEditorWidget(() => this.#onDidFocusWidget.fire()));
        this.#widgetDisposableStore.add(this.#codeEditorWidget.onDidContentSizeChange(e => {
            if (!e.contentHeightChanged) {
                return;
            }
            if (this.#dimension) {
                this.#layoutWidgets(this.#dimension);
            }
        }));
        this.#widgetDisposableStore.add(this.#codeEditorWidget.onDidChangeCursorPosition(e => this.#onDidChangeSelection.fire({ reason: this.#toEditorPaneSelectionChangeReason(e) })));
        this.#widgetDisposableStore.add(this.#codeEditorWidget.onDidChangeModelContent(() => this.#onDidChangeSelection.fire({ reason: 3 /* EditorPaneSelectionChangeReason.EDIT */ })));
        this.#widgetDisposableStore.add(this.#notebookKernelService.onDidChangeNotebookAffinity(this.#syncWithKernel, this));
        this.#widgetDisposableStore.add(this.#notebookKernelService.onDidChangeSelectedNotebooks(this.#syncWithKernel, this));
        this.#widgetDisposableStore.add(this.themeService.onDidColorThemeChange(() => {
            if (this.isVisible()) {
                this.#updateInputDecoration();
            }
        }));
        this.#widgetDisposableStore.add(this.#codeEditorWidget.onDidChangeModelContent(() => {
            if (this.isVisible()) {
                this.#updateInputDecoration();
            }
        }));
        const cursorAtBoundaryContext = INTERACTIVE_INPUT_CURSOR_BOUNDARY.bindTo(this.#contextKeyService);
        if (input.resource && input.historyService.has(input.resource)) {
            cursorAtBoundaryContext.set('top');
        }
        else {
            cursorAtBoundaryContext.set('none');
        }
        this.#widgetDisposableStore.add(this.#codeEditorWidget.onDidChangeCursorPosition(({ position }) => {
            const viewModel = this.#codeEditorWidget._getViewModel();
            const lastLineNumber = viewModel.getLineCount();
            const lastLineCol = viewModel.getLineContent(lastLineNumber).length + 1;
            const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(position);
            const firstLine = viewPosition.lineNumber === 1 && viewPosition.column === 1;
            const lastLine = viewPosition.lineNumber === lastLineNumber && viewPosition.column === lastLineCol;
            if (firstLine) {
                if (lastLine) {
                    cursorAtBoundaryContext.set('both');
                }
                else {
                    cursorAtBoundaryContext.set('top');
                }
            }
            else {
                if (lastLine) {
                    cursorAtBoundaryContext.set('bottom');
                }
                else {
                    cursorAtBoundaryContext.set('none');
                }
            }
        }));
        this.#widgetDisposableStore.add(editorModel.onDidChangeContent(() => {
            const value = editorModel.getValue();
            if (this.input?.resource && value !== '') {
                this.input.historyService.replaceLast(this.input.resource, value);
            }
        }));
        this.#syncWithKernel();
    }
    setOptions(options) {
        this.#notebookWidget.value?.setOptions(options);
        super.setOptions(options);
    }
    #toEditorPaneSelectionChangeReason(e) {
        switch (e.source) {
            case "api" /* TextEditorSelectionSource.PROGRAMMATIC */: return 1 /* EditorPaneSelectionChangeReason.PROGRAMMATIC */;
            case "code.navigation" /* TextEditorSelectionSource.NAVIGATION */: return 4 /* EditorPaneSelectionChangeReason.NAVIGATION */;
            case "code.jump" /* TextEditorSelectionSource.JUMP */: return 5 /* EditorPaneSelectionChangeReason.JUMP */;
            default: return 2 /* EditorPaneSelectionChangeReason.USER */;
        }
    }
    #cellAtBottom(cell) {
        const visibleRanges = this.#notebookWidget.value?.visibleRanges || [];
        const cellIndex = this.#notebookWidget.value?.getCellIndex(cell);
        if (cellIndex === Math.max(...visibleRanges.map(range => range.end - 1))) {
            return true;
        }
        return false;
    }
    #scrollIfNecessary(cvm) {
        const index = this.#notebookWidget.value.getCellIndex(cvm);
        if (index === this.#notebookWidget.value.getLength() - 1) {
            // If we're already at the bottom or auto scroll is enabled, scroll to the bottom
            if (this.configurationService.getValue(InteractiveWindowSetting.interactiveWindowAlwaysScrollOnNewCell) || this.#cellAtBottom(cvm)) {
                this.#notebookWidget.value.scrollToBottom();
            }
        }
    }
    #syncWithKernel() {
        const notebook = this.#notebookWidget.value?.textModel;
        const textModel = this.#codeEditorWidget.getModel();
        if (notebook && textModel) {
            const info = this.#notebookKernelService.getMatchingKernel(notebook);
            const selectedOrSuggested = info.selected
                ?? (info.suggestions.length === 1 ? info.suggestions[0] : undefined)
                ?? (info.all.length === 1 ? info.all[0] : undefined);
            if (selectedOrSuggested) {
                const language = selectedOrSuggested.supportedLanguages[0];
                const newMode = language ? this.#languageService.createById(language).languageId : PLAINTEXT_LANGUAGE_ID;
                textModel.setMode(newMode);
                NOTEBOOK_KERNEL.bindTo(this.#contextKeyService).set(selectedOrSuggested.id);
            }
        }
        this.#updateInputDecoration();
    }
    layout(dimension) {
        this.#rootElement.classList.toggle('mid-width', dimension.width < 1000 && dimension.width >= 600);
        this.#rootElement.classList.toggle('narrow-width', dimension.width < 600);
        this.#dimension = dimension;
        if (!this.#notebookWidget.value) {
            return;
        }
        this.#notebookEditorContainer.style.height = `${this.#dimension.height - this.#inputCellContainerHeight}px`;
        this.#layoutWidgets(dimension);
    }
    #layoutWidgets(dimension) {
        const contentHeight = this.#codeEditorWidget.hasModel() ? this.#codeEditorWidget.getContentHeight() : this.#inputCellEditorHeight;
        const maxHeight = Math.min(dimension.height / 2, contentHeight);
        const { codeCellLeftMargin, cellRunGutter } = this.#notebookOptions.getLayoutConfiguration();
        const leftMargin = codeCellLeftMargin + cellRunGutter;
        const inputCellContainerHeight = maxHeight + INPUT_CELL_VERTICAL_PADDING * 2;
        this.#notebookEditorContainer.style.height = `${dimension.height - inputCellContainerHeight}px`;
        this.#notebookWidget.value.layout(dimension.with(dimension.width, dimension.height - inputCellContainerHeight), this.#notebookEditorContainer);
        this.#codeEditorWidget.layout(this.#validateDimension(dimension.width - leftMargin - INPUT_CELL_HORIZONTAL_PADDING_RIGHT, maxHeight));
        this.#inputFocusIndicator.style.height = `${contentHeight}px`;
        this.#inputCellContainer.style.top = `${dimension.height - inputCellContainerHeight}px`;
        this.#inputCellContainer.style.width = `${dimension.width}px`;
    }
    #validateDimension(width, height) {
        return new DOM.Dimension(Math.max(0, width), Math.max(0, height));
    }
    #updateInputDecoration() {
        if (!this.#codeEditorWidget) {
            return;
        }
        if (!this.#codeEditorWidget.hasModel()) {
            return;
        }
        const model = this.#codeEditorWidget.getModel();
        const decorations = [];
        if (model?.getValueLength() === 0) {
            const transparentForeground = resolveColorValue(editorForeground, this.themeService.getColorTheme())?.transparent(0.4);
            const languageId = model.getLanguageId();
            const keybinding = this.#keybindingService.lookupKeybinding('interactive.execute', this.#contextKeyService)?.getLabel();
            const text = nls.localize('interactiveInputPlaceHolder', "Type '{0}' code here and press {1} to run", languageId, keybinding ?? 'ctrl+enter');
            decorations.push({
                range: {
                    startLineNumber: 0,
                    endLineNumber: 0,
                    startColumn: 0,
                    endColumn: 1
                },
                renderOptions: {
                    after: {
                        contentText: text,
                        color: transparentForeground ? transparentForeground.toString() : undefined
                    }
                }
            });
        }
        this.#codeEditorWidget.setDecorationsByType('interactive-decoration', DECORATION_KEY, decorations);
    }
    focus() {
        this.#codeEditorWidget.focus();
    }
    focusHistory() {
        this.#notebookWidget.value.focus();
    }
    setEditorVisible(visible, group) {
        super.setEditorVisible(visible, group);
        if (group) {
            this.#groupListener.clear();
            this.#groupListener.add(group.onWillCloseEditor(e => this.#saveEditorViewState(e.editor)));
        }
        if (!visible) {
            this.#saveEditorViewState(this.input);
            if (this.input && this.#notebookWidget.value) {
                this.#notebookWidget.value.onWillHide();
            }
        }
    }
    clearInput() {
        if (this.#notebookWidget.value) {
            this.#saveEditorViewState(this.input);
            this.#notebookWidget.value.onWillHide();
        }
        this.#codeEditorWidget?.dispose();
        this.#notebookWidget = { value: undefined };
        this.#widgetDisposableStore.clear();
        super.clearInput();
    }
    getControl() {
        return {
            notebookEditor: this.#notebookWidget.value,
            codeEditor: this.#codeEditorWidget
        };
    }
};
InteractiveEditor = __decorate([
    __param(0, ITelemetryService),
    __param(1, IThemeService),
    __param(2, IStorageService),
    __param(3, IInstantiationService),
    __param(4, INotebookEditorService),
    __param(5, IContextKeyService),
    __param(6, ICodeEditorService),
    __param(7, INotebookKernelService),
    __param(8, ILanguageService),
    __param(9, IKeybindingService),
    __param(10, IConfigurationService),
    __param(11, IMenuService),
    __param(12, IContextMenuService),
    __param(13, IEditorGroupsService),
    __param(14, ITextResourceConfigurationService),
    __param(15, INotebookExecutionStateService),
    __param(16, IExtensionService)
], InteractiveEditor);
export { InteractiveEditor };
