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
import { joinPath } from 'vs/base/common/resources';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IMainProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { reviveProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
let UserDataProfilesNativeService = class UserDataProfilesNativeService extends Disposable {
    _serviceBrand;
    channel;
    profilesHome;
    get defaultProfile() { return this.profiles[0]; }
    _profiles = [];
    get profiles() { return this._profiles; }
    _onDidChangeProfiles = this._register(new Emitter());
    onDidChangeProfiles = this._onDidChangeProfiles.event;
    onDidResetWorkspaces;
    enabled = true;
    constructor(profiles, mainProcessService, environmentService) {
        super();
        this.channel = mainProcessService.getChannel('userDataProfiles');
        this.profilesHome = joinPath(environmentService.userRoamingDataHome, 'profiles');
        this._profiles = profiles.map(profile => reviveProfile(profile, this.profilesHome.scheme));
        this._register(this.channel.listen('onDidChangeProfiles')(e => {
            const added = e.added.map(profile => reviveProfile(profile, this.profilesHome.scheme));
            const removed = e.removed.map(profile => reviveProfile(profile, this.profilesHome.scheme));
            const updated = e.updated.map(profile => reviveProfile(profile, this.profilesHome.scheme));
            this._profiles = e.all.map(profile => reviveProfile(profile, this.profilesHome.scheme));
            this._onDidChangeProfiles.fire({ added, removed, updated, all: this.profiles });
        }));
        this.onDidResetWorkspaces = this.channel.listen('onDidResetWorkspaces');
    }
    setEnablement(enabled) {
        this.enabled = enabled;
    }
    isEnabled() {
        return this.enabled;
    }
    async createNamedProfile(name, options, workspaceIdentifier) {
        const result = await this.channel.call('createNamedProfile', [name, options, workspaceIdentifier]);
        return reviveProfile(result, this.profilesHome.scheme);
    }
    async createProfile(id, name, options, workspaceIdentifier) {
        const result = await this.channel.call('createProfile', [id, name, options, workspaceIdentifier]);
        return reviveProfile(result, this.profilesHome.scheme);
    }
    async createTransientProfile(workspaceIdentifier) {
        const result = await this.channel.call('createTransientProfile', [workspaceIdentifier]);
        return reviveProfile(result, this.profilesHome.scheme);
    }
    async setProfileForWorkspace(workspaceIdentifier, profile) {
        await this.channel.call('setProfileForWorkspace', [workspaceIdentifier, profile]);
    }
    removeProfile(profile) {
        return this.channel.call('removeProfile', [profile]);
    }
    async updateProfile(profile, updateOptions) {
        const result = await this.channel.call('updateProfile', [profile, updateOptions]);
        return reviveProfile(result, this.profilesHome.scheme);
    }
    resetWorkspaces() {
        return this.channel.call('resetWorkspaces');
    }
    cleanUp() {
        return this.channel.call('cleanUp');
    }
    cleanUpTransientProfiles() {
        return this.channel.call('cleanUpTransientProfiles');
    }
};
UserDataProfilesNativeService = __decorate([
    __param(1, IMainProcessService),
    __param(2, IEnvironmentService)
], UserDataProfilesNativeService);
export { UserDataProfilesNativeService };
