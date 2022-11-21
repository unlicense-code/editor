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
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { isWeb } from 'vs/base/common/platform';
import { isEqual } from 'vs/base/common/resources';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IUserDataAutoSyncService } from 'vs/platform/userDataSync/common/userDataSync';
import { IViewsService } from 'vs/workbench/common/views';
import { VIEWLET_ID } from 'vs/workbench/contrib/extensions/common/extensions';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { KeybindingsEditorInput } from 'vs/workbench/services/preferences/browser/keybindingsEditorInput';
import { SettingsEditor2Input } from 'vs/workbench/services/preferences/common/preferencesEditorInput';
let UserDataSyncTrigger = class UserDataSyncTrigger extends Disposable {
    userDataProfilesService;
    constructor(editorService, userDataProfilesService, viewsService, userDataAutoSyncService, hostService) {
        super();
        this.userDataProfilesService = userDataProfilesService;
        const event = Event.filter(Event.any(Event.map(editorService.onDidActiveEditorChange, () => this.getUserDataEditorInputSource(editorService.activeEditor)), Event.map(Event.filter(viewsService.onDidChangeViewContainerVisibility, e => e.id === VIEWLET_ID && e.visible), e => e.id)), source => source !== undefined);
        if (isWeb) {
            this._register(Event.debounce(Event.any(Event.map(hostService.onDidChangeFocus, () => 'windowFocus'), Event.map(event, source => source)), (last, source) => last ? [...last, source] : [source], 1000)(sources => userDataAutoSyncService.triggerSync(sources, true, false)));
        }
        else {
            this._register(event(source => userDataAutoSyncService.triggerSync([source], true, false)));
        }
    }
    getUserDataEditorInputSource(editorInput) {
        if (!editorInput) {
            return undefined;
        }
        if (editorInput instanceof SettingsEditor2Input) {
            return 'settingsEditor';
        }
        if (editorInput instanceof KeybindingsEditorInput) {
            return 'keybindingsEditor';
        }
        const resource = editorInput.resource;
        if (isEqual(resource, this.userDataProfilesService.defaultProfile.settingsResource)) {
            return 'settingsEditor';
        }
        if (isEqual(resource, this.userDataProfilesService.defaultProfile.keybindingsResource)) {
            return 'keybindingsEditor';
        }
        return undefined;
    }
};
UserDataSyncTrigger = __decorate([
    __param(0, IEditorService),
    __param(1, IUserDataProfilesService),
    __param(2, IViewsService),
    __param(3, IUserDataAutoSyncService),
    __param(4, IHostService)
], UserDataSyncTrigger);
export { UserDataSyncTrigger };
