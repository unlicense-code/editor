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
import { toAction } from 'vs/base/common/actions';
import { createErrorWithActions } from 'vs/base/common/errorMessage';
import { Emitter } from 'vs/base/common/event';
import { DisposableStore, MutableDisposable } from 'vs/base/common/lifecycle';
import { extname, isEqual } from 'vs/base/common/resources';
import { generateUuid } from 'vs/base/common/uuid';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { localize } from 'vs/nls';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { EditorPane } from 'vs/workbench/browser/parts/editor/editorPane';
import { DEFAULT_EDITOR_ASSOCIATION, EditorResourceAccessor } from 'vs/workbench/common/editor';
import { SELECT_KERNEL_ID } from 'vs/workbench/contrib/notebook/browser/controller/coreActions';
import { INotebookEditorService } from 'vs/workbench/contrib/notebook/browser/services/notebookEditorService';
import { NotebooKernelActionViewItem } from 'vs/workbench/contrib/notebook/browser/viewParts/notebookKernelView';
import { NOTEBOOK_EDITOR_ID } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { NotebookEditorInput } from 'vs/workbench/contrib/notebook/common/notebookEditorInput';
import { NotebookPerfMarks } from 'vs/workbench/contrib/notebook/common/notebookPerformance';
import { IEditorDropService } from 'vs/workbench/services/editor/browser/editorDropService';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
const NOTEBOOK_EDITOR_VIEW_STATE_PREFERENCE_KEY = 'NotebookEditorViewState';
let NotebookEditor = class NotebookEditor extends EditorPane {
    _instantiationService;
    _editorService;
    _editorGroupService;
    _editorDropService;
    _notebookWidgetService;
    _contextKeyService;
    _fileService;
    static ID = NOTEBOOK_EDITOR_ID;
    _editorMemento;
    _groupListener = this._register(new DisposableStore());
    _widgetDisposableStore = this._register(new DisposableStore());
    _widget = { value: undefined };
    _rootElement;
    _pagePosition;
    _inputListener = this._register(new MutableDisposable());
    // override onDidFocus and onDidBlur to be based on the NotebookEditorWidget element
    _onDidFocusWidget = this._register(new Emitter());
    get onDidFocus() { return this._onDidFocusWidget.event; }
    _onDidBlurWidget = this._register(new Emitter());
    get onDidBlur() { return this._onDidBlurWidget.event; }
    _onDidChangeModel = this._register(new Emitter());
    onDidChangeModel = this._onDidChangeModel.event;
    _onDidChangeSelection = this._register(new Emitter());
    onDidChangeSelection = this._onDidChangeSelection.event;
    constructor(telemetryService, themeService, _instantiationService, storageService, _editorService, _editorGroupService, _editorDropService, _notebookWidgetService, _contextKeyService, _fileService, configurationService) {
        super(NotebookEditor.ID, telemetryService, themeService, storageService);
        this._instantiationService = _instantiationService;
        this._editorService = _editorService;
        this._editorGroupService = _editorGroupService;
        this._editorDropService = _editorDropService;
        this._notebookWidgetService = _notebookWidgetService;
        this._contextKeyService = _contextKeyService;
        this._fileService = _fileService;
        this._editorMemento = this.getEditorMemento(_editorGroupService, configurationService, NOTEBOOK_EDITOR_VIEW_STATE_PREFERENCE_KEY);
        this._register(this._fileService.onDidChangeFileSystemProviderCapabilities(e => this._onDidChangeFileSystemProvider(e.scheme)));
        this._register(this._fileService.onDidChangeFileSystemProviderRegistrations(e => this._onDidChangeFileSystemProvider(e.scheme)));
    }
    _onDidChangeFileSystemProvider(scheme) {
        if (this.input instanceof NotebookEditorInput && this.input.resource?.scheme === scheme) {
            this._updateReadonly(this.input);
        }
    }
    _onDidChangeInputCapabilities(input) {
        if (this.input === input) {
            this._updateReadonly(input);
        }
    }
    _updateReadonly(input) {
        this._widget.value?.setOptions({ isReadOnly: input.hasCapability(2 /* EditorInputCapabilities.Readonly */) });
    }
    get textModel() {
        return this._widget.value?.textModel;
    }
    get minimumWidth() { return 220; }
    get maximumWidth() { return Number.POSITIVE_INFINITY; }
    // these setters need to exist because this extends from EditorPane
    set minimumWidth(value) { }
    set maximumWidth(value) { }
    //#region Editor Core
    get scopedContextKeyService() {
        return this._widget.value?.scopedContextKeyService;
    }
    createEditor(parent) {
        this._rootElement = DOM.append(parent, DOM.$('.notebook-editor'));
        this._rootElement.id = `notebook-editor-element-${generateUuid()}`;
    }
    getActionViewItem(action) {
        if (action.id === SELECT_KERNEL_ID) {
            // this is being disposed by the consumer
            return this._instantiationService.createInstance(NotebooKernelActionViewItem, action, this);
        }
        return undefined;
    }
    getControl() {
        return this._widget.value;
    }
    setEditorVisible(visible, group) {
        super.setEditorVisible(visible, group);
        if (group) {
            this._groupListener.clear();
            this._groupListener.add(group.onWillCloseEditor(e => this._saveEditorViewState(e.editor)));
            this._groupListener.add(group.onDidModelChange(() => {
                if (this._editorGroupService.activeGroup !== group) {
                    this._widget?.value?.updateEditorFocus();
                }
            }));
        }
        if (!visible) {
            this._saveEditorViewState(this.input);
            if (this.input && this._widget.value) {
                // the widget is not transfered to other editor inputs
                this._widget.value.onWillHide();
            }
        }
    }
    focus() {
        super.focus();
        this._widget.value?.focus();
    }
    hasFocus() {
        const activeElement = document.activeElement;
        const value = this._widget.value;
        return !!value && (DOM.isAncestor(activeElement, value.getDomNode() || DOM.isAncestor(activeElement, value.getOverflowContainerDomNode())));
    }
    async setInput(input, options, context, token, noRetry) {
        try {
            const perf = new NotebookPerfMarks();
            perf.mark('startTime');
            const group = this.group;
            this._inputListener.value = input.onDidChangeCapabilities(() => this._onDidChangeInputCapabilities(input));
            this._widgetDisposableStore.clear();
            // there currently is a widget which we still own so
            // we need to hide it before getting a new widget
            this._widget.value?.onWillHide();
            this._widget = this._instantiationService.invokeFunction(this._notebookWidgetService.retrieveWidget, group, input, undefined, this._pagePosition?.dimension);
            if (this._rootElement && this._widget.value.getDomNode()) {
                this._rootElement.setAttribute('aria-flowto', this._widget.value.getDomNode().id || '');
                DOM.setParentFlowTo(this._widget.value.getDomNode(), this._rootElement);
            }
            this._widgetDisposableStore.add(this._widget.value.onDidChangeModel(() => this._onDidChangeModel.fire()));
            this._widgetDisposableStore.add(this._widget.value.onDidChangeActiveCell(() => this._onDidChangeSelection.fire({ reason: 2 /* EditorPaneSelectionChangeReason.USER */ })));
            if (this._pagePosition) {
                this._widget.value.layout(this._pagePosition.dimension, this._rootElement, this._pagePosition.position);
            }
            // only now `setInput` and yield/await. this is AFTER the actual widget is ready. This is very important
            // so that others synchronously receive a notebook editor with the correct widget being set
            await super.setInput(input, options, context, token);
            const model = await input.resolve(perf);
            perf.mark('inputLoaded');
            // Check for cancellation
            if (token.isCancellationRequested) {
                return undefined;
            }
            // The widget has been taken away again. This can happen when the tab has been closed while
            // loading was in progress, in particular when open the same resource as different view type.
            // When this happen, retry once
            if (!this._widget.value) {
                if (noRetry) {
                    return undefined;
                }
                return this.setInput(input, options, context, token, true);
            }
            if (model === null) {
                throw new Error(localize('fail.noEditor', "Cannot open resource with notebook editor type '{0}', please check if you have the right extension installed and enabled.", input.viewType));
            }
            this._widgetDisposableStore.add(model.notebook.onDidChangeContent(() => this._onDidChangeSelection.fire({ reason: 3 /* EditorPaneSelectionChangeReason.EDIT */ })));
            const viewState = options?.viewState ?? this._loadNotebookEditorViewState(input);
            this._widget.value?.setParentContextKeyService(this._contextKeyService);
            await this._widget.value.setModel(model.notebook, viewState, perf);
            const isReadOnly = input.hasCapability(2 /* EditorInputCapabilities.Readonly */);
            await this._widget.value.setOptions({ ...options, isReadOnly });
            this._widgetDisposableStore.add(this._widget.value.onDidFocusWidget(() => this._onDidFocusWidget.fire()));
            this._widgetDisposableStore.add(this._widget.value.onDidBlurWidget(() => this._onDidBlurWidget.fire()));
            this._widgetDisposableStore.add(this._editorDropService.createEditorDropTarget(this._widget.value.getDomNode(), {
                containsGroup: (group) => this.group?.id === group.id
            }));
            perf.mark('editorLoaded');
            const perfMarks = perf.value;
            if (perfMarks) {
                const startTime = perfMarks['startTime'];
                const extensionActivated = perfMarks['extensionActivated'];
                const inputLoaded = perfMarks['inputLoaded'];
                const customMarkdownLoaded = perfMarks['customMarkdownLoaded'];
                const editorLoaded = perfMarks['editorLoaded'];
                if (startTime !== undefined
                    && extensionActivated !== undefined
                    && inputLoaded !== undefined
                    && editorLoaded !== undefined) {
                    this.telemetryService.publicLog2('notebook/editorOpenPerf', {
                        scheme: model.notebook.uri.scheme,
                        ext: extname(model.notebook.uri),
                        viewType: model.notebook.viewType,
                        extensionActivated: extensionActivated - startTime,
                        inputLoaded: inputLoaded - startTime,
                        webviewCommLoaded: inputLoaded - startTime,
                        customMarkdownLoaded: typeof customMarkdownLoaded === 'number' ? customMarkdownLoaded - startTime : undefined,
                        editorLoaded: editorLoaded - startTime
                    });
                }
                else {
                    console.warn(`notebook file open perf marks are broken: startTime ${startTime}, extensionActivated ${extensionActivated}, inputLoaded ${inputLoaded}, customMarkdownLoaded ${customMarkdownLoaded}, editorLoaded ${editorLoaded}`);
                }
            }
        }
        catch (e) {
            console.warn(e);
            const error = createErrorWithActions(e instanceof Error ? e : new Error((e ? e.message : '')), [
                toAction({
                    id: 'workbench.notebook.action.openInTextEditor', label: localize('notebookOpenInTextEditor', "Open in Text Editor"), run: async () => {
                        const activeEditorPane = this._editorService.activeEditorPane;
                        if (!activeEditorPane) {
                            return;
                        }
                        const activeEditorResource = EditorResourceAccessor.getCanonicalUri(activeEditorPane.input);
                        if (!activeEditorResource) {
                            return;
                        }
                        if (activeEditorResource.toString() === input.resource?.toString()) {
                            // Replace the current editor with the text editor
                            return this._editorService.openEditor({
                                resource: activeEditorResource,
                                options: {
                                    override: DEFAULT_EDITOR_ASSOCIATION.id,
                                    pinned: true // new file gets pinned by default
                                }
                            });
                        }
                        return;
                    }
                })
            ]);
            throw error;
        }
    }
    clearInput() {
        this._inputListener.clear();
        if (this._widget.value) {
            this._saveEditorViewState(this.input);
            this._widget.value.onWillHide();
        }
        super.clearInput();
    }
    setOptions(options) {
        this._widget.value?.setOptions(options);
        super.setOptions(options);
    }
    saveState() {
        this._saveEditorViewState(this.input);
        super.saveState();
    }
    getViewState() {
        const input = this.input;
        if (!(input instanceof NotebookEditorInput)) {
            return undefined;
        }
        this._saveEditorViewState(input);
        return this._loadNotebookEditorViewState(input);
    }
    getSelection() {
        if (this._widget.value) {
            const cellUri = this._widget.value.getActiveCell()?.uri;
            if (cellUri) {
                return new NotebookEditorSelection(cellUri);
            }
        }
        return undefined;
    }
    _saveEditorViewState(input) {
        if (this.group && this._widget.value && input instanceof NotebookEditorInput) {
            if (this._widget.value.isDisposed) {
                return;
            }
            const state = this._widget.value.getEditorViewState();
            this._editorMemento.saveEditorState(this.group, input.resource, state);
        }
    }
    _loadNotebookEditorViewState(input) {
        let result;
        if (this.group) {
            result = this._editorMemento.loadEditorState(this.group, input.resource);
        }
        if (result) {
            return result;
        }
        // when we don't have a view state for the group/input-tuple then we try to use an existing
        // editor for the same resource.
        for (const group of this._editorGroupService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */)) {
            if (group.activeEditorPane !== this && group.activeEditorPane instanceof NotebookEditor && group.activeEditor?.matches(input)) {
                return group.activeEditorPane._widget.value?.getEditorViewState();
            }
        }
        return;
    }
    layout(dimension, position) {
        this._rootElement.classList.toggle('mid-width', dimension.width < 1000 && dimension.width >= 600);
        this._rootElement.classList.toggle('narrow-width', dimension.width < 600);
        this._pagePosition = { dimension, position };
        if (!this._widget.value || !(this._input instanceof NotebookEditorInput)) {
            return;
        }
        if (this._input.resource.toString() !== this.textModel?.uri.toString() && this._widget.value?.hasModel()) {
            // input and widget mismatch
            // this happens when
            // 1. open document A, pin the document
            // 2. open document B
            // 3. close document B
            // 4. a layout is triggered
            return;
        }
        this._widget.value.layout(dimension, this._rootElement, position);
    }
};
NotebookEditor = __decorate([
    __param(0, ITelemetryService),
    __param(1, IThemeService),
    __param(2, IInstantiationService),
    __param(3, IStorageService),
    __param(4, IEditorService),
    __param(5, IEditorGroupsService),
    __param(6, IEditorDropService),
    __param(7, INotebookEditorService),
    __param(8, IContextKeyService),
    __param(9, IFileService),
    __param(10, ITextResourceConfigurationService)
], NotebookEditor);
export { NotebookEditor };
class NotebookEditorSelection {
    cellUri;
    constructor(cellUri) {
        this.cellUri = cellUri;
    }
    compare(other) {
        if (!(other instanceof NotebookEditorSelection)) {
            return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
        }
        if (isEqual(this.cellUri, other.cellUri)) {
            return 1 /* EditorPaneSelectionCompareResult.IDENTICAL */;
        }
        return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
    }
    restore(options) {
        const notebookOptions = {
            cellOptions: {
                resource: this.cellUri
            }
        };
        Object.assign(notebookOptions, options);
        return notebookOptions;
    }
    log() {
        return this.cellUri.fragment;
    }
}
