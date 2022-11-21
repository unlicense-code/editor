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
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { Emitter } from 'vs/base/common/event';
import { IMenuService, SubmenuItemAction } from 'vs/platform/actions/common/actions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { createAndFillInActionBarActions } from 'vs/platform/actions/browser/menuEntryActionViewItem';
class MenuActions extends Disposable {
    options;
    menuService;
    contextKeyService;
    menu;
    _primaryActions = [];
    get primaryActions() { return this._primaryActions; }
    _secondaryActions = [];
    get secondaryActions() { return this._secondaryActions; }
    _onDidChange = this._register(new Emitter());
    onDidChange = this._onDidChange.event;
    disposables = this._register(new DisposableStore());
    constructor(menuId, options, menuService, contextKeyService) {
        super();
        this.options = options;
        this.menuService = menuService;
        this.contextKeyService = contextKeyService;
        this.menu = this._register(menuService.createMenu(menuId, contextKeyService));
        this._register(this.menu.onDidChange(() => this.updateActions()));
        this.updateActions();
    }
    updateActions() {
        this.disposables.clear();
        this._primaryActions = [];
        this._secondaryActions = [];
        createAndFillInActionBarActions(this.menu, this.options, { primary: this._primaryActions, secondary: this._secondaryActions });
        this.disposables.add(this.updateSubmenus([...this._primaryActions, ...this._secondaryActions], {}));
        this._onDidChange.fire();
    }
    updateSubmenus(actions, submenus) {
        const disposables = new DisposableStore();
        for (const action of actions) {
            if (action instanceof SubmenuItemAction && !submenus[action.item.submenu.id]) {
                const menu = submenus[action.item.submenu.id] = disposables.add(this.menuService.createMenu(action.item.submenu, this.contextKeyService));
                disposables.add(menu.onDidChange(() => this.updateActions()));
                disposables.add(this.updateSubmenus(action.actions, submenus));
            }
        }
        return disposables;
    }
}
let CompositeMenuActions = class CompositeMenuActions extends Disposable {
    menuId;
    contextMenuId;
    options;
    contextKeyService;
    menuService;
    menuActions;
    _onDidChange = this._register(new Emitter());
    onDidChange = this._onDidChange.event;
    constructor(menuId, contextMenuId, options, contextKeyService, menuService) {
        super();
        this.menuId = menuId;
        this.contextMenuId = contextMenuId;
        this.options = options;
        this.contextKeyService = contextKeyService;
        this.menuService = menuService;
        this.menuActions = this._register(new MenuActions(menuId, this.options, menuService, contextKeyService));
        this._register(this.menuActions.onDidChange(() => this._onDidChange.fire()));
    }
    getPrimaryActions() {
        return this.menuActions.primaryActions;
    }
    getSecondaryActions() {
        return this.menuActions.secondaryActions;
    }
    getContextMenuActions() {
        const actions = [];
        if (this.contextMenuId) {
            const menu = this.menuService.createMenu(this.contextMenuId, this.contextKeyService);
            createAndFillInActionBarActions(menu, this.options, { primary: [], secondary: actions });
            menu.dispose();
        }
        return actions;
    }
};
CompositeMenuActions = __decorate([
    __param(3, IContextKeyService),
    __param(4, IMenuService)
], CompositeMenuActions);
export { CompositeMenuActions };
