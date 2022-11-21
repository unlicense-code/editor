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
import { RunOnceScheduler } from 'vs/base/common/async';
import { onUnexpectedError } from 'vs/base/common/errors';
import { Disposable } from 'vs/base/common/lifecycle';
import { join } from 'vs/base/common/path';
import { Promises } from 'vs/base/node/pfs';
import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { IMainProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { ILogService } from 'vs/platform/log/common/log';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { StorageClient } from 'vs/platform/storage/common/storageIpc';
import { EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE } from 'vs/platform/workspace/common/workspace';
import { NON_EMPTY_WORKSPACE_ID_LENGTH } from 'vs/platform/workspaces/node/workspaces';
let UnusedWorkspaceStorageDataCleaner = class UnusedWorkspaceStorageDataCleaner extends Disposable {
    environmentService;
    logService;
    nativeHostService;
    mainProcessService;
    constructor(environmentService, logService, nativeHostService, mainProcessService) {
        super();
        this.environmentService = environmentService;
        this.logService = logService;
        this.nativeHostService = nativeHostService;
        this.mainProcessService = mainProcessService;
        const scheduler = this._register(new RunOnceScheduler(() => {
            this.cleanUpStorage();
        }, 30 * 1000 /* after 30s */));
        scheduler.schedule();
    }
    async cleanUpStorage() {
        this.logService.trace('[storage cleanup]: Starting to clean up workspace storage folders for unused empty workspaces.');
        try {
            const workspaceStorageFolders = await Promises.readdir(this.environmentService.workspaceStorageHome.fsPath);
            const storageClient = new StorageClient(this.mainProcessService.getChannel('storage'));
            await Promise.all(workspaceStorageFolders.map(async (workspaceStorageFolder) => {
                const workspaceStoragePath = join(this.environmentService.workspaceStorageHome.fsPath, workspaceStorageFolder);
                if (workspaceStorageFolder.length === NON_EMPTY_WORKSPACE_ID_LENGTH) {
                    return; // keep workspace storage for folders/workspaces that can be accessed still
                }
                if (workspaceStorageFolder === EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE.id) {
                    return; // keep workspace storage for empty extension development workspaces
                }
                const windows = await this.nativeHostService.getWindows();
                if (windows.some(window => window.workspace?.id === workspaceStorageFolder)) {
                    return; // keep workspace storage for empty workspaces opened as window
                }
                const isStorageUsed = await storageClient.isUsed(workspaceStoragePath);
                if (isStorageUsed) {
                    return; // keep workspace storage for empty workspaces that are in use
                }
                this.logService.trace(`[storage cleanup]: Deleting workspace storage folder ${workspaceStorageFolder} as it seems to be an unused empty workspace.`);
                await Promises.rm(workspaceStoragePath);
            }));
        }
        catch (error) {
            onUnexpectedError(error);
        }
    }
};
UnusedWorkspaceStorageDataCleaner = __decorate([
    __param(0, INativeEnvironmentService),
    __param(1, ILogService),
    __param(2, INativeHostService),
    __param(3, IMainProcessService)
], UnusedWorkspaceStorageDataCleaner);
export { UnusedWorkspaceStorageDataCleaner };
