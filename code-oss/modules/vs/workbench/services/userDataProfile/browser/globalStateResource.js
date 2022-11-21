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
import { localize } from 'vs/nls';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IUserDataProfileStorageService } from 'vs/platform/userDataProfile/common/userDataProfileStorageService';
import { API_OPEN_EDITOR_COMMAND_ID } from 'vs/workbench/browser/parts/editor/editorCommands';
import { TreeItemCollapsibleState } from 'vs/workbench/common/views';
let GlobalStateResource = class GlobalStateResource {
    storageService;
    userDataProfileStorageService;
    logService;
    constructor(storageService, userDataProfileStorageService, logService) {
        this.storageService = storageService;
        this.userDataProfileStorageService = userDataProfileStorageService;
        this.logService = logService;
    }
    async getContent(profile) {
        const globalState = await this.getGlobalState(profile);
        return JSON.stringify(globalState);
    }
    async apply(content, profile) {
        const globalState = JSON.parse(content);
        await this.writeGlobalState(globalState, profile);
    }
    async getGlobalState(profile) {
        const storage = {};
        const storageData = await this.userDataProfileStorageService.readStorageData(profile);
        for (const [key, value] of storageData) {
            if (value.value !== undefined && value.target === 0 /* StorageTarget.USER */) {
                storage[key] = value.value;
            }
        }
        return { storage };
    }
    async writeGlobalState(globalState, profile) {
        const storageKeys = Object.keys(globalState.storage);
        if (storageKeys.length) {
            const updatedStorage = new Map();
            const nonProfileKeys = [
                // Do not include application scope user target keys because they also include default profile user target keys
                ...this.storageService.keys(-1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */),
                ...this.storageService.keys(1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */),
                ...this.storageService.keys(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */),
            ];
            for (const key of storageKeys) {
                if (nonProfileKeys.includes(key)) {
                    this.logService.info(`Profile: Ignoring global state key '${key}' because it is not a profile key.`);
                }
                else {
                    updatedStorage.set(key, globalState.storage[key]);
                }
            }
            await this.userDataProfileStorageService.updateStorageData(profile, updatedStorage, 0 /* StorageTarget.USER */);
        }
    }
};
GlobalStateResource = __decorate([
    __param(0, IStorageService),
    __param(1, IUserDataProfileStorageService),
    __param(2, ILogService)
], GlobalStateResource);
export { GlobalStateResource };
let GlobalStateResourceExportTreeItem = class GlobalStateResourceExportTreeItem {
    profile;
    instantiationService;
    handle = this.profile.globalStorageHome.toString();
    label = { label: localize('globalState', "UI State") };
    collapsibleState = TreeItemCollapsibleState.None;
    checkbox = { isChecked: true };
    constructor(profile, instantiationService) {
        this.profile = profile;
        this.instantiationService = instantiationService;
    }
    async getChildren() { return undefined; }
    async hasContent() {
        const globalState = await this.instantiationService.createInstance(GlobalStateResource).getGlobalState(this.profile);
        return Object.keys(globalState.storage).length > 0;
    }
    async getContent() {
        return this.instantiationService.createInstance(GlobalStateResource).getContent(this.profile);
    }
};
GlobalStateResourceExportTreeItem = __decorate([
    __param(1, IInstantiationService)
], GlobalStateResourceExportTreeItem);
export { GlobalStateResourceExportTreeItem };
export class GlobalStateResourceImportTreeItem {
    resource;
    handle = 'globalState';
    label = { label: localize('globalState', "UI State") };
    collapsibleState = TreeItemCollapsibleState.None;
    command = {
        id: API_OPEN_EDITOR_COMMAND_ID,
        title: '',
        arguments: [this.resource, undefined, undefined]
    };
    constructor(resource) {
        this.resource = resource;
    }
    async getChildren() { return undefined; }
}
