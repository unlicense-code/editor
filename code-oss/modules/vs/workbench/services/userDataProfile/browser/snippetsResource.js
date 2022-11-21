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
import { ResourceSet } from 'vs/base/common/map';
import { localize } from 'vs/nls';
import { FileOperationError, IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { API_OPEN_EDITOR_COMMAND_ID } from 'vs/workbench/browser/parts/editor/editorCommands';
import { TreeItemCollapsibleState } from 'vs/workbench/common/views';
let SnippetsResource = class SnippetsResource {
    fileService;
    uriIdentityService;
    constructor(fileService, uriIdentityService) {
        this.fileService = fileService;
        this.uriIdentityService = uriIdentityService;
    }
    async getContent(profile, excluded) {
        const snippets = await this.getSnippets(profile, excluded);
        return JSON.stringify({ snippets });
    }
    async apply(content, profile) {
        const snippetsContent = JSON.parse(content);
        for (const key in snippetsContent.snippets) {
            const resource = this.uriIdentityService.extUri.joinPath(profile.snippetsHome, key);
            await this.fileService.writeFile(resource, VSBuffer.fromString(snippetsContent.snippets[key]));
        }
    }
    async getSnippets(profile, excluded) {
        const snippets = {};
        const snippetsResources = await this.getSnippetsResources(profile, excluded);
        for (const resource of snippetsResources) {
            const key = this.uriIdentityService.extUri.relativePath(profile.snippetsHome, resource);
            const content = await this.fileService.readFile(resource);
            snippets[key] = content.value.toString();
        }
        return snippets;
    }
    async getSnippetsResources(profile, excluded) {
        const snippets = [];
        let stat;
        try {
            stat = await this.fileService.resolve(profile.snippetsHome);
        }
        catch (e) {
            // No snippets
            if (e instanceof FileOperationError && e.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                return snippets;
            }
            else {
                throw e;
            }
        }
        for (const { resource } of stat.children || []) {
            if (excluded?.has(resource)) {
                continue;
            }
            const extension = this.uriIdentityService.extUri.extname(resource);
            if (extension === '.json' || extension === '.code-snippets') {
                snippets.push(resource);
            }
        }
        return snippets;
    }
};
SnippetsResource = __decorate([
    __param(0, IFileService),
    __param(1, IUriIdentityService)
], SnippetsResource);
export { SnippetsResource };
let SnippetsResourceTreeItem = class SnippetsResourceTreeItem {
    profile;
    instantiationService;
    handle = this.profile.snippetsHome.toString();
    label = { label: localize('snippets', "Snippets") };
    collapsibleState = TreeItemCollapsibleState.Collapsed;
    checkbox = { isChecked: true };
    excludedSnippets = new ResourceSet();
    constructor(profile, instantiationService) {
        this.profile = profile;
        this.instantiationService = instantiationService;
    }
    async getChildren() {
        const snippetsResources = await this.instantiationService.createInstance(SnippetsResource).getSnippetsResources(this.profile);
        const that = this;
        return snippetsResources.map(resource => ({
            handle: resource.toString(),
            parent: that,
            resourceUri: resource,
            collapsibleState: TreeItemCollapsibleState.None,
            checkbox: that.checkbox ? {
                get isChecked() { return !that.excludedSnippets.has(resource); },
                set isChecked(value) {
                    if (value) {
                        that.excludedSnippets.delete(resource);
                    }
                    else {
                        that.excludedSnippets.add(resource);
                    }
                }
            } : undefined,
            command: {
                id: API_OPEN_EDITOR_COMMAND_ID,
                title: '',
                arguments: [resource, undefined, undefined]
            }
        }));
    }
    async hasContent() {
        const snippetsResources = await this.instantiationService.createInstance(SnippetsResource).getSnippetsResources(this.profile);
        return snippetsResources.length > 0;
    }
    async getContent() {
        return this.instantiationService.createInstance(SnippetsResource).getContent(this.profile, this.excludedSnippets);
    }
};
SnippetsResourceTreeItem = __decorate([
    __param(1, IInstantiationService)
], SnippetsResourceTreeItem);
export { SnippetsResourceTreeItem };
