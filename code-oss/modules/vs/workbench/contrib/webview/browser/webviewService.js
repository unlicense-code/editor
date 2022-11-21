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
import { Disposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { WebviewThemeDataProvider } from 'vs/workbench/contrib/webview/browser/themeing';
import { WebviewElement } from 'vs/workbench/contrib/webview/browser/webviewElement';
import { OverlayWebview } from './overlayWebview';
let WebviewService = class WebviewService extends Disposable {
    _instantiationService;
    _webviewThemeDataProvider;
    constructor(_instantiationService) {
        super();
        this._instantiationService = _instantiationService;
        this._webviewThemeDataProvider = this._instantiationService.createInstance(WebviewThemeDataProvider);
    }
    _activeWebview;
    get activeWebview() { return this._activeWebview; }
    _updateActiveWebview(value) {
        if (value !== this._activeWebview) {
            this._activeWebview = value;
            this._onDidChangeActiveWebview.fire(value);
        }
    }
    _webviews = new Set();
    get webviews() {
        return this._webviews.values();
    }
    _onDidChangeActiveWebview = this._register(new Emitter());
    onDidChangeActiveWebview = this._onDidChangeActiveWebview.event;
    createWebviewElement(initInfo) {
        const webview = this._instantiationService.createInstance(WebviewElement, initInfo, this._webviewThemeDataProvider);
        this.registerNewWebview(webview);
        return webview;
    }
    createWebviewOverlay(initInfo) {
        const webview = this._instantiationService.createInstance(OverlayWebview, initInfo);
        this.registerNewWebview(webview);
        return webview;
    }
    registerNewWebview(webview) {
        this._webviews.add(webview);
        webview.onDidFocus(() => {
            this._updateActiveWebview(webview);
        });
        const onBlur = () => {
            if (this._activeWebview === webview) {
                this._updateActiveWebview(undefined);
            }
        };
        webview.onDidBlur(onBlur);
        webview.onDidDispose(() => {
            onBlur();
            this._webviews.delete(webview);
        });
    }
};
WebviewService = __decorate([
    __param(0, IInstantiationService)
], WebviewService);
export { WebviewService };
