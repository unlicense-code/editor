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
import { Promises } from 'vs/base/common/async';
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { defaultUserDataProfileIcon } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
let UserDataProfileService = class UserDataProfileService extends Disposable {
    _serviceBrand;
    _onDidChangeCurrentProfile = this._register(new Emitter());
    onDidChangeCurrentProfile = this._onDidChangeCurrentProfile.event;
    _onDidUpdateCurrentProfile = this._register(new Emitter());
    onDidUpdateCurrentProfile = this._onDidUpdateCurrentProfile.event;
    _currentProfile;
    get currentProfile() { return this._currentProfile; }
    constructor(currentProfile, userDataProfilesService) {
        super();
        this._currentProfile = currentProfile;
        this._register(userDataProfilesService.onDidChangeProfiles(e => {
            const updatedCurrentProfile = e.updated.find(p => this._currentProfile.id === p.id);
            if (updatedCurrentProfile) {
                this._currentProfile = updatedCurrentProfile;
                this._onDidUpdateCurrentProfile.fire();
            }
        }));
    }
    async updateCurrentProfile(userDataProfile, preserveData) {
        if (this._currentProfile.id === userDataProfile.id) {
            return;
        }
        const previous = this._currentProfile;
        this._currentProfile = userDataProfile;
        const joiners = [];
        this._onDidChangeCurrentProfile.fire({
            preserveData,
            previous,
            profile: userDataProfile,
            join(promise) {
                joiners.push(promise);
            }
        });
        await Promises.settled(joiners);
    }
    getShortName(profile) {
        if (profile.isDefault) {
            return `$(${defaultUserDataProfileIcon.id})`;
        }
        if (profile.shortName) {
            return profile.shortName;
        }
        if (profile.isTransient) {
            return `T${profile.name.charAt(profile.name.length - 1)}`;
        }
        return profile.name.substring(0, 2).toUpperCase();
    }
};
UserDataProfileService = __decorate([
    __param(1, IUserDataProfilesService)
], UserDataProfileService);
export { UserDataProfileService };
