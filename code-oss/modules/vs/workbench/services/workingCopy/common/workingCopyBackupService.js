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
import { basename, isEqual, joinPath } from 'vs/base/common/resources';
import { URI } from 'vs/base/common/uri';
import { coalesce } from 'vs/base/common/arrays';
import { equals, deepClone } from 'vs/base/common/objects';
import { Promises, ResourceQueue } from 'vs/base/common/async';
import { IFileService } from 'vs/platform/files/common/files';
import { ResourceMap } from 'vs/base/common/map';
import { isReadableStream, peekStream } from 'vs/base/common/stream';
import { bufferToStream, prefixedBufferReadable, prefixedBufferStream, readableToBuffer, streamToBuffer, VSBuffer } from 'vs/base/common/buffer';
import { Disposable } from 'vs/base/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
import { Schemas } from 'vs/base/common/network';
import { hash } from 'vs/base/common/hash';
import { isEmptyObject } from 'vs/base/common/types';
import { NO_TYPE_ID } from 'vs/workbench/services/workingCopy/common/workingCopy';
export class WorkingCopyBackupsModel {
    backupRoot;
    fileService;
    cache = new ResourceMap();
    static async create(backupRoot, fileService) {
        const model = new WorkingCopyBackupsModel(backupRoot, fileService);
        await model.resolve();
        return model;
    }
    constructor(backupRoot, fileService) {
        this.backupRoot = backupRoot;
        this.fileService = fileService;
    }
    async resolve() {
        try {
            const backupRootStat = await this.fileService.resolve(this.backupRoot);
            if (backupRootStat.children) {
                await Promises.settled(backupRootStat.children
                    .filter(child => child.isDirectory)
                    .map(async (backupSchemaFolder) => {
                    // Read backup directory for backups
                    const backupSchemaFolderStat = await this.fileService.resolve(backupSchemaFolder.resource);
                    // Remember known backups in our caches
                    //
                    // Note: this does NOT account for resolving
                    // associated meta data because that requires
                    // opening the backup and reading the meta
                    // preamble. Instead, when backups are actually
                    // resolved, the meta data will be added via
                    // additional `update` calls.
                    if (backupSchemaFolderStat.children) {
                        for (const backupForSchema of backupSchemaFolderStat.children) {
                            if (!backupForSchema.isDirectory) {
                                this.add(backupForSchema.resource);
                            }
                        }
                    }
                }));
            }
        }
        catch (error) {
            // ignore any errors
        }
    }
    add(resource, versionId = 0, meta) {
        this.cache.set(resource, {
            versionId,
            meta: deepClone(meta)
        });
    }
    update(resource, meta) {
        const entry = this.cache.get(resource);
        if (entry) {
            entry.meta = deepClone(meta);
        }
    }
    count() {
        return this.cache.size;
    }
    has(resource, versionId, meta) {
        const entry = this.cache.get(resource);
        if (!entry) {
            return false; // unknown resource
        }
        if (typeof versionId === 'number' && versionId !== entry.versionId) {
            return false; // different versionId
        }
        if (meta && !equals(meta, entry.meta)) {
            return false; // different metadata
        }
        return true;
    }
    get() {
        return Array.from(this.cache.keys());
    }
    remove(resource) {
        this.cache.delete(resource);
    }
    move(source, target) {
        const entry = this.cache.get(source);
        if (entry) {
            this.cache.delete(source);
            this.cache.set(target, entry);
        }
    }
    clear() {
        this.cache.clear();
    }
}
let WorkingCopyBackupService = class WorkingCopyBackupService {
    fileService;
    logService;
    impl;
    constructor(backupWorkspaceHome, fileService, logService) {
        this.fileService = fileService;
        this.logService = logService;
        this.impl = this.initialize(backupWorkspaceHome);
    }
    initialize(backupWorkspaceHome) {
        if (backupWorkspaceHome) {
            return new WorkingCopyBackupServiceImpl(backupWorkspaceHome, this.fileService, this.logService);
        }
        return new InMemoryWorkingCopyBackupService();
    }
    reinitialize(backupWorkspaceHome) {
        // Re-init implementation (unless we are running in-memory)
        if (this.impl instanceof WorkingCopyBackupServiceImpl) {
            if (backupWorkspaceHome) {
                this.impl.initialize(backupWorkspaceHome);
            }
            else {
                this.impl = new InMemoryWorkingCopyBackupService();
            }
        }
    }
    hasBackups() {
        return this.impl.hasBackups();
    }
    hasBackupSync(identifier, versionId, meta) {
        return this.impl.hasBackupSync(identifier, versionId, meta);
    }
    backup(identifier, content, versionId, meta, token) {
        return this.impl.backup(identifier, content, versionId, meta, token);
    }
    discardBackup(identifier, token) {
        return this.impl.discardBackup(identifier, token);
    }
    discardBackups(filter) {
        return this.impl.discardBackups(filter);
    }
    getBackups() {
        return this.impl.getBackups();
    }
    resolve(identifier) {
        return this.impl.resolve(identifier);
    }
    toBackupResource(identifier) {
        return this.impl.toBackupResource(identifier);
    }
    joinBackups() {
        return this.impl.joinBackups();
    }
};
WorkingCopyBackupService = __decorate([
    __param(1, IFileService),
    __param(2, ILogService)
], WorkingCopyBackupService);
export { WorkingCopyBackupService };
let WorkingCopyBackupServiceImpl = class WorkingCopyBackupServiceImpl extends Disposable {
    backupWorkspaceHome;
    fileService;
    logService;
    static PREAMBLE_END_MARKER = '\n';
    static PREAMBLE_END_MARKER_CHARCODE = '\n'.charCodeAt(0);
    static PREAMBLE_META_SEPARATOR = ' '; // using a character that is know to be escaped in a URI as separator
    static PREAMBLE_MAX_LENGTH = 10000;
    ioOperationQueues = this._register(new ResourceQueue()); // queue IO operations to ensure write/delete file order
    ready;
    model = undefined;
    constructor(backupWorkspaceHome, fileService, logService) {
        super();
        this.backupWorkspaceHome = backupWorkspaceHome;
        this.fileService = fileService;
        this.logService = logService;
        this.initialize(backupWorkspaceHome);
    }
    initialize(backupWorkspaceResource) {
        this.backupWorkspaceHome = backupWorkspaceResource;
        this.ready = this.doInitialize();
    }
    async doInitialize() {
        // Create backup model
        this.model = await WorkingCopyBackupsModel.create(this.backupWorkspaceHome, this.fileService);
        // Migrate hashes as needed. We used to hash with a MD5
        // sum of the path but switched to our own simpler hash
        // to avoid a node.js dependency. We still want to
        // support the older hash to prevent dataloss, so we:
        // - iterate over all backups
        // - detect if the file name length is 32 (MD5 length)
        // - read the backup's target file path
        // - rename the backup to the new hash
        // - update the backup in our model
        for (const backupResource of this.model.get()) {
            if (basename(backupResource).length !== 32) {
                continue; // not a MD5 hash, already uses new hash function
            }
            try {
                const identifier = await this.resolveIdentifier(backupResource, this.model);
                if (!identifier) {
                    this.logService.warn(`Backup: Unable to read target URI of backup ${backupResource} for migration to new hash.`);
                    continue;
                }
                const expectedBackupResource = this.toBackupResource(identifier);
                if (!isEqual(expectedBackupResource, backupResource)) {
                    await this.fileService.move(backupResource, expectedBackupResource, true);
                    this.model.move(backupResource, expectedBackupResource);
                }
            }
            catch (error) {
                this.logService.error(`Backup: Unable to migrate backup ${backupResource} to new hash.`);
            }
        }
        return this.model;
    }
    async hasBackups() {
        const model = await this.ready;
        return model.count() > 0;
    }
    hasBackupSync(identifier, versionId, meta) {
        if (!this.model) {
            return false;
        }
        const backupResource = this.toBackupResource(identifier);
        return this.model.has(backupResource, versionId, meta);
    }
    async backup(identifier, content, versionId, meta, token) {
        const model = await this.ready;
        if (token?.isCancellationRequested) {
            return;
        }
        const backupResource = this.toBackupResource(identifier);
        if (model.has(backupResource, versionId, meta)) {
            // return early if backup version id matches requested one
            return;
        }
        return this.ioOperationQueues.queueFor(backupResource).queue(async () => {
            if (token?.isCancellationRequested) {
                return;
            }
            if (model.has(backupResource, versionId, meta)) {
                // return early if backup version id matches requested one
                // this can happen when multiple backup IO operations got
                // scheduled, racing against each other.
                return;
            }
            // Encode as: Resource + META-START + Meta + END
            // and respect max length restrictions in case
            // meta is too large.
            let preamble = this.createPreamble(identifier, meta);
            if (preamble.length >= WorkingCopyBackupServiceImpl.PREAMBLE_MAX_LENGTH) {
                preamble = this.createPreamble(identifier);
            }
            // Update backup with value
            const preambleBuffer = VSBuffer.fromString(preamble);
            let backupBuffer;
            if (isReadableStream(content)) {
                backupBuffer = prefixedBufferStream(preambleBuffer, content);
            }
            else if (content) {
                backupBuffer = prefixedBufferReadable(preambleBuffer, content);
            }
            else {
                backupBuffer = VSBuffer.concat([preambleBuffer, VSBuffer.fromString('')]);
            }
            // Write backup via file service
            await this.fileService.writeFile(backupResource, backupBuffer);
            //
            // Update model
            //
            // Note: not checking for cancellation here because a successful
            // write into the backup file should be noted in the model to
            // prevent the model being out of sync with the backup file
            model.add(backupResource, versionId, meta);
        });
    }
    createPreamble(identifier, meta) {
        return `${identifier.resource.toString()}${WorkingCopyBackupServiceImpl.PREAMBLE_META_SEPARATOR}${JSON.stringify({ ...meta, typeId: identifier.typeId })}${WorkingCopyBackupServiceImpl.PREAMBLE_END_MARKER}`;
    }
    async discardBackups(filter) {
        const model = await this.ready;
        // Discard all but some backups
        const except = filter?.except;
        if (Array.isArray(except) && except.length > 0) {
            const exceptMap = new ResourceMap();
            for (const exceptWorkingCopy of except) {
                exceptMap.set(this.toBackupResource(exceptWorkingCopy), true);
            }
            await Promises.settled(model.get().map(async (backupResource) => {
                if (!exceptMap.has(backupResource)) {
                    await this.doDiscardBackup(backupResource);
                }
            }));
        }
        // Discard all backups
        else {
            await this.deleteIgnoreFileNotFound(this.backupWorkspaceHome);
            model.clear();
        }
    }
    discardBackup(identifier, token) {
        const backupResource = this.toBackupResource(identifier);
        return this.doDiscardBackup(backupResource, token);
    }
    async doDiscardBackup(backupResource, token) {
        const model = await this.ready;
        if (token?.isCancellationRequested) {
            return;
        }
        return this.ioOperationQueues.queueFor(backupResource).queue(async () => {
            if (token?.isCancellationRequested) {
                return;
            }
            // Delete backup file ignoring any file not found errors
            await this.deleteIgnoreFileNotFound(backupResource);
            //
            // Update model
            //
            // Note: not checking for cancellation here because a successful
            // delete of the backup file should be noted in the model to
            // prevent the model being out of sync with the backup file
            model.remove(backupResource);
        });
    }
    async deleteIgnoreFileNotFound(backupResource) {
        try {
            await this.fileService.del(backupResource, { recursive: true });
        }
        catch (error) {
            if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                throw error; // re-throw any other error than file not found which is OK
            }
        }
    }
    async getBackups() {
        const model = await this.ready;
        const backups = await Promise.all(model.get().map(backupResource => this.resolveIdentifier(backupResource, model)));
        return coalesce(backups);
    }
    async resolveIdentifier(backupResource, model) {
        // Read the entire backup preamble by reading up to
        // `PREAMBLE_MAX_LENGTH` in the backup file until
        // the `PREAMBLE_END_MARKER` is found
        const backupPreamble = await this.readToMatchingString(backupResource, WorkingCopyBackupServiceImpl.PREAMBLE_END_MARKER, WorkingCopyBackupServiceImpl.PREAMBLE_MAX_LENGTH);
        if (!backupPreamble) {
            return undefined;
        }
        // Figure out the offset in the preamble where meta
        // information possibly starts. This can be `-1` for
        // older backups without meta.
        const metaStartIndex = backupPreamble.indexOf(WorkingCopyBackupServiceImpl.PREAMBLE_META_SEPARATOR);
        // Extract the preamble content for resource and meta
        let resourcePreamble;
        let metaPreamble;
        if (metaStartIndex > 0) {
            resourcePreamble = backupPreamble.substring(0, metaStartIndex);
            metaPreamble = backupPreamble.substr(metaStartIndex + 1);
        }
        else {
            resourcePreamble = backupPreamble;
            metaPreamble = undefined;
        }
        // Try to parse the meta preamble for figuring out
        // `typeId` and `meta` if defined.
        const { typeId, meta } = this.parsePreambleMeta(metaPreamble);
        // Update model entry with now resolved meta
        model.update(backupResource, meta);
        return {
            typeId: typeId ?? NO_TYPE_ID,
            resource: URI.parse(resourcePreamble)
        };
    }
    async readToMatchingString(backupResource, matchingString, maximumBytesToRead) {
        const contents = (await this.fileService.readFile(backupResource, { length: maximumBytesToRead })).value.toString();
        const matchingStringIndex = contents.indexOf(matchingString);
        if (matchingStringIndex >= 0) {
            return contents.substr(0, matchingStringIndex);
        }
        // Unable to find matching string in file
        return undefined;
    }
    async resolve(identifier) {
        const backupResource = this.toBackupResource(identifier);
        const model = await this.ready;
        if (!model.has(backupResource)) {
            return undefined; // require backup to be present
        }
        // Load the backup content and peek into the first chunk
        // to be able to resolve the meta data
        const backupStream = await this.fileService.readFileStream(backupResource);
        const peekedBackupStream = await peekStream(backupStream.value, 1);
        const firstBackupChunk = VSBuffer.concat(peekedBackupStream.buffer);
        // We have seen reports (e.g. https://github.com/microsoft/vscode/issues/78500) where
        // if VSCode goes down while writing the backup file, the file can turn empty because
        // it always first gets truncated and then written to. In this case, we will not find
        // the meta-end marker ('\n') and as such the backup can only be invalid. We bail out
        // here if that is the case.
        const preambleEndIndex = firstBackupChunk.buffer.indexOf(WorkingCopyBackupServiceImpl.PREAMBLE_END_MARKER_CHARCODE);
        if (preambleEndIndex === -1) {
            this.logService.trace(`Backup: Could not find meta end marker in ${backupResource}. The file is probably corrupt (filesize: ${backupStream.size}).`);
            return undefined;
        }
        const preambelRaw = firstBackupChunk.slice(0, preambleEndIndex).toString();
        // Extract meta data (if any)
        let meta;
        const metaStartIndex = preambelRaw.indexOf(WorkingCopyBackupServiceImpl.PREAMBLE_META_SEPARATOR);
        if (metaStartIndex !== -1) {
            meta = this.parsePreambleMeta(preambelRaw.substr(metaStartIndex + 1)).meta;
        }
        // Update model entry with now resolved meta
        model.update(backupResource, meta);
        // Build a new stream without the preamble
        const firstBackupChunkWithoutPreamble = firstBackupChunk.slice(preambleEndIndex + 1);
        let value;
        if (peekedBackupStream.ended) {
            value = bufferToStream(firstBackupChunkWithoutPreamble);
        }
        else {
            value = prefixedBufferStream(firstBackupChunkWithoutPreamble, peekedBackupStream.stream);
        }
        return { value, meta };
    }
    parsePreambleMeta(preambleMetaRaw) {
        let typeId = undefined;
        let meta = undefined;
        if (preambleMetaRaw) {
            try {
                meta = JSON.parse(preambleMetaRaw);
                typeId = meta?.typeId;
                // `typeId` is a property that we add so we
                // remove it when returning to clients.
                if (typeof meta?.typeId === 'string') {
                    delete meta.typeId;
                    if (isEmptyObject(meta)) {
                        meta = undefined;
                    }
                }
            }
            catch (error) {
                // ignore JSON parse errors
            }
        }
        return { typeId, meta };
    }
    toBackupResource(identifier) {
        return joinPath(this.backupWorkspaceHome, identifier.resource.scheme, hashIdentifier(identifier));
    }
    joinBackups() {
        return this.ioOperationQueues.whenDrained();
    }
};
WorkingCopyBackupServiceImpl = __decorate([
    __param(1, IFileService),
    __param(2, ILogService)
], WorkingCopyBackupServiceImpl);
export class InMemoryWorkingCopyBackupService {
    backups = new ResourceMap();
    constructor() { }
    async hasBackups() {
        return this.backups.size > 0;
    }
    hasBackupSync(identifier, versionId) {
        const backupResource = this.toBackupResource(identifier);
        return this.backups.has(backupResource);
    }
    async backup(identifier, content, versionId, meta, token) {
        const backupResource = this.toBackupResource(identifier);
        this.backups.set(backupResource, {
            typeId: identifier.typeId,
            content: content instanceof VSBuffer ? content : content ? isReadableStream(content) ? await streamToBuffer(content) : readableToBuffer(content) : VSBuffer.fromString(''),
            meta
        });
    }
    async resolve(identifier) {
        const backupResource = this.toBackupResource(identifier);
        const backup = this.backups.get(backupResource);
        if (backup) {
            return { value: bufferToStream(backup.content), meta: backup.meta };
        }
        return undefined;
    }
    async getBackups() {
        return Array.from(this.backups.entries()).map(([resource, backup]) => ({ typeId: backup.typeId, resource }));
    }
    async discardBackup(identifier) {
        this.backups.delete(this.toBackupResource(identifier));
    }
    async discardBackups(filter) {
        const except = filter?.except;
        if (Array.isArray(except) && except.length > 0) {
            const exceptMap = new ResourceMap();
            for (const exceptWorkingCopy of except) {
                exceptMap.set(this.toBackupResource(exceptWorkingCopy), true);
            }
            for (const backup of await this.getBackups()) {
                if (!exceptMap.has(this.toBackupResource(backup))) {
                    await this.discardBackup(backup);
                }
            }
        }
        else {
            this.backups.clear();
        }
    }
    toBackupResource(identifier) {
        return URI.from({ scheme: Schemas.inMemory, path: hashIdentifier(identifier) });
    }
    async joinBackups() {
        return;
    }
}
/*
 * Exported only for testing
 */
export function hashIdentifier(identifier) {
    // IMPORTANT: for backwards compatibility, ensure that
    // we ignore the `typeId` unless a value is provided.
    // To preserve previous backups without type id, we
    // need to just hash the resource. Otherwise we use
    // the type id as a seed to the resource path.
    let resource;
    if (identifier.typeId.length > 0) {
        const typeIdHash = hashString(identifier.typeId);
        if (identifier.resource.path) {
            resource = joinPath(identifier.resource, typeIdHash);
        }
        else {
            resource = identifier.resource.with({ path: typeIdHash });
        }
    }
    else {
        resource = identifier.resource;
    }
    return hashPath(resource);
}
function hashPath(resource) {
    const str = resource.scheme === Schemas.file || resource.scheme === Schemas.untitled ? resource.fsPath : resource.toString();
    return hashString(str);
}
function hashString(str) {
    return hash(str).toString(16);
}
