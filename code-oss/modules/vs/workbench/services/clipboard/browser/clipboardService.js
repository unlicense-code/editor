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
import { localize } from 'vs/nls';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { BrowserClipboardService as BaseBrowserClipboardService } from 'vs/platform/clipboard/browser/clipboardService';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { once } from 'vs/base/common/functional';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { ILogService } from 'vs/platform/log/common/log';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
let BrowserClipboardService = class BrowserClipboardService extends BaseBrowserClipboardService {
    notificationService;
    openerService;
    environmentService;
    constructor(notificationService, openerService, environmentService, logService, layoutService) {
        super(layoutService, logService);
        this.notificationService = notificationService;
        this.openerService = openerService;
        this.environmentService = environmentService;
    }
    async readText(type) {
        if (type) {
            return super.readText(type);
        }
        try {
            return await navigator.clipboard.readText();
        }
        catch (error) {
            if (!!this.environmentService.extensionTestsLocationURI) {
                return ''; // do not ask for input in tests (https://github.com/microsoft/vscode/issues/112264)
            }
            return new Promise(resolve => {
                // Inform user about permissions problem (https://github.com/microsoft/vscode/issues/112089)
                const listener = new DisposableStore();
                const handle = this.notificationService.prompt(Severity.Error, localize('clipboardError', "Unable to read from the browser's clipboard. Please make sure you have granted access for this website to read from the clipboard."), [{
                        label: localize('retry', "Retry"),
                        run: async () => {
                            listener.dispose();
                            resolve(await this.readText(type));
                        }
                    }, {
                        label: localize('learnMore', "Learn More"),
                        run: () => this.openerService.open('https://go.microsoft.com/fwlink/?linkid=2151362')
                    }], {
                    sticky: true
                });
                // Always resolve the promise once the notification closes
                listener.add(once(handle.onDidClose)(() => resolve('')));
            });
        }
    }
};
BrowserClipboardService = __decorate([
    __param(0, INotificationService),
    __param(1, IOpenerService),
    __param(2, IWorkbenchEnvironmentService),
    __param(3, ILogService),
    __param(4, ILayoutService)
], BrowserClipboardService);
export { BrowserClipboardService };
registerSingleton(IClipboardService, BrowserClipboardService, 1 /* InstantiationType.Delayed */);
