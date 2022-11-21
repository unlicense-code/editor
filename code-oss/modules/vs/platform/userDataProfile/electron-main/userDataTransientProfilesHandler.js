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
import { Disposable } from 'vs/base/common/lifecycle';
import { ILifecycleMainService, } from 'vs/platform/lifecycle/electron-main/lifecycleMainService';
import { IUserDataProfilesMainService } from 'vs/platform/userDataProfile/electron-main/userDataProfile';
let UserDataTransientProfilesHandler = class UserDataTransientProfilesHandler extends Disposable {
    userDataProfilesService;
    constructor(lifecycleMainService, userDataProfilesService) {
        super();
        this.userDataProfilesService = userDataProfilesService;
        this._register(lifecycleMainService.onWillLoadWindow(e => {
            if (e.reason === 2 /* LoadReason.LOAD */) {
                this.unsetTransientProfileForWorkspace(e.window.openedWorkspace ?? 'empty-window');
            }
        }));
        this._register(lifecycleMainService.onBeforeCloseWindow(window => this.unsetTransientProfileForWorkspace(window.openedWorkspace ?? 'empty-window')));
    }
    async unsetTransientProfileForWorkspace(workspace) {
        const profile = this.userDataProfilesService.getOrSetProfileForWorkspace(workspace);
        if (profile.isTransient) {
            this.userDataProfilesService.unsetWorkspace(workspace, true);
            await this.userDataProfilesService.cleanUpTransientProfiles();
        }
    }
};
UserDataTransientProfilesHandler = __decorate([
    __param(0, ILifecycleMainService),
    __param(1, IUserDataProfilesMainService)
], UserDataTransientProfilesHandler);
export { UserDataTransientProfilesHandler };
