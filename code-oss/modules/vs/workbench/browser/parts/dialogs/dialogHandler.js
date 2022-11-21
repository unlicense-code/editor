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
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
import { ILogService } from 'vs/platform/log/common/log';
import Severity from 'vs/base/common/severity';
import { Dialog } from 'vs/base/browser/ui/dialog/dialog';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { attachDialogStyler } from 'vs/platform/theme/common/styler';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { EventHelper } from 'vs/base/browser/dom';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IProductService } from 'vs/platform/product/common/productService';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { fromNow } from 'vs/base/common/date';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { MarkdownRenderer } from 'vs/editor/contrib/markdownRenderer/browser/markdownRenderer';
import { defaultButtonStyles } from 'vs/platform/theme/browser/defaultStyles';
let BrowserDialogHandler = class BrowserDialogHandler {
    logService;
    layoutService;
    themeService;
    keybindingService;
    instantiationService;
    productService;
    clipboardService;
    static ALLOWABLE_COMMANDS = [
        'copy',
        'cut',
        'editor.action.selectAll',
        'editor.action.clipboardCopyAction',
        'editor.action.clipboardCutAction',
        'editor.action.clipboardPasteAction'
    ];
    markdownRenderer;
    constructor(logService, layoutService, themeService, keybindingService, instantiationService, productService, clipboardService) {
        this.logService = logService;
        this.layoutService = layoutService;
        this.themeService = themeService;
        this.keybindingService = keybindingService;
        this.instantiationService = instantiationService;
        this.productService = productService;
        this.clipboardService = clipboardService;
        this.markdownRenderer = this.instantiationService.createInstance(MarkdownRenderer, {});
    }
    async confirm(confirmation) {
        this.logService.trace('DialogService#confirm', confirmation.message);
        const buttons = [];
        if (confirmation.primaryButton) {
            buttons.push(confirmation.primaryButton);
        }
        else {
            buttons.push(localize({ key: 'yesButton', comment: ['&& denotes a mnemonic'] }, "&&Yes"));
        }
        if (confirmation.secondaryButton) {
            buttons.push(confirmation.secondaryButton);
        }
        else if (typeof confirmation.secondaryButton === 'undefined') {
            buttons.push(localize('cancelButton', "Cancel"));
        }
        const result = await this.doShow(confirmation.type, confirmation.message, buttons, confirmation.detail, 1, confirmation.checkbox);
        return { confirmed: result.button === 0, checkboxChecked: result.checkboxChecked };
    }
    getDialogType(severity) {
        return (severity === Severity.Info) ? 'question' : (severity === Severity.Error) ? 'error' : (severity === Severity.Warning) ? 'warning' : 'none';
    }
    async show(severity, message, buttons, options) {
        this.logService.trace('DialogService#show', message);
        const result = await this.doShow(this.getDialogType(severity), message, buttons, options?.detail, options?.cancelId, options?.checkbox, undefined, typeof options?.custom === 'object' ? options.custom : undefined);
        return {
            choice: result.button,
            checkboxChecked: result.checkboxChecked
        };
    }
    async doShow(type, message, buttons, detail, cancelId, checkbox, inputs, customOptions) {
        const dialogDisposables = new DisposableStore();
        const renderBody = customOptions ? (parent) => {
            parent.classList.add(...(customOptions.classes || []));
            customOptions.markdownDetails?.forEach(markdownDetail => {
                const result = this.markdownRenderer.render(markdownDetail.markdown);
                parent.appendChild(result.element);
                result.element.classList.add(...(markdownDetail.classes || []));
                dialogDisposables.add(result);
            });
        } : undefined;
        const dialog = new Dialog(this.layoutService.container, message, buttons, {
            detail,
            cancelId,
            type,
            keyEventProcessor: (event) => {
                const resolved = this.keybindingService.softDispatch(event, this.layoutService.container);
                if (resolved?.commandId) {
                    if (BrowserDialogHandler.ALLOWABLE_COMMANDS.indexOf(resolved.commandId) === -1) {
                        EventHelper.stop(event, true);
                    }
                }
            },
            renderBody,
            icon: customOptions?.icon,
            disableCloseAction: customOptions?.disableCloseAction,
            buttonDetails: customOptions?.buttonDetails,
            checkboxLabel: checkbox?.label,
            checkboxChecked: checkbox?.checked,
            inputs,
            buttonStyles: defaultButtonStyles
        });
        dialogDisposables.add(dialog);
        dialogDisposables.add(attachDialogStyler(dialog, this.themeService));
        const result = await dialog.show();
        dialogDisposables.dispose();
        return result;
    }
    async input(severity, message, buttons, inputs, options) {
        this.logService.trace('DialogService#input', message);
        const result = await this.doShow(this.getDialogType(severity), message, buttons, options?.detail, options?.cancelId, options?.checkbox, inputs);
        return {
            choice: result.button,
            checkboxChecked: result.checkboxChecked,
            values: result.values
        };
    }
    async about() {
        const detailString = (useAgo) => {
            return localize('aboutDetail', "Version: {0}\nCommit: {1}\nDate: {2}\nBrowser: {3}", this.productService.version || 'Unknown', this.productService.commit || 'Unknown', this.productService.date ? `${this.productService.date}${useAgo ? ' (' + fromNow(new Date(this.productService.date), true) + ')' : ''}` : 'Unknown', navigator.userAgent);
        };
        const detail = detailString(true);
        const detailToCopy = detailString(false);
        const { choice } = await this.show(Severity.Info, this.productService.nameLong, [localize('copy', "Copy"), localize('ok', "OK")], { detail, cancelId: 1 });
        if (choice === 0) {
            this.clipboardService.writeText(detailToCopy);
        }
    }
};
BrowserDialogHandler = __decorate([
    __param(0, ILogService),
    __param(1, ILayoutService),
    __param(2, IThemeService),
    __param(3, IKeybindingService),
    __param(4, IInstantiationService),
    __param(5, IProductService),
    __param(6, IClipboardService)
], BrowserDialogHandler);
export { BrowserDialogHandler };
