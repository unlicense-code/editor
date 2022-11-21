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
import { Disposable } from 'vs/base/common/lifecycle';
import { Event } from 'vs/base/common/event';
import { FilePermission, FileSystemProviderErrorCode, FileType } from 'vs/platform/files/common/files';
import { ChangeType, decodeEditSessionFileContent, EDIT_SESSIONS_SCHEME, IEditSessionsStorageService } from 'vs/workbench/contrib/editSessions/common/editSessions';
import { NotSupportedError } from 'vs/base/common/errors';
let EditSessionsFileSystemProvider = class EditSessionsFileSystemProvider {
    editSessionsStorageService;
    static SCHEMA = EDIT_SESSIONS_SCHEME;
    constructor(editSessionsStorageService) {
        this.editSessionsStorageService = editSessionsStorageService;
    }
    capabilities = 2048 /* FileSystemProviderCapabilities.Readonly */ + 2 /* FileSystemProviderCapabilities.FileReadWrite */;
    async readFile(resource) {
        const match = /(?<ref>[^/]+)\/(?<folderName>[^/]+)\/(?<filePath>.*)/.exec(resource.path.substring(1));
        if (!match?.groups) {
            throw FileSystemProviderErrorCode.FileNotFound;
        }
        const { ref, folderName, filePath } = match.groups;
        const data = await this.editSessionsStorageService.read(ref);
        if (!data) {
            throw FileSystemProviderErrorCode.FileNotFound;
        }
        const change = data?.editSession.folders.find((f) => f.name === folderName)?.workingChanges.find((change) => change.relativeFilePath === filePath);
        if (!change || change.type === ChangeType.Deletion) {
            throw FileSystemProviderErrorCode.FileNotFound;
        }
        return decodeEditSessionFileContent(data.editSession.version, change.contents).buffer;
    }
    async stat(resource) {
        const content = await this.readFile(resource);
        const currentTime = Date.now();
        return {
            type: FileType.File,
            permissions: FilePermission.Readonly,
            mtime: currentTime,
            ctime: currentTime,
            size: content.byteLength
        };
    }
    //#region Unsupported file operations
    onDidChangeCapabilities = Event.None;
    onDidChangeFile = Event.None;
    watch(resource, opts) { return Disposable.None; }
    async mkdir(resource) { }
    async readdir(resource) { return []; }
    async rename(from, to, opts) { }
    async delete(resource, opts) { }
    async writeFile() {
        throw new NotSupportedError();
    }
};
EditSessionsFileSystemProvider = __decorate([
    __param(0, IEditSessionsStorageService)
], EditSessionsFileSystemProvider);
export { EditSessionsFileSystemProvider };
