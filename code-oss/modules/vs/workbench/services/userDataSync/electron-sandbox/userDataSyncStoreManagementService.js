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
import { IUserDataSyncStoreManagementService } from 'vs/platform/userDataSync/common/userDataSync';
import { ISharedProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { AbstractUserDataSyncStoreManagementService } from 'vs/platform/userDataSync/common/userDataSyncStoreService';
import { IProductService } from 'vs/platform/product/common/productService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { UserDataSyncStoreManagementServiceChannelClient } from 'vs/platform/userDataSync/common/userDataSyncIpc';
let UserDataSyncStoreManagementService = class UserDataSyncStoreManagementService extends AbstractUserDataSyncStoreManagementService {
    channelClient;
    constructor(productService, configurationService, storageService, sharedProcessService) {
        super(productService, configurationService, storageService);
        this.channelClient = this._register(new UserDataSyncStoreManagementServiceChannelClient(sharedProcessService.getChannel('userDataSyncStoreManagement')));
        this._register(this.channelClient.onDidChangeUserDataSyncStore(() => this.updateUserDataSyncStore()));
    }
    async switch(type) {
        return this.channelClient.switch(type);
    }
    async getPreviousUserDataSyncStore() {
        return this.channelClient.getPreviousUserDataSyncStore();
    }
};
UserDataSyncStoreManagementService = __decorate([
    __param(0, IProductService),
    __param(1, IConfigurationService),
    __param(2, IStorageService),
    __param(3, ISharedProcessService)
], UserDataSyncStoreManagementService);
registerSingleton(IUserDataSyncStoreManagementService, UserDataSyncStoreManagementService, 1 /* InstantiationType.Delayed */);
