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
import { Delayer } from 'vs/base/common/async';
import * as DOM from 'vs/base/browser/dom';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IThemeService, registerThemingParticipant } from 'vs/platform/theme/common/themeService';
import { attachInputBoxStyler, attachStylerCallback } from 'vs/platform/theme/common/styler';
import { toDisposable } from 'vs/base/common/lifecycle';
import { badgeBackground, badgeForeground, contrastBorder, inputActiveOptionBorder, inputActiveOptionBackground, inputActiveOptionForeground } from 'vs/platform/theme/common/colorRegistry';
import { localize } from 'vs/nls';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ContextScopedHistoryInputBox } from 'vs/platform/history/browser/contextScopedHistoryWidget';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { Codicon } from 'vs/base/common/codicons';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { showHistoryKeybindingHint } from 'vs/platform/history/browser/historyWidgetKeybindingHint';
import { MenuId, MenuRegistry, SubmenuItemAction } from 'vs/platform/actions/common/actions';
import { MenuWorkbenchToolBar } from 'vs/platform/actions/browser/toolbar';
import { SubmenuEntryActionViewItem } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { Widget } from 'vs/base/browser/ui/widget';
import { Emitter } from 'vs/base/common/event';
const viewFilterMenu = new MenuId('menu.view.filter');
export const viewFilterSubmenu = new MenuId('submenu.view.filter');
MenuRegistry.appendMenuItem(viewFilterMenu, {
    submenu: viewFilterSubmenu,
    title: localize('more filters', "More Filters..."),
    group: 'navigation',
    icon: Codicon.filter,
});
class MoreFiltersActionViewItem extends SubmenuEntryActionViewItem {
    _checked = false;
    set checked(checked) {
        if (this._checked !== checked) {
            this._checked = checked;
            this.updateChecked();
        }
    }
    updateChecked() {
        if (this.element) {
            this.element.classList.toggle('checked', this._checked);
        }
    }
    render(container) {
        super.render(container);
        this.updateChecked();
    }
}
let FilterWidget = class FilterWidget extends Widget {
    options;
    instantiationService;
    contextViewService;
    themeService;
    keybindingService;
    element;
    delayedFilterUpdate;
    filterInputBox;
    filterBadge;
    toolbar;
    focusContextKey;
    _onDidChangeFilterText = this._register(new Emitter());
    onDidChangeFilterText = this._onDidChangeFilterText.event;
    moreFiltersActionViewItem;
    isMoreFiltersChecked = false;
    constructor(options, instantiationService, contextViewService, themeService, contextKeyService, keybindingService) {
        super();
        this.options = options;
        this.instantiationService = instantiationService;
        this.contextViewService = contextViewService;
        this.themeService = themeService;
        this.keybindingService = keybindingService;
        this.delayedFilterUpdate = new Delayer(400);
        this._register(toDisposable(() => this.delayedFilterUpdate.cancel()));
        if (options.focusContextKey) {
            this.focusContextKey = new RawContextKey(options.focusContextKey, false).bindTo(contextKeyService);
        }
        this.element = DOM.$('.viewpane-filter');
        this.filterInputBox = this.createInput(this.element);
        const controlsContainer = DOM.append(this.element, DOM.$('.viewpane-filter-controls'));
        this.filterBadge = this.createBadge(controlsContainer);
        this.toolbar = this._register(this.createToolBar(controlsContainer));
        this.adjustInputBox();
    }
    focus() {
        this.filterInputBox.focus();
    }
    blur() {
        this.filterInputBox.blur();
    }
    updateBadge(message) {
        this.filterBadge.classList.toggle('hidden', !message);
        this.filterBadge.textContent = message || '';
        this.adjustInputBox();
    }
    setFilterText(filterText) {
        this.filterInputBox.value = filterText;
    }
    getFilterText() {
        return this.filterInputBox.value;
    }
    getHistory() {
        return this.filterInputBox.getHistory();
    }
    layout(width) {
        this.element.parentElement?.classList.toggle('grow', width > 700);
        this.element.classList.toggle('small', width < 400);
        this.adjustInputBox();
    }
    checkMoreFilters(checked) {
        this.isMoreFiltersChecked = checked;
        if (this.moreFiltersActionViewItem) {
            this.moreFiltersActionViewItem.checked = checked;
        }
    }
    createInput(container) {
        const inputBox = this._register(this.instantiationService.createInstance(ContextScopedHistoryInputBox, container, this.contextViewService, {
            placeholder: this.options.placeholder,
            ariaLabel: this.options.ariaLabel,
            history: this.options.history || [],
            showHistoryHint: () => showHistoryKeybindingHint(this.keybindingService)
        }));
        this._register(attachInputBoxStyler(inputBox, this.themeService));
        if (this.options.text) {
            inputBox.value = this.options.text;
        }
        this._register(inputBox.onDidChange(filter => this.delayedFilterUpdate.trigger(() => this.onDidInputChange(inputBox))));
        this._register(DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.KEY_DOWN, (e) => this.onInputKeyDown(e, inputBox)));
        this._register(DOM.addStandardDisposableListener(container, DOM.EventType.KEY_DOWN, this.handleKeyboardEvent));
        this._register(DOM.addStandardDisposableListener(container, DOM.EventType.KEY_UP, this.handleKeyboardEvent));
        this._register(DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.CLICK, (e) => {
            e.stopPropagation();
            e.preventDefault();
        }));
        const focusTracker = this._register(DOM.trackFocus(inputBox.inputElement));
        if (this.focusContextKey) {
            this._register(focusTracker.onDidFocus(() => this.focusContextKey.set(true)));
            this._register(focusTracker.onDidBlur(() => this.focusContextKey.set(false)));
            this._register(toDisposable(() => this.focusContextKey.reset()));
        }
        return inputBox;
    }
    createBadge(container) {
        const filterBadge = DOM.append(container, DOM.$('.viewpane-filter-badge.hidden'));
        this._register(attachStylerCallback(this.themeService, { badgeBackground, badgeForeground, contrastBorder }, colors => {
            const background = colors.badgeBackground ? colors.badgeBackground.toString() : '';
            const foreground = colors.badgeForeground ? colors.badgeForeground.toString() : '';
            const border = colors.contrastBorder ? colors.contrastBorder.toString() : '';
            filterBadge.style.backgroundColor = background;
            filterBadge.style.borderWidth = border ? '1px' : '';
            filterBadge.style.borderStyle = border ? 'solid' : '';
            filterBadge.style.borderColor = border;
            filterBadge.style.color = foreground;
        }));
        return filterBadge;
    }
    createToolBar(container) {
        return this.instantiationService.createInstance(MenuWorkbenchToolBar, container, viewFilterMenu, {
            hiddenItemStrategy: -1 /* HiddenItemStrategy.NoHide */,
            actionViewItemProvider: (action) => {
                if (action instanceof SubmenuItemAction && action.item.submenu.id === viewFilterSubmenu.id) {
                    this.moreFiltersActionViewItem = this.instantiationService.createInstance(MoreFiltersActionViewItem, action, undefined);
                    this.moreFiltersActionViewItem.checked = this.isMoreFiltersChecked;
                    return this.moreFiltersActionViewItem;
                }
                return undefined;
            }
        });
    }
    onDidInputChange(inputbox) {
        inputbox.addToHistory();
        this._onDidChangeFilterText.fire(inputbox.value);
    }
    adjustInputBox() {
        this.filterInputBox.inputElement.style.paddingRight = this.element.classList.contains('small') || this.filterBadge.classList.contains('hidden') ? '25px' : '150px';
    }
    // Action toolbar is swallowing some keys for action items which should not be for an input box
    handleKeyboardEvent(event) {
        if (event.equals(10 /* KeyCode.Space */)
            || event.equals(15 /* KeyCode.LeftArrow */)
            || event.equals(17 /* KeyCode.RightArrow */)) {
            event.stopPropagation();
        }
    }
    onInputKeyDown(event, filterInputBox) {
        let handled = false;
        if (event.equals(2 /* KeyCode.Tab */)) {
            this.toolbar.focus();
            handled = true;
        }
        if (handled) {
            event.stopPropagation();
            event.preventDefault();
        }
    }
};
FilterWidget = __decorate([
    __param(1, IInstantiationService),
    __param(2, IContextViewService),
    __param(3, IThemeService),
    __param(4, IContextKeyService),
    __param(5, IKeybindingService)
], FilterWidget);
export { FilterWidget };
registerThemingParticipant((theme, collector) => {
    const inputActiveOptionBorderColor = theme.getColor(inputActiveOptionBorder);
    if (inputActiveOptionBorderColor) {
        collector.addRule(`.viewpane-filter > .viewpane-filter-controls .monaco-action-bar .action-label.codicon.codicon-filter.checked { border-color: ${inputActiveOptionBorderColor}; }`);
    }
    const inputActiveOptionForegroundColor = theme.getColor(inputActiveOptionForeground);
    if (inputActiveOptionForegroundColor) {
        collector.addRule(`.viewpane-filter > .viewpane-filter-controls .monaco-action-bar .action-label.codicon.codicon-filter.checked { color: ${inputActiveOptionForegroundColor}; }`);
    }
    const inputActiveOptionBackgroundColor = theme.getColor(inputActiveOptionBackground);
    if (inputActiveOptionBackgroundColor) {
        collector.addRule(`.viewpane-filter > .viewpane-filter-controls .monaco-action-bar .action-label.codicon.codicon-filter.checked { background-color: ${inputActiveOptionBackgroundColor}; }`);
    }
});
