/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { VSBuffer } from 'vs/base/common/buffer';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable, DisposableStore, toDisposable } from 'vs/base/common/lifecycle';
import { clamp } from 'vs/base/common/numbers';
import { assertNever } from 'vs/base/common/assert';
import { FilePermission, FileSystemProviderError, FileSystemProviderErrorCode, FileType } from 'vs/platform/files/common/files';
import { DEBUG_MEMORY_SCHEME } from 'vs/workbench/contrib/debug/common/debug';
const rangeRe = /range=([0-9]+):([0-9]+)/;
export class DebugMemoryFileSystemProvider {
    debugService;
    memoryFdCounter = 0;
    fdMemory = new Map();
    changeEmitter = new Emitter();
    /** @inheritdoc */
    onDidChangeCapabilities = Event.None;
    /** @inheritdoc */
    onDidChangeFile = this.changeEmitter.event;
    /** @inheritdoc */
    capabilities = 0
        | 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */
        | 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */;
    constructor(debugService) {
        this.debugService = debugService;
        debugService.onDidEndSession(session => {
            for (const [fd, memory] of this.fdMemory) {
                if (memory.session === session) {
                    this.close(fd);
                }
            }
        });
    }
    watch(resource, opts) {
        if (opts.recursive) {
            return toDisposable(() => { });
        }
        const { session, memoryReference, offset } = this.parseUri(resource);
        const disposable = new DisposableStore();
        disposable.add(session.onDidChangeState(() => {
            if (session.state === 3 /* State.Running */ || session.state === 0 /* State.Inactive */) {
                this.changeEmitter.fire([{ type: 2 /* FileChangeType.DELETED */, resource }]);
            }
        }));
        disposable.add(session.onDidInvalidateMemory(e => {
            if (e.body.memoryReference !== memoryReference) {
                return;
            }
            if (offset && (e.body.offset >= offset.toOffset || e.body.offset + e.body.count < offset.fromOffset)) {
                return;
            }
            this.changeEmitter.fire([{ resource, type: 0 /* FileChangeType.UPDATED */ }]);
        }));
        return disposable;
    }
    /** @inheritdoc */
    stat(file) {
        const { readOnly } = this.parseUri(file);
        return Promise.resolve({
            type: FileType.File,
            mtime: 0,
            ctime: 0,
            size: 0,
            permissions: readOnly ? FilePermission.Readonly : undefined,
        });
    }
    /** @inheritdoc */
    mkdir() {
        throw new FileSystemProviderError(`Not allowed`, FileSystemProviderErrorCode.NoPermissions);
    }
    /** @inheritdoc */
    readdir() {
        throw new FileSystemProviderError(`Not allowed`, FileSystemProviderErrorCode.NoPermissions);
    }
    /** @inheritdoc */
    delete() {
        throw new FileSystemProviderError(`Not allowed`, FileSystemProviderErrorCode.NoPermissions);
    }
    /** @inheritdoc */
    rename() {
        throw new FileSystemProviderError(`Not allowed`, FileSystemProviderErrorCode.NoPermissions);
    }
    /** @inheritdoc */
    open(resource, _opts) {
        const { session, memoryReference, offset } = this.parseUri(resource);
        const fd = this.memoryFdCounter++;
        let region = session.getMemory(memoryReference);
        if (offset) {
            region = new MemoryRegionView(region, offset);
        }
        this.fdMemory.set(fd, { session, region });
        return Promise.resolve(fd);
    }
    /** @inheritdoc */
    close(fd) {
        this.fdMemory.get(fd)?.region.dispose();
        this.fdMemory.delete(fd);
        return Promise.resolve();
    }
    /** @inheritdoc */
    async writeFile(resource, content) {
        const { offset } = this.parseUri(resource);
        if (!offset) {
            throw new FileSystemProviderError(`Range must be present to read a file`, FileSystemProviderErrorCode.FileNotFound);
        }
        const fd = await this.open(resource, { create: false });
        try {
            await this.write(fd, offset.fromOffset, content, 0, content.length);
        }
        finally {
            this.close(fd);
        }
    }
    /** @inheritdoc */
    async readFile(resource) {
        const { offset } = this.parseUri(resource);
        if (!offset) {
            throw new FileSystemProviderError(`Range must be present to read a file`, FileSystemProviderErrorCode.FileNotFound);
        }
        const data = new Uint8Array(offset.toOffset - offset.fromOffset);
        const fd = await this.open(resource, { create: false });
        try {
            await this.read(fd, offset.fromOffset, data, 0, data.length);
            return data;
        }
        finally {
            this.close(fd);
        }
    }
    /** @inheritdoc */
    async read(fd, pos, data, offset, length) {
        const memory = this.fdMemory.get(fd);
        if (!memory) {
            throw new FileSystemProviderError(`No file with that descriptor open`, FileSystemProviderErrorCode.Unavailable);
        }
        const ranges = await memory.region.read(pos, length);
        let readSoFar = 0;
        for (const range of ranges) {
            switch (range.type) {
                case 1 /* MemoryRangeType.Unreadable */:
                    return readSoFar;
                case 2 /* MemoryRangeType.Error */:
                    if (readSoFar > 0) {
                        return readSoFar;
                    }
                    else {
                        throw new FileSystemProviderError(range.error, FileSystemProviderErrorCode.Unknown);
                    }
                case 0 /* MemoryRangeType.Valid */: {
                    const start = Math.max(0, pos - range.offset);
                    const toWrite = range.data.slice(start, Math.min(range.data.byteLength, start + (length - readSoFar)));
                    data.set(toWrite.buffer, offset + readSoFar);
                    readSoFar += toWrite.byteLength;
                    break;
                }
                default:
                    assertNever(range);
            }
        }
        return readSoFar;
    }
    /** @inheritdoc */
    write(fd, pos, data, offset, length) {
        const memory = this.fdMemory.get(fd);
        if (!memory) {
            throw new FileSystemProviderError(`No file with that descriptor open`, FileSystemProviderErrorCode.Unavailable);
        }
        return memory.region.write(pos, VSBuffer.wrap(data).slice(offset, offset + length));
    }
    parseUri(uri) {
        if (uri.scheme !== DEBUG_MEMORY_SCHEME) {
            throw new FileSystemProviderError(`Cannot open file with scheme ${uri.scheme}`, FileSystemProviderErrorCode.FileNotFound);
        }
        const session = this.debugService.getModel().getSession(uri.authority);
        if (!session) {
            throw new FileSystemProviderError(`Debug session not found`, FileSystemProviderErrorCode.FileNotFound);
        }
        let offset;
        const rangeMatch = rangeRe.exec(uri.query);
        if (rangeMatch) {
            offset = { fromOffset: Number(rangeMatch[1]), toOffset: Number(rangeMatch[2]) };
        }
        const [, memoryReference] = uri.path.split('/');
        return {
            session,
            offset,
            readOnly: !session.capabilities.supportsWriteMemoryRequest,
            sessionId: uri.authority,
            memoryReference: decodeURIComponent(memoryReference),
        };
    }
}
/** A wrapper for a MemoryRegion that references a subset of data in another region. */
class MemoryRegionView extends Disposable {
    parent;
    range;
    invalidateEmitter = new Emitter();
    onDidInvalidate = this.invalidateEmitter.event;
    writable;
    width = this.range.toOffset - this.range.fromOffset;
    constructor(parent, range) {
        super();
        this.parent = parent;
        this.range = range;
        this.writable = parent.writable;
        this._register(parent);
        this._register(parent.onDidInvalidate(e => {
            const fromOffset = clamp(e.fromOffset - range.fromOffset, 0, this.width);
            const toOffset = clamp(e.toOffset - range.fromOffset, 0, this.width);
            if (toOffset > fromOffset) {
                this.invalidateEmitter.fire({ fromOffset, toOffset });
            }
        }));
    }
    read(fromOffset, toOffset) {
        if (fromOffset < 0) {
            throw new RangeError(`Invalid fromOffset: ${fromOffset}`);
        }
        return this.parent.read(this.range.fromOffset + fromOffset, this.range.fromOffset + Math.min(toOffset, this.width));
    }
    write(offset, data) {
        return this.parent.write(this.range.fromOffset + offset, data);
    }
}
