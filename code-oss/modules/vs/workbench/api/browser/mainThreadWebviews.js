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
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { Schemas } from 'vs/base/common/network';
import { isWeb } from 'vs/base/common/platform';
import { escape } from 'vs/base/common/strings';
import { URI } from 'vs/base/common/uri';
import { localize } from 'vs/nls';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IProductService } from 'vs/platform/product/common/productService';
import * as extHostProtocol from 'vs/workbench/api/common/extHost.protocol';
import { deserializeWebviewMessage, serializeWebviewMessage } from 'vs/workbench/api/common/extHostWebviewMessaging';
import { SerializableObjectWithBuffers } from 'vs/workbench/services/extensions/common/proxyIdentifier';
let MainThreadWebviews = class MainThreadWebviews extends Disposable {
    _openerService;
    _productService;
    static standardSupportedLinkSchemes = new Set([
        Schemas.http,
        Schemas.https,
        Schemas.mailto,
        Schemas.vscode,
        'vscode-insider',
    ]);
    _proxy;
    _webviews = new Map();
    constructor(context, _openerService, _productService) {
        super();
        this._openerService = _openerService;
        this._productService = _productService;
        this._proxy = context.getProxy(extHostProtocol.ExtHostContext.ExtHostWebviews);
    }
    addWebview(handle, webview, options) {
        if (this._webviews.has(handle)) {
            throw new Error('Webview already registered');
        }
        this._webviews.set(handle, webview);
        this.hookupWebviewEventDelegate(handle, webview, options);
    }
    $setHtml(handle, value) {
        const webview = this.getWebview(handle);
        webview.html = value;
    }
    $setOptions(handle, options) {
        const webview = this.getWebview(handle);
        webview.contentOptions = reviveWebviewContentOptions(options);
    }
    async $postMessage(handle, jsonMessage, ...buffers) {
        const webview = this.getWebview(handle);
        const { message, arrayBuffers } = deserializeWebviewMessage(jsonMessage, buffers);
        return webview.postMessage(message, arrayBuffers);
    }
    hookupWebviewEventDelegate(handle, webview, options) {
        const disposables = new DisposableStore();
        disposables.add(webview.onDidClickLink((uri) => this.onDidClickLink(handle, uri)));
        disposables.add(webview.onMessage((message) => {
            const serialized = serializeWebviewMessage(message.message, options);
            this._proxy.$onMessage(handle, serialized.message, new SerializableObjectWithBuffers(serialized.buffers));
        }));
        disposables.add(webview.onMissingCsp((extension) => this._proxy.$onMissingCsp(handle, extension.value)));
        disposables.add(webview.onDidDispose(() => {
            disposables.dispose();
            this._webviews.delete(handle);
        }));
    }
    onDidClickLink(handle, link) {
        const webview = this.getWebview(handle);
        if (this.isSupportedLink(webview, URI.parse(link))) {
            this._openerService.open(link, { fromUserGesture: true, allowContributedOpeners: true, allowCommands: Array.isArray(webview.contentOptions.enableCommandUris) || webview.contentOptions.enableCommandUris === true, fromWorkspace: true });
        }
    }
    isSupportedLink(webview, link) {
        if (MainThreadWebviews.standardSupportedLinkSchemes.has(link.scheme)) {
            return true;
        }
        if (!isWeb && this._productService.urlProtocol === link.scheme) {
            return true;
        }
        if (link.scheme === Schemas.command) {
            if (Array.isArray(webview.contentOptions.enableCommandUris)) {
                return webview.contentOptions.enableCommandUris.includes(link.path);
            }
            return webview.contentOptions.enableCommandUris === true;
        }
        return false;
    }
    getWebview(handle) {
        const webview = this._webviews.get(handle);
        if (!webview) {
            throw new Error(`Unknown webview handle:${handle}`);
        }
        return webview;
    }
    getWebviewResolvedFailedContent(viewType) {
        return `<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none';">
			</head>
			<body>${localize('errorMessage', "An error occurred while loading view: {0}", escape(viewType))}</body>
		</html>`;
    }
};
MainThreadWebviews = __decorate([
    __param(1, IOpenerService),
    __param(2, IProductService)
], MainThreadWebviews);
export { MainThreadWebviews };
export function reviveWebviewExtension(extensionData) {
    return {
        id: extensionData.id,
        location: URI.revive(extensionData.location),
    };
}
export function reviveWebviewContentOptions(webviewOptions) {
    return {
        allowScripts: webviewOptions.enableScripts,
        allowForms: webviewOptions.enableForms,
        enableCommandUris: webviewOptions.enableCommandUris,
        localResourceRoots: Array.isArray(webviewOptions.localResourceRoots) ? webviewOptions.localResourceRoots.map(r => URI.revive(r)) : undefined,
        portMapping: webviewOptions.portMapping,
    };
}
