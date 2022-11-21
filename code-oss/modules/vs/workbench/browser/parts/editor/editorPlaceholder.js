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
import 'vs/css!./media/editorplaceholder';
import { localize } from 'vs/nls';
import Severity from 'vs/base/common/severity';
import { EditorPane } from 'vs/workbench/browser/parts/editor/editorPane';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { DomScrollableElement } from 'vs/base/browser/ui/scrollbar/scrollableElement';
import { IThemeService, registerThemingParticipant } from 'vs/platform/theme/common/themeService';
import { size, clearNode, $ } from 'vs/base/browser/dom';
import { DisposableStore, MutableDisposable } from 'vs/base/common/lifecycle';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { assertIsDefined, assertAllDefined } from 'vs/base/common/types';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IWorkspaceContextService, isSingleFolderWorkspaceIdentifier, toWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
import { EditorOpenSource } from 'vs/platform/editor/common/editor';
import { computeEditorAriaLabel, EditorPaneDescriptor } from 'vs/workbench/browser/editor';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Link } from 'vs/platform/opener/browser/link';
import { SimpleIconLabel } from 'vs/base/browser/ui/iconLabel/simpleIconLabel';
import { editorErrorForeground, editorInfoForeground, editorWarningForeground } from 'vs/platform/theme/common/colorRegistry';
import { Codicon } from 'vs/base/common/codicons';
import { IFileService } from 'vs/platform/files/common/files';
import { isErrorWithActions, toErrorMessage } from 'vs/base/common/errorMessage';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { truncate } from 'vs/base/common/strings';
let EditorPlaceholder = class EditorPlaceholder extends EditorPane {
    instantiationService;
    static PLACEHOLDER_LABEL_MAX_LENGTH = 1024;
    container;
    scrollbar;
    inputDisposable = this._register(new MutableDisposable());
    constructor(id, telemetryService, themeService, storageService, instantiationService) {
        super(id, telemetryService, themeService, storageService);
        this.instantiationService = instantiationService;
    }
    createEditor(parent) {
        // Container
        this.container = document.createElement('div');
        this.container.className = 'monaco-editor-pane-placeholder';
        this.container.style.outline = 'none';
        this.container.tabIndex = 0; // enable focus support from the editor part (do not remove)
        // Custom Scrollbars
        this.scrollbar = this._register(new DomScrollableElement(this.container, { horizontal: 1 /* ScrollbarVisibility.Auto */, vertical: 1 /* ScrollbarVisibility.Auto */ }));
        parent.appendChild(this.scrollbar.getDomNode());
    }
    async setInput(input, options, context, token) {
        await super.setInput(input, options, context, token);
        // Check for cancellation
        if (token.isCancellationRequested) {
            return;
        }
        // Render Input
        this.inputDisposable.value = await this.renderInput(input, options);
    }
    async renderInput(input, options) {
        const [container, scrollbar] = assertAllDefined(this.container, this.scrollbar);
        // Reset any previous contents
        clearNode(container);
        // Delegate to implementation for contents
        const disposables = new DisposableStore();
        const { icon, label, actions } = await this.getContents(input, options, disposables);
        const truncatedLabel = truncate(label, EditorPlaceholder.PLACEHOLDER_LABEL_MAX_LENGTH);
        // Icon
        const iconContainer = container.appendChild($('.editor-placeholder-icon-container'));
        const iconWidget = new SimpleIconLabel(iconContainer);
        iconWidget.text = icon;
        // Label
        const labelContainer = container.appendChild($('.editor-placeholder-label-container'));
        const labelWidget = document.createElement('span');
        labelWidget.textContent = truncatedLabel;
        labelContainer.appendChild(labelWidget);
        // ARIA label
        container.setAttribute('aria-label', `${computeEditorAriaLabel(input, undefined, this.group, undefined)}, ${truncatedLabel}`);
        // Actions
        const actionsContainer = container.appendChild($('.editor-placeholder-actions-container'));
        for (const action of actions) {
            disposables.add(this.instantiationService.createInstance(Link, actionsContainer, {
                label: action.label,
                href: ''
            }, {
                opener: () => action.run()
            }));
        }
        // Adjust scrollbar
        scrollbar.scanDomNode();
        return disposables;
    }
    clearInput() {
        if (this.container) {
            clearNode(this.container);
        }
        this.inputDisposable.clear();
        super.clearInput();
    }
    layout(dimension) {
        const [container, scrollbar] = assertAllDefined(this.container, this.scrollbar);
        // Pass on to Container
        size(container, dimension.width, dimension.height);
        // Adjust scrollbar
        scrollbar.scanDomNode();
        // Toggle responsive class
        container.classList.toggle('max-height-200px', dimension.height <= 200);
    }
    focus() {
        const container = assertIsDefined(this.container);
        container.focus();
    }
    dispose() {
        this.container?.remove();
        super.dispose();
    }
};
EditorPlaceholder = __decorate([
    __param(1, ITelemetryService),
    __param(2, IThemeService),
    __param(3, IStorageService),
    __param(4, IInstantiationService)
], EditorPlaceholder);
export { EditorPlaceholder };
let WorkspaceTrustRequiredPlaceholderEditor = class WorkspaceTrustRequiredPlaceholderEditor extends EditorPlaceholder {
    commandService;
    workspaceService;
    static ID = 'workbench.editors.workspaceTrustRequiredEditor';
    static LABEL = localize('trustRequiredEditor', "Workspace Trust Required");
    static DESCRIPTOR = EditorPaneDescriptor.create(WorkspaceTrustRequiredPlaceholderEditor, WorkspaceTrustRequiredPlaceholderEditor.ID, WorkspaceTrustRequiredPlaceholderEditor.LABEL);
    constructor(telemetryService, themeService, commandService, workspaceService, storageService, instantiationService) {
        super(WorkspaceTrustRequiredPlaceholderEditor.ID, telemetryService, themeService, storageService, instantiationService);
        this.commandService = commandService;
        this.workspaceService = workspaceService;
    }
    getTitle() {
        return WorkspaceTrustRequiredPlaceholderEditor.LABEL;
    }
    async getContents() {
        return {
            icon: '$(workspace-untrusted)',
            label: isSingleFolderWorkspaceIdentifier(toWorkspaceIdentifier(this.workspaceService.getWorkspace())) ?
                localize('requiresFolderTrustText', "The file is not displayed in the editor because trust has not been granted to the folder.") :
                localize('requiresWorkspaceTrustText', "The file is not displayed in the editor because trust has not been granted to the workspace."),
            actions: [
                {
                    label: localize('manageTrust', "Manage Workspace Trust"),
                    run: () => this.commandService.executeCommand('workbench.trust.manage')
                }
            ]
        };
    }
};
WorkspaceTrustRequiredPlaceholderEditor = __decorate([
    __param(0, ITelemetryService),
    __param(1, IThemeService),
    __param(2, ICommandService),
    __param(3, IWorkspaceContextService),
    __param(4, IStorageService),
    __param(5, IInstantiationService)
], WorkspaceTrustRequiredPlaceholderEditor);
export { WorkspaceTrustRequiredPlaceholderEditor };
let ErrorPlaceholderEditor = class ErrorPlaceholderEditor extends EditorPlaceholder {
    fileService;
    dialogService;
    static ID = 'workbench.editors.errorEditor';
    static LABEL = localize('errorEditor', "Error Editor");
    static DESCRIPTOR = EditorPaneDescriptor.create(ErrorPlaceholderEditor, ErrorPlaceholderEditor.ID, ErrorPlaceholderEditor.LABEL);
    constructor(telemetryService, themeService, storageService, instantiationService, fileService, dialogService) {
        super(ErrorPlaceholderEditor.ID, telemetryService, themeService, storageService, instantiationService);
        this.fileService = fileService;
        this.dialogService = dialogService;
    }
    async getContents(input, options, disposables) {
        const resource = input.resource;
        const group = this.group;
        const error = options.error;
        const isFileNotFound = error?.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */;
        // Error Label
        let label;
        if (isFileNotFound) {
            label = localize('unavailableResourceErrorEditorText', "The editor could not be opened because the file was not found.");
        }
        else if (error) {
            label = localize('unknownErrorEditorTextWithError', "The editor could not be opened due to an unexpected error: {0}", toErrorMessage(error));
        }
        else {
            label = localize('unknownErrorEditorTextWithoutError', "The editor could not be opened due to an unexpected error.");
        }
        // Actions
        let actions = undefined;
        if (isErrorWithActions(error) && error.actions.length > 0) {
            actions = error.actions.map(action => {
                return {
                    label: action.label,
                    run: () => {
                        const result = action.run();
                        if (result instanceof Promise) {
                            result.catch(error => this.dialogService.show(Severity.Error, toErrorMessage(error)));
                        }
                    }
                };
            });
        }
        else if (group) {
            actions = [
                {
                    label: localize('retry', "Try Again"),
                    run: () => group.openEditor(input, { ...options, source: EditorOpenSource.USER /* explicit user gesture */ })
                }
            ];
        }
        // Auto-reload when file is added
        if (group && isFileNotFound && resource && this.fileService.hasProvider(resource)) {
            disposables.add(this.fileService.onDidFilesChange(e => {
                if (e.contains(resource, 1 /* FileChangeType.ADDED */, 0 /* FileChangeType.UPDATED */)) {
                    group.openEditor(input, options);
                }
            }));
        }
        return { icon: '$(error)', label, actions: actions ?? [] };
    }
};
ErrorPlaceholderEditor = __decorate([
    __param(0, ITelemetryService),
    __param(1, IThemeService),
    __param(2, IStorageService),
    __param(3, IInstantiationService),
    __param(4, IFileService),
    __param(5, IDialogService)
], ErrorPlaceholderEditor);
export { ErrorPlaceholderEditor };
registerThemingParticipant((theme, collector) => {
    // Editor Placeholder Error Icon
    const editorErrorIconForegroundColor = theme.getColor(editorErrorForeground);
    if (editorErrorIconForegroundColor) {
        collector.addRule(`
		.monaco-editor-pane-placeholder .editor-placeholder-icon-container ${Codicon.error.cssSelector} {
			color: ${editorErrorIconForegroundColor};
		}`);
    }
    // Editor Placeholder Warning Icon
    const editorWarningIconForegroundColor = theme.getColor(editorWarningForeground);
    if (editorWarningIconForegroundColor) {
        collector.addRule(`
		.monaco-editor-pane-placeholder .editor-placeholder-icon-container ${Codicon.warning.cssSelector} {
			color: ${editorWarningIconForegroundColor};
		}`);
    }
    // Editor Placeholder Info/Trust Icon
    const editorInfoIconForegroundColor = theme.getColor(editorInfoForeground);
    if (editorInfoIconForegroundColor) {
        collector.addRule(`
		.monaco-editor-pane-placeholder .editor-placeholder-icon-container ${Codicon.info.cssSelector},
		.monaco-editor-pane-placeholder .editor-placeholder-icon-container ${Codicon.workspaceUntrusted.cssSelector} {
			color: ${editorInfoIconForegroundColor};
		}`);
    }
});
