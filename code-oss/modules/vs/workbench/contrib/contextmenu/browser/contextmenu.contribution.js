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
import { DisposableStore } from 'vs/base/common/lifecycle';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
let ContextMenuContribution = class ContextMenuContribution {
    disposables = new DisposableStore();
    constructor(layoutService, contextMenuService) {
        const update = (visible) => layoutService.container.classList.toggle('context-menu-visible', visible);
        contextMenuService.onDidShowContextMenu(() => update(true), null, this.disposables);
        contextMenuService.onDidHideContextMenu(() => update(false), null, this.disposables);
    }
};
ContextMenuContribution = __decorate([
    __param(0, ILayoutService),
    __param(1, IContextMenuService)
], ContextMenuContribution);
Registry.as(WorkbenchExtensions.Workbench)
    .registerWorkbenchContribution(ContextMenuContribution, 4 /* LifecyclePhase.Eventually */);
