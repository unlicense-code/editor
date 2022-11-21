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
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILogService } from 'vs/platform/log/common/log';
import { RequestService } from 'vs/platform/request/browser/requestService';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IRequestService } from 'vs/platform/request/common/request';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
let NativeRequestService = class NativeRequestService extends RequestService {
    nativeHostService;
    constructor(configurationService, logService, nativeHostService) {
        super(configurationService, logService);
        this.nativeHostService = nativeHostService;
    }
    async resolveProxy(url) {
        return this.nativeHostService.resolveProxy(url);
    }
};
NativeRequestService = __decorate([
    __param(0, IConfigurationService),
    __param(1, ILogService),
    __param(2, INativeHostService)
], NativeRequestService);
export { NativeRequestService };
registerSingleton(IRequestService, NativeRequestService, 1 /* InstantiationType.Delayed */);
