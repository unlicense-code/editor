import { Disposable } from 'vs/base/common/lifecycle';
import { MainThreadWebviews } from 'vs/workbench/api/browser/mainThreadWebviews';
import * as extHostProtocol from 'vs/workbench/api/common/extHost.protocol';
import { IViewBadge } from 'vs/workbench/common/views';
import { IWebviewViewService } from 'vs/workbench/contrib/webviewView/browser/webviewViewService';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
export declare class MainThreadWebviewsViews extends Disposable implements extHostProtocol.MainThreadWebviewViewsShape {
    private readonly mainThreadWebviews;
    private readonly _webviewViewService;
    private readonly _proxy;
    private readonly _webviewViews;
    private readonly _webviewViewProviders;
    constructor(context: IExtHostContext, mainThreadWebviews: MainThreadWebviews, _webviewViewService: IWebviewViewService);
    $setWebviewViewTitle(handle: extHostProtocol.WebviewHandle, value: string | undefined): void;
    $setWebviewViewDescription(handle: extHostProtocol.WebviewHandle, value: string | undefined): void;
    $setWebviewViewBadge(handle: string, badge: IViewBadge | undefined): void;
    $show(handle: extHostProtocol.WebviewHandle, preserveFocus: boolean): void;
    $registerWebviewViewProvider(extensionData: extHostProtocol.WebviewExtensionDescription, viewType: string, options: {
        retainContextWhenHidden?: boolean;
        serializeBuffersForPostMessage: boolean;
    }): void;
    $unregisterWebviewViewProvider(viewType: string): void;
    private getWebviewView;
}
