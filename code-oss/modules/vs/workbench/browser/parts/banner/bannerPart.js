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
import 'vs/css!./media/bannerpart';
import { localize } from 'vs/nls';
import { $, addDisposableListener, append, asCSSUrl, clearNode, EventType } from 'vs/base/browser/dom';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { Codicon } from 'vs/base/common/codicons';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { Part } from 'vs/workbench/browser/part';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { Action } from 'vs/base/common/actions';
import { Link } from 'vs/platform/opener/browser/link';
import { Emitter } from 'vs/base/common/event';
import { IBannerService } from 'vs/workbench/services/banner/browser/bannerService';
import { MarkdownRenderer } from 'vs/editor/contrib/markdownRenderer/browser/markdownRenderer';
import { Action2, registerAction2 } from 'vs/platform/actions/common/actions';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { KeybindingsRegistry } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { URI } from 'vs/base/common/uri';
import { widgetClose } from 'vs/platform/theme/common/iconRegistry';
import { BannerFocused } from 'vs/workbench/common/contextkeys';
// Banner Part
let BannerPart = class BannerPart extends Part {
    contextKeyService;
    instantiationService;
    // #region IView
    height = 26;
    minimumWidth = 0;
    maximumWidth = Number.POSITIVE_INFINITY;
    get minimumHeight() {
        return this.visible ? this.height : 0;
    }
    get maximumHeight() {
        return this.visible ? this.height : 0;
    }
    _onDidChangeSize = this._register(new Emitter());
    get onDidChange() { return this._onDidChangeSize.event; }
    //#endregion
    item;
    markdownRenderer;
    visible = false;
    actionBar;
    messageActionsContainer;
    focusedActionIndex = -1;
    constructor(themeService, layoutService, storageService, contextKeyService, instantiationService) {
        super("workbench.parts.banner" /* Parts.BANNER_PART */, { hasTitle: false }, themeService, storageService, layoutService);
        this.contextKeyService = contextKeyService;
        this.instantiationService = instantiationService;
        this.markdownRenderer = this.instantiationService.createInstance(MarkdownRenderer, {});
    }
    createContentArea(parent) {
        this.element = parent;
        this.element.tabIndex = 0;
        // Restore focused action if needed
        this._register(addDisposableListener(this.element, EventType.FOCUS, () => {
            if (this.focusedActionIndex !== -1) {
                this.focusActionLink();
            }
        }));
        // Track focus
        const scopedContextKeyService = this.contextKeyService.createScoped(this.element);
        BannerFocused.bindTo(scopedContextKeyService).set(true);
        return this.element;
    }
    close(item) {
        // Hide banner
        this.setVisibility(false);
        // Remove from document
        clearNode(this.element);
        // Remember choice
        if (typeof item.onClose === 'function') {
            item.onClose();
        }
        this.item = undefined;
    }
    focusActionLink() {
        const length = this.item?.actions?.length ?? 0;
        if (this.focusedActionIndex < length) {
            const actionLink = this.messageActionsContainer?.children[this.focusedActionIndex];
            if (actionLink instanceof HTMLElement) {
                this.actionBar?.setFocusable(false);
                actionLink.focus();
            }
        }
        else {
            this.actionBar?.focus(0);
        }
    }
    getAriaLabel(item) {
        if (item.ariaLabel) {
            return item.ariaLabel;
        }
        if (typeof item.message === 'string') {
            return item.message;
        }
        return undefined;
    }
    getBannerMessage(message) {
        if (typeof message === 'string') {
            const element = $('span');
            element.innerText = message;
            return element;
        }
        return this.markdownRenderer.render(message).element;
    }
    setVisibility(visible) {
        if (visible !== this.visible) {
            this.visible = visible;
            this.focusedActionIndex = -1;
            this.layoutService.setPartHidden(!visible, "workbench.parts.banner" /* Parts.BANNER_PART */);
            this._onDidChangeSize.fire(undefined);
        }
    }
    focus() {
        this.focusedActionIndex = -1;
        this.element.focus();
    }
    focusNextAction() {
        const length = this.item?.actions?.length ?? 0;
        this.focusedActionIndex = this.focusedActionIndex < length ? this.focusedActionIndex + 1 : 0;
        this.focusActionLink();
    }
    focusPreviousAction() {
        const length = this.item?.actions?.length ?? 0;
        this.focusedActionIndex = this.focusedActionIndex > 0 ? this.focusedActionIndex - 1 : length;
        this.focusActionLink();
    }
    hide(id) {
        if (this.item?.id !== id) {
            return;
        }
        this.setVisibility(false);
    }
    show(item) {
        if (item.id === this.item?.id) {
            this.setVisibility(true);
            return;
        }
        // Clear previous item
        clearNode(this.element);
        // Banner aria label
        const ariaLabel = this.getAriaLabel(item);
        if (ariaLabel) {
            this.element.setAttribute('aria-label', ariaLabel);
        }
        // Icon
        const iconContainer = append(this.element, $('div.icon-container'));
        iconContainer.setAttribute('aria-hidden', 'true');
        if (item.icon instanceof Codicon) {
            iconContainer.appendChild($(`div${item.icon.cssSelector}`));
        }
        else {
            iconContainer.classList.add('custom-icon');
            if (URI.isUri(item.icon)) {
                iconContainer.style.backgroundImage = asCSSUrl(item.icon);
            }
        }
        // Message
        const messageContainer = append(this.element, $('div.message-container'));
        messageContainer.setAttribute('aria-hidden', 'true');
        messageContainer.appendChild(this.getBannerMessage(item.message));
        // Message Actions
        this.messageActionsContainer = append(this.element, $('div.message-actions-container'));
        if (item.actions) {
            for (const action of item.actions) {
                this._register(this.instantiationService.createInstance(Link, this.messageActionsContainer, { ...action, tabIndex: -1 }, {}));
            }
        }
        // Action
        const actionBarContainer = append(this.element, $('div.action-container'));
        this.actionBar = this._register(new ActionBar(actionBarContainer));
        const closeAction = this._register(new Action('banner.close', 'Close Banner', ThemeIcon.asClassName(widgetClose), true, () => this.close(item)));
        this.actionBar.push(closeAction, { icon: true, label: false });
        this.actionBar.setFocusable(false);
        this.setVisibility(true);
        this.item = item;
    }
    toJSON() {
        return {
            type: "workbench.parts.banner" /* Parts.BANNER_PART */
        };
    }
};
BannerPart = __decorate([
    __param(0, IThemeService),
    __param(1, IWorkbenchLayoutService),
    __param(2, IStorageService),
    __param(3, IContextKeyService),
    __param(4, IInstantiationService)
], BannerPart);
export { BannerPart };
registerSingleton(IBannerService, BannerPart, 0 /* InstantiationType.Eager */);
// Keybindings
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'workbench.banner.focusBanner',
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    primary: 9 /* KeyCode.Escape */,
    when: BannerFocused,
    handler: (accessor) => {
        const bannerService = accessor.get(IBannerService);
        bannerService.focus();
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'workbench.banner.focusNextAction',
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    primary: 17 /* KeyCode.RightArrow */,
    secondary: [18 /* KeyCode.DownArrow */],
    when: BannerFocused,
    handler: (accessor) => {
        const bannerService = accessor.get(IBannerService);
        bannerService.focusNextAction();
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'workbench.banner.focusPreviousAction',
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    primary: 15 /* KeyCode.LeftArrow */,
    secondary: [16 /* KeyCode.UpArrow */],
    when: BannerFocused,
    handler: (accessor) => {
        const bannerService = accessor.get(IBannerService);
        bannerService.focusPreviousAction();
    }
});
// Actions
class FocusBannerAction extends Action2 {
    static ID = 'workbench.action.focusBanner';
    static LABEL = localize('focusBanner', "Focus Banner");
    constructor() {
        super({
            id: FocusBannerAction.ID,
            title: { value: FocusBannerAction.LABEL, original: 'Focus Banner' },
            category: Categories.View,
            f1: true
        });
    }
    async run(accessor) {
        const layoutService = accessor.get(IWorkbenchLayoutService);
        layoutService.focusPart("workbench.parts.banner" /* Parts.BANNER_PART */);
    }
}
registerAction2(FocusBannerAction);
