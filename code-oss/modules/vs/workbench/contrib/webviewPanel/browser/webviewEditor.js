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
import { Emitter } from 'vs/base/common/event';
import { DisposableStore, MutableDisposable } from 'vs/base/common/lifecycle';
import { isWeb } from 'vs/base/common/platform';
import { generateUuid } from 'vs/base/common/uuid';
import * as nls from 'vs/nls';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { EditorPane } from 'vs/workbench/browser/parts/editor/editorPane';
import { WebviewWindowDragMonitor } from 'vs/workbench/contrib/webview/browser/webviewWindowDragMonitor';
import { WebviewInput } from 'vs/workbench/contrib/webviewPanel/browser/webviewEditorInput';
import { IEditorDropService } from 'vs/workbench/services/editor/browser/editorDropService';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
/**
 * Tracks the id of the actively focused webview.
 */
export const CONTEXT_ACTIVE_WEBVIEW_PANEL_ID = new RawContextKey('activeWebviewPanelId', '', {
    type: 'string',
    description: nls.localize('context.activeWebviewId', "The viewType of the currently active webview panel."),
});
let WebviewEditor = class WebviewEditor extends EditorPane {
    _editorService;
    _workbenchLayoutService;
    _editorDropService;
    _hostService;
    _contextKeyService;
    static ID = 'WebviewEditor';
    _element;
    _dimension;
    _visible = false;
    _isDisposed = false;
    _webviewVisibleDisposables = this._register(new DisposableStore());
    _onFocusWindowHandler = this._register(new MutableDisposable());
    _onDidFocusWebview = this._register(new Emitter());
    get onDidFocus() { return this._onDidFocusWebview.event; }
    _scopedContextKeyService = this._register(new MutableDisposable());
    constructor(telemetryService, themeService, storageService, editorGroupsService, _editorService, _workbenchLayoutService, _editorDropService, _hostService, _contextKeyService) {
        super(WebviewEditor.ID, telemetryService, themeService, storageService);
        this._editorService = _editorService;
        this._workbenchLayoutService = _workbenchLayoutService;
        this._editorDropService = _editorDropService;
        this._hostService = _hostService;
        this._contextKeyService = _contextKeyService;
        this._register(editorGroupsService.onDidScroll(() => {
            if (this.webview && this._visible) {
                this.synchronizeWebviewContainerDimensions(this.webview);
            }
        }));
    }
    get webview() {
        return this.input instanceof WebviewInput ? this.input.webview : undefined;
    }
    get scopedContextKeyService() {
        return this._scopedContextKeyService.value;
    }
    createEditor(parent) {
        const element = document.createElement('div');
        this._element = element;
        this._element.id = `webview-editor-element-${generateUuid()}`;
        parent.appendChild(element);
        this._scopedContextKeyService.value = this._contextKeyService.createScoped(element);
    }
    dispose() {
        this._isDisposed = true;
        this._element?.remove();
        this._element = undefined;
        super.dispose();
    }
    layout(dimension) {
        this._dimension = dimension;
        if (this.webview && this._visible) {
            this.synchronizeWebviewContainerDimensions(this.webview, dimension);
        }
    }
    focus() {
        super.focus();
        if (!this._onFocusWindowHandler.value && !isWeb) {
            // Make sure we restore focus when switching back to a VS Code window
            this._onFocusWindowHandler.value = this._hostService.onDidChangeFocus(focused => {
                if (focused && this._editorService.activeEditorPane === this && this._workbenchLayoutService.hasFocus("workbench.parts.editor" /* Parts.EDITOR_PART */)) {
                    this.focus();
                }
            });
        }
        this.webview?.focus();
    }
    setEditorVisible(visible, group) {
        this._visible = visible;
        if (this.input instanceof WebviewInput && this.webview) {
            if (visible) {
                this.claimWebview(this.input);
            }
            else {
                this.webview.release(this);
            }
        }
        super.setEditorVisible(visible, group);
    }
    clearInput() {
        if (this.webview) {
            this.webview.release(this);
            this._webviewVisibleDisposables.clear();
        }
        super.clearInput();
    }
    async setInput(input, options, context, token) {
        if (this.input && input.matches(this.input)) {
            return;
        }
        const alreadyOwnsWebview = input instanceof WebviewInput && input.webview === this.webview;
        if (this.webview && !alreadyOwnsWebview) {
            this.webview.release(this);
        }
        await super.setInput(input, options, context, token);
        await input.resolve();
        if (token.isCancellationRequested || this._isDisposed) {
            return;
        }
        if (input instanceof WebviewInput) {
            if (this.group) {
                input.updateGroup(this.group.id);
            }
            if (!alreadyOwnsWebview) {
                this.claimWebview(input);
            }
            if (this._dimension) {
                this.layout(this._dimension);
            }
        }
    }
    claimWebview(input) {
        input.webview.claim(this, this.scopedContextKeyService);
        if (this._element) {
            this._element.setAttribute('aria-flowto', input.webview.container.id);
            DOM.setParentFlowTo(input.webview.container, this._element);
        }
        this._webviewVisibleDisposables.clear();
        // Webviews are not part of the normal editor dom, so we have to register our own drag and drop handler on them.
        this._webviewVisibleDisposables.add(this._editorDropService.createEditorDropTarget(input.webview.container, {
            containsGroup: (group) => this.group?.id === group.id
        }));
        this._webviewVisibleDisposables.add(new WebviewWindowDragMonitor(() => this.webview));
        this.synchronizeWebviewContainerDimensions(input.webview);
        this._webviewVisibleDisposables.add(this.trackFocus(input.webview));
    }
    synchronizeWebviewContainerDimensions(webview, dimension) {
        if (!this._element) {
            return;
        }
        const rootContainer = this._workbenchLayoutService.getContainer("workbench.parts.editor" /* Parts.EDITOR_PART */);
        webview.layoutWebviewOverElement(this._element.parentElement, dimension, rootContainer);
    }
    trackFocus(webview) {
        const store = new DisposableStore();
        // Track focus in webview content
        const webviewContentFocusTracker = DOM.trackFocus(webview.container);
        store.add(webviewContentFocusTracker);
        store.add(webviewContentFocusTracker.onDidFocus(() => this._onDidFocusWebview.fire()));
        // Track focus in webview element
        store.add(webview.onDidFocus(() => this._onDidFocusWebview.fire()));
        return store;
    }
};
WebviewEditor = __decorate([
    __param(0, ITelemetryService),
    __param(1, IThemeService),
    __param(2, IStorageService),
    __param(3, IEditorGroupsService),
    __param(4, IEditorService),
    __param(5, IWorkbenchLayoutService),
    __param(6, IEditorDropService),
    __param(7, IHostService),
    __param(8, IContextKeyService)
], WebviewEditor);
export { WebviewEditor };
