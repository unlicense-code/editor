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
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { MarkerList, IMarkerNavigationService } from 'vs/editor/contrib/gotoError/browser/markerNavigationService';
import { CellUri } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { IMarkerService } from 'vs/platform/markers/common/markers';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
let MarkerListProvider = class MarkerListProvider {
    _markerService;
    _configService;
    _dispoables;
    constructor(_markerService, markerNavigation, _configService) {
        this._markerService = _markerService;
        this._configService = _configService;
        this._dispoables = markerNavigation.registerProvider(this);
    }
    dispose() {
        this._dispoables.dispose();
    }
    getMarkerList(resource) {
        if (!resource) {
            return undefined;
        }
        const data = CellUri.parse(resource);
        if (!data) {
            return undefined;
        }
        return new MarkerList(uri => {
            const otherData = CellUri.parse(uri);
            return otherData?.notebook.toString() === data.notebook.toString();
        }, this._markerService, this._configService);
    }
};
MarkerListProvider = __decorate([
    __param(0, IMarkerService),
    __param(1, IMarkerNavigationService),
    __param(2, IConfigurationService)
], MarkerListProvider);
Registry
    .as(WorkbenchExtensions.Workbench)
    .registerWorkbenchContribution(MarkerListProvider, 2 /* LifecyclePhase.Ready */);
