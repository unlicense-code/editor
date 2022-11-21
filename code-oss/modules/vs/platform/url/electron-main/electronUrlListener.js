/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { app } from 'electron';
import { disposableTimeout } from 'vs/base/common/async';
import { Event } from 'vs/base/common/event';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { isWindows } from 'vs/base/common/platform';
import { URI } from 'vs/base/common/uri';
function uriFromRawUrl(url) {
    try {
        return URI.parse(url);
    }
    catch (e) {
        return null;
    }
}
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
export class ElectronURLListener {
    urlService;
    uris = [];
    retryCount = 0;
    flushDisposable = Disposable.None;
    disposables = new DisposableStore();
    constructor(initialUrisToHandle, urlService, windowsMainService, environmentMainService, productService) {
        this.urlService = urlService;
        // the initial set of URIs we need to handle once the window is ready
        this.uris = initialUrisToHandle;
        // Windows: install as protocol handler
        if (isWindows) {
            const windowsParameters = environmentMainService.isBuilt ? [] : [`"${environmentMainService.appRoot}"`];
            windowsParameters.push('--open-url', '--');
            app.setAsDefaultProtocolClient(productService.urlProtocol, process.execPath, windowsParameters);
        }
        // macOS: listen to `open-url` events from here on to handle
        const onOpenElectronUrl = Event.map(Event.fromNodeEventEmitter(app, 'open-url', (event, url) => ({ event, url })), ({ event, url }) => {
            event.preventDefault(); // always prevent default and return the url as string
            return url;
        });
        this.disposables.add(onOpenElectronUrl(url => {
            const uri = uriFromRawUrl(url);
            if (!uri) {
                return;
            }
            this.urlService.open(uri, { originalUrl: url });
        }));
        // Send initial links to the window once it has loaded
        const isWindowReady = windowsMainService.getWindows()
            .filter(w => w.isReady)
            .length > 0;
        if (isWindowReady) {
            this.flush();
        }
        else {
            Event.once(windowsMainService.onDidSignalReadyWindow)(this.flush, this, this.disposables);
        }
    }
    async flush() {
        if (this.retryCount++ > 10) {
            return;
        }
        const uris = [];
        for (const obj of this.uris) {
            const handled = await this.urlService.open(obj.uri, { originalUrl: obj.url });
            if (!handled) {
                uris.push(obj);
            }
        }
        if (uris.length === 0) {
            return;
        }
        this.uris = uris;
        this.flushDisposable = disposableTimeout(() => this.flush(), 500);
    }
    dispose() {
        this.disposables.dispose();
        this.flushDisposable.dispose();
    }
}
