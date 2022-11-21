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
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ViewPaneContainer } from 'vs/workbench/browser/parts/views/viewPaneContainer';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
let FilterViewPaneContainer = class FilterViewPaneContainer extends ViewPaneContainer {
    constantViewDescriptors = new Map();
    allViews = new Map();
    filterValue;
    constructor(viewletId, onDidChangeFilterValue, configurationService, layoutService, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService, viewDescriptorService) {
        super(viewletId, { mergeViewWithContainerWhenSingleView: false }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService);
        this._register(onDidChangeFilterValue(newFilterValue => {
            this.filterValue = newFilterValue;
            this.onFilterChanged(newFilterValue);
        }));
        this._register(this.onDidChangeViewVisibility(view => {
            const descriptorMap = Array.from(this.allViews.entries()).find(entry => entry[1].has(view.id));
            if (descriptorMap && !this.filterValue?.includes(descriptorMap[0])) {
                this.setFilter(descriptorMap[1].get(view.id));
            }
        }));
        this._register(this.viewContainerModel.onDidChangeActiveViewDescriptors(() => {
            this.updateAllViews(this.viewContainerModel.activeViewDescriptors);
        }));
    }
    updateAllViews(viewDescriptors) {
        viewDescriptors.forEach(descriptor => {
            const filterOnValue = this.getFilterOn(descriptor);
            if (!filterOnValue) {
                return;
            }
            if (!this.allViews.has(filterOnValue)) {
                this.allViews.set(filterOnValue, new Map());
            }
            this.allViews.get(filterOnValue).set(descriptor.id, descriptor);
            if (this.filterValue && !this.filterValue.includes(filterOnValue) && this.panes.find(pane => pane.id === descriptor.id)) {
                this.viewContainerModel.setVisible(descriptor.id, false);
            }
        });
    }
    addConstantViewDescriptors(constantViewDescriptors) {
        constantViewDescriptors.forEach(viewDescriptor => this.constantViewDescriptors.set(viewDescriptor.id, viewDescriptor));
    }
    onFilterChanged(newFilterValue) {
        if (this.allViews.size === 0) {
            this.updateAllViews(this.viewContainerModel.activeViewDescriptors);
        }
        this.getViewsNotForTarget(newFilterValue).forEach(item => this.viewContainerModel.setVisible(item.id, false));
        this.getViewsForTarget(newFilterValue).forEach(item => this.viewContainerModel.setVisible(item.id, true));
    }
    getViewsForTarget(target) {
        const views = [];
        for (let i = 0; i < target.length; i++) {
            if (this.allViews.has(target[i])) {
                views.push(...Array.from(this.allViews.get(target[i]).values()));
            }
        }
        return views;
    }
    getViewsNotForTarget(target) {
        const iterable = this.allViews.keys();
        let key = iterable.next();
        let views = [];
        while (!key.done) {
            let isForTarget = false;
            target.forEach(value => {
                if (key.value === value) {
                    isForTarget = true;
                }
            });
            if (!isForTarget) {
                views = views.concat(this.getViewsForTarget([key.value]));
            }
            key = iterable.next();
        }
        return views;
    }
    onDidAddViewDescriptors(added) {
        const panes = super.onDidAddViewDescriptors(added);
        for (let i = 0; i < added.length; i++) {
            if (this.constantViewDescriptors.has(added[i].viewDescriptor.id)) {
                panes[i].setExpanded(false);
            }
        }
        // Check that allViews is ready
        if (this.allViews.size === 0) {
            this.updateAllViews(this.viewContainerModel.activeViewDescriptors);
        }
        return panes;
    }
};
FilterViewPaneContainer = __decorate([
    __param(2, IConfigurationService),
    __param(3, IWorkbenchLayoutService),
    __param(4, ITelemetryService),
    __param(5, IStorageService),
    __param(6, IInstantiationService),
    __param(7, IThemeService),
    __param(8, IContextMenuService),
    __param(9, IExtensionService),
    __param(10, IWorkspaceContextService),
    __param(11, IViewDescriptorService)
], FilterViewPaneContainer);
export { FilterViewPaneContainer };
