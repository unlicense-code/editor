import { IWebviewElement, WebviewInitInfo } from 'vs/workbench/contrib/webview/browser/webview';
import { WebviewService } from 'vs/workbench/contrib/webview/browser/webviewService';
export declare class ElectronWebviewService extends WebviewService {
    createWebviewElement(initInfo: WebviewInitInfo): IWebviewElement;
}
