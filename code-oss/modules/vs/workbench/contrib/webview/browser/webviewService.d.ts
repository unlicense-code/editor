import { Disposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { WebviewThemeDataProvider } from 'vs/workbench/contrib/webview/browser/themeing';
import { IOverlayWebview, IWebview, IWebviewElement, IWebviewService, WebviewInitInfo } from 'vs/workbench/contrib/webview/browser/webview';
export declare class WebviewService extends Disposable implements IWebviewService {
    protected readonly _instantiationService: IInstantiationService;
    readonly _serviceBrand: undefined;
    protected readonly _webviewThemeDataProvider: WebviewThemeDataProvider;
    constructor(_instantiationService: IInstantiationService);
    private _activeWebview?;
    get activeWebview(): IWebview | undefined;
    private _updateActiveWebview;
    private _webviews;
    get webviews(): Iterable<IWebview>;
    private readonly _onDidChangeActiveWebview;
    readonly onDidChangeActiveWebview: import("vs/base/common/event").Event<IWebview | undefined>;
    createWebviewElement(initInfo: WebviewInitInfo): IWebviewElement;
    createWebviewOverlay(initInfo: WebviewInitInfo): IOverlayWebview;
    protected registerNewWebview(webview: IWebview): void;
}
