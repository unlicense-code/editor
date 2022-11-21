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
import { Disposable, isDisposable } from 'vs/base/common/lifecycle';
import { Storage } from 'vs/base/parts/storage/common/storage';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { AbstractStorageService, IStorageService } from 'vs/platform/storage/common/storage';
export const IUserDataProfileStorageService = createDecorator('IUserDataProfileStorageService');
let AbstractUserDataProfileStorageService = class AbstractUserDataProfileStorageService extends Disposable {
    storageService;
    _serviceBrand;
    constructor(storageService) {
        super();
        this.storageService = storageService;
    }
    async readStorageData(profile) {
        return this.withProfileScopedStorageService(profile, async (storageService) => this.getItems(storageService));
    }
    async updateStorageData(profile, data, target) {
        return this.withProfileScopedStorageService(profile, async (storageService) => this.writeItems(storageService, data, target));
    }
    async withProfileScopedStorageService(profile, fn) {
        if (this.storageService.hasScope(profile)) {
            return fn(this.storageService);
        }
        const storageDatabase = await this.createStorageDatabase(profile);
        const storageService = new StorageService(storageDatabase);
        try {
            await storageService.initialize();
            const result = await fn(storageService);
            await storageService.flush();
            return result;
        }
        finally {
            storageService.dispose();
            await this.closeAndDispose(storageDatabase);
        }
    }
    getItems(storageService) {
        const result = new Map();
        const populate = (target) => {
            for (const key of storageService.keys(0 /* StorageScope.PROFILE */, target)) {
                result.set(key, { value: storageService.get(key, 0 /* StorageScope.PROFILE */), target });
            }
        };
        populate(0 /* StorageTarget.USER */);
        populate(1 /* StorageTarget.MACHINE */);
        return result;
    }
    writeItems(storageService, items, target) {
        for (const [key, value] of items) {
            storageService.store(key, value, 0 /* StorageScope.PROFILE */, target);
        }
    }
    async closeAndDispose(storageDatabase) {
        try {
            await storageDatabase.close();
        }
        finally {
            if (isDisposable(storageDatabase)) {
                storageDatabase.dispose();
            }
        }
    }
};
AbstractUserDataProfileStorageService = __decorate([
    __param(0, IStorageService)
], AbstractUserDataProfileStorageService);
export { AbstractUserDataProfileStorageService };
class StorageService extends AbstractStorageService {
    profileStorage;
    constructor(profileStorageDatabase) {
        super({ flushInterval: 100 });
        this.profileStorage = this._register(new Storage(profileStorageDatabase));
    }
    doInitialize() {
        return this.profileStorage.init();
    }
    getStorage(scope) {
        return scope === 0 /* StorageScope.PROFILE */ ? this.profileStorage : undefined;
    }
    getLogDetails() { return undefined; }
    async switchToProfile() { }
    async switchToWorkspace() { }
    hasScope() { return false; }
}
