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
import { isSafari, setFullscreen } from 'vs/base/browser/browser';
import { addDisposableListener, addDisposableThrottledListener, detectFullscreen, EventHelper, EventType, windowOpenNoOpener, windowOpenPopup, windowOpenWithSuccess } from 'vs/base/browser/dom';
import { DomEmitter } from 'vs/base/browser/event';
import { requestHidDevice, requestSerialPort, requestUsbDevice } from 'vs/base/browser/deviceAccess';
import { timeout } from 'vs/base/common/async';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { Schemas } from 'vs/base/common/network';
import { isIOS, isMacintosh } from 'vs/base/common/platform';
import Severity from 'vs/base/common/severity';
import { URI } from 'vs/base/common/uri';
import { localize } from 'vs/nls';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { registerWindowDriver } from 'vs/platform/driver/browser/driver';
import { ILabelService } from 'vs/platform/label/common/label';
import { IOpenerService, matchesScheme } from 'vs/platform/opener/common/opener';
import { IProductService } from 'vs/platform/product/common/productService';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IHostService } from 'vs/workbench/services/host/browser/host';
let BrowserWindow = class BrowserWindow extends Disposable {
    openerService;
    lifecycleService;
    dialogService;
    labelService;
    productService;
    environmentService;
    layoutService;
    hostService;
    constructor(openerService, lifecycleService, dialogService, labelService, productService, environmentService, layoutService, hostService) {
        super();
        this.openerService = openerService;
        this.lifecycleService = lifecycleService;
        this.dialogService = dialogService;
        this.labelService = labelService;
        this.productService = productService;
        this.environmentService = environmentService;
        this.layoutService = layoutService;
        this.hostService = hostService;
        this.registerListeners();
        this.create();
    }
    registerListeners() {
        // Lifecycle
        this._register(this.lifecycleService.onWillShutdown(() => this.onWillShutdown()));
        // Layout
        const viewport = isIOS && window.visualViewport ? window.visualViewport /** Visual viewport */ : window /** Layout viewport */;
        this._register(addDisposableListener(viewport, EventType.RESIZE, () => {
            this.layoutService.layout();
            // Sometimes the keyboard appearing scrolls the whole workbench out of view, as a workaround scroll back into view #121206
            if (isIOS) {
                window.scrollTo(0, 0);
            }
        }));
        // Prevent the back/forward gestures in macOS
        this._register(addDisposableListener(this.layoutService.container, EventType.WHEEL, e => e.preventDefault(), { passive: false }));
        // Prevent native context menus in web
        this._register(addDisposableListener(this.layoutService.container, EventType.CONTEXT_MENU, e => EventHelper.stop(e, true)));
        // Prevent default navigation on drop
        this._register(addDisposableListener(this.layoutService.container, EventType.DROP, e => EventHelper.stop(e, true)));
        // Fullscreen (Browser)
        for (const event of [EventType.FULLSCREEN_CHANGE, EventType.WK_FULLSCREEN_CHANGE]) {
            this._register(addDisposableListener(document, event, () => setFullscreen(!!detectFullscreen())));
        }
        // Fullscreen (Native)
        this._register(addDisposableThrottledListener(viewport, EventType.RESIZE, () => {
            setFullscreen(!!detectFullscreen());
        }, undefined, isMacintosh ? 2000 /* adjust for macOS animation */ : 800 /* can be throttled */));
    }
    onWillShutdown() {
        // Try to detect some user interaction with the workbench
        // when shutdown has happened to not show the dialog e.g.
        // when navigation takes a longer time.
        Event.toPromise(Event.any(Event.once(new DomEmitter(document.body, EventType.KEY_DOWN, true).event), Event.once(new DomEmitter(document.body, EventType.MOUSE_DOWN, true).event))).then(async () => {
            // Delay the dialog in case the user interacted
            // with the page before it transitioned away
            await timeout(3000);
            // This should normally not happen, but if for some reason
            // the workbench was shutdown while the page is still there,
            // inform the user that only a reload can bring back a working
            // state.
            const res = await this.dialogService.show(Severity.Error, localize('shutdownError', "An unexpected error occurred that requires a reload of this page."), [
                localize('reload', "Reload")
            ], {
                detail: localize('shutdownErrorDetail', "The workbench was unexpectedly disposed while running.")
            });
            if (res.choice === 0) {
                window.location.reload(); // do not use any services at this point since they are likely not functional at this point
            }
        });
    }
    create() {
        // Handle open calls
        this.setupOpenHandlers();
        // Label formatting
        this.registerLabelFormatters();
        // Commands
        this.registerCommands();
        // Smoke Test Driver
        this.setupDriver();
    }
    setupDriver() {
        if (this.environmentService.enableSmokeTestDriver) {
            registerWindowDriver();
        }
    }
    setupOpenHandlers() {
        // We need to ignore the `beforeunload` event while
        // we handle external links to open specifically for
        // the case of application protocols that e.g. invoke
        // vscode itself. We do not want to open these links
        // in a new window because that would leave a blank
        // window to the user, but using `window.location.href`
        // will trigger the `beforeunload`.
        this.openerService.setDefaultExternalOpener({
            openExternal: async (href) => {
                let isAllowedOpener = false;
                if (this.environmentService.options?.openerAllowedExternalUrlPrefixes) {
                    for (const trustedPopupPrefix of this.environmentService.options.openerAllowedExternalUrlPrefixes) {
                        if (href.startsWith(trustedPopupPrefix)) {
                            isAllowedOpener = true;
                            break;
                        }
                    }
                }
                // HTTP(s): open in new window and deal with potential popup blockers
                if (matchesScheme(href, Schemas.http) || matchesScheme(href, Schemas.https)) {
                    if (isSafari) {
                        const opened = windowOpenWithSuccess(href, !isAllowedOpener);
                        if (!opened) {
                            const showResult = await this.dialogService.show(Severity.Warning, localize('unableToOpenExternal', "The browser interrupted the opening of a new tab or window. Press 'Open' to open it anyway."), [
                                localize('open', "Open"),
                                localize('learnMore', "Learn More"),
                                localize('cancel', "Cancel")
                            ], {
                                cancelId: 2,
                                detail: href
                            });
                            if (showResult.choice === 0) {
                                isAllowedOpener
                                    ? windowOpenPopup(href)
                                    : windowOpenNoOpener(href);
                            }
                            if (showResult.choice === 1) {
                                await this.openerService.open(URI.parse('https://aka.ms/allow-vscode-popup'));
                            }
                        }
                    }
                    else {
                        isAllowedOpener
                            ? windowOpenPopup(href)
                            : windowOpenNoOpener(href);
                    }
                }
                // Anything else: set location to trigger protocol handler in the browser
                // but make sure to signal this as an expected unload and disable unload
                // handling explicitly to prevent the workbench from going down.
                else {
                    const invokeProtocolHandler = () => {
                        this.lifecycleService.withExpectedShutdown({ disableShutdownHandling: true }, () => window.location.href = href);
                    };
                    invokeProtocolHandler();
                    const showProtocolUrlOpenedDialog = async () => {
                        const { downloadUrl } = this.productService;
                        let detail = localize('openExternalDialogDetail.v2', "We launched {0} on your computer.\n\nIf {1} did not launch, try again or install it below.", this.productService.nameLong, this.productService.nameLong);
                        const options = [
                            localize('openExternalDialogButtonClose.v2', "Close Tab"),
                            localize('openExternalDialogButtonRetry.v2', "Try Again"),
                            localize('openExternalDialogButtonInstall.v3', "Install"),
                            localize('openExternalDialogButtonCancel', "Cancel")
                        ];
                        if (downloadUrl === undefined) {
                            options.splice(2, 1);
                            detail = localize('openExternalDialogDetailNoInstall', "We launched {0} on your computer.\n\nIf {1} did not launch, try again below.", this.productService.nameLong, this.productService.nameLong);
                        }
                        const showResult = await this.dialogService.show(Severity.Info, localize('openExternalDialogTitle', "All done. You can close this tab now."), options, {
                            cancelId: downloadUrl === undefined ? 2 : 3,
                            detail
                        });
                        if (showResult.choice === 0) {
                            this.hostService.close();
                        }
                        else if (showResult.choice === 1) {
                            invokeProtocolHandler();
                        }
                        else if (showResult.choice === 2 && downloadUrl !== undefined) {
                            await this.openerService.open(URI.parse(downloadUrl));
                            // Re-show the dialog so that the user can come back after installing and try again
                            showProtocolUrlOpenedDialog();
                        }
                    };
                    // We cannot know whether the protocol handler succeeded.
                    // Display guidance in case it did not, e.g. the app is not installed locally.
                    if (matchesScheme(href, this.productService.urlProtocol)) {
                        await showProtocolUrlOpenedDialog();
                    }
                }
                return true;
            }
        });
    }
    registerLabelFormatters() {
        this._register(this.labelService.registerFormatter({
            scheme: Schemas.vscodeUserData,
            priority: true,
            formatting: {
                label: '(Settings) ${path}',
                separator: '/',
            }
        }));
    }
    registerCommands() {
        // Allow extensions to request USB devices in Web
        CommandsRegistry.registerCommand('workbench.experimental.requestUsbDevice', async (_accessor, options) => {
            return requestUsbDevice(options);
        });
        // Allow extensions to request Serial devices in Web
        CommandsRegistry.registerCommand('workbench.experimental.requestSerialPort', async (_accessor, options) => {
            return requestSerialPort(options);
        });
        // Allow extensions to request HID devices in Web
        CommandsRegistry.registerCommand('workbench.experimental.requestHidDevice', async (_accessor, options) => {
            return requestHidDevice(options);
        });
    }
};
BrowserWindow = __decorate([
    __param(0, IOpenerService),
    __param(1, ILifecycleService),
    __param(2, IDialogService),
    __param(3, ILabelService),
    __param(4, IProductService),
    __param(5, IBrowserWorkbenchEnvironmentService),
    __param(6, IWorkbenchLayoutService),
    __param(7, IHostService)
], BrowserWindow);
export { BrowserWindow };
