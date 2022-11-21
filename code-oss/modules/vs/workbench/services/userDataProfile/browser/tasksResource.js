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
import { localize } from 'vs/nls';
import { FileOperationError, IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { API_OPEN_EDITOR_COMMAND_ID } from 'vs/workbench/browser/parts/editor/editorCommands';
import { TreeItemCollapsibleState } from 'vs/workbench/common/views';
let TasksResource = class TasksResource {
    fileService;
    logService;
    constructor(fileService, logService) {
        this.fileService = fileService;
        this.logService = logService;
    }
    async getContent(profile) {
        const tasksContent = await this.getTasksResourceContent(profile);
        return JSON.stringify(tasksContent);
    }
    async getTasksResourceContent(profile) {
        const tasksContent = await this.getTasksContent(profile);
        return { tasks: tasksContent };
    }
    async apply(content, profile) {
        const tasksContent = JSON.parse(content);
        if (!tasksContent.tasks) {
            this.logService.info(`Profile: No tasks to apply...`);
            return;
        }
        await this.fileService.writeFile(profile.tasksResource, VSBuffer.fromString(tasksContent.tasks));
    }
    async getTasksContent(profile) {
        try {
            const content = await this.fileService.readFile(profile.tasksResource);
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
TasksResource = __decorate([
    __param(0, IFileService),
    __param(1, ILogService)
], TasksResource);
export { TasksResource };
let TasksResourceTreeItem = class TasksResourceTreeItem {
    profile;
    instantiationService;
    handle = this.profile.tasksResource.toString();
    label = { label: localize('tasks', "User Tasks") };
    collapsibleState = TreeItemCollapsibleState.None;
    checkbox = { isChecked: true };
    command = {
        id: API_OPEN_EDITOR_COMMAND_ID,
        title: '',
        arguments: [this.profile.tasksResource, undefined, undefined]
    };
    constructor(profile, instantiationService) {
        this.profile = profile;
        this.instantiationService = instantiationService;
    }
    async getChildren() { return undefined; }
    async hasContent() {
        const tasksContent = await this.instantiationService.createInstance(TasksResource).getTasksResourceContent(this.profile);
        return tasksContent.tasks !== null;
    }
    async getContent() {
        return this.instantiationService.createInstance(TasksResource).getContent(this.profile);
    }
};
TasksResourceTreeItem = __decorate([
    __param(1, IInstantiationService)
], TasksResourceTreeItem);
export { TasksResourceTreeItem };
