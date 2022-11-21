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
import { VSBuffer } from 'vs/base/common/buffer';
import { Extensions } from 'vs/platform/configuration/common/configurationRegistry';
import { FileOperationError, IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { Registry } from 'vs/platform/registry/common/platform';
import { updateIgnoredSettings } from 'vs/platform/userDataSync/common/settingsMerge';
import { IUserDataSyncUtilService } from 'vs/platform/userDataSync/common/userDataSync';
import { TreeItemCollapsibleState } from 'vs/workbench/common/views';
import { API_OPEN_EDITOR_COMMAND_ID } from 'vs/workbench/browser/parts/editor/editorCommands';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { localize } from 'vs/nls';
let SettingsResource = class SettingsResource {
    fileService;
    userDataSyncUtilService;
    logService;
    constructor(fileService, userDataSyncUtilService, logService) {
        this.fileService = fileService;
        this.userDataSyncUtilService = userDataSyncUtilService;
        this.logService = logService;
    }
    async getContent(profile) {
        const settingsContent = await this.getSettingsContent(profile);
        return JSON.stringify(settingsContent);
    }
    async getSettingsContent(profile) {
        const localContent = await this.getLocalFileContent(profile);
        if (localContent === null) {
            return { settings: null };
        }
        else {
            const ignoredSettings = this.getIgnoredSettings();
            const formattingOptions = await this.userDataSyncUtilService.resolveFormattingOptions(profile.settingsResource);
            const settings = updateIgnoredSettings(localContent || '{}', '{}', ignoredSettings, formattingOptions);
            return { settings };
        }
    }
    async apply(content, profile) {
        const settingsContent = JSON.parse(content);
        if (settingsContent.settings === null) {
            this.logService.info(`Profile: No settings to apply...`);
            return;
        }
        const localSettingsContent = await this.getLocalFileContent(profile);
        const formattingOptions = await this.userDataSyncUtilService.resolveFormattingOptions(profile.settingsResource);
        const contentToUpdate = updateIgnoredSettings(settingsContent.settings, localSettingsContent || '{}', this.getIgnoredSettings(), formattingOptions);
        await this.fileService.writeFile(profile.settingsResource, VSBuffer.fromString(contentToUpdate));
    }
    getIgnoredSettings() {
        const allSettings = Registry.as(Extensions.Configuration).getConfigurationProperties();
        const ignoredSettings = Object.keys(allSettings).filter(key => allSettings[key]?.scope === 2 /* ConfigurationScope.MACHINE */ || allSettings[key]?.scope === 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */);
        return ignoredSettings;
    }
    async getLocalFileContent(profile) {
        try {
            const content = await this.fileService.readFile(profile.settingsResource);
            return content.value.toString();
        }
        catch (error) {
            // File not found
            if (error instanceof FileOperationError && error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                return null;
            }
            else {
                throw error;
            }
        }
    }
};
SettingsResource = __decorate([
    __param(0, IFileService),
    __param(1, IUserDataSyncUtilService),
    __param(2, ILogService)
], SettingsResource);
export { SettingsResource };
let SettingsResourceTreeItem = class SettingsResourceTreeItem {
    profile;
    instantiationService;
    handle = this.profile.settingsResource.toString();
    label = { label: localize('settings', "Settings") };
    collapsibleState = TreeItemCollapsibleState.None;
    checkbox = { isChecked: true };
    command = {
        id: API_OPEN_EDITOR_COMMAND_ID,
        title: '',
        arguments: [this.profile.settingsResource, undefined, undefined]
    };
    constructor(profile, instantiationService) {
        this.profile = profile;
        this.instantiationService = instantiationService;
    }
    async getChildren() { return undefined; }
    async hasContent() {
        const settingsContent = await this.instantiationService.createInstance(SettingsResource).getSettingsContent(this.profile);
        return settingsContent.settings !== null;
    }
    async getContent() {
        return this.instantiationService.createInstance(SettingsResource).getContent(this.profile);
    }
};
SettingsResourceTreeItem = __decorate([
    __param(1, IInstantiationService)
], SettingsResourceTreeItem);
export { SettingsResourceTreeItem };
