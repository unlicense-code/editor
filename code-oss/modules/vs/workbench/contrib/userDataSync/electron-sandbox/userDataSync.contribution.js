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
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { IUserDataSyncUtilService } from 'vs/platform/userDataSync/common/userDataSync';
import { Registry } from 'vs/platform/registry/common/platform';
import { ISharedProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { UserDataSycnUtilServiceChannel } from 'vs/platform/userDataSync/common/userDataSyncIpc';
import { registerAction2, Action2, MenuId } from 'vs/platform/actions/common/actions';
import { localize } from 'vs/nls';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { CONTEXT_SYNC_STATE, SYNC_TITLE } from 'vs/workbench/services/userDataSync/common/userDataSync';
let UserDataSyncServicesContribution = class UserDataSyncServicesContribution {
    constructor(userDataSyncUtilService, sharedProcessService) {
        sharedProcessService.registerChannel('userDataSyncUtil', new UserDataSycnUtilServiceChannel(userDataSyncUtilService));
    }
};
UserDataSyncServicesContribution = __decorate([
    __param(0, IUserDataSyncUtilService),
    __param(1, ISharedProcessService)
], UserDataSyncServicesContribution);
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(UserDataSyncServicesContribution, 1 /* LifecyclePhase.Starting */);
registerAction2(class OpenSyncBackupsFolder extends Action2 {
    constructor() {
        super({
            id: 'workbench.userData.actions.openSyncBackupsFolder',
            title: { value: localize('Open Backup folder', "Open Local Backups Folder"), original: 'Open Local Backups Folder' },
            category: { value: SYNC_TITLE, original: `Settings Sync` },
            menu: {
                id: MenuId.CommandPalette,
                when: CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */),
            }
        });
    }
    async run(accessor) {
        const syncHome = accessor.get(IEnvironmentService).userDataSyncHome;
        const nativeHostService = accessor.get(INativeHostService);
        const fileService = accessor.get(IFileService);
        const notificationService = accessor.get(INotificationService);
        if (await fileService.exists(syncHome)) {
            const folderStat = await fileService.resolve(syncHome);
            const item = folderStat.children && folderStat.children[0] ? folderStat.children[0].resource : syncHome;
            return nativeHostService.showItemInFolder(item.fsPath);
        }
        else {
            notificationService.info(localize('no backups', "Local backups folder does not exist"));
        }
    }
});
