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
import { isNonEmptyArray } from 'vs/base/common/arrays';
import { VSBuffer } from 'vs/base/common/buffer';
import { Event } from 'vs/base/common/event';
import { parse } from 'vs/base/common/json';
import { OS } from 'vs/base/common/platform';
import { isUndefined } from 'vs/base/common/types';
import { localize } from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { AbstractInitializer, AbstractJsonFileSynchroniser } from 'vs/platform/userDataSync/common/abstractSynchronizer';
import { merge } from 'vs/platform/userDataSync/common/keybindingsMerge';
import { IUserDataSyncBackupStoreService, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService, IUserDataSyncUtilService, UserDataSyncError, USER_DATA_SYNC_SCHEME, CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM } from 'vs/platform/userDataSync/common/userDataSync';
export function getKeybindingsContentFromSyncContent(syncContent, platformSpecific, logService) {
    try {
        const parsed = JSON.parse(syncContent);
        if (!platformSpecific) {
            return isUndefined(parsed.all) ? null : parsed.all;
        }
        switch (OS) {
            case 2 /* OperatingSystem.Macintosh */:
                return isUndefined(parsed.mac) ? null : parsed.mac;
            case 3 /* OperatingSystem.Linux */:
                return isUndefined(parsed.linux) ? null : parsed.linux;
            case 1 /* OperatingSystem.Windows */:
                return isUndefined(parsed.windows) ? null : parsed.windows;
        }
    }
    catch (e) {
        logService.error(e);
        return null;
    }
}
let KeybindingsSynchroniser = class KeybindingsSynchroniser extends AbstractJsonFileSynchroniser {
    /* Version 2: Change settings from `sync.${setting}` to `settingsSync.{setting}` */
    version = 2;
    previewResource = this.extUri.joinPath(this.syncPreviewFolder, 'keybindings.json');
    baseResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'base' });
    localResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'local' });
    remoteResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'remote' });
    acceptedResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'accepted' });
    constructor(profile, collection, userDataSyncStoreService, userDataSyncBackupStoreService, logService, configurationService, userDataSyncEnablementService, fileService, environmentService, storageService, userDataSyncUtilService, telemetryService, uriIdentityService) {
        super(profile.keybindingsResource, { syncResource: "keybindings" /* SyncResource.Keybindings */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncBackupStoreService, userDataSyncEnablementService, telemetryService, logService, userDataSyncUtilService, configurationService, uriIdentityService);
        this._register(Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('settingsSync.keybindingsPerPlatform'))(() => this.triggerLocalChange()));
    }
    async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, userDataSyncConfiguration) {
        const remoteContent = remoteUserData.syncData ? getKeybindingsContentFromSyncContent(remoteUserData.syncData.content, userDataSyncConfiguration.keybindingsPerPlatform ?? this.syncKeybindingsPerPlatform(), this.logService) : null;
        // Use remote data as last sync data if last sync data does not exist and remote data is from same machine
        lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
        const lastSyncContent = lastSyncUserData ? this.getKeybindingsContentFromLastSyncUserData(lastSyncUserData) : null;
        // Get file content last to get the latest
        const fileContent = await this.getLocalFileContent();
        const formattingOptions = await this.getFormattingOptions();
        let mergedContent = null;
        let hasLocalChanged = false;
        let hasRemoteChanged = false;
        let hasConflicts = false;
        if (remoteContent) {
            let localContent = fileContent ? fileContent.value.toString() : '[]';
            localContent = localContent || '[]';
            if (this.hasErrors(localContent, true)) {
                throw new UserDataSyncError(localize('errorInvalidSettings', "Unable to sync keybindings because the content in the file is not valid. Please open the file and correct it."), "LocalInvalidContent" /* UserDataSyncErrorCode.LocalInvalidContent */, this.resource);
            }
            if (!lastSyncContent // First time sync
                || lastSyncContent !== localContent // Local has forwarded
                || lastSyncContent !== remoteContent // Remote has forwarded
            ) {
                this.logService.trace(`${this.syncResourceLogLabel}: Merging remote keybindings with local keybindings...`);
                const result = await merge(localContent, remoteContent, lastSyncContent, formattingOptions, this.userDataSyncUtilService);
                // Sync only if there are changes
                if (result.hasChanges) {
                    mergedContent = result.mergeContent;
                    hasConflicts = result.hasConflicts;
                    hasLocalChanged = hasConflicts || result.mergeContent !== localContent;
                    hasRemoteChanged = hasConflicts || result.mergeContent !== remoteContent;
                }
            }
        }
        // First time syncing to remote
        else if (fileContent) {
            this.logService.trace(`${this.syncResourceLogLabel}: Remote keybindings does not exist. Synchronizing keybindings for the first time.`);
            mergedContent = fileContent.value.toString();
            hasRemoteChanged = true;
        }
        const previewResult = {
            content: hasConflicts ? lastSyncContent : mergedContent,
            localChange: hasLocalChanged ? fileContent ? 2 /* Change.Modified */ : 1 /* Change.Added */ : 0 /* Change.None */,
            remoteChange: hasRemoteChanged ? 2 /* Change.Modified */ : 0 /* Change.None */,
            hasConflicts
        };
        const localContent = fileContent ? fileContent.value.toString() : null;
        return [{
                fileContent,
                baseResource: this.baseResource,
                baseContent: lastSyncContent,
                localResource: this.localResource,
                localContent,
                localChange: previewResult.localChange,
                remoteResource: this.remoteResource,
                remoteContent,
                remoteChange: previewResult.remoteChange,
                previewResource: this.previewResource,
                previewResult,
                acceptedResource: this.acceptedResource,
            }];
    }
    async hasRemoteChanged(lastSyncUserData) {
        const lastSyncContent = this.getKeybindingsContentFromLastSyncUserData(lastSyncUserData);
        if (lastSyncContent === null) {
            return true;
        }
        const fileContent = await this.getLocalFileContent();
        const localContent = fileContent ? fileContent.value.toString() : '';
        const formattingOptions = await this.getFormattingOptions();
        const result = await merge(localContent || '[]', lastSyncContent, lastSyncContent, formattingOptions, this.userDataSyncUtilService);
        return result.hasConflicts || result.mergeContent !== lastSyncContent;
    }
    async getMergeResult(resourcePreview, token) {
        return resourcePreview.previewResult;
    }
    async getAcceptResult(resourcePreview, resource, content, token) {
        /* Accept local resource */
        if (this.extUri.isEqual(resource, this.localResource)) {
            return {
                content: resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : null,
                localChange: 0 /* Change.None */,
                remoteChange: 2 /* Change.Modified */,
            };
        }
        /* Accept remote resource */
        if (this.extUri.isEqual(resource, this.remoteResource)) {
            return {
                content: resourcePreview.remoteContent,
                localChange: 2 /* Change.Modified */,
                remoteChange: 0 /* Change.None */,
            };
        }
        /* Accept preview resource */
        if (this.extUri.isEqual(resource, this.previewResource)) {
            if (content === undefined) {
                return {
                    content: resourcePreview.previewResult.content,
                    localChange: resourcePreview.previewResult.localChange,
                    remoteChange: resourcePreview.previewResult.remoteChange,
                };
            }
            else {
                return {
                    content,
                    localChange: 2 /* Change.Modified */,
                    remoteChange: 2 /* Change.Modified */,
                };
            }
        }
        throw new Error(`Invalid Resource: ${resource.toString()}`);
    }
    async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
        const { fileContent } = resourcePreviews[0][0];
        let { content, localChange, remoteChange } = resourcePreviews[0][1];
        if (localChange === 0 /* Change.None */ && remoteChange === 0 /* Change.None */) {
            this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing keybindings.`);
        }
        if (content !== null) {
            content = content.trim();
            content = content || '[]';
            if (this.hasErrors(content, true)) {
                throw new UserDataSyncError(localize('errorInvalidSettings', "Unable to sync keybindings because the content in the file is not valid. Please open the file and correct it."), "LocalInvalidContent" /* UserDataSyncErrorCode.LocalInvalidContent */, this.resource);
            }
        }
        if (localChange !== 0 /* Change.None */) {
            this.logService.trace(`${this.syncResourceLogLabel}: Updating local keybindings...`);
            if (fileContent) {
                await this.backupLocal(this.toSyncContent(fileContent.value.toString()));
            }
            await this.updateLocalFileContent(content || '[]', fileContent, force);
            this.logService.info(`${this.syncResourceLogLabel}: Updated local keybindings`);
        }
        if (remoteChange !== 0 /* Change.None */) {
            this.logService.trace(`${this.syncResourceLogLabel}: Updating remote keybindings...`);
            const remoteContents = this.toSyncContent(content || '[]', remoteUserData.syncData?.content);
            remoteUserData = await this.updateRemoteUserData(remoteContents, force ? null : remoteUserData.ref);
            this.logService.info(`${this.syncResourceLogLabel}: Updated remote keybindings`);
        }
        // Delete the preview
        try {
            await this.fileService.del(this.previewResource);
        }
        catch (e) { /* ignore */ }
        if (lastSyncUserData?.ref !== remoteUserData.ref) {
            this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized keybindings...`);
            await this.updateLastSyncUserData(remoteUserData, { platformSpecific: this.syncKeybindingsPerPlatform() });
            this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized keybindings`);
        }
    }
    async hasLocalData() {
        try {
            const localFileContent = await this.getLocalFileContent();
            if (localFileContent) {
                const keybindings = parse(localFileContent.value.toString());
                if (isNonEmptyArray(keybindings)) {
                    return true;
                }
            }
        }
        catch (error) {
            if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                return true;
            }
        }
        return false;
    }
    async resolveContent(uri) {
        if (this.extUri.isEqual(this.remoteResource, uri)
            || this.extUri.isEqual(this.baseResource, uri)
            || this.extUri.isEqual(this.localResource, uri)
            || this.extUri.isEqual(this.acceptedResource, uri)) {
            return this.resolvePreviewContent(uri);
        }
        return null;
    }
    getKeybindingsContentFromLastSyncUserData(lastSyncUserData) {
        if (!lastSyncUserData.syncData) {
            return null;
        }
        // Return null if there is a change in platform specific property from last time sync.
        if (lastSyncUserData.platformSpecific !== undefined && lastSyncUserData.platformSpecific !== this.syncKeybindingsPerPlatform()) {
            return null;
        }
        return getKeybindingsContentFromSyncContent(lastSyncUserData.syncData.content, this.syncKeybindingsPerPlatform(), this.logService);
    }
    toSyncContent(keybindingsContent, syncContent) {
        let parsed = {};
        try {
            parsed = JSON.parse(syncContent || '{}');
        }
        catch (e) {
            this.logService.error(e);
        }
        if (this.syncKeybindingsPerPlatform()) {
            delete parsed.all;
        }
        else {
            parsed.all = keybindingsContent;
        }
        switch (OS) {
            case 2 /* OperatingSystem.Macintosh */:
                parsed.mac = keybindingsContent;
                break;
            case 3 /* OperatingSystem.Linux */:
                parsed.linux = keybindingsContent;
                break;
            case 1 /* OperatingSystem.Windows */:
                parsed.windows = keybindingsContent;
                break;
        }
        return JSON.stringify(parsed);
    }
    syncKeybindingsPerPlatform() {
        return !!this.configurationService.getValue(CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM);
    }
};
KeybindingsSynchroniser = __decorate([
    __param(2, IUserDataSyncStoreService),
    __param(3, IUserDataSyncBackupStoreService),
    __param(4, IUserDataSyncLogService),
    __param(5, IConfigurationService),
    __param(6, IUserDataSyncEnablementService),
    __param(7, IFileService),
    __param(8, IEnvironmentService),
    __param(9, IStorageService),
    __param(10, IUserDataSyncUtilService),
    __param(11, ITelemetryService),
    __param(12, IUriIdentityService)
], KeybindingsSynchroniser);
export { KeybindingsSynchroniser };
let KeybindingsInitializer = class KeybindingsInitializer extends AbstractInitializer {
    constructor(fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
        super("keybindings" /* SyncResource.Keybindings */, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
    }
    async doInitialize(remoteUserData) {
        const keybindingsContent = remoteUserData.syncData ? this.getKeybindingsContentFromSyncContent(remoteUserData.syncData.content) : null;
        if (!keybindingsContent) {
            this.logService.info('Skipping initializing keybindings because remote keybindings does not exist.');
            return;
        }
        const isEmpty = await this.isEmpty();
        if (!isEmpty) {
            this.logService.info('Skipping initializing keybindings because local keybindings exist.');
            return;
        }
        await this.fileService.writeFile(this.userDataProfilesService.defaultProfile.keybindingsResource, VSBuffer.fromString(keybindingsContent));
        await this.updateLastSyncUserData(remoteUserData);
    }
    async isEmpty() {
        try {
            const fileContent = await this.fileService.readFile(this.userDataProfilesService.defaultProfile.settingsResource);
            const keybindings = parse(fileContent.value.toString());
            return !isNonEmptyArray(keybindings);
        }
        catch (error) {
            return error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */;
        }
    }
    getKeybindingsContentFromSyncContent(syncContent) {
        try {
            return getKeybindingsContentFromSyncContent(syncContent, true, this.logService);
        }
        catch (e) {
            this.logService.error(e);
            return null;
        }
    }
};
KeybindingsInitializer = __decorate([
    __param(0, IFileService),
    __param(1, IUserDataProfilesService),
    __param(2, IEnvironmentService),
    __param(3, IUserDataSyncLogService),
    __param(4, IStorageService),
    __param(5, IUriIdentityService)
], KeybindingsInitializer);
export { KeybindingsInitializer };
