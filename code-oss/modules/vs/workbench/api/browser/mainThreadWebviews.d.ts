import { VSBuffer } from 'vs/base/common/buffer';
import { Disposable } from 'vs/base/common/lifecycle';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IProductService } from 'vs/platform/product/common/productService';
import * as extHostProtocol from 'vs/workbench/api/common/extHost.protocol';
import { IOverlayWebview, WebviewContentOptions, WebviewExtensionDescription } from 'vs/workbench/contrib/webview/browser/webview';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
export declare class MainThreadWebviews extends Disposable implements extHostProtocol.MainThreadWebviewsShape {
    private readonly _openerService;
    private readonly _productService;
    private static readonly standardSupportedLinkSchemes;
    private readonly _proxy;
    private readonly _webviews;
    constructor(context: IExtHostContext, _openerService: IOpenerService, _productService: IProductService);
    addWebview(handle: extHostProtocol.WebviewHandle, webview: IOverlayWebview, options: {
        serializeBuffersForPostMessage: boolean;
    }): void;
    $setHtml(handle: extHostProtocol.WebviewHandle, value: string): void;
    $setOptions(handle: extHostProtocol.WebviewHandle, options: extHostProtocol.IWebviewContentOptions): void;
    $postMessage(handle: extHostProtocol.WebviewHandle, jsonMessage: string, ...buffers: VSBuffer[]): Promise<boolean>;
    private hookupWebviewEventDelegate;
    private onDidClickLink;
    private isSupportedLink;
    private getWebview;
    getWebviewResolvedFailedContent(viewType: string): string;
}
export declare function reviveWebviewExtension(extensionData: extHostProtocol.WebviewExtensionDescription): WebviewExtensionDescription;
export declare function reviveWebviewContentOptions(webviewOptions: extHostProtocol.IWebviewContentOptions): WebviewContentOptions;
