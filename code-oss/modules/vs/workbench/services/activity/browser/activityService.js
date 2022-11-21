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
import { IActivityService } from 'vs/workbench/services/activity/common/activity';
import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { GLOBAL_ACTIVITY_ID, ACCOUNTS_ACTIVITY_ID } from 'vs/workbench/common/activity';
import { Event } from 'vs/base/common/event';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
let ViewContainerActivityByView = class ViewContainerActivityByView extends Disposable {
    viewId;
    viewDescriptorService;
    activityService;
    activity = undefined;
    activityDisposable = Disposable.None;
    constructor(viewId, viewDescriptorService, activityService) {
        super();
        this.viewId = viewId;
        this.viewDescriptorService = viewDescriptorService;
        this.activityService = activityService;
        this._register(Event.filter(this.viewDescriptorService.onDidChangeContainer, e => e.views.some(view => view.id === viewId))(() => this.update()));
        this._register(Event.filter(this.viewDescriptorService.onDidChangeLocation, e => e.views.some(view => view.id === viewId))(() => this.update()));
    }
    setActivity(activity) {
        this.activity = activity;
        this.update();
    }
    clearActivity() {
        this.activity = undefined;
        this.update();
    }
    update() {
        this.activityDisposable.dispose();
        const container = this.viewDescriptorService.getViewContainerByViewId(this.viewId);
        if (container && this.activity) {
            this.activityDisposable = this.activityService.showViewContainerActivity(container.id, this.activity);
        }
    }
    dispose() {
        this.activityDisposable.dispose();
    }
};
ViewContainerActivityByView = __decorate([
    __param(1, IViewDescriptorService),
    __param(2, IActivityService)
], ViewContainerActivityByView);
let ActivityService = class ActivityService {
    paneCompositeService;
    viewDescriptorService;
    instantiationService;
    _serviceBrand;
    viewActivities = new Map();
    constructor(paneCompositeService, viewDescriptorService, instantiationService) {
        this.paneCompositeService = paneCompositeService;
        this.viewDescriptorService = viewDescriptorService;
        this.instantiationService = instantiationService;
    }
    showViewContainerActivity(viewContainerId, { badge, clazz, priority }) {
        const viewContainer = this.viewDescriptorService.getViewContainerById(viewContainerId);
        if (viewContainer) {
            const location = this.viewDescriptorService.getViewContainerLocation(viewContainer);
            if (location !== null) {
                return this.paneCompositeService.showActivity(viewContainer.id, location, badge, clazz, priority);
            }
        }
        return Disposable.None;
    }
    showViewActivity(viewId, activity) {
        let maybeItem = this.viewActivities.get(viewId);
        if (maybeItem) {
            maybeItem.id++;
        }
        else {
            maybeItem = {
                id: 1,
                activity: this.instantiationService.createInstance(ViewContainerActivityByView, viewId)
            };
            this.viewActivities.set(viewId, maybeItem);
        }
        const id = maybeItem.id;
        maybeItem.activity.setActivity(activity);
        const item = maybeItem;
        return toDisposable(() => {
            if (item.id === id) {
                item.activity.dispose();
                this.viewActivities.delete(viewId);
            }
        });
    }
    showAccountsActivity({ badge, clazz, priority }) {
        return this.paneCompositeService.showActivity(ACCOUNTS_ACTIVITY_ID, 0 /* ViewContainerLocation.Sidebar */, badge, clazz, priority);
    }
    showGlobalActivity({ badge, clazz, priority }) {
        return this.paneCompositeService.showActivity(GLOBAL_ACTIVITY_ID, 0 /* ViewContainerLocation.Sidebar */, badge, clazz, priority);
    }
};
ActivityService = __decorate([
    __param(0, IPaneCompositePartService),
    __param(1, IViewDescriptorService),
    __param(2, IInstantiationService)
], ActivityService);
export { ActivityService };
registerSingleton(IActivityService, ActivityService, 1 /* InstantiationType.Delayed */);
