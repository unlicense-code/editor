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
import { URI } from 'vs/base/common/uri';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { refineServiceDecorator } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { IStateMainService } from 'vs/platform/state/electron-main/state';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { UserDataProfilesService } from 'vs/platform/userDataProfile/node/userDataProfile';
export const IUserDataProfilesMainService = refineServiceDecorator(IUserDataProfilesService);
let UserDataProfilesMainService = class UserDataProfilesMainService extends UserDataProfilesService {
    stateMainService;
    constructor(stateMainService, uriIdentityService, environmentService, fileService, logService) {
        super(stateMainService, uriIdentityService, environmentService, fileService, logService);
        this.stateMainService = stateMainService;
    }
    setEnablement(enabled) {
        super.setEnablement(enabled);
        if (!this.enabled) {
            // reset
            this.saveStoredProfiles([]);
            this.saveStoredProfileAssociations({});
        }
    }
    saveStoredProfiles(storedProfiles) {
        if (storedProfiles.length) {
            this.stateMainService.setItem(UserDataProfilesMainService.PROFILES_KEY, storedProfiles);
        }
        else {
            this.stateMainService.removeItem(UserDataProfilesMainService.PROFILES_KEY);
        }
    }
    saveStoredProfileAssociations(storedProfileAssociations) {
        if (storedProfileAssociations.emptyWindow || storedProfileAssociations.workspaces) {
            this.stateMainService.setItem(UserDataProfilesMainService.PROFILE_ASSOCIATIONS_KEY, storedProfileAssociations);
        }
        else {
            this.stateMainService.removeItem(UserDataProfilesMainService.PROFILE_ASSOCIATIONS_KEY);
        }
    }
    getStoredProfileAssociations() {
        const oldKey = 'workspaceAndProfileInfo';
        const storedWorkspaceInfos = this.stateMainService.getItem(oldKey, undefined);
        if (storedWorkspaceInfos) {
            this.stateMainService.removeItem(oldKey);
            const workspaces = storedWorkspaceInfos.reduce((result, { workspace, profile }) => {
                result[URI.revive(workspace).toString()] = URI.revive(profile).toString();
                return result;
            }, {});
            this.stateMainService.setItem(UserDataProfilesMainService.PROFILE_ASSOCIATIONS_KEY, { workspaces });
        }
        return super.getStoredProfileAssociations();
    }
};
UserDataProfilesMainService = __decorate([
    __param(0, IStateMainService),
    __param(1, IUriIdentityService),
    __param(2, IEnvironmentService),
    __param(3, IFileService),
    __param(4, ILogService)
], UserDataProfilesMainService);
export { UserDataProfilesMainService };
