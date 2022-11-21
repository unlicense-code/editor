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
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { MainContext } from 'vs/workbench/api/common/extHost.protocol';
import { ICredentialsService } from 'vs/platform/credentials/common/credentials';
let MainThreadKeytar = class MainThreadKeytar {
    _credentialsService;
    constructor(_extHostContext, _credentialsService) {
        this._credentialsService = _credentialsService;
    }
    async $getPassword(service, account) {
        return this._credentialsService.getPassword(service, account);
    }
    async $setPassword(service, account, password) {
        return this._credentialsService.setPassword(service, account, password);
    }
    async $deletePassword(service, account) {
        return this._credentialsService.deletePassword(service, account);
    }
    async $findPassword(service) {
        return this._credentialsService.findPassword(service);
    }
    async $findCredentials(service) {
        return this._credentialsService.findCredentials(service);
    }
    dispose() {
        //
    }
};
MainThreadKeytar = __decorate([
    extHostNamedCustomer(MainContext.MainThreadKeytar),
    __param(1, ICredentialsService)
], MainThreadKeytar);
export { MainThreadKeytar };
