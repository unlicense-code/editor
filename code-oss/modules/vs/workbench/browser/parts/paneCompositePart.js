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
import { Event } from 'vs/base/common/event';
import { assertIsDefined } from 'vs/base/common/types';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ActivitybarPart } from 'vs/workbench/browser/parts/activitybar/activitybarPart';
import { AuxiliaryBarPart } from 'vs/workbench/browser/parts/auxiliarybar/auxiliaryBarPart';
import { PanelPart } from 'vs/workbench/browser/parts/panel/panelPart';
import { SidebarPart } from 'vs/workbench/browser/parts/sidebar/sidebarPart';
import { ViewContainerLocations } from 'vs/workbench/common/views';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
let PaneCompositeParts = class PaneCompositeParts extends Disposable {
    onDidPaneCompositeOpen;
    onDidPaneCompositeClose;
    paneCompositeParts = new Map();
    paneCompositeSelectorParts = new Map();
    constructor(instantiationService) {
        super();
        const panelPart = instantiationService.createInstance(PanelPart);
        const sideBarPart = instantiationService.createInstance(SidebarPart);
        const auxiliaryBarPart = instantiationService.createInstance(AuxiliaryBarPart);
        const activityBarPart = instantiationService.createInstance(ActivitybarPart, sideBarPart);
        this.paneCompositeParts.set(1 /* ViewContainerLocation.Panel */, panelPart);
        this.paneCompositeParts.set(0 /* ViewContainerLocation.Sidebar */, sideBarPart);
        this.paneCompositeParts.set(2 /* ViewContainerLocation.AuxiliaryBar */, auxiliaryBarPart);
        this.paneCompositeSelectorParts.set(1 /* ViewContainerLocation.Panel */, panelPart);
        this.paneCompositeSelectorParts.set(0 /* ViewContainerLocation.Sidebar */, activityBarPart);
        this.paneCompositeSelectorParts.set(2 /* ViewContainerLocation.AuxiliaryBar */, auxiliaryBarPart);
        const eventDisposables = this._register(new DisposableStore());
        this.onDidPaneCompositeOpen = Event.any(...ViewContainerLocations.map(loc => Event.map(this.paneCompositeParts.get(loc).onDidPaneCompositeOpen, composite => { return { composite, viewContainerLocation: loc }; }, eventDisposables)));
        this.onDidPaneCompositeClose = Event.any(...ViewContainerLocations.map(loc => Event.map(this.paneCompositeParts.get(loc).onDidPaneCompositeClose, composite => { return { composite, viewContainerLocation: loc }; }, eventDisposables)));
    }
    openPaneComposite(id, viewContainerLocation, focus) {
        return this.getPartByLocation(viewContainerLocation).openPaneComposite(id, focus);
    }
    getActivePaneComposite(viewContainerLocation) {
        return this.getPartByLocation(viewContainerLocation).getActivePaneComposite();
    }
    getPaneComposite(id, viewContainerLocation) {
        return this.getPartByLocation(viewContainerLocation).getPaneComposite(id);
    }
    getPaneComposites(viewContainerLocation) {
        return this.getPartByLocation(viewContainerLocation).getPaneComposites();
    }
    getPinnedPaneCompositeIds(viewContainerLocation) {
        return this.getSelectorPartByLocation(viewContainerLocation).getPinnedPaneCompositeIds();
    }
    getVisiblePaneCompositeIds(viewContainerLocation) {
        return this.getSelectorPartByLocation(viewContainerLocation).getVisiblePaneCompositeIds();
    }
    getProgressIndicator(id, viewContainerLocation) {
        return this.getPartByLocation(viewContainerLocation).getProgressIndicator(id);
    }
    hideActivePaneComposite(viewContainerLocation) {
        this.getPartByLocation(viewContainerLocation).hideActivePaneComposite();
    }
    getLastActivePaneCompositeId(viewContainerLocation) {
        return this.getPartByLocation(viewContainerLocation).getLastActivePaneCompositeId();
    }
    showActivity(id, viewContainerLocation, badge, clazz, priority) {
        return this.getSelectorPartByLocation(viewContainerLocation).showActivity(id, badge, clazz, priority);
    }
    getPartByLocation(viewContainerLocation) {
        return assertIsDefined(this.paneCompositeParts.get(viewContainerLocation));
    }
    getSelectorPartByLocation(viewContainerLocation) {
        return assertIsDefined(this.paneCompositeSelectorParts.get(viewContainerLocation));
    }
};
PaneCompositeParts = __decorate([
    __param(0, IInstantiationService)
], PaneCompositeParts);
export { PaneCompositeParts };
registerSingleton(IPaneCompositePartService, PaneCompositeParts, 1 /* InstantiationType.Delayed */);
