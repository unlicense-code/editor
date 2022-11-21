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
import { Registry } from 'vs/platform/registry/common/platform';
import { Composite, CompositeDescriptor, CompositeRegistry } from 'vs/workbench/browser/composite';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Separator } from 'vs/base/common/actions';
import { SubmenuItemAction } from 'vs/platform/actions/common/actions';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ViewsSubMenu } from 'vs/workbench/browser/parts/views/viewPaneContainer';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { VIEWPANE_FILTER_ACTION } from 'vs/workbench/browser/parts/views/viewPane';
let PaneComposite = class PaneComposite extends Composite {
    storageService;
    instantiationService;
    contextMenuService;
    extensionService;
    contextService;
    viewPaneContainer;
    constructor(id, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService) {
        super(id, telemetryService, themeService, storageService);
        this.storageService = storageService;
        this.instantiationService = instantiationService;
        this.contextMenuService = contextMenuService;
        this.extensionService = extensionService;
        this.contextService = contextService;
    }
    create(parent) {
        this.viewPaneContainer = this._register(this.createViewPaneContainer(parent));
        this._register(this.viewPaneContainer.onTitleAreaUpdate(() => this.updateTitleArea()));
        this.viewPaneContainer.create(parent);
    }
    setVisible(visible) {
        super.setVisible(visible);
        this.viewPaneContainer?.setVisible(visible);
    }
    layout(dimension) {
        this.viewPaneContainer?.layout(dimension);
    }
    getOptimalWidth() {
        return this.viewPaneContainer?.getOptimalWidth() ?? 0;
    }
    openView(id, focus) {
        return this.viewPaneContainer?.openView(id, focus);
    }
    getViewPaneContainer() {
        return this.viewPaneContainer;
    }
    getActionsContext() {
        return this.getViewPaneContainer()?.getActionsContext();
    }
    getContextMenuActions() {
        return this.viewPaneContainer?.menuActions?.getContextMenuActions() ?? [];
    }
    getMenuIds() {
        const result = [];
        if (this.viewPaneContainer?.menuActions) {
            result.push(this.viewPaneContainer.menuActions.menuId);
            if (this.viewPaneContainer.isViewMergedWithContainer()) {
                result.push(this.viewPaneContainer.panes[0].menuActions.menuId);
            }
        }
        return result;
    }
    getActions() {
        const result = [];
        if (this.viewPaneContainer?.menuActions) {
            result.push(...this.viewPaneContainer.menuActions.getPrimaryActions());
            if (this.viewPaneContainer.isViewMergedWithContainer()) {
                const viewPane = this.viewPaneContainer.panes[0];
                if (viewPane.shouldShowFilterInHeader()) {
                    result.push(VIEWPANE_FILTER_ACTION);
                }
                result.push(...viewPane.menuActions.getPrimaryActions());
            }
        }
        return result;
    }
    getSecondaryActions() {
        if (!this.viewPaneContainer?.menuActions) {
            return [];
        }
        const viewPaneActions = this.viewPaneContainer.isViewMergedWithContainer() ? this.viewPaneContainer.panes[0].menuActions.getSecondaryActions() : [];
        let menuActions = this.viewPaneContainer.menuActions.getSecondaryActions();
        const viewsSubmenuActionIndex = menuActions.findIndex(action => action instanceof SubmenuItemAction && action.item.submenu === ViewsSubMenu);
        if (viewsSubmenuActionIndex !== -1) {
            const viewsSubmenuAction = menuActions[viewsSubmenuActionIndex];
            if (viewsSubmenuAction.actions.some(({ enabled }) => enabled)) {
                if (menuActions.length === 1 && viewPaneActions.length === 0) {
                    menuActions = viewsSubmenuAction.actions.slice();
                }
                else if (viewsSubmenuActionIndex !== 0) {
                    menuActions = [viewsSubmenuAction, ...menuActions.slice(0, viewsSubmenuActionIndex), ...menuActions.slice(viewsSubmenuActionIndex + 1)];
                }
            }
            else {
                // Remove views submenu if none of the actions are enabled
                menuActions.splice(viewsSubmenuActionIndex, 1);
            }
        }
        if (menuActions.length && viewPaneActions.length) {
            return [
                ...menuActions,
                new Separator(),
                ...viewPaneActions
            ];
        }
        return menuActions.length ? menuActions : viewPaneActions;
    }
    getActionViewItem(action) {
        return this.viewPaneContainer?.getActionViewItem(action);
    }
    getTitle() {
        return this.viewPaneContainer?.getTitle() ?? '';
    }
    saveState() {
        super.saveState();
    }
    focus() {
        this.viewPaneContainer?.focus();
    }
};
PaneComposite = __decorate([
    __param(1, ITelemetryService),
    __param(2, IStorageService),
    __param(3, IInstantiationService),
    __param(4, IThemeService),
    __param(5, IContextMenuService),
    __param(6, IExtensionService),
    __param(7, IWorkspaceContextService)
], PaneComposite);
export { PaneComposite };
/**
 * A Pane Composite descriptor is a lightweight descriptor of a Pane Composite in the workbench.
 */
export class PaneCompositeDescriptor extends CompositeDescriptor {
    iconUrl;
    static create(ctor, id, name, cssClass, order, requestedIndex, iconUrl) {
        return new PaneCompositeDescriptor(ctor, id, name, cssClass, order, requestedIndex, iconUrl);
    }
    constructor(ctor, id, name, cssClass, order, requestedIndex, iconUrl) {
        super(ctor, id, name, cssClass, order, requestedIndex);
        this.iconUrl = iconUrl;
    }
}
export const Extensions = {
    Viewlets: 'workbench.contributions.viewlets',
    Panels: 'workbench.contributions.panels',
    Auxiliary: 'workbench.contributions.auxiliary',
};
export class PaneCompositeRegistry extends CompositeRegistry {
    /**
     * Registers a viewlet to the platform.
     */
    registerPaneComposite(descriptor) {
        super.registerComposite(descriptor);
    }
    /**
     * Deregisters a viewlet to the platform.
     */
    deregisterPaneComposite(id) {
        super.deregisterComposite(id);
    }
    /**
     * Returns the viewlet descriptor for the given id or null if none.
     */
    getPaneComposite(id) {
        return this.getComposite(id);
    }
    /**
     * Returns an array of registered viewlets known to the platform.
     */
    getPaneComposites() {
        return this.getComposites();
    }
}
Registry.add(Extensions.Viewlets, new PaneCompositeRegistry());
Registry.add(Extensions.Panels, new PaneCompositeRegistry());
Registry.add(Extensions.Auxiliary, new PaneCompositeRegistry());
