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
import { ISharedProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { Disposable } from 'vs/base/common/lifecycle';
import { Emitter } from 'vs/base/common/event';
import { IUserDataSyncAccountService } from 'vs/platform/userDataSync/common/userDataSyncAccount';
let UserDataSyncAccountService = class UserDataSyncAccountService extends Disposable {
    channel;
    _account;
    get account() { return this._account; }
    get onTokenFailed() { return this.channel.listen('onTokenFailed'); }
    _onDidChangeAccount = this._register(new Emitter());
    onDidChangeAccount = this._onDidChangeAccount.event;
    constructor(sharedProcessService) {
        super();
        this.channel = sharedProcessService.getChannel('userDataSyncAccount');
        this.channel.call('_getInitialData').then(account => {
            this._account = account;
            this._register(this.channel.listen('onDidChangeAccount')(account => {
                this._account = account;
                this._onDidChangeAccount.fire(account);
            }));
        });
    }
    updateAccount(account) {
        return this.channel.call('updateAccount', account);
    }
};
UserDataSyncAccountService = __decorate([
    __param(0, ISharedProcessService)
], UserDataSyncAccountService);
export { UserDataSyncAccountService };
registerSingleton(IUserDataSyncAccountService, UserDataSyncAccountService, 1 /* InstantiationType.Delayed */);
