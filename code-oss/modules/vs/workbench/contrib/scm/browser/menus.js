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
import 'vs/css!./media/scm';
import { Emitter } from 'vs/base/common/event';
import { DisposableStore, dispose } from 'vs/base/common/lifecycle';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IMenuService, MenuId } from 'vs/platform/actions/common/actions';
import { createAndFillInActionBarActions } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { ISCMService } from 'vs/workbench/contrib/scm/common/scm';
import { equals } from 'vs/base/common/arrays';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
function actionEquals(a, b) {
    return a.id === b.id;
}
let SCMTitleMenu = class SCMTitleMenu {
    _actions = [];
    get actions() { return this._actions; }
    _secondaryActions = [];
    get secondaryActions() { return this._secondaryActions; }
    _onDidChangeTitle = new Emitter();
    onDidChangeTitle = this._onDidChangeTitle.event;
    menu;
    disposables = new DisposableStore();
    constructor(menuService, contextKeyService) {
        this.menu = menuService.createMenu(MenuId.SCMTitle, contextKeyService);
        this.disposables.add(this.menu);
        this.menu.onDidChange(this.updateTitleActions, this, this.disposables);
        this.updateTitleActions();
    }
    updateTitleActions() {
        const primary = [];
        const secondary = [];
        createAndFillInActionBarActions(this.menu, { shouldForwardArgs: true }, { primary, secondary });
        if (equals(primary, this._actions, actionEquals) && equals(secondary, this._secondaryActions, actionEquals)) {
            return;
        }
        this._actions = primary;
        this._secondaryActions = secondary;
        this._onDidChangeTitle.fire();
    }
    dispose() {
        this.disposables.dispose();
    }
};
SCMTitleMenu = __decorate([
    __param(0, IMenuService),
    __param(1, IContextKeyService)
], SCMTitleMenu);
export { SCMTitleMenu };
class SCMMenusItem {
    contextKeyService;
    menuService;
    _resourceGroupMenu;
    get resourceGroupMenu() {
        if (!this._resourceGroupMenu) {
            this._resourceGroupMenu = this.menuService.createMenu(MenuId.SCMResourceGroupContext, this.contextKeyService);
        }
        return this._resourceGroupMenu;
    }
    _resourceFolderMenu;
    get resourceFolderMenu() {
        if (!this._resourceFolderMenu) {
            this._resourceFolderMenu = this.menuService.createMenu(MenuId.SCMResourceFolderContext, this.contextKeyService);
        }
        return this._resourceFolderMenu;
    }
    genericResourceMenu;
    contextualResourceMenus;
    constructor(contextKeyService, menuService) {
        this.contextKeyService = contextKeyService;
        this.menuService = menuService;
    }
    getResourceMenu(resource) {
        if (typeof resource.contextValue === 'undefined') {
            if (!this.genericResourceMenu) {
                this.genericResourceMenu = this.menuService.createMenu(MenuId.SCMResourceContext, this.contextKeyService);
            }
            return this.genericResourceMenu;
        }
        if (!this.contextualResourceMenus) {
            this.contextualResourceMenus = new Map();
        }
        let item = this.contextualResourceMenus.get(resource.contextValue);
        if (!item) {
            const contextKeyService = this.contextKeyService.createOverlay([['scmResourceState', resource.contextValue]]);
            const menu = this.menuService.createMenu(MenuId.SCMResourceContext, contextKeyService);
            item = {
                menu, dispose() {
                    menu.dispose();
                }
            };
            this.contextualResourceMenus.set(resource.contextValue, item);
        }
        return item.menu;
    }
    dispose() {
        this._resourceGroupMenu?.dispose();
        this._resourceFolderMenu?.dispose();
        this.genericResourceMenu?.dispose();
        if (this.contextualResourceMenus) {
            dispose(this.contextualResourceMenus.values());
            this.contextualResourceMenus.clear();
            this.contextualResourceMenus = undefined;
        }
    }
}
let SCMRepositoryMenus = class SCMRepositoryMenus {
    menuService;
    contextKeyService;
    titleMenu;
    resourceGroups = [];
    resourceGroupMenusItems = new Map();
    _repositoryMenu;
    get repositoryMenu() {
        if (!this._repositoryMenu) {
            this._repositoryMenu = this.menuService.createMenu(MenuId.SCMSourceControl, this.contextKeyService);
            this.disposables.add(this._repositoryMenu);
        }
        return this._repositoryMenu;
    }
    disposables = new DisposableStore();
    constructor(provider, contextKeyService, instantiationService, menuService) {
        this.menuService = menuService;
        this.contextKeyService = contextKeyService.createOverlay([
            ['scmProvider', provider.contextValue],
            ['scmProviderRootUri', provider.rootUri?.toString()],
            ['scmProviderHasRootUri', !!provider.rootUri],
        ]);
        const serviceCollection = new ServiceCollection([IContextKeyService, this.contextKeyService]);
        instantiationService = instantiationService.createChild(serviceCollection);
        this.titleMenu = instantiationService.createInstance(SCMTitleMenu);
        provider.groups.onDidSplice(this.onDidSpliceGroups, this, this.disposables);
        this.onDidSpliceGroups({ start: 0, deleteCount: 0, toInsert: provider.groups.elements });
    }
    getResourceGroupMenu(group) {
        return this.getOrCreateResourceGroupMenusItem(group).resourceGroupMenu;
    }
    getResourceMenu(resource) {
        return this.getOrCreateResourceGroupMenusItem(resource.resourceGroup).getResourceMenu(resource);
    }
    getResourceFolderMenu(group) {
        return this.getOrCreateResourceGroupMenusItem(group).resourceFolderMenu;
    }
    getOrCreateResourceGroupMenusItem(group) {
        let result = this.resourceGroupMenusItems.get(group);
        if (!result) {
            const contextKeyService = this.contextKeyService.createOverlay([
                ['scmResourceGroup', group.id],
            ]);
            result = new SCMMenusItem(contextKeyService, this.menuService);
            this.resourceGroupMenusItems.set(group, result);
        }
        return result;
    }
    onDidSpliceGroups({ start, deleteCount, toInsert }) {
        const deleted = this.resourceGroups.splice(start, deleteCount, ...toInsert);
        for (const group of deleted) {
            const item = this.resourceGroupMenusItems.get(group);
            item?.dispose();
            this.resourceGroupMenusItems.delete(group);
        }
    }
    dispose() {
        this.disposables.dispose();
        this.resourceGroupMenusItems.forEach(item => item.dispose());
    }
};
SCMRepositoryMenus = __decorate([
    __param(1, IContextKeyService),
    __param(2, IInstantiationService),
    __param(3, IMenuService)
], SCMRepositoryMenus);
export { SCMRepositoryMenus };
let SCMMenus = class SCMMenus {
    instantiationService;
    titleMenu;
    disposables = new DisposableStore();
    menus = new Map();
    constructor(scmService, instantiationService) {
        this.instantiationService = instantiationService;
        this.titleMenu = instantiationService.createInstance(SCMTitleMenu);
        scmService.onDidRemoveRepository(this.onDidRemoveRepository, this, this.disposables);
    }
    onDidRemoveRepository(repository) {
        const menus = this.menus.get(repository.provider);
        menus?.dispose();
        this.menus.delete(repository.provider);
    }
    getRepositoryMenus(provider) {
        let result = this.menus.get(provider);
        if (!result) {
            const menus = this.instantiationService.createInstance(SCMRepositoryMenus, provider);
            const dispose = () => {
                menus.dispose();
                this.menus.delete(provider);
            };
            result = { menus, dispose };
            this.menus.set(provider, result);
        }
        return result.menus;
    }
    dispose() {
        this.disposables.dispose();
    }
};
SCMMenus = __decorate([
    __param(0, ISCMService),
    __param(1, IInstantiationService)
], SCMMenus);
export { SCMMenus };
