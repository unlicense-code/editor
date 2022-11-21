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
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { Registry } from 'vs/platform/registry/common/platform';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { BrowserDialogHandler } from 'vs/workbench/browser/parts/dialogs/dialogHandler';
import { Disposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
let DialogHandlerContribution = class DialogHandlerContribution extends Disposable {
    dialogService;
    model;
    impl;
    currentDialog;
    constructor(dialogService, logService, layoutService, themeService, keybindingService, instantiationService, productService, clipboardService) {
        super();
        this.dialogService = dialogService;
        this.impl = new BrowserDialogHandler(logService, layoutService, themeService, keybindingService, instantiationService, productService, clipboardService);
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
            if (this.currentDialog.args.confirmArgs) {
                const args = this.currentDialog.args.confirmArgs;
                result = await this.impl.confirm(args.confirmation);
            }
            else if (this.currentDialog.args.inputArgs) {
                const args = this.currentDialog.args.inputArgs;
                result = await this.impl.input(args.severity, args.message, args.buttons, args.inputs, args.options);
            }
            else if (this.currentDialog.args.showArgs) {
                const args = this.currentDialog.args.showArgs;
                result = await this.impl.show(args.severity, args.message, args.buttons, args.options);
            }
            else {
                await this.impl.about();
            }
            this.currentDialog.close(result);
            this.currentDialog = undefined;
        }
    }
};
DialogHandlerContribution = __decorate([
    __param(0, IDialogService),
    __param(1, ILogService),
    __param(2, ILayoutService),
    __param(3, IThemeService),
    __param(4, IKeybindingService),
    __param(5, IInstantiationService),
    __param(6, IProductService),
    __param(7, IClipboardService)
], DialogHandlerContribution);
export { DialogHandlerContribution };
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(DialogHandlerContribution, 1 /* LifecyclePhase.Starting */);
