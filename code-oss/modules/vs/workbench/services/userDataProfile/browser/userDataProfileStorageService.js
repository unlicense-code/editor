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
import { Emitter, Event } from 'vs/base/common/event';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ILogService } from 'vs/platform/log/common/log';
import { AbstractUserDataProfileStorageService, IUserDataProfileStorageService } from 'vs/platform/userDataProfile/common/userDataProfileStorageService';
import { isProfileUsingDefaultStorage, IStorageService } from 'vs/platform/storage/common/storage';
import { IndexedDBStorageDatabase } from 'vs/workbench/services/storage/browser/storageService';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
let UserDataProfileStorageService = class UserDataProfileStorageService extends AbstractUserDataProfileStorageService {
    userDataProfileService;
    logService;
    _onDidChange = this._register(new Emitter());
    onDidChange = this._onDidChange.event;
    constructor(storageService, userDataProfileService, logService) {
        super(storageService);
        this.userDataProfileService = userDataProfileService;
        this.logService = logService;
        this._register(Event.filter(storageService.onDidChangeTarget, e => e.scope === 0 /* StorageScope.PROFILE */)(e => this.onDidChangeStorageTargetInCurrentProfile()));
        this._register(Event.filter(storageService.onDidChangeValue, e => e.scope === 0 /* StorageScope.PROFILE */)(e => this.onDidChangeStorageValueInCurrentProfile(e)));
    }
    onDidChangeStorageTargetInCurrentProfile() {
        // Not broadcasting changes to other windows/tabs as it is not required in web.
        // Revisit if needed in future.
        this._onDidChange.fire({ targetChanges: [this.userDataProfileService.currentProfile], valueChanges: [] });
    }
    onDidChangeStorageValueInCurrentProfile(e) {
        // Not broadcasting changes to other windows/tabs as it is not required in web
        // Revisit if needed in future.
        this._onDidChange.fire({ targetChanges: [], valueChanges: [{ profile: this.userDataProfileService.currentProfile, changes: [e] }] });
    }
    createStorageDatabase(profile) {
        return isProfileUsingDefaultStorage(profile) ? IndexedDBStorageDatabase.createApplicationStorage(this.logService) : IndexedDBStorageDatabase.createProfileStorage(profile, this.logService);
    }
};
UserDataProfileStorageService = __decorate([
    __param(0, IStorageService),
    __param(1, IUserDataProfileService),
    __param(2, ILogService)
], UserDataProfileStorageService);
export { UserDataProfileStorageService };
registerSingleton(IUserDataProfileStorageService, UserDataProfileStorageService, 1 /* InstantiationType.Delayed */);
