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
import { VSBuffer } from 'vs/base/common/buffer';
import { toLocalISOString } from 'vs/base/common/date';
import { Disposable } from 'vs/base/common/lifecycle';
import { joinPath } from 'vs/base/common/resources';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { ALL_SYNC_RESOURCES, IUserDataSyncLogService } from 'vs/platform/userDataSync/common/userDataSync';
let UserDataSyncBackupStoreService = class UserDataSyncBackupStoreService extends Disposable {
    environmentService;
    fileService;
    configurationService;
    logService;
    userDataProfilesService;
    _serviceBrand;
    constructor(environmentService, fileService, configurationService, logService, userDataProfilesService) {
        super();
        this.environmentService = environmentService;
        this.fileService = fileService;
        this.configurationService = configurationService;
        this.logService = logService;
        this.userDataProfilesService = userDataProfilesService;
        for (const profile of this.userDataProfilesService.profiles) {
            for (const resource of ALL_SYNC_RESOURCES) {
                this.cleanUpBackup(this.getResourceBackupHome(profile, resource));
            }
        }
    }
    async getAllRefs(profile, resource) {
        const folder = this.getResourceBackupHome(profile, resource);
        const stat = await this.fileService.resolve(folder);
        if (stat.children) {
            const all = stat.children.filter(stat => stat.isFile && /^\d{8}T\d{6}(\.json)?$/.test(stat.name)).sort().reverse();
            return all.map(stat => ({
                ref: stat.name,
                created: this.getCreationTime(stat)
            }));
        }
        return [];
    }
    async resolveContent(profile, resourceKey, ref) {
        const folder = this.getResourceBackupHome(profile, resourceKey);
        const file = joinPath(folder, ref);
        try {
            const content = await this.fileService.readFile(file);
            return content.value.toString();
        }
        catch (error) {
            this.logService.error(error);
            return null;
        }
    }
    async backup(profile, resourceKey, content) {
        const folder = this.getResourceBackupHome(profile, resourceKey);
        const resource = joinPath(folder, `${toLocalISOString(new Date()).replace(/-|:|\.\d+Z$/g, '')}.json`);
        try {
            await this.fileService.writeFile(resource, VSBuffer.fromString(content));
        }
        catch (e) {
            this.logService.error(e);
        }
        try {
            this.cleanUpBackup(folder);
        }
        catch (e) { /* Ignore */ }
    }
    getResourceBackupHome(profile, resource) {
        return joinPath(this.environmentService.userDataSyncHome, ...(profile.isDefault ? [resource] : [profile.id, resource]));
    }
    async cleanUpBackup(folder) {
        try {
            try {
                if (!(await this.fileService.exists(folder))) {
                    return;
                }
            }
            catch (e) {
                return;
            }
            const stat = await this.fileService.resolve(folder);
            if (stat.children) {
                const all = stat.children.filter(stat => stat.isFile && /^\d{8}T\d{6}(\.json)?$/.test(stat.name)).sort();
                const backUpMaxAge = 1000 * 60 * 60 * 24 * (this.configurationService.getValue('sync.localBackupDuration') || 30 /* Default 30 days */);
                let toDelete = all.filter(stat => Date.now() - this.getCreationTime(stat) > backUpMaxAge);
                const remaining = all.length - toDelete.length;
                if (remaining < 10) {
                    toDelete = toDelete.slice(10 - remaining);
                }
                await Promises.settled(toDelete.map(async (stat) => {
                    this.logService.info('Deleting from backup', stat.resource.path);
                    await this.fileService.del(stat.resource);
                }));
            }
        }
        catch (e) {
            this.logService.error(e);
        }
    }
    getCreationTime(stat) {
        return stat.ctime || new Date(parseInt(stat.name.substring(0, 4)), parseInt(stat.name.substring(4, 6)) - 1, parseInt(stat.name.substring(6, 8)), parseInt(stat.name.substring(9, 11)), parseInt(stat.name.substring(11, 13)), parseInt(stat.name.substring(13, 15))).getTime();
    }
};
UserDataSyncBackupStoreService = __decorate([
    __param(0, IEnvironmentService),
    __param(1, IFileService),
    __param(2, IConfigurationService),
    __param(3, IUserDataSyncLogService),
    __param(4, IUserDataProfilesService)
], UserDataSyncBackupStoreService);
export { UserDataSyncBackupStoreService };
