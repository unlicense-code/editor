/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { toExtensionData, shouldSerializeBuffersForPostMessage } from 'vs/workbench/api/common/extHostWebview';
import { ViewBadge } from 'vs/workbench/api/common/extHostTypeConverters';
import * as extHostProtocol from './extHost.protocol';
import * as extHostTypes from './extHostTypes';
class ExtHostWebviewView extends Disposable {
    #handle;
    #proxy;
    #viewType;
    #webview;
    #isDisposed = false;
    #isVisible;
    #title;
    #description;
    #badge;
    constructor(handle, proxy, viewType, title, webview, isVisible) {
        super();
        this.#viewType = viewType;
        this.#title = title;
        this.#handle = handle;
        this.#proxy = proxy;
        this.#webview = webview;
        this.#isVisible = isVisible;
    }
    dispose() {
        if (this.#isDisposed) {
            return;
        }
        this.#isDisposed = true;
        this.#onDidDispose.fire();
        this.#webview.dispose();
        super.dispose();
    }
    #onDidChangeVisibility = this._register(new Emitter());
    onDidChangeVisibility = this.#onDidChangeVisibility.event;
    #onDidDispose = this._register(new Emitter());
    onDidDispose = this.#onDidDispose.event;
    get title() {
        this.assertNotDisposed();
        return this.#title;
    }
    set title(value) {
        this.assertNotDisposed();
        if (this.#title !== value) {
            this.#title = value;
            this.#proxy.$setWebviewViewTitle(this.#handle, value);
        }
    }
    get description() {
        this.assertNotDisposed();
        return this.#description;
    }
    set description(value) {
        this.assertNotDisposed();
        if (this.#description !== value) {
            this.#description = value;
            this.#proxy.$setWebviewViewDescription(this.#handle, value);
        }
    }
    get visible() { return this.#isVisible; }
    get webview() { return this.#webview; }
    get viewType() { return this.#viewType; }
    /* internal */ _setVisible(visible) {
        if (visible === this.#isVisible || this.#isDisposed) {
            return;
        }
        this.#isVisible = visible;
        this.#onDidChangeVisibility.fire();
    }
    get badge() {
        this.assertNotDisposed();
        return this.#badge;
    }
    set badge(badge) {
        this.assertNotDisposed();
        if (badge?.value === this.#badge?.value &&
            badge?.tooltip === this.#badge?.tooltip) {
            return;
        }
        this.#badge = ViewBadge.from(badge);
        this.#proxy.$setWebviewViewBadge(this.#handle, badge);
    }
    show(preserveFocus) {
        this.assertNotDisposed();
        this.#proxy.$show(this.#handle, !!preserveFocus);
    }
    assertNotDisposed() {
        if (this.#isDisposed) {
            throw new Error('Webview is disposed');
        }
    }
}
export class ExtHostWebviewViews {
    _extHostWebview;
    _proxy;
    _viewProviders = new Map();
    _webviewViews = new Map();
    constructor(mainContext, _extHostWebview) {
        this._extHostWebview = _extHostWebview;
        this._proxy = mainContext.getProxy(extHostProtocol.MainContext.MainThreadWebviewViews);
    }
    registerWebviewViewProvider(extension, viewType, provider, webviewOptions) {
        if (this._viewProviders.has(viewType)) {
            throw new Error(`View provider for '${viewType}' already registered`);
        }
        this._viewProviders.set(viewType, { provider, extension });
        this._proxy.$registerWebviewViewProvider(toExtensionData(extension), viewType, {
            retainContextWhenHidden: webviewOptions?.retainContextWhenHidden,
            serializeBuffersForPostMessage: shouldSerializeBuffersForPostMessage(extension),
        });
        return new extHostTypes.Disposable(() => {
            this._viewProviders.delete(viewType);
            this._proxy.$unregisterWebviewViewProvider(viewType);
        });
    }
    async $resolveWebviewView(webviewHandle, viewType, title, state, cancellation) {
        const entry = this._viewProviders.get(viewType);
        if (!entry) {
            throw new Error(`No view provider found for '${viewType}'`);
        }
        const { provider, extension } = entry;
        const webview = this._extHostWebview.createNewWebview(webviewHandle, { /* todo */}, extension);
        const revivedView = new ExtHostWebviewView(webviewHandle, this._proxy, viewType, title, webview, true);
        this._webviewViews.set(webviewHandle, revivedView);
        await provider.resolveWebviewView(revivedView, { state }, cancellation);
    }
    async $onDidChangeWebviewViewVisibility(webviewHandle, visible) {
        const webviewView = this.getWebviewView(webviewHandle);
        webviewView._setVisible(visible);
    }
    async $disposeWebviewView(webviewHandle) {
        const webviewView = this.getWebviewView(webviewHandle);
        this._webviewViews.delete(webviewHandle);
        webviewView.dispose();
        this._extHostWebview.deleteWebview(webviewHandle);
    }
    getWebviewView(handle) {
        const entry = this._webviewViews.get(handle);
        if (!entry) {
            throw new Error('No webview found');
        }
        return entry;
    }
}
