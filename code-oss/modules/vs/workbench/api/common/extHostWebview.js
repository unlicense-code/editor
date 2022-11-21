/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Schemas } from 'vs/base/common/network';
import * as objects from 'vs/base/common/objects';
import { URI } from 'vs/base/common/uri';
import { normalizeVersion, parseVersion } from 'vs/platform/extensions/common/extensionValidator';
import { deserializeWebviewMessage, serializeWebviewMessage } from 'vs/workbench/api/common/extHostWebviewMessaging';
import { asWebviewUri, webviewGenericCspSource } from 'vs/workbench/contrib/webview/common/webview';
import * as extHostProtocol from './extHost.protocol';
export class ExtHostWebview {
    #handle;
    #proxy;
    #deprecationService;
    #remoteInfo;
    #workspace;
    #extension;
    #html = '';
    #options;
    #isDisposed = false;
    #hasCalledAsWebviewUri = false;
    #serializeBuffersForPostMessage;
    #shouldRewriteOldResourceUris;
    constructor(handle, proxy, options, remoteInfo, workspace, extension, deprecationService) {
        this.#handle = handle;
        this.#proxy = proxy;
        this.#options = options;
        this.#remoteInfo = remoteInfo;
        this.#workspace = workspace;
        this.#extension = extension;
        this.#serializeBuffersForPostMessage = shouldSerializeBuffersForPostMessage(extension);
        this.#shouldRewriteOldResourceUris = shouldTryRewritingOldResourceUris(extension);
        this.#deprecationService = deprecationService;
    }
    /* internal */ _onMessageEmitter = new Emitter();
    onDidReceiveMessage = this._onMessageEmitter.event;
    #onDidDisposeEmitter = new Emitter();
    /* internal */ _onDidDispose = this.#onDidDisposeEmitter.event;
    dispose() {
        this.#isDisposed = true;
        this.#onDidDisposeEmitter.fire();
        this.#onDidDisposeEmitter.dispose();
        this._onMessageEmitter.dispose();
    }
    asWebviewUri(resource) {
        this.#hasCalledAsWebviewUri = true;
        return asWebviewUri(resource, this.#remoteInfo);
    }
    get cspSource() {
        const extensionLocation = this.#extension.extensionLocation;
        if (extensionLocation.scheme === Schemas.https || extensionLocation.scheme === Schemas.http) {
            // The extension is being served up from a CDN.
            // Also include the CDN in the default csp.
            let extensionCspRule = extensionLocation.toString();
            if (!extensionCspRule.endsWith('/')) {
                // Always treat the location as a directory so that we allow all content under it
                extensionCspRule += '/';
            }
            return extensionCspRule + ' ' + webviewGenericCspSource;
        }
        return webviewGenericCspSource;
    }
    get html() {
        this.assertNotDisposed();
        return this.#html;
    }
    set html(value) {
        this.assertNotDisposed();
        if (this.#html !== value) {
            this.#html = value;
            if (this.#shouldRewriteOldResourceUris && !this.#hasCalledAsWebviewUri && /(["'])vscode-resource:([^\s'"]+?)(["'])/i.test(value)) {
                this.#hasCalledAsWebviewUri = true;
                this.#deprecationService.report('Webview vscode-resource: uris', this.#extension, `Please migrate to use the 'webview.asWebviewUri' api instead: https://aka.ms/vscode-webview-use-aswebviewuri`);
            }
            this.#proxy.$setHtml(this.#handle, this.rewriteOldResourceUrlsIfNeeded(value));
        }
    }
    get options() {
        this.assertNotDisposed();
        return this.#options;
    }
    set options(newOptions) {
        this.assertNotDisposed();
        if (!objects.equals(this.#options, newOptions)) {
            this.#proxy.$setOptions(this.#handle, serializeWebviewOptions(this.#extension, this.#workspace, newOptions));
        }
        this.#options = newOptions;
    }
    async postMessage(message) {
        if (this.#isDisposed) {
            return false;
        }
        const serialized = serializeWebviewMessage(message, { serializeBuffersForPostMessage: this.#serializeBuffersForPostMessage });
        return this.#proxy.$postMessage(this.#handle, serialized.message, ...serialized.buffers);
    }
    assertNotDisposed() {
        if (this.#isDisposed) {
            throw new Error('Webview is disposed');
        }
    }
    rewriteOldResourceUrlsIfNeeded(value) {
        if (!this.#shouldRewriteOldResourceUris) {
            return value;
        }
        const isRemote = this.#extension.extensionLocation?.scheme === Schemas.vscodeRemote;
        const remoteAuthority = this.#extension.extensionLocation.scheme === Schemas.vscodeRemote ? this.#extension.extensionLocation.authority : undefined;
        return value
            .replace(/(["'])(?:vscode-resource):(\/\/([^\s\/'"]+?)(?=\/))?([^\s'"]+?)(["'])/gi, (_match, startQuote, _1, scheme, path, endQuote) => {
            const uri = URI.from({
                scheme: scheme || 'file',
                path: decodeURIComponent(path),
            });
            const webviewUri = asWebviewUri(uri, { isRemote, authority: remoteAuthority }).toString();
            return `${startQuote}${webviewUri}${endQuote}`;
        })
            .replace(/(["'])(?:vscode-webview-resource):(\/\/[^\s\/'"]+\/([^\s\/'"]+?)(?=\/))?([^\s'"]+?)(["'])/gi, (_match, startQuote, _1, scheme, path, endQuote) => {
            const uri = URI.from({
                scheme: scheme || 'file',
                path: decodeURIComponent(path),
            });
            const webviewUri = asWebviewUri(uri, { isRemote, authority: remoteAuthority }).toString();
            return `${startQuote}${webviewUri}${endQuote}`;
        });
    }
}
export function shouldSerializeBuffersForPostMessage(extension) {
    try {
        const version = normalizeVersion(parseVersion(extension.engines.vscode));
        return !!version && version.majorBase >= 1 && version.minorBase >= 57;
    }
    catch {
        return false;
    }
}
function shouldTryRewritingOldResourceUris(extension) {
    try {
        const version = normalizeVersion(parseVersion(extension.engines.vscode));
        if (!version) {
            return false;
        }
        return version.majorBase < 1 || (version.majorBase === 1 && version.minorBase < 60);
    }
    catch {
        return false;
    }
}
export class ExtHostWebviews {
    remoteInfo;
    workspace;
    _logService;
    _deprecationService;
    _webviewProxy;
    _webviews = new Map();
    constructor(mainContext, remoteInfo, workspace, _logService, _deprecationService) {
        this.remoteInfo = remoteInfo;
        this.workspace = workspace;
        this._logService = _logService;
        this._deprecationService = _deprecationService;
        this._webviewProxy = mainContext.getProxy(extHostProtocol.MainContext.MainThreadWebviews);
    }
    $onMessage(handle, jsonMessage, buffers) {
        const webview = this.getWebview(handle);
        if (webview) {
            const { message } = deserializeWebviewMessage(jsonMessage, buffers.value);
            webview._onMessageEmitter.fire(message);
        }
    }
    $onMissingCsp(_handle, extensionId) {
        this._logService.warn(`${extensionId} created a webview without a content security policy: https://aka.ms/vscode-webview-missing-csp`);
    }
    createNewWebview(handle, options, extension) {
        const webview = new ExtHostWebview(handle, this._webviewProxy, reviveOptions(options), this.remoteInfo, this.workspace, extension, this._deprecationService);
        this._webviews.set(handle, webview);
        webview._onDidDispose(() => { this._webviews.delete(handle); });
        return webview;
    }
    deleteWebview(handle) {
        this._webviews.delete(handle);
    }
    getWebview(handle) {
        return this._webviews.get(handle);
    }
}
export function toExtensionData(extension) {
    return { id: extension.identifier, location: extension.extensionLocation };
}
export function serializeWebviewOptions(extension, workspace, options) {
    return {
        enableCommandUris: options.enableCommandUris,
        enableScripts: options.enableScripts,
        enableForms: options.enableForms,
        portMapping: options.portMapping,
        localResourceRoots: options.localResourceRoots || getDefaultLocalResourceRoots(extension, workspace)
    };
}
function reviveOptions(options) {
    return {
        enableCommandUris: options.enableCommandUris,
        enableScripts: options.enableScripts,
        enableForms: options.enableForms,
        portMapping: options.portMapping,
        localResourceRoots: options.localResourceRoots?.map(components => URI.from(components)),
    };
}
function getDefaultLocalResourceRoots(extension, workspace) {
    return [
        ...(workspace?.getWorkspaceFolders() || []).map(x => x.uri),
        extension.extensionLocation,
    ];
}
