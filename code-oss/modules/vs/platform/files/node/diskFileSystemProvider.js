/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as fs from 'fs';
import { gracefulify } from 'graceful-fs';
import { Barrier, retry } from 'vs/base/common/async';
import { ResourceMap } from 'vs/base/common/map';
import { VSBuffer } from 'vs/base/common/buffer';
import { Event } from 'vs/base/common/event';
import { isEqual } from 'vs/base/common/extpath';
import { DisposableStore, toDisposable } from 'vs/base/common/lifecycle';
import { basename, dirname } from 'vs/base/common/path';
import { isLinux, isWindows } from 'vs/base/common/platform';
import { extUriBiasedIgnorePathCase, joinPath } from 'vs/base/common/resources';
import { newWriteableStream } from 'vs/base/common/stream';
import { Promises, RimRafMode, SymlinkSupport } from 'vs/base/node/pfs';
import { localize } from 'vs/nls';
import { createFileSystemProviderError, FileSystemProviderError, FileSystemProviderErrorCode, FileType, isFileOpenForWriteOptions } from 'vs/platform/files/common/files';
import { readFileIntoStream } from 'vs/platform/files/common/io';
import { AbstractDiskFileSystemProvider } from 'vs/platform/files/common/diskFileSystemProvider';
import { toErrorMessage } from 'vs/base/common/errorMessage';
import { UniversalWatcherClient } from 'vs/platform/files/node/watcher/watcherClient';
import { NodeJSWatcherClient } from 'vs/platform/files/node/watcher/nodejs/nodejsClient';
/**
 * Enable graceful-fs very early from here to have it enabled
 * in all contexts that leverage the disk file system provider.
 */
(() => {
    try {
        gracefulify(fs);
    }
    catch (error) {
        console.error(`Error enabling graceful-fs: ${toErrorMessage(error)}`);
    }
})();
export class DiskFileSystemProvider extends AbstractDiskFileSystemProvider {
    static TRACE_LOG_RESOURCE_LOCKS = false; // not enabled by default because very spammy
    constructor(logService, options) {
        super(logService, options);
    }
    //#region File Capabilities
    onDidChangeCapabilities = Event.None;
    _capabilities;
    get capabilities() {
        if (!this._capabilities) {
            this._capabilities =
                2 /* FileSystemProviderCapabilities.FileReadWrite */ |
                    4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */ |
                    16 /* FileSystemProviderCapabilities.FileReadStream */ |
                    8 /* FileSystemProviderCapabilities.FileFolderCopy */ |
                    8192 /* FileSystemProviderCapabilities.FileWriteUnlock */ |
                    16384 /* FileSystemProviderCapabilities.FileAtomicRead */ |
                    32768 /* FileSystemProviderCapabilities.FileClone */;
            if (isLinux) {
                this._capabilities |= 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */;
            }
        }
        return this._capabilities;
    }
    //#endregion
    //#region File Metadata Resolving
    async stat(resource) {
        try {
            const { stat, symbolicLink } = await SymlinkSupport.stat(this.toFilePath(resource)); // cannot use fs.stat() here to support links properly
            return {
                type: this.toType(stat, symbolicLink),
                ctime: stat.birthtime.getTime(),
                mtime: stat.mtime.getTime(),
                size: stat.size
            };
        }
        catch (error) {
            throw this.toFileSystemProviderError(error);
        }
    }
    async readdir(resource) {
        try {
            const children = await Promises.readdir(this.toFilePath(resource), { withFileTypes: true });
            const result = [];
            await Promise.all(children.map(async (child) => {
                try {
                    let type;
                    if (child.isSymbolicLink()) {
                        type = (await this.stat(joinPath(resource, child.name))).type; // always resolve target the link points to if any
                    }
                    else {
                        type = this.toType(child);
                    }
                    result.push([child.name, type]);
                }
                catch (error) {
                    this.logService.trace(error); // ignore errors for individual entries that can arise from permission denied
                }
            }));
            return result;
        }
        catch (error) {
            throw this.toFileSystemProviderError(error);
        }
    }
    toType(entry, symbolicLink) {
        // Signal file type by checking for file / directory, except:
        // - symbolic links pointing to nonexistent files are FileType.Unknown
        // - files that are neither file nor directory are FileType.Unknown
        let type;
        if (symbolicLink?.dangling) {
            type = FileType.Unknown;
        }
        else if (entry.isFile()) {
            type = FileType.File;
        }
        else if (entry.isDirectory()) {
            type = FileType.Directory;
        }
        else {
            type = FileType.Unknown;
        }
        // Always signal symbolic link as file type additionally
        if (symbolicLink) {
            type |= FileType.SymbolicLink;
        }
        return type;
    }
    //#endregion
    //#region File Reading/Writing
    resourceLocks = new ResourceMap(resource => extUriBiasedIgnorePathCase.getComparisonKey(resource));
    async createResourceLock(resource) {
        const filePath = this.toFilePath(resource);
        this.traceLock(`[Disk FileSystemProvider]: createResourceLock() - request to acquire resource lock (${filePath})`);
        // Await pending locks for resource. It is possible for a new lock being
        // added right after opening, so we have to loop over locks until no lock
        // remains.
        let existingLock = undefined;
        while (existingLock = this.resourceLocks.get(resource)) {
            this.traceLock(`[Disk FileSystemProvider]: createResourceLock() - waiting for resource lock to be released (${filePath})`);
            await existingLock.wait();
        }
        // Store new
        const newLock = new Barrier();
        this.resourceLocks.set(resource, newLock);
        this.traceLock(`[Disk FileSystemProvider]: createResourceLock() - new resource lock created (${filePath})`);
        return toDisposable(() => {
            this.traceLock(`[Disk FileSystemProvider]: createResourceLock() - resource lock dispose() (${filePath})`);
            // Delete lock if it is still ours
            if (this.resourceLocks.get(resource) === newLock) {
                this.traceLock(`[Disk FileSystemProvider]: createResourceLock() - resource lock removed from resource-lock map (${filePath})`);
                this.resourceLocks.delete(resource);
            }
            // Open lock
            this.traceLock(`[Disk FileSystemProvider]: createResourceLock() - resource lock barrier open() (${filePath})`);
            newLock.open();
        });
    }
    async readFile(resource, options) {
        let lock = undefined;
        try {
            if (options?.atomic) {
                this.traceLock(`[Disk FileSystemProvider]: atomic read operation started (${this.toFilePath(resource)})`);
                // When the read should be atomic, make sure
                // to await any pending locks for the resource
                // and lock for the duration of the read.
                lock = await this.createResourceLock(resource);
            }
            const filePath = this.toFilePath(resource);
            return await Promises.readFile(filePath);
        }
        catch (error) {
            throw this.toFileSystemProviderError(error);
        }
        finally {
            lock?.dispose();
        }
    }
    traceLock(msg) {
        if (DiskFileSystemProvider.TRACE_LOG_RESOURCE_LOCKS) {
            this.logService.trace(msg);
        }
    }
    readFileStream(resource, opts, token) {
        const stream = newWriteableStream(data => VSBuffer.concat(data.map(data => VSBuffer.wrap(data))).buffer);
        readFileIntoStream(this, resource, stream, data => data.buffer, {
            ...opts,
            bufferSize: 256 * 1024 // read into chunks of 256kb each to reduce IPC overhead
        }, token);
        return stream;
    }
    async writeFile(resource, content, opts) {
        let handle = undefined;
        try {
            const filePath = this.toFilePath(resource);
            // Validate target unless { create: true, overwrite: true }
            if (!opts.create || !opts.overwrite) {
                const fileExists = await Promises.exists(filePath);
                if (fileExists) {
                    if (!opts.overwrite) {
                        throw createFileSystemProviderError(localize('fileExists', "File already exists"), FileSystemProviderErrorCode.FileExists);
                    }
                }
                else {
                    if (!opts.create) {
                        throw createFileSystemProviderError(localize('fileNotExists', "File does not exist"), FileSystemProviderErrorCode.FileNotFound);
                    }
                }
            }
            // Open
            handle = await this.open(resource, { create: true, unlock: opts.unlock });
            // Write content at once
            await this.write(handle, 0, content, 0, content.byteLength);
        }
        catch (error) {
            throw await this.toFileSystemProviderWriteError(resource, error);
        }
        finally {
            if (typeof handle === 'number') {
                await this.close(handle);
            }
        }
    }
    mapHandleToPos = new Map();
    mapHandleToLock = new Map();
    writeHandles = new Map();
    static canFlush = true;
    static configureFlushOnWrite(enabled) {
        DiskFileSystemProvider.canFlush = enabled;
    }
    async open(resource, opts) {
        const filePath = this.toFilePath(resource);
        // Writes: guard multiple writes to the same resource
        // behind a single lock to prevent races when writing
        // from multiple places at the same time to the same file
        let lock = undefined;
        if (isFileOpenForWriteOptions(opts)) {
            lock = await this.createResourceLock(resource);
        }
        let fd = undefined;
        try {
            // Determine wether to unlock the file (write only)
            if (isFileOpenForWriteOptions(opts) && opts.unlock) {
                try {
                    const { stat } = await SymlinkSupport.stat(filePath);
                    if (!(stat.mode & 0o200 /* File mode indicating writable by owner */)) {
                        await Promises.chmod(filePath, stat.mode | 0o200);
                    }
                }
                catch (error) {
                    this.logService.trace(error); // ignore any errors here and try to just write
                }
            }
            // Determine file flags for opening (read vs write)
            let flags = undefined;
            if (isFileOpenForWriteOptions(opts)) {
                if (isWindows) {
                    try {
                        // On Windows and if the file exists, we use a different strategy of saving the file
                        // by first truncating the file and then writing with r+ flag. This helps to save hidden files on Windows
                        // (see https://github.com/microsoft/vscode/issues/931) and prevent removing alternate data streams
                        // (see https://github.com/microsoft/vscode/issues/6363)
                        await Promises.truncate(filePath, 0);
                        // After a successful truncate() the flag can be set to 'r+' which will not truncate.
                        flags = 'r+';
                    }
                    catch (error) {
                        if (error.code !== 'ENOENT') {
                            this.logService.trace(error);
                        }
                    }
                }
                // We take opts.create as a hint that the file is opened for writing
                // as such we use 'w' to truncate an existing or create the
                // file otherwise. we do not allow reading.
                if (!flags) {
                    flags = 'w';
                }
            }
            else {
                // Otherwise we assume the file is opened for reading
                // as such we use 'r' to neither truncate, nor create
                // the file.
                flags = 'r';
            }
            // Finally open handle to file path
            fd = await Promises.open(filePath, flags);
        }
        catch (error) {
            // Release lock because we have no valid handle
            // if we did open a lock during this operation
            lock?.dispose();
            // Rethrow as file system provider error
            if (isFileOpenForWriteOptions(opts)) {
                throw await this.toFileSystemProviderWriteError(resource, error);
            }
            else {
                throw this.toFileSystemProviderError(error);
            }
        }
        // Remember this handle to track file position of the handle
        // we init the position to 0 since the file descriptor was
        // just created and the position was not moved so far (see
        // also http://man7.org/linux/man-pages/man2/open.2.html -
        // "The file offset is set to the beginning of the file.")
        this.mapHandleToPos.set(fd, 0);
        // remember that this handle was used for writing
        if (isFileOpenForWriteOptions(opts)) {
            this.writeHandles.set(fd, resource);
        }
        if (lock) {
            const previousLock = this.mapHandleToLock.get(fd);
            // Remember that this handle has an associated lock
            this.traceLock(`[Disk FileSystemProvider]: open() - storing lock for handle ${fd} (${filePath})`);
            this.mapHandleToLock.set(fd, lock);
            // There is a slight chance that a resource lock for a
            // handle was not yet disposed when we acquire a new
            // lock, so we must ensure to dispose the previous lock
            // before storing a new one for the same handle, other
            // wise we end up in a deadlock situation
            // https://github.com/microsoft/vscode/issues/142462
            if (previousLock) {
                this.traceLock(`[Disk FileSystemProvider]: open() - disposing a previous lock that was still stored on same handle ${fd} (${filePath})`);
                previousLock.dispose();
            }
        }
        return fd;
    }
    async close(fd) {
        // It is very important that we keep any associated lock
        // for the file handle before attempting to call `fs.close(fd)`
        // because of a possible race condition: as soon as a file
        // handle is released, the OS may assign the same handle to
        // the next `fs.open` call and as such it is possible that our
        // lock is getting overwritten
        const lockForHandle = this.mapHandleToLock.get(fd);
        try {
            // Remove this handle from map of positions
            this.mapHandleToPos.delete(fd);
            // If a handle is closed that was used for writing, ensure
            // to flush the contents to disk if possible.
            if (this.writeHandles.delete(fd) && DiskFileSystemProvider.canFlush) {
                try {
                    await Promises.fdatasync(fd); // https://github.com/microsoft/vscode/issues/9589
                }
                catch (error) {
                    // In some exotic setups it is well possible that node fails to sync
                    // In that case we disable flushing and log the error to our logger
                    DiskFileSystemProvider.configureFlushOnWrite(false);
                    this.logService.error(error);
                }
            }
            return await Promises.close(fd);
        }
        catch (error) {
            throw this.toFileSystemProviderError(error);
        }
        finally {
            if (lockForHandle) {
                if (this.mapHandleToLock.get(fd) === lockForHandle) {
                    this.traceLock(`[Disk FileSystemProvider]: close() - resource lock removed from handle-lock map ${fd}`);
                    this.mapHandleToLock.delete(fd); // only delete from map if this is still our lock!
                }
                this.traceLock(`[Disk FileSystemProvider]: close() - disposing lock for handle ${fd}`);
                lockForHandle.dispose();
            }
        }
    }
    async read(fd, pos, data, offset, length) {
        const normalizedPos = this.normalizePos(fd, pos);
        let bytesRead = null;
        try {
            bytesRead = (await Promises.read(fd, data, offset, length, normalizedPos)).bytesRead;
        }
        catch (error) {
            throw this.toFileSystemProviderError(error);
        }
        finally {
            this.updatePos(fd, normalizedPos, bytesRead);
        }
        return bytesRead;
    }
    normalizePos(fd, pos) {
        // When calling fs.read/write we try to avoid passing in the "pos" argument and
        // rather prefer to pass in "null" because this avoids an extra seek(pos)
        // call that in some cases can even fail (e.g. when opening a file over FTP -
        // see https://github.com/microsoft/vscode/issues/73884).
        //
        // as such, we compare the passed in position argument with our last known
        // position for the file descriptor and use "null" if they match.
        if (pos === this.mapHandleToPos.get(fd)) {
            return null;
        }
        return pos;
    }
    updatePos(fd, pos, bytesLength) {
        const lastKnownPos = this.mapHandleToPos.get(fd);
        if (typeof lastKnownPos === 'number') {
            // pos !== null signals that previously a position was used that is
            // not null. node.js documentation explains, that in this case
            // the internal file pointer is not moving and as such we do not move
            // our position pointer.
            //
            // Docs: "If position is null, data will be read from the current file position,
            // and the file position will be updated. If position is an integer, the file position
            // will remain unchanged."
            if (typeof pos === 'number') {
                // do not modify the position
            }
            // bytesLength = number is a signal that the read/write operation was
            // successful and as such we need to advance the position in the Map
            //
            // Docs (http://man7.org/linux/man-pages/man2/read.2.html):
            // "On files that support seeking, the read operation commences at the
            // file offset, and the file offset is incremented by the number of
            // bytes read."
            //
            // Docs (http://man7.org/linux/man-pages/man2/write.2.html):
            // "For a seekable file (i.e., one to which lseek(2) may be applied, for
            // example, a regular file) writing takes place at the file offset, and
            // the file offset is incremented by the number of bytes actually
            // written."
            else if (typeof bytesLength === 'number') {
                this.mapHandleToPos.set(fd, lastKnownPos + bytesLength);
            }
            // bytesLength = null signals an error in the read/write operation
            // and as such we drop the handle from the Map because the position
            // is unspecificed at this point.
            else {
                this.mapHandleToPos.delete(fd);
            }
        }
    }
    async write(fd, pos, data, offset, length) {
        // We know at this point that the file to write to is truncated and thus empty
        // if the write now fails, the file remains empty. as such we really try hard
        // to ensure the write succeeds by retrying up to three times.
        return retry(() => this.doWrite(fd, pos, data, offset, length), 100 /* ms delay */, 3 /* retries */);
    }
    async doWrite(fd, pos, data, offset, length) {
        const normalizedPos = this.normalizePos(fd, pos);
        let bytesWritten = null;
        try {
            bytesWritten = (await Promises.write(fd, data, offset, length, normalizedPos)).bytesWritten;
        }
        catch (error) {
            throw await this.toFileSystemProviderWriteError(this.writeHandles.get(fd), error);
        }
        finally {
            this.updatePos(fd, normalizedPos, bytesWritten);
        }
        return bytesWritten;
    }
    //#endregion
    //#region Move/Copy/Delete/Create Folder
    async mkdir(resource) {
        try {
            await Promises.mkdir(this.toFilePath(resource));
        }
        catch (error) {
            throw this.toFileSystemProviderError(error);
        }
    }
    async delete(resource, opts) {
        try {
            const filePath = this.toFilePath(resource);
            if (opts.recursive) {
                await Promises.rm(filePath, RimRafMode.MOVE);
            }
            else {
                await Promises.unlink(filePath);
            }
        }
        catch (error) {
            throw this.toFileSystemProviderError(error);
        }
    }
    async rename(from, to, opts) {
        const fromFilePath = this.toFilePath(from);
        const toFilePath = this.toFilePath(to);
        if (fromFilePath === toFilePath) {
            return; // simulate node.js behaviour here and do a no-op if paths match
        }
        try {
            // Ensure target does not exist
            await this.validateTargetDeleted(from, to, 'move', opts.overwrite);
            // Move
            await Promises.move(fromFilePath, toFilePath);
        }
        catch (error) {
            // Rewrite some typical errors that can happen especially around symlinks
            // to something the user can better understand
            if (error.code === 'EINVAL' || error.code === 'EBUSY' || error.code === 'ENAMETOOLONG') {
                error = new Error(localize('moveError', "Unable to move '{0}' into '{1}' ({2}).", basename(fromFilePath), basename(dirname(toFilePath)), error.toString()));
            }
            throw this.toFileSystemProviderError(error);
        }
    }
    async copy(from, to, opts) {
        const fromFilePath = this.toFilePath(from);
        const toFilePath = this.toFilePath(to);
        if (fromFilePath === toFilePath) {
            return; // simulate node.js behaviour here and do a no-op if paths match
        }
        try {
            // Ensure target does not exist
            await this.validateTargetDeleted(from, to, 'copy', opts.overwrite);
            // Copy
            await Promises.copy(fromFilePath, toFilePath, { preserveSymlinks: true });
        }
        catch (error) {
            // Rewrite some typical errors that can happen especially around symlinks
            // to something the user can better understand
            if (error.code === 'EINVAL' || error.code === 'EBUSY' || error.code === 'ENAMETOOLONG') {
                error = new Error(localize('copyError', "Unable to copy '{0}' into '{1}' ({2}).", basename(fromFilePath), basename(dirname(toFilePath)), error.toString()));
            }
            throw this.toFileSystemProviderError(error);
        }
    }
    async validateTargetDeleted(from, to, mode, overwrite) {
        const fromFilePath = this.toFilePath(from);
        const toFilePath = this.toFilePath(to);
        let isSameResourceWithDifferentPathCase = false;
        const isPathCaseSensitive = !!(this.capabilities & 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */);
        if (!isPathCaseSensitive) {
            isSameResourceWithDifferentPathCase = isEqual(fromFilePath, toFilePath, true /* ignore case */);
        }
        if (isSameResourceWithDifferentPathCase && mode === 'copy') {
            throw createFileSystemProviderError(localize('fileCopyErrorPathCase', "'File cannot be copied to same path with different path case"), FileSystemProviderErrorCode.FileExists);
        }
        // Handle existing target (unless this is a case change)
        if (!isSameResourceWithDifferentPathCase && await Promises.exists(toFilePath)) {
            if (!overwrite) {
                throw createFileSystemProviderError(localize('fileCopyErrorExists', "File at target already exists"), FileSystemProviderErrorCode.FileExists);
            }
            // Delete target
            await this.delete(to, { recursive: true, useTrash: false });
        }
    }
    //#endregion
    //#region Clone File
    async cloneFile(from, to) {
        return this.doCloneFile(from, to, false /* optimistically assume parent folders exist */);
    }
    async doCloneFile(from, to, mkdir) {
        const fromFilePath = this.toFilePath(from);
        const toFilePath = this.toFilePath(to);
        const isPathCaseSensitive = !!(this.capabilities & 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */);
        if (isEqual(fromFilePath, toFilePath, !isPathCaseSensitive)) {
            return; // cloning is only supported `from` and `to` are different files
        }
        // Implement clone by using `fs.copyFile`, however setup locks
        // for both `from` and `to` because node.js does not ensure
        // this to be an atomic operation
        const locks = new DisposableStore();
        try {
            const [fromLock, toLock] = await Promise.all([
                this.createResourceLock(from),
                this.createResourceLock(to)
            ]);
            locks.add(fromLock);
            locks.add(toLock);
            if (mkdir) {
                await Promises.mkdir(dirname(toFilePath), { recursive: true });
            }
            await Promises.copyFile(fromFilePath, toFilePath);
        }
        catch (error) {
            if (error.code === 'ENOENT' && !mkdir) {
                return this.doCloneFile(from, to, true);
            }
            throw this.toFileSystemProviderError(error);
        }
        finally {
            locks.dispose();
        }
    }
    //#endregion
    //#region File Watching
    createUniversalWatcher(onChange, onLogMessage, verboseLogging) {
        return new UniversalWatcherClient(changes => onChange(changes), msg => onLogMessage(msg), verboseLogging);
    }
    createNonRecursiveWatcher(onChange, onLogMessage, verboseLogging) {
        return new NodeJSWatcherClient(changes => onChange(changes), msg => onLogMessage(msg), verboseLogging);
    }
    //#endregion
    //#region Helpers
    toFileSystemProviderError(error) {
        if (error instanceof FileSystemProviderError) {
            return error; // avoid double conversion
        }
        let code;
        switch (error.code) {
            case 'ENOENT':
                code = FileSystemProviderErrorCode.FileNotFound;
                break;
            case 'EISDIR':
                code = FileSystemProviderErrorCode.FileIsADirectory;
                break;
            case 'ENOTDIR':
                code = FileSystemProviderErrorCode.FileNotADirectory;
                break;
            case 'EEXIST':
                code = FileSystemProviderErrorCode.FileExists;
                break;
            case 'EPERM':
            case 'EACCES':
                code = FileSystemProviderErrorCode.NoPermissions;
                break;
            default:
                code = FileSystemProviderErrorCode.Unknown;
        }
        return createFileSystemProviderError(error, code);
    }
    async toFileSystemProviderWriteError(resource, error) {
        let fileSystemProviderWriteError = this.toFileSystemProviderError(error);
        // If the write error signals permission issues, we try
        // to read the file's mode to see if the file is write
        // locked.
        if (resource && fileSystemProviderWriteError.code === FileSystemProviderErrorCode.NoPermissions) {
            try {
                const { stat } = await SymlinkSupport.stat(this.toFilePath(resource));
                if (!(stat.mode & 0o200 /* File mode indicating writable by owner */)) {
                    fileSystemProviderWriteError = createFileSystemProviderError(error, FileSystemProviderErrorCode.FileWriteLocked);
                }
            }
            catch (error) {
                this.logService.trace(error); // ignore - return original error
            }
        }
        return fileSystemProviderWriteError;
    }
}
