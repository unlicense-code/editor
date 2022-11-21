/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { WebviewService } from 'vs/workbench/contrib/webview/browser/webviewService';
import { ElectronWebviewElement } from 'vs/workbench/contrib/webview/electron-sandbox/webviewElement';
export class ElectronWebviewService extends WebviewService {
    createWebviewElement(initInfo) {
        const webview = this._instantiationService.createInstance(ElectronWebviewElement, initInfo, this._webviewThemeDataProvider);
        this.registerNewWebview(webview);
        return webview;
    }
}
