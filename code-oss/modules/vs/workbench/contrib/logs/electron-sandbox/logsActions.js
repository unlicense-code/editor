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
import { Action } from 'vs/base/common/actions';
import { join } from 'vs/base/common/path';
import { URI } from 'vs/base/common/uri';
import * as nls from 'vs/nls';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IFileService } from 'vs/platform/files/common/files';
let OpenLogsFolderAction = class OpenLogsFolderAction extends Action {
    environmentService;
    nativeHostService;
    static ID = 'workbench.action.openLogsFolder';
    static TITLE = { value: nls.localize('openLogsFolder', "Open Logs Folder"), original: 'Open Logs Folder' };
    constructor(id, label, environmentService, nativeHostService) {
        super(id, label);
        this.environmentService = environmentService;
        this.nativeHostService = nativeHostService;
    }
    run() {
        return this.nativeHostService.showItemInFolder(URI.file(join(this.environmentService.logsPath, 'main.log')).fsPath);
    }
};
OpenLogsFolderAction = __decorate([
    __param(2, INativeWorkbenchEnvironmentService),
    __param(3, INativeHostService)
], OpenLogsFolderAction);
export { OpenLogsFolderAction };
let OpenExtensionLogsFolderAction = class OpenExtensionLogsFolderAction extends Action {
    environmentSerice;
    fileService;
    nativeHostService;
    static ID = 'workbench.action.openExtensionLogsFolder';
    static TITLE = { value: nls.localize('openExtensionLogsFolder', "Open Extension Logs Folder"), original: 'Open Extension Logs Folder' };
    constructor(id, label, environmentSerice, fileService, nativeHostService) {
        super(id, label);
        this.environmentSerice = environmentSerice;
        this.fileService = fileService;
        this.nativeHostService = nativeHostService;
    }
    async run() {
        const folderStat = await this.fileService.resolve(this.environmentSerice.extHostLogsPath);
        if (folderStat.children && folderStat.children[0]) {
            return this.nativeHostService.showItemInFolder(folderStat.children[0].resource.fsPath);
        }
    }
};
OpenExtensionLogsFolderAction = __decorate([
    __param(2, INativeWorkbenchEnvironmentService),
    __param(3, IFileService),
    __param(4, INativeHostService)
], OpenExtensionLogsFolderAction);
export { OpenExtensionLogsFolderAction };
