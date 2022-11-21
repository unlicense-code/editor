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
import { BroadcastDataChannel } from 'vs/base/browser/broadcast';
import { revive } from 'vs/base/common/marshalling';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { reviveProfile, UserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
let BrowserUserDataProfilesService = class BrowserUserDataProfilesService extends UserDataProfilesService {
    changesBroadcastChannel;
    constructor(environmentService, fileService, uriIdentityService, logService) {
        super(environmentService, fileService, uriIdentityService, logService);
        this.changesBroadcastChannel = this._register(new BroadcastDataChannel(`${UserDataProfilesService.PROFILES_KEY}.changes`));
        this._register(this.changesBroadcastChannel.onDidReceiveData(changes => {
            try {
                this._profilesObject = undefined;
                const added = changes.added.map(p => reviveProfile(p, this.profilesHome.scheme));
                const removed = changes.removed.map(p => reviveProfile(p, this.profilesHome.scheme));
                const updated = changes.updated.map(p => reviveProfile(p, this.profilesHome.scheme));
                this.updateTransientProfiles(added.filter(a => a.isTransient), removed.filter(a => a.isTransient), updated.filter(a => a.isTransient));
                this._onDidChangeProfiles.fire({
                    added,
                    removed,
                    updated,
                    all: this.profiles
                });
            }
            catch (error) { /* ignore */ }
        }));
    }
    updateTransientProfiles(added, removed, updated) {
        if (added.length) {
            this.transientProfilesObject.profiles.push(...added);
        }
        if (removed.length || updated.length) {
            const allTransientProfiles = this.transientProfilesObject.profiles;
            this.transientProfilesObject.profiles = [];
            for (const profile of allTransientProfiles) {
                if (removed.some(p => profile.id === p.id)) {
                    continue;
                }
                this.transientProfilesObject.profiles.push(updated.find(p => profile.id === p.id) ?? profile);
            }
        }
    }
    getStoredProfiles() {
        try {
            const value = window.localStorage.getItem(UserDataProfilesService.PROFILES_KEY);
            if (value) {
                return revive(JSON.parse(value));
            }
        }
        catch (error) {
            /* ignore */
            this.logService.error(error);
        }
        return [];
    }
    triggerProfilesChanges(added, removed, updated) {
        super.triggerProfilesChanges(added, removed, updated);
        this.changesBroadcastChannel.postData({ added, removed, updated });
    }
    saveStoredProfiles(storedProfiles) {
        window.localStorage.setItem(UserDataProfilesService.PROFILES_KEY, JSON.stringify(storedProfiles));
    }
    getStoredProfileAssociations() {
        try {
            const value = window.localStorage.getItem(UserDataProfilesService.PROFILE_ASSOCIATIONS_KEY);
            if (value) {
                return revive(JSON.parse(value));
            }
        }
        catch (error) {
            /* ignore */
            this.logService.error(error);
        }
        return {};
    }
    saveStoredProfileAssociations(storedProfileAssociations) {
        window.localStorage.setItem(UserDataProfilesService.PROFILE_ASSOCIATIONS_KEY, JSON.stringify(storedProfileAssociations));
    }
};
BrowserUserDataProfilesService = __decorate([
    __param(0, IEnvironmentService),
    __param(1, IFileService),
    __param(2, IUriIdentityService),
    __param(3, ILogService)
], BrowserUserDataProfilesService);
export { BrowserUserDataProfilesService };
