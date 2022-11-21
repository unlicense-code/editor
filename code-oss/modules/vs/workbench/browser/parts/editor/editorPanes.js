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
import { localize } from 'vs/nls';
import { Emitter } from 'vs/base/common/event';
import Severity from 'vs/base/common/severity';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { EditorExtensions } from 'vs/workbench/common/editor';
import { Dimension, show, hide } from 'vs/base/browser/dom';
import { Registry } from 'vs/platform/registry/common/platform';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEditorProgressService, LongRunningOperation } from 'vs/platform/progress/common/progress';
import { DEFAULT_EDITOR_MIN_DIMENSIONS, DEFAULT_EDITOR_MAX_DIMENSIONS } from 'vs/workbench/browser/parts/editor/editor';
import { assertIsDefined } from 'vs/base/common/types';
import { IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
import { ErrorPlaceholderEditor, WorkspaceTrustRequiredPlaceholderEditor } from 'vs/workbench/browser/parts/editor/editorPlaceholder';
import { EditorOpenSource } from 'vs/platform/editor/common/editor';
import { isCancellationError } from 'vs/base/common/errors';
import { isErrorWithActions, toErrorMessage } from 'vs/base/common/errorMessage';
import { ILogService } from 'vs/platform/log/common/log';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
let EditorPanes = class EditorPanes extends Disposable {
    parent;
    groupView;
    layoutService;
    instantiationService;
    editorProgressService;
    workspaceTrustService;
    logService;
    dialogService;
    //#region Events
    _onDidFocus = this._register(new Emitter());
    onDidFocus = this._onDidFocus.event;
    _onDidChangeSizeConstraints = this._register(new Emitter());
    onDidChangeSizeConstraints = this._onDidChangeSizeConstraints.event;
    //#endregion
    get minimumWidth() { return this._activeEditorPane?.minimumWidth ?? DEFAULT_EDITOR_MIN_DIMENSIONS.width; }
    get minimumHeight() { return this._activeEditorPane?.minimumHeight ?? DEFAULT_EDITOR_MIN_DIMENSIONS.height; }
    get maximumWidth() { return this._activeEditorPane?.maximumWidth ?? DEFAULT_EDITOR_MAX_DIMENSIONS.width; }
    get maximumHeight() { return this._activeEditorPane?.maximumHeight ?? DEFAULT_EDITOR_MAX_DIMENSIONS.height; }
    _activeEditorPane = null;
    get activeEditorPane() { return this._activeEditorPane; }
    editorPanes = [];
    activeEditorPaneDisposables = this._register(new DisposableStore());
    pagePosition;
    editorOperation = this._register(new LongRunningOperation(this.editorProgressService));
    editorPanesRegistry = Registry.as(EditorExtensions.EditorPane);
    constructor(parent, groupView, layoutService, instantiationService, editorProgressService, workspaceTrustService, logService, dialogService) {
        super();
        this.parent = parent;
        this.groupView = groupView;
        this.layoutService = layoutService;
        this.instantiationService = instantiationService;
        this.editorProgressService = editorProgressService;
        this.workspaceTrustService = workspaceTrustService;
        this.logService = logService;
        this.dialogService = dialogService;
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.workspaceTrustService.onDidChangeTrust(() => this.onDidChangeWorkspaceTrust()));
    }
    onDidChangeWorkspaceTrust() {
        // If the active editor pane requires workspace trust
        // we need to re-open it anytime trust changes to
        // account for it.
        // For that we explicitly call into the group-view
        // to handle errors properly.
        const editor = this._activeEditorPane?.input;
        const options = this._activeEditorPane?.options;
        if (editor?.hasCapability(16 /* EditorInputCapabilities.RequiresTrust */)) {
            this.groupView.openEditor(editor, options);
        }
    }
    async openEditor(editor, options, context = Object.create(null)) {
        try {
            return await this.doOpenEditor(this.getEditorPaneDescriptor(editor), editor, options, context);
        }
        catch (error) {
            // First check if caller instructed us to ignore error handling
            if (options?.ignoreError) {
                return { error };
            }
            // In case of an error when opening an editor, we still want to show
            // an editor in the desired location to preserve the user intent and
            // view state (e.g. when restoring).
            //
            // For that reason we have place holder editors that can convey a
            // message with actions the user can click on.
            return this.doShowError(error, editor, options, context);
        }
    }
    async doShowError(error, editor, options, context) {
        // Always log the error to figure out what is going on
        this.logService.error(error);
        // Show as modal dialog when explicit user action
        let errorHandled = false;
        if (options?.source === EditorOpenSource.USER) {
            // Extract possible error actions from the error
            let errorActions = undefined;
            if (isErrorWithActions(error)) {
                errorActions = error.actions;
            }
            const buttons = [];
            if (errorActions && errorActions.length > 0) {
                for (const errorAction of errorActions) {
                    buttons.push(errorAction.label);
                }
            }
            else {
                buttons.push(localize('ok', 'OK'));
            }
            let cancelId = undefined;
            if (buttons.length === 1) {
                buttons.push(localize('cancel', "Cancel"));
                cancelId = 1;
            }
            const result = await this.dialogService.show(Severity.Error, localize('editorOpenErrorDialog', "Unable to open '{0}'", editor.getName()), buttons, {
                detail: toErrorMessage(error),
                cancelId
            });
            // Make sure to run any error action if present
            if (result.choice !== cancelId && errorActions) {
                const errorAction = errorActions[result.choice];
                if (errorAction) {
                    const result = errorAction.run();
                    if (result instanceof Promise) {
                        result.catch(error => this.dialogService.show(Severity.Error, toErrorMessage(error)));
                    }
                    errorHandled = true; // consider the error as handled!
                }
            }
        }
        // Return early if the user dealt with the error already
        if (errorHandled) {
            return { error };
        }
        // Show as editor placeholder: pass over the error to display
        const editorPlaceholderOptions = { ...options };
        if (!isCancellationError(error)) {
            editorPlaceholderOptions.error = error;
        }
        return {
            ...(await this.doOpenEditor(ErrorPlaceholderEditor.DESCRIPTOR, editor, editorPlaceholderOptions, context)),
            error
        };
    }
    async doOpenEditor(descriptor, editor, options, context = Object.create(null)) {
        // Editor pane
        const pane = this.doShowEditorPane(descriptor);
        // Apply input to pane
        const { changed, cancelled } = await this.doSetInput(pane, editor, options, context);
        // Focus unless cancelled
        if (!cancelled) {
            const focus = !options || !options.preserveFocus;
            if (focus) {
                pane.focus();
            }
        }
        return { pane, changed, cancelled };
    }
    getEditorPaneDescriptor(editor) {
        if (editor.hasCapability(16 /* EditorInputCapabilities.RequiresTrust */) && !this.workspaceTrustService.isWorkspaceTrusted()) {
            // Workspace trust: if an editor signals it needs workspace trust
            // but the current workspace is untrusted, we fallback to a generic
            // editor descriptor to indicate this an do NOT load the registered
            // editor.
            return WorkspaceTrustRequiredPlaceholderEditor.DESCRIPTOR;
        }
        return assertIsDefined(this.editorPanesRegistry.getEditorPane(editor));
    }
    doShowEditorPane(descriptor) {
        // Return early if the currently active editor pane can handle the input
        if (this._activeEditorPane && descriptor.describes(this._activeEditorPane)) {
            return this._activeEditorPane;
        }
        // Hide active one first
        this.doHideActiveEditorPane();
        // Create editor pane
        const editorPane = this.doCreateEditorPane(descriptor);
        // Set editor as active
        this.doSetActiveEditorPane(editorPane);
        // Show editor
        const container = assertIsDefined(editorPane.getContainer());
        this.parent.appendChild(container);
        show(container);
        // Indicate to editor that it is now visible
        editorPane.setVisible(true, this.groupView);
        // Layout
        if (this.pagePosition) {
            editorPane.layout(new Dimension(this.pagePosition.width, this.pagePosition.height), { top: this.pagePosition.top, left: this.pagePosition.left });
        }
        return editorPane;
    }
    doCreateEditorPane(descriptor) {
        // Instantiate editor
        const editorPane = this.doInstantiateEditorPane(descriptor);
        // Create editor container as needed
        if (!editorPane.getContainer()) {
            const editorPaneContainer = document.createElement('div');
            editorPaneContainer.classList.add('editor-instance');
            editorPane.create(editorPaneContainer);
        }
        return editorPane;
    }
    doInstantiateEditorPane(descriptor) {
        // Return early if already instantiated
        const existingEditorPane = this.editorPanes.find(editorPane => descriptor.describes(editorPane));
        if (existingEditorPane) {
            return existingEditorPane;
        }
        // Otherwise instantiate new
        const editorPane = this._register(descriptor.instantiate(this.instantiationService));
        this.editorPanes.push(editorPane);
        return editorPane;
    }
    doSetActiveEditorPane(editorPane) {
        this._activeEditorPane = editorPane;
        // Clear out previous active editor pane listeners
        this.activeEditorPaneDisposables.clear();
        // Listen to editor pane changes
        if (editorPane) {
            this.activeEditorPaneDisposables.add(editorPane.onDidChangeSizeConstraints(e => this._onDidChangeSizeConstraints.fire(e)));
            this.activeEditorPaneDisposables.add(editorPane.onDidFocus(() => this._onDidFocus.fire()));
        }
        // Indicate that size constraints could have changed due to new editor
        this._onDidChangeSizeConstraints.fire(undefined);
    }
    async doSetInput(editorPane, editor, options, context) {
        // If the input did not change, return early and only
        // apply the options unless the options instruct us to
        // force open it even if it is the same
        const inputMatches = editorPane.input?.matches(editor);
        if (inputMatches && !options?.forceReload) {
            editorPane.setOptions(options);
            return { changed: false, cancelled: false };
        }
        // Start a new editor input operation to report progress
        // and to support cancellation. Any new operation that is
        // started will cancel the previous one.
        const operation = this.editorOperation.start(this.layoutService.isRestored() ? 800 : 3200);
        let cancelled = false;
        try {
            // Clear the current input before setting new input
            // This ensures that a slow loading input will not
            // be visible for the duration of the new input to
            // load (https://github.com/microsoft/vscode/issues/34697)
            editorPane.clearInput();
            // Set the input to the editor pane
            await editorPane.setInput(editor, options, context, operation.token);
            if (!operation.isCurrent()) {
                cancelled = true;
            }
        }
        finally {
            operation.stop();
        }
        return { changed: !inputMatches, cancelled };
    }
    doHideActiveEditorPane() {
        if (!this._activeEditorPane) {
            return;
        }
        // Stop any running operation
        this.editorOperation.stop();
        // Indicate to editor pane before removing the editor from
        // the DOM to give a chance to persist certain state that
        // might depend on still being the active DOM element.
        this._activeEditorPane.clearInput();
        this._activeEditorPane.setVisible(false, this.groupView);
        // Remove editor pane from parent
        const editorPaneContainer = this._activeEditorPane.getContainer();
        if (editorPaneContainer) {
            this.parent.removeChild(editorPaneContainer);
            hide(editorPaneContainer);
        }
        // Clear active editor pane
        this.doSetActiveEditorPane(null);
    }
    closeEditor(editor) {
        if (this._activeEditorPane?.input && editor.matches(this._activeEditorPane.input)) {
            this.doHideActiveEditorPane();
        }
    }
    setVisible(visible) {
        this._activeEditorPane?.setVisible(visible, this.groupView);
    }
    layout(pagePosition) {
        this.pagePosition = pagePosition;
        this._activeEditorPane?.layout(new Dimension(pagePosition.width, pagePosition.height), pagePosition);
    }
};
EditorPanes = __decorate([
    __param(2, IWorkbenchLayoutService),
    __param(3, IInstantiationService),
    __param(4, IEditorProgressService),
    __param(5, IWorkspaceTrustManagementService),
    __param(6, ILogService),
    __param(7, IDialogService)
], EditorPanes);
export { EditorPanes };
