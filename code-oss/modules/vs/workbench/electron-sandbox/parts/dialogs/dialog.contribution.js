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
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
import { ILogService } from 'vs/platform/log/common/log';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IProductService } from 'vs/platform/product/common/productService';
import { Registry } from 'vs/platform/registry/common/platform';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { BrowserDialogHandler } from 'vs/workbench/browser/parts/dialogs/dialogHandler';
import { NativeDialogHandler } from 'vs/workbench/electron-sandbox/parts/dialogs/dialogHandler';
import { Disposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
let DialogHandlerContribution = class DialogHandlerContribution extends Disposable {
    configurationService;
    dialogService;
    nativeImpl;
    browserImpl;
    model;
    currentDialog;
    constructor(configurationService, dialogService, logService, layoutService, themeService, keybindingService, instantiationService, productService, clipboardService, nativeHostService) {
        super();
        this.configurationService = configurationService;
        this.dialogService = dialogService;
        this.browserImpl = new BrowserDialogHandler(logService, layoutService, themeService, keybindingService, instantiationService, productService, clipboardService);
        this.nativeImpl = new NativeDialogHandler(logService, nativeHostService, productService, clipboardService);
        this.model = this.dialogService.model;
        this._register(this.model.onWillShowDialog(() => {
            if (!this.currentDialog) {
                this.processDialogs();
            }
        }));
        this.processDialogs();
    }
    async processDialogs() {
        while (this.model.dialogs.length) {
            this.currentDialog = this.model.dialogs[0];
            let result = undefined;
            // Confirm
            if (this.currentDialog.args.confirmArgs) {
                const args = this.currentDialog.args.confirmArgs;
                result = this.useCustomDialog ? await this.browserImpl.confirm(args.confirmation) : await this.nativeImpl.confirm(args.confirmation);
            }
            // Input (custom only)
            else if (this.currentDialog.args.inputArgs) {
                const args = this.currentDialog.args.inputArgs;
                result = await this.browserImpl.input(args.severity, args.message, args.buttons, args.inputs, args.options);
            }
            // Message
            else if (this.currentDialog.args.showArgs) {
                const args = this.currentDialog.args.showArgs;
                result = (this.useCustomDialog || args.options?.custom) ?
                    await this.browserImpl.show(args.severity, args.message, args.buttons, args.options) :
                    await this.nativeImpl.show(args.severity, args.message, args.buttons, args.options);
            }
            // About
            else {
                await this.nativeImpl.about();
            }
            this.currentDialog.close(result);
            this.currentDialog = undefined;
        }
    }
    get useCustomDialog() {
        return this.configurationService.getValue('window.dialogStyle') === 'custom';
    }
};
DialogHandlerContribution = __decorate([
    __param(0, IConfigurationService),
    __param(1, IDialogService),
    __param(2, ILogService),
    __param(3, ILayoutService),
    __param(4, IThemeService),
    __param(5, IKeybindingService),
    __param(6, IInstantiationService),
    __param(7, IProductService),
    __param(8, IClipboardService),
    __param(9, INativeHostService)
], DialogHandlerContribution);
export { DialogHandlerContribution };
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(DialogHandlerContribution, 1 /* LifecyclePhase.Starting */);
