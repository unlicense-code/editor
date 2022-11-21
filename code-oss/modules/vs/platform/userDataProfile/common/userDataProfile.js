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
import { hash } from 'vs/base/common/hash';
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { basename, joinPath } from 'vs/base/common/resources';
import { URI } from 'vs/base/common/uri';
import { localize } from 'vs/nls';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
import { ResourceMap } from 'vs/base/common/map';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { Promises } from 'vs/base/common/async';
import { generateUuid } from 'vs/base/common/uuid';
import { escapeRegExpCharacters } from 'vs/base/common/strings';
export function isUserDataProfile(thing) {
    const candidate = thing;
    return !!(candidate && typeof candidate === 'object'
        && typeof candidate.id === 'string'
        && typeof candidate.isDefault === 'boolean'
        && typeof candidate.name === 'string'
        && URI.isUri(candidate.location)
        && URI.isUri(candidate.globalStorageHome)
        && URI.isUri(candidate.settingsResource)
        && URI.isUri(candidate.keybindingsResource)
        && URI.isUri(candidate.tasksResource)
        && URI.isUri(candidate.snippetsHome)
        && URI.isUri(candidate.extensionsResource));
}
export const PROFILES_ENABLEMENT_CONFIG = 'workbench.experimental.settingsProfiles.enabled';
export const IUserDataProfilesService = createDecorator('IUserDataProfilesService');
export function reviveProfile(profile, scheme) {
    return {
        id: profile.id,
        isDefault: profile.isDefault,
        name: profile.name,
        shortName: profile.shortName,
        location: URI.revive(profile.location).with({ scheme }),
        globalStorageHome: URI.revive(profile.globalStorageHome).with({ scheme }),
        settingsResource: URI.revive(profile.settingsResource).with({ scheme }),
        keybindingsResource: URI.revive(profile.keybindingsResource).with({ scheme }),
        tasksResource: URI.revive(profile.tasksResource).with({ scheme }),
        snippetsHome: URI.revive(profile.snippetsHome).with({ scheme }),
        extensionsResource: URI.revive(profile.extensionsResource)?.with({ scheme }),
        useDefaultFlags: profile.useDefaultFlags,
        isTransient: profile.isTransient,
    };
}
export function toUserDataProfile(id, name, location, options) {
    return {
        id,
        name,
        location,
        isDefault: false,
        shortName: options?.shortName,
        globalStorageHome: joinPath(location, 'globalStorage'),
        settingsResource: joinPath(location, 'settings.json'),
        keybindingsResource: joinPath(location, 'keybindings.json'),
        tasksResource: joinPath(location, 'tasks.json'),
        snippetsHome: joinPath(location, 'snippets'),
        extensionsResource: joinPath(location, 'extensions.json'),
        useDefaultFlags: options?.useDefaultFlags,
        isTransient: options?.transient
    };
}
let UserDataProfilesService = class UserDataProfilesService extends Disposable {
    environmentService;
    fileService;
    uriIdentityService;
    logService;
    static PROFILES_KEY = 'userDataProfiles';
    static PROFILE_ASSOCIATIONS_KEY = 'profileAssociations';
    _serviceBrand;
    enabled = false;
    profilesHome;
    get defaultProfile() { return this.profiles[0]; }
    get profiles() { return [...this.profilesObject.profiles, ...this.transientProfilesObject.profiles]; }
    _onDidChangeProfiles = this._register(new Emitter());
    onDidChangeProfiles = this._onDidChangeProfiles.event;
    _onWillCreateProfile = this._register(new Emitter());
    onWillCreateProfile = this._onWillCreateProfile.event;
    _onWillRemoveProfile = this._register(new Emitter());
    onWillRemoveProfile = this._onWillRemoveProfile.event;
    _onDidResetWorkspaces = this._register(new Emitter());
    onDidResetWorkspaces = this._onDidResetWorkspaces.event;
    profileCreationPromises = new Map();
    transientProfilesObject = {
        profiles: [],
        workspaces: new ResourceMap()
    };
    constructor(environmentService, fileService, uriIdentityService, logService) {
        super();
        this.environmentService = environmentService;
        this.fileService = fileService;
        this.uriIdentityService = uriIdentityService;
        this.logService = logService;
        this.profilesHome = joinPath(this.environmentService.userRoamingDataHome, 'profiles');
    }
    setEnablement(enabled) {
        if (this.enabled !== enabled) {
            this._profilesObject = undefined;
            this.enabled = enabled;
        }
    }
    isEnabled() {
        return this.enabled;
    }
    _profilesObject;
    get profilesObject() {
        if (!this._profilesObject) {
            const profiles = this.enabled ? this.getStoredProfiles().map(storedProfile => toUserDataProfile(basename(storedProfile.location), storedProfile.name, storedProfile.location, { shortName: storedProfile.shortName, useDefaultFlags: storedProfile.useDefaultFlags })) : [];
            let emptyWindow;
            const workspaces = new ResourceMap();
            const defaultProfile = toUserDataProfile(hash(this.environmentService.userRoamingDataHome.path).toString(16), localize('defaultProfile', "Default"), this.environmentService.userRoamingDataHome);
            profiles.unshift({ ...defaultProfile, isDefault: true });
            if (profiles.length) {
                const profileAssicaitions = this.getStoredProfileAssociations();
                if (profileAssicaitions.workspaces) {
                    for (const [workspacePath, profilePath] of Object.entries(profileAssicaitions.workspaces)) {
                        const workspace = URI.parse(workspacePath);
                        const profileLocation = URI.parse(profilePath);
                        const profile = profiles.find(p => this.uriIdentityService.extUri.isEqual(p.location, profileLocation));
                        if (profile) {
                            workspaces.set(workspace, profile);
                        }
                    }
                }
                if (profileAssicaitions.emptyWindow) {
                    const emptyWindowProfileLocation = URI.parse(profileAssicaitions.emptyWindow);
                    emptyWindow = profiles.find(p => this.uriIdentityService.extUri.isEqual(p.location, emptyWindowProfileLocation));
                }
            }
            this._profilesObject = { profiles, workspaces, emptyWindow };
        }
        return this._profilesObject;
    }
    async createTransientProfile(workspaceIdentifier) {
        const namePrefix = `Temp`;
        const nameRegEx = new RegExp(`${escapeRegExpCharacters(namePrefix)}\\s(\\d+)`);
        let nameIndex = 0;
        for (const profile of this.profiles) {
            const matches = nameRegEx.exec(profile.name);
            const index = matches ? parseInt(matches[1]) : 0;
            nameIndex = index > nameIndex ? index : nameIndex;
        }
        const name = `${namePrefix} ${nameIndex + 1}`;
        return this.createProfile(hash(generateUuid()).toString(16), name, { transient: true }, workspaceIdentifier);
    }
    async createNamedProfile(name, options, workspaceIdentifier) {
        return this.createProfile(hash(generateUuid()).toString(16), name, options, workspaceIdentifier);
    }
    async createProfile(id, name, options, workspaceIdentifier) {
        if (!this.enabled) {
            throw new Error(`Profiles are disabled. Enable them via the '${PROFILES_ENABLEMENT_CONFIG}' setting.`);
        }
        const profile = await this.doCreateProfile(id, name, options);
        if (workspaceIdentifier) {
            await this.setProfileForWorkspace(workspaceIdentifier, profile);
        }
        return profile;
    }
    async doCreateProfile(id, name, options) {
        let profileCreationPromise = this.profileCreationPromises.get(name);
        if (!profileCreationPromise) {
            profileCreationPromise = (async () => {
                try {
                    const existing = this.profiles.find(p => p.name === name || p.id === id);
                    if (existing) {
                        return existing;
                    }
                    const profile = toUserDataProfile(id, name, joinPath(this.profilesHome, id), options);
                    await this.fileService.createFolder(profile.location);
                    const joiners = [];
                    this._onWillCreateProfile.fire({
                        profile,
                        join(promise) {
                            joiners.push(promise);
                        }
                    });
                    await Promises.settled(joiners);
                    this.updateProfiles([profile], [], []);
                    return profile;
                }
                finally {
                    this.profileCreationPromises.delete(name);
                }
            })();
            this.profileCreationPromises.set(name, profileCreationPromise);
        }
        return profileCreationPromise;
    }
    async updateProfile(profileToUpdate, options) {
        if (!this.enabled) {
            throw new Error(`Profiles are disabled. Enable them via the '${PROFILES_ENABLEMENT_CONFIG}' setting.`);
        }
        let profile = this.profiles.find(p => p.id === profileToUpdate.id);
        if (!profile) {
            throw new Error(`Profile '${profileToUpdate.name}' does not exist`);
        }
        profile = toUserDataProfile(profile.id, options.name ?? profile.name, profile.location, { shortName: options.shortName ?? profile.shortName, transient: options.transient ?? profile.isTransient, useDefaultFlags: options.useDefaultFlags ?? profile.useDefaultFlags });
        this.updateProfiles([], [], [profile]);
        return profile;
    }
    async removeProfile(profileToRemove) {
        if (!this.enabled) {
            throw new Error(`Profiles are disabled. Enable them via the '${PROFILES_ENABLEMENT_CONFIG}' setting.`);
        }
        if (profileToRemove.isDefault) {
            throw new Error('Cannot remove default profile');
        }
        const profile = this.profiles.find(p => p.id === profileToRemove.id);
        if (!profile) {
            throw new Error(`Profile '${profileToRemove.name}' does not exist`);
        }
        const joiners = [];
        this._onWillRemoveProfile.fire({
            profile,
            join(promise) {
                joiners.push(promise);
            }
        });
        try {
            await Promise.allSettled(joiners);
        }
        catch (error) {
            this.logService.error(error);
        }
        if (profile.id === this.profilesObject.emptyWindow?.id) {
            this.profilesObject.emptyWindow = undefined;
        }
        for (const workspace of [...this.profilesObject.workspaces.keys()]) {
            if (profile.id === this.profilesObject.workspaces.get(workspace)?.id) {
                this.profilesObject.workspaces.delete(workspace);
            }
        }
        this.updateStoredProfileAssociations();
        this.updateProfiles([], [profile], []);
        try {
            if (this.profiles.length === 1) {
                await this.fileService.del(this.profilesHome, { recursive: true });
            }
            else {
                await this.fileService.del(profile.location, { recursive: true });
            }
        }
        catch (error) {
            this.logService.error(error);
        }
    }
    getOrSetProfileForWorkspace(workspaceIdentifier, profileToSet = this.defaultProfile) {
        if (!this.enabled) {
            return this.defaultProfile;
        }
        let profile = this.getProfileForWorkspace(workspaceIdentifier);
        if (!profile) {
            profile = profileToSet;
            // Associate the profile to workspace only if there are user profiles
            // If there are no profiles, workspaces are associated to default profile by default
            if (this.profiles.length > 1) {
                this.setProfileForWorkspaceSync(workspaceIdentifier, profile);
            }
        }
        return profile;
    }
    async setProfileForWorkspace(workspaceIdentifier, profileToSet) {
        this.setProfileForWorkspaceSync(workspaceIdentifier, profileToSet);
    }
    setProfileForWorkspaceSync(workspaceIdentifier, profileToSet) {
        if (!this.enabled) {
            throw new Error(`Profiles are disabled. Enable them via the '${PROFILES_ENABLEMENT_CONFIG}' setting.`);
        }
        const profile = this.profiles.find(p => p.id === profileToSet.id);
        if (!profile) {
            throw new Error(`Profile '${profileToSet.name}' does not exist`);
        }
        this.updateWorkspaceAssociation(workspaceIdentifier, profile);
    }
    unsetWorkspace(workspaceIdentifier, transient) {
        if (!this.enabled) {
            throw new Error(`Profiles are disabled. Enable them via the '${PROFILES_ENABLEMENT_CONFIG}' setting.`);
        }
        this.updateWorkspaceAssociation(workspaceIdentifier, undefined, transient);
    }
    async resetWorkspaces() {
        this.transientProfilesObject.workspaces.clear();
        this.transientProfilesObject.emptyWindow = undefined;
        this.profilesObject.workspaces.clear();
        this.profilesObject.emptyWindow = undefined;
        this.updateStoredProfileAssociations();
        this._onDidResetWorkspaces.fire();
    }
    async cleanUp() {
        if (!this.enabled) {
            return;
        }
        if (await this.fileService.exists(this.profilesHome)) {
            const stat = await this.fileService.resolve(this.profilesHome);
            await Promise.all((stat.children || [])
                .filter(child => child.isDirectory && this.profiles.every(p => !this.uriIdentityService.extUri.isEqual(p.location, child.resource)))
                .map(child => this.fileService.del(child.resource, { recursive: true })));
        }
    }
    async cleanUpTransientProfiles() {
        if (!this.enabled) {
            return;
        }
        const unAssociatedTransientProfiles = this.transientProfilesObject.profiles.filter(p => !this.isProfileAssociatedToWorkspace(p));
        await Promise.allSettled(unAssociatedTransientProfiles.map(p => this.removeProfile(p)));
    }
    getProfileForWorkspace(workspaceIdentifier) {
        const workspace = this.getWorkspace(workspaceIdentifier);
        return URI.isUri(workspace) ? this.transientProfilesObject.workspaces.get(workspace) ?? this.profilesObject.workspaces.get(workspace) : this.transientProfilesObject.emptyWindow ?? this.profilesObject.emptyWindow;
    }
    getWorkspace(workspaceIdentifier) {
        if (isSingleFolderWorkspaceIdentifier(workspaceIdentifier)) {
            return workspaceIdentifier.uri;
        }
        if (isWorkspaceIdentifier(workspaceIdentifier)) {
            return workspaceIdentifier.configPath;
        }
        return 'empty-window';
    }
    isProfileAssociatedToWorkspace(profile) {
        if (this.uriIdentityService.extUri.isEqual(this.transientProfilesObject.emptyWindow?.location, profile.location)) {
            return true;
        }
        if ([...this.transientProfilesObject.workspaces.values()].some(workspaceProfile => this.uriIdentityService.extUri.isEqual(workspaceProfile.location, profile.location))) {
            return true;
        }
        if (this.uriIdentityService.extUri.isEqual(this.profilesObject.emptyWindow?.location, profile.location)) {
            return true;
        }
        if ([...this.profilesObject.workspaces.values()].some(workspaceProfile => this.uriIdentityService.extUri.isEqual(workspaceProfile.location, profile.location))) {
            return true;
        }
        return false;
    }
    updateProfiles(added, removed, updated) {
        const allProfiles = [...this.profiles, ...added];
        const storedProfiles = [];
        this.transientProfilesObject.profiles = [];
        for (let profile of allProfiles) {
            if (profile.isDefault) {
                continue;
            }
            if (removed.some(p => profile.id === p.id)) {
                continue;
            }
            profile = updated.find(p => profile.id === p.id) ?? profile;
            if (profile.isTransient) {
                this.transientProfilesObject.profiles.push(profile);
            }
            else {
                storedProfiles.push({ location: profile.location, name: profile.name, shortName: profile.shortName, useDefaultFlags: profile.useDefaultFlags });
            }
        }
        this.saveStoredProfiles(storedProfiles);
        this._profilesObject = undefined;
        this.triggerProfilesChanges(added, removed, updated);
    }
    triggerProfilesChanges(added, removed, updated) {
        this._onDidChangeProfiles.fire({ added, removed, updated, all: this.profiles });
    }
    updateWorkspaceAssociation(workspaceIdentifier, newProfile, transient) {
        // Force transient if the new profile to associate is transient
        transient = newProfile?.isTransient ? true : transient;
        if (!transient) {
            // Unset the transiet workspace association if any
            this.updateWorkspaceAssociation(workspaceIdentifier, undefined, true);
        }
        const workspace = this.getWorkspace(workspaceIdentifier);
        const profilesObject = transient ? this.transientProfilesObject : this.profilesObject;
        // Folder or Multiroot workspace
        if (URI.isUri(workspace)) {
            profilesObject.workspaces.delete(workspace);
            if (newProfile) {
                profilesObject.workspaces.set(workspace, newProfile);
            }
        }
        // Empty Window
        else {
            profilesObject.emptyWindow = newProfile;
        }
        if (!transient) {
            this.updateStoredProfileAssociations();
        }
    }
    updateStoredProfileAssociations() {
        const workspaces = {};
        for (const [workspace, profile] of this.profilesObject.workspaces.entries()) {
            workspaces[workspace.toString()] = profile.location.toString();
        }
        const emptyWindow = this.profilesObject.emptyWindow?.location.toString();
        this.saveStoredProfileAssociations({ workspaces, emptyWindow });
        this._profilesObject = undefined;
    }
    getStoredProfiles() { return []; }
    saveStoredProfiles(storedProfiles) { throw new Error('not implemented'); }
    getStoredProfileAssociations() { return {}; }
    saveStoredProfileAssociations(storedProfileAssociations) { throw new Error('not implemented'); }
};
UserDataProfilesService = __decorate([
    __param(0, IEnvironmentService),
    __param(1, IFileService),
    __param(2, IUriIdentityService),
    __param(3, ILogService)
], UserDataProfilesService);
export { UserDataProfilesService };
export class InMemoryUserDataProfilesService extends UserDataProfilesService {
    storedProfiles = [];
    getStoredProfiles() { return this.storedProfiles; }
    saveStoredProfiles(storedProfiles) { this.storedProfiles = storedProfiles; }
    storedProfileAssociations = {};
    getStoredProfileAssociations() { return this.storedProfileAssociations; }
    saveStoredProfileAssociations(storedProfileAssociations) { this.storedProfileAssociations = storedProfileAssociations; }
}
