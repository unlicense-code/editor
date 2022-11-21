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
import { Extensions } from 'vs/workbench/common/contributions';
import { ISplashStorageService } from 'vs/workbench/contrib/splash/browser/splash';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { PartsSplash } from 'vs/workbench/contrib/splash/browser/partsSplash';
let SplashStorageService = class SplashStorageService {
    _serviceBrand;
    saveWindowSplash;
    constructor(nativeHostService) {
        this.saveWindowSplash = nativeHostService.saveWindowSplash.bind(nativeHostService);
    }
};
SplashStorageService = __decorate([
    __param(0, INativeHostService)
], SplashStorageService);
registerSingleton(ISplashStorageService, SplashStorageService, 1 /* InstantiationType.Delayed */);
Registry.as(Extensions.Workbench).registerWorkbenchContribution(PartsSplash, 1 /* LifecyclePhase.Starting */);
