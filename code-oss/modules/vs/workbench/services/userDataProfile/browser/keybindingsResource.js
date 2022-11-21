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
import { FileOperationError, IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { platform } from 'vs/base/common/platform';
import { TreeItemCollapsibleState } from 'vs/workbench/common/views';
import { API_OPEN_EDITOR_COMMAND_ID } from 'vs/workbench/browser/parts/editor/editorCommands';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { localize } from 'vs/nls';
let KeybindingsResource = class KeybindingsResource {
    fileService;
    logService;
    constructor(fileService, logService) {
        this.fileService = fileService;
        this.logService = logService;
    }
    async getContent(profile) {
        const keybindingsContent = await this.getKeybindingsResourceContent(profile);
        return JSON.stringify(keybindingsContent);
    }
    async getKeybindingsResourceContent(profile) {
        const keybindings = await this.getKeybindingsContent(profile);
        return { keybindings, platform };
    }
    async apply(content, profile) {
        const keybindingsContent = JSON.parse(content);
        if (keybindingsContent.keybindings === null) {
            this.logService.info(`Profile: No keybindings to apply...`);
            return;
        }
        await this.fileService.writeFile(profile.keybindingsResource, VSBuffer.fromString(keybindingsContent.keybindings));
    }
    async getKeybindingsContent(profile) {
        try {
            const content = await this.fileService.readFile(profile.keybindingsResource);
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
KeybindingsResource = __decorate([
    __param(0, IFileService),
    __param(1, ILogService)
], KeybindingsResource);
export { KeybindingsResource };
let KeybindingsResourceTreeItem = class KeybindingsResourceTreeItem {
    profile;
    instantiationService;
    handle = this.profile.keybindingsResource.toString();
    label = { label: localize('keybindings', "Keyboard Shortcuts") };
    collapsibleState = TreeItemCollapsibleState.None;
    checkbox = { isChecked: true };
    command = {
        id: API_OPEN_EDITOR_COMMAND_ID,
        title: '',
        arguments: [this.profile.keybindingsResource, undefined, undefined]
    };
    constructor(profile, instantiationService) {
        this.profile = profile;
        this.instantiationService = instantiationService;
    }
    async getChildren() { return undefined; }
    async hasContent() {
        const keybindingsContent = await this.instantiationService.createInstance(KeybindingsResource).getKeybindingsResourceContent(this.profile);
        return keybindingsContent.keybindings !== null;
    }
    async getContent() {
        return this.instantiationService.createInstance(KeybindingsResource).getContent(this.profile);
    }
};
KeybindingsResourceTreeItem = __decorate([
    __param(1, IInstantiationService)
], KeybindingsResourceTreeItem);
export { KeybindingsResourceTreeItem };
