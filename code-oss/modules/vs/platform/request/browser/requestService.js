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
import { request } from 'vs/base/parts/request/browser/request';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILogService } from 'vs/platform/log/common/log';
/**
 * This service exposes the `request` API, while using the global
 * or configured proxy settings.
 */
let RequestService = class RequestService {
    configurationService;
    logService;
    constructor(configurationService, logService) {
        this.configurationService = configurationService;
        this.logService = logService;
    }
    async request(options, token) {
        this.logService.trace('RequestService#request (browser) - begin', options.url);
        if (!options.proxyAuthorization) {
            options.proxyAuthorization = this.configurationService.getValue('http.proxyAuthorization');
        }
        try {
            const res = await request(options, token);
            this.logService.trace('RequestService#request (browser) - success', options.url);
            return res;
        }
        catch (error) {
            this.logService.error('RequestService#request (browser) - error', options.url, error);
            throw error;
        }
    }
    async resolveProxy(url) {
        return undefined; // not implemented in the web
    }
};
RequestService = __decorate([
    __param(0, IConfigurationService),
    __param(1, ILogService)
], RequestService);
export { RequestService };
