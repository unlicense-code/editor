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
import * as DOM from 'vs/base/browser/dom';
import { StandardKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { BaseActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { DropdownMenuActionViewItem } from 'vs/base/browser/ui/dropdown/dropdownActionViewItem';
import { MenuEntryActionViewItem } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IThemeService } from 'vs/platform/theme/common/themeService';
let DropdownWithPrimaryActionViewItem = class DropdownWithPrimaryActionViewItem extends BaseActionViewItem {
    _contextMenuProvider;
    _options;
    _primaryAction;
    _dropdown;
    _container = null;
    _dropdownContainer = null;
    get onDidChangeDropdownVisibility() {
        return this._dropdown.onDidChangeVisibility;
    }
    constructor(primaryAction, dropdownAction, dropdownMenuActions, className, _contextMenuProvider, _options, _keybindingService, _notificationService, _contextKeyService, _themeService) {
        super(null, primaryAction);
        this._contextMenuProvider = _contextMenuProvider;
        this._options = _options;
        this._primaryAction = new MenuEntryActionViewItem(primaryAction, undefined, _keybindingService, _notificationService, _contextKeyService, _themeService, _contextMenuProvider);
        this._dropdown = new DropdownMenuActionViewItem(dropdownAction, dropdownMenuActions, this._contextMenuProvider, {
            menuAsChild: true,
            classNames: className ? ['codicon', 'codicon-chevron-down', className] : ['codicon', 'codicon-chevron-down'],
            keybindingProvider: this._options?.getKeyBinding
        });
    }
    setActionContext(newContext) {
        super.setActionContext(newContext);
        this._primaryAction.setActionContext(newContext);
        this._dropdown.setActionContext(newContext);
    }
    render(container) {
        this._container = container;
        super.render(this._container);
        this._container.classList.add('monaco-dropdown-with-primary');
        const primaryContainer = DOM.$('.action-container');
        this._primaryAction.render(DOM.append(this._container, primaryContainer));
        this._dropdownContainer = DOM.$('.dropdown-action-container');
        this._dropdown.render(DOM.append(this._container, this._dropdownContainer));
        this._register(DOM.addDisposableListener(primaryContainer, DOM.EventType.KEY_DOWN, (e) => {
            const event = new StandardKeyboardEvent(e);
            if (event.equals(17 /* KeyCode.RightArrow */)) {
                this._primaryAction.element.tabIndex = -1;
                this._dropdown.focus();
                event.stopPropagation();
            }
        }));
        this._register(DOM.addDisposableListener(this._dropdownContainer, DOM.EventType.KEY_DOWN, (e) => {
            const event = new StandardKeyboardEvent(e);
            if (event.equals(15 /* KeyCode.LeftArrow */)) {
                this._primaryAction.element.tabIndex = 0;
                this._dropdown.setFocusable(false);
                this._primaryAction.element?.focus();
                event.stopPropagation();
            }
        }));
    }
    focus(fromRight) {
        if (fromRight) {
            this._dropdown.focus();
        }
        else {
            this._primaryAction.element.tabIndex = 0;
            this._primaryAction.element.focus();
        }
    }
    blur() {
        this._primaryAction.element.tabIndex = -1;
        this._dropdown.blur();
        this._container.blur();
    }
    setFocusable(focusable) {
        if (focusable) {
            this._primaryAction.element.tabIndex = 0;
        }
        else {
            this._primaryAction.element.tabIndex = -1;
            this._dropdown.setFocusable(false);
        }
    }
    update(dropdownAction, dropdownMenuActions, dropdownIcon) {
        this._dropdown.dispose();
        this._dropdown = new DropdownMenuActionViewItem(dropdownAction, dropdownMenuActions, this._contextMenuProvider, {
            menuAsChild: true,
            classNames: ['codicon', dropdownIcon || 'codicon-chevron-down']
        });
        if (this._dropdownContainer) {
            this._dropdown.render(this._dropdownContainer);
        }
    }
    dispose() {
        this._primaryAction.dispose();
        this._dropdown.dispose();
        super.dispose();
    }
};
DropdownWithPrimaryActionViewItem = __decorate([
    __param(6, IKeybindingService),
    __param(7, INotificationService),
    __param(8, IContextKeyService),
    __param(9, IThemeService)
], DropdownWithPrimaryActionViewItem);
export { DropdownWithPrimaryActionViewItem };
