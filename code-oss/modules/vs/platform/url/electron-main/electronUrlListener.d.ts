import { URI } from 'vs/base/common/uri';
import { IEnvironmentMainService } from 'vs/platform/environment/electron-main/environmentMainService';
import { IProductService } from 'vs/platform/product/common/productService';
import { IURLService } from 'vs/platform/url/common/url';
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';
/**
 * A listener for URLs that are opened from the OS and handled by VSCode.
 * Depending on the platform, this works differently:
 * - Windows: we use `app.setAsDefaultProtocolClient()` to register VSCode with the OS
 *            and additionally add the `open-url` command line argument to identify.
 * - macOS:   we rely on `app.on('open-url')` to be called by the OS
 * - Linux:   we have a special shortcut installed (`resources/linux/code-url-handler.desktop`)
 *            that calls VSCode with the `open-url` command line argument
 *            (https://github.com/microsoft/vscode/pull/56727)
 */
export declare class ElectronURLListener {
    private readonly urlService;
    private uris;
    private retryCount;
    private flushDisposable;
    private disposables;
    constructor(initialUrisToHandle: {
        uri: URI;
        url: string;
    }[], urlService: IURLService, windowsMainService: IWindowsMainService, environmentMainService: IEnvironmentMainService, productService: IProductService);
    private flush;
    dispose(): void;
}
