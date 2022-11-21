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
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IUserDataSyncLogService, IUserDataSyncStoreService } from 'vs/platform/userDataSync/common/userDataSync';
export const IUserDataSyncAccountService = createDecorator('IUserDataSyncAccountService');
let UserDataSyncAccountService = class UserDataSyncAccountService extends Disposable {
    userDataSyncStoreService;
    logService;
    _serviceBrand;
    _account;
    get account() { return this._account; }
    _onDidChangeAccount = this._register(new Emitter());
    onDidChangeAccount = this._onDidChangeAccount.event;
    _onTokenFailed = this._register(new Emitter());
    onTokenFailed = this._onTokenFailed.event;
    wasTokenFailed = false;
    constructor(userDataSyncStoreService, logService) {
        super();
        this.userDataSyncStoreService = userDataSyncStoreService;
        this.logService = logService;
        this._register(userDataSyncStoreService.onTokenFailed(() => {
            this.logService.info('Settings Sync auth token failed', this.account?.authenticationProviderId, this.wasTokenFailed);
            this.updateAccount(undefined);
            this._onTokenFailed.fire(this.wasTokenFailed);
            this.wasTokenFailed = true;
        }));
        this._register(userDataSyncStoreService.onTokenSucceed(() => this.wasTokenFailed = false));
    }
    async updateAccount(account) {
        if (account && this._account ? account.token !== this._account.token || account.authenticationProviderId !== this._account.authenticationProviderId : account !== this._account) {
            this._account = account;
            if (this._account) {
                this.userDataSyncStoreService.setAuthToken(this._account.token, this._account.authenticationProviderId);
            }
            this._onDidChangeAccount.fire(account);
        }
    }
};
UserDataSyncAccountService = __decorate([
    __param(0, IUserDataSyncStoreService),
    __param(1, IUserDataSyncLogService)
], UserDataSyncAccountService);
export { UserDataSyncAccountService };
