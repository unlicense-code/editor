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
import { revive } from 'vs/base/common/marshalling';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { IStateService } from 'vs/platform/state/node/state';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { UserDataProfilesService as BaseUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
let UserDataProfilesService = class UserDataProfilesService extends BaseUserDataProfilesService {
    stateService;
    constructor(stateService, uriIdentityService, environmentService, fileService, logService) {
        super(environmentService, fileService, uriIdentityService, logService);
        this.stateService = stateService;
    }
    getStoredProfiles() {
        return revive(this.stateService.getItem(UserDataProfilesService.PROFILES_KEY, []));
    }
    getStoredProfileAssociations() {
        return revive(this.stateService.getItem(UserDataProfilesService.PROFILE_ASSOCIATIONS_KEY, {}));
    }
};
UserDataProfilesService = __decorate([
    __param(0, IStateService),
    __param(1, IUriIdentityService),
    __param(2, IEnvironmentService),
    __param(3, IFileService),
    __param(4, ILogService)
], UserDataProfilesService);
export { UserDataProfilesService };
