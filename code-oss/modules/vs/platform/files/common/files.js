/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { TernarySearchTree } from 'vs/base/common/ternarySearchTree';
import { sep } from 'vs/base/common/path';
import { startsWithIgnoreCase } from 'vs/base/common/strings';
import { isNumber } from 'vs/base/common/types';
import { URI } from 'vs/base/common/uri';
import { localize } from 'vs/nls';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
//#region file service & providers
export const IFileService = createDecorator('fileService');
export function isFileOpenForWriteOptions(options) {
    return options.create === true;
}
export var FileType;
(function (FileType) {
    /**
     * File is unknown (neither file, directory nor symbolic link).
     */
    FileType[FileType["Unknown"] = 0] = "Unknown";
    /**
     * File is a normal file.
     */
    FileType[FileType["File"] = 1] = "File";
    /**
     * File is a directory.
     */
    FileType[FileType["Directory"] = 2] = "Directory";
    /**
     * File is a symbolic link.
     *
     * Note: even when the file is a symbolic link, you can test for
     * `FileType.File` and `FileType.Directory` to know the type of
     * the target the link points to.
     */
    FileType[FileType["SymbolicLink"] = 64] = "SymbolicLink";
})(FileType || (FileType = {}));
export var FilePermission;
(function (FilePermission) {
    /**
     * File is readonly.
     */
    FilePermission[FilePermission["Readonly"] = 1] = "Readonly";
})(FilePermission || (FilePermission = {}));
export var FileSystemProviderCapabilities;
(function (FileSystemProviderCapabilities) {
    /**
     * Provider supports unbuffered read/write.
     */
    FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileReadWrite"] = 2] = "FileReadWrite";
    /**
     * Provider supports open/read/write/close low level file operations.
     */
    FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileOpenReadWriteClose"] = 4] = "FileOpenReadWriteClose";
    /**
     * Provider supports stream based reading.
     */
    FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileReadStream"] = 16] = "FileReadStream";
    /**
     * Provider supports copy operation.
     */
    FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileFolderCopy"] = 8] = "FileFolderCopy";
    /**
     * Provider is path case sensitive.
     */
    FileSystemProviderCapabilities[FileSystemProviderCapabilities["PathCaseSensitive"] = 1024] = "PathCaseSensitive";
    /**
     * All files of the provider are readonly.
     */
    FileSystemProviderCapabilities[FileSystemProviderCapabilities["Readonly"] = 2048] = "Readonly";
    /**
     * Provider supports to delete via trash.
     */
    FileSystemProviderCapabilities[FileSystemProviderCapabilities["Trash"] = 4096] = "Trash";
    /**
     * Provider support to unlock files for writing.
     */
    FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileWriteUnlock"] = 8192] = "FileWriteUnlock";
    /**
     * Provider support to read files atomically. This implies the
     * provider provides the `FileReadWrite` capability too.
     */
    FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileAtomicRead"] = 16384] = "FileAtomicRead";
    /**
     * Provider support to clone files atomically.
     */
    FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileClone"] = 32768] = "FileClone";
})(FileSystemProviderCapabilities || (FileSystemProviderCapabilities = {}));
export function hasReadWriteCapability(provider) {
    return !!(provider.capabilities & 2 /* FileSystemProviderCapabilities.FileReadWrite */);
}
export function hasFileFolderCopyCapability(provider) {
    return !!(provider.capabilities & 8 /* FileSystemProviderCapabilities.FileFolderCopy */);
}
export function hasFileCloneCapability(provider) {
    return !!(provider.capabilities & 32768 /* FileSystemProviderCapabilities.FileClone */);
}
export function hasOpenReadWriteCloseCapability(provider) {
    return !!(provider.capabilities & 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
}
export function hasFileReadStreamCapability(provider) {
    return !!(provider.capabilities & 16 /* FileSystemProviderCapabilities.FileReadStream */);
}
export function hasFileAtomicReadCapability(provider) {
    if (!hasReadWriteCapability(provider)) {
        return false; // we require the `FileReadWrite` capability too
    }
    return !!(provider.capabilities & 16384 /* FileSystemProviderCapabilities.FileAtomicRead */);
}
export var FileSystemProviderErrorCode;
(function (FileSystemProviderErrorCode) {
    FileSystemProviderErrorCode["FileExists"] = "EntryExists";
    FileSystemProviderErrorCode["FileNotFound"] = "EntryNotFound";
    FileSystemProviderErrorCode["FileNotADirectory"] = "EntryNotADirectory";
    FileSystemProviderErrorCode["FileIsADirectory"] = "EntryIsADirectory";
    FileSystemProviderErrorCode["FileExceedsMemoryLimit"] = "EntryExceedsMemoryLimit";
    FileSystemProviderErrorCode["FileTooLarge"] = "EntryTooLarge";
    FileSystemProviderErrorCode["FileWriteLocked"] = "EntryWriteLocked";
    FileSystemProviderErrorCode["NoPermissions"] = "NoPermissions";
    FileSystemProviderErrorCode["Unavailable"] = "Unavailable";
    FileSystemProviderErrorCode["Unknown"] = "Unknown";
})(FileSystemProviderErrorCode || (FileSystemProviderErrorCode = {}));
export class FileSystemProviderError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
export function createFileSystemProviderError(error, code) {
    const providerError = new FileSystemProviderError(error.toString(), code);
    markAsFileSystemProviderError(providerError, code);
    return providerError;
}
export function ensureFileSystemProviderError(error) {
    if (!error) {
        return createFileSystemProviderError(localize('unknownError', "Unknown Error"), FileSystemProviderErrorCode.Unknown); // https://github.com/microsoft/vscode/issues/72798
    }
    return error;
}
export function markAsFileSystemProviderError(error, code) {
    error.name = code ? `${code} (FileSystemError)` : `FileSystemError`;
    return error;
}
export function toFileSystemProviderErrorCode(error) {
    // Guard against abuse
    if (!error) {
        return FileSystemProviderErrorCode.Unknown;
    }
    // FileSystemProviderError comes with the code
    if (error instanceof FileSystemProviderError) {
        return error.code;
    }
    // Any other error, check for name match by assuming that the error
    // went through the markAsFileSystemProviderError() method
    const match = /^(.+) \(FileSystemError\)$/.exec(error.name);
    if (!match) {
        return FileSystemProviderErrorCode.Unknown;
    }
    switch (match[1]) {
        case FileSystemProviderErrorCode.FileExists: return FileSystemProviderErrorCode.FileExists;
        case FileSystemProviderErrorCode.FileIsADirectory: return FileSystemProviderErrorCode.FileIsADirectory;
        case FileSystemProviderErrorCode.FileNotADirectory: return FileSystemProviderErrorCode.FileNotADirectory;
        case FileSystemProviderErrorCode.FileNotFound: return FileSystemProviderErrorCode.FileNotFound;
        case FileSystemProviderErrorCode.FileExceedsMemoryLimit: return FileSystemProviderErrorCode.FileExceedsMemoryLimit;
        case FileSystemProviderErrorCode.FileTooLarge: return FileSystemProviderErrorCode.FileTooLarge;
        case FileSystemProviderErrorCode.FileWriteLocked: return FileSystemProviderErrorCode.FileWriteLocked;
        case FileSystemProviderErrorCode.NoPermissions: return FileSystemProviderErrorCode.NoPermissions;
        case FileSystemProviderErrorCode.Unavailable: return FileSystemProviderErrorCode.Unavailable;
    }
    return FileSystemProviderErrorCode.Unknown;
}
export function toFileOperationResult(error) {
    // FileSystemProviderError comes with the result already
    if (error instanceof FileOperationError) {
        return error.fileOperationResult;
    }
    // Otherwise try to find from code
    switch (toFileSystemProviderErrorCode(error)) {
        case FileSystemProviderErrorCode.FileNotFound:
            return 1 /* FileOperationResult.FILE_NOT_FOUND */;
        case FileSystemProviderErrorCode.FileIsADirectory:
            return 0 /* FileOperationResult.FILE_IS_DIRECTORY */;
        case FileSystemProviderErrorCode.FileNotADirectory:
            return 10 /* FileOperationResult.FILE_NOT_DIRECTORY */;
        case FileSystemProviderErrorCode.FileWriteLocked:
            return 5 /* FileOperationResult.FILE_WRITE_LOCKED */;
        case FileSystemProviderErrorCode.NoPermissions:
            return 6 /* FileOperationResult.FILE_PERMISSION_DENIED */;
        case FileSystemProviderErrorCode.FileExists:
            return 4 /* FileOperationResult.FILE_MOVE_CONFLICT */;
        case FileSystemProviderErrorCode.FileExceedsMemoryLimit:
            return 9 /* FileOperationResult.FILE_EXCEEDS_MEMORY_LIMIT */;
        case FileSystemProviderErrorCode.FileTooLarge:
            return 7 /* FileOperationResult.FILE_TOO_LARGE */;
        default:
            return 11 /* FileOperationResult.FILE_OTHER_ERROR */;
    }
}
export var FileOperation;
(function (FileOperation) {
    FileOperation[FileOperation["CREATE"] = 0] = "CREATE";
    FileOperation[FileOperation["DELETE"] = 1] = "DELETE";
    FileOperation[FileOperation["MOVE"] = 2] = "MOVE";
    FileOperation[FileOperation["COPY"] = 3] = "COPY";
    FileOperation[FileOperation["WRITE"] = 4] = "WRITE";
})(FileOperation || (FileOperation = {}));
export class FileOperationEvent {
    resource;
    operation;
    target;
    constructor(resource, operation, target) {
        this.resource = resource;
        this.operation = operation;
        this.target = target;
    }
    isOperation(operation) {
        return this.operation === operation;
    }
}
/**
 * Possible changes that can occur to a file.
 */
export var FileChangeType;
(function (FileChangeType) {
    FileChangeType[FileChangeType["UPDATED"] = 0] = "UPDATED";
    FileChangeType[FileChangeType["ADDED"] = 1] = "ADDED";
    FileChangeType[FileChangeType["DELETED"] = 2] = "DELETED";
})(FileChangeType || (FileChangeType = {}));
export class FileChangesEvent {
    added = undefined;
    updated = undefined;
    deleted = undefined;
    constructor(changes, ignorePathCasing) {
        this.rawChanges = changes;
        const entriesByType = new Map();
        for (const change of changes) {
            const array = entriesByType.get(change.type);
            if (array) {
                array.push([change.resource, change]);
            }
            else {
                entriesByType.set(change.type, [[change.resource, change]]);
            }
            switch (change.type) {
                case 1 /* FileChangeType.ADDED */:
                    this.rawAdded.push(change.resource);
                    break;
                case 0 /* FileChangeType.UPDATED */:
                    this.rawUpdated.push(change.resource);
                    break;
                case 2 /* FileChangeType.DELETED */:
                    this.rawDeleted.push(change.resource);
                    break;
            }
        }
        for (const [key, value] of entriesByType) {
            switch (key) {
                case 1 /* FileChangeType.ADDED */:
                    this.added = TernarySearchTree.forUris(() => ignorePathCasing);
                    this.added.fill(value);
                    break;
                case 0 /* FileChangeType.UPDATED */:
                    this.updated = TernarySearchTree.forUris(() => ignorePathCasing);
                    this.updated.fill(value);
                    break;
                case 2 /* FileChangeType.DELETED */:
                    this.deleted = TernarySearchTree.forUris(() => ignorePathCasing);
                    this.deleted.fill(value);
                    break;
            }
        }
    }
    /**
     * Find out if the file change events match the provided resource.
     *
     * Note: when passing `FileChangeType.DELETED`, we consider a match
     * also when the parent of the resource got deleted.
     */
    contains(resource, ...types) {
        return this.doContains(resource, { includeChildren: false }, ...types);
    }
    /**
     * Find out if the file change events either match the provided
     * resource, or contain a child of this resource.
     */
    affects(resource, ...types) {
        return this.doContains(resource, { includeChildren: true }, ...types);
    }
    doContains(resource, options, ...types) {
        if (!resource) {
            return false;
        }
        const hasTypesFilter = types.length > 0;
        // Added
        if (!hasTypesFilter || types.includes(1 /* FileChangeType.ADDED */)) {
            if (this.added?.get(resource)) {
                return true;
            }
            if (options.includeChildren && this.added?.findSuperstr(resource)) {
                return true;
            }
        }
        // Updated
        if (!hasTypesFilter || types.includes(0 /* FileChangeType.UPDATED */)) {
            if (this.updated?.get(resource)) {
                return true;
            }
            if (options.includeChildren && this.updated?.findSuperstr(resource)) {
                return true;
            }
        }
        // Deleted
        if (!hasTypesFilter || types.includes(2 /* FileChangeType.DELETED */)) {
            if (this.deleted?.findSubstr(resource) /* deleted also considers parent folders */) {
                return true;
            }
            if (options.includeChildren && this.deleted?.findSuperstr(resource)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Returns if this event contains added files.
     */
    gotAdded() {
        return !!this.added;
    }
    /**
     * Returns if this event contains deleted files.
     */
    gotDeleted() {
        return !!this.deleted;
    }
    /**
     * Returns if this event contains updated files.
     */
    gotUpdated() {
        return !!this.updated;
    }
    /**
     * @deprecated use the `contains` or `affects` method to efficiently find
     * out if the event relates to a given resource. these methods ensure:
     * - that there is no expensive lookup needed (by using a `TernarySearchTree`)
     * - correctly handles `FileChangeType.DELETED` events
     */
    rawChanges = [];
    /**
     * @deprecated use the `contains` or `affects` method to efficiently find
     * out if the event relates to a given resource. these methods ensure:
     * - that there is no expensive lookup needed (by using a `TernarySearchTree`)
     * - correctly handles `FileChangeType.DELETED` events
     */
    rawAdded = [];
    /**
    * @deprecated use the `contains` or `affects` method to efficiently find
    * out if the event relates to a given resource. these methods ensure:
    * - that there is no expensive lookup needed (by using a `TernarySearchTree`)
    * - correctly handles `FileChangeType.DELETED` events
    */
    rawUpdated = [];
    /**
    * @deprecated use the `contains` or `affects` method to efficiently find
    * out if the event relates to a given resource. these methods ensure:
    * - that there is no expensive lookup needed (by using a `TernarySearchTree`)
    * - correctly handles `FileChangeType.DELETED` events
    */
    rawDeleted = [];
}
export function isParent(path, candidate, ignoreCase) {
    if (!path || !candidate || path === candidate) {
        return false;
    }
    if (candidate.length > path.length) {
        return false;
    }
    if (candidate.charAt(candidate.length - 1) !== sep) {
        candidate += sep;
    }
    if (ignoreCase) {
        return startsWithIgnoreCase(path, candidate);
    }
    return path.indexOf(candidate) === 0;
}
export class FileOperationError extends Error {
    fileOperationResult;
    options;
    constructor(message, fileOperationResult, options) {
        super(message);
        this.fileOperationResult = fileOperationResult;
        this.options = options;
    }
}
export class NotModifiedSinceFileOperationError extends FileOperationError {
    stat;
    constructor(message, stat, options) {
        super(message, 2 /* FileOperationResult.FILE_NOT_MODIFIED_SINCE */, options);
        this.stat = stat;
    }
}
export var FileOperationResult;
(function (FileOperationResult) {
    FileOperationResult[FileOperationResult["FILE_IS_DIRECTORY"] = 0] = "FILE_IS_DIRECTORY";
    FileOperationResult[FileOperationResult["FILE_NOT_FOUND"] = 1] = "FILE_NOT_FOUND";
    FileOperationResult[FileOperationResult["FILE_NOT_MODIFIED_SINCE"] = 2] = "FILE_NOT_MODIFIED_SINCE";
    FileOperationResult[FileOperationResult["FILE_MODIFIED_SINCE"] = 3] = "FILE_MODIFIED_SINCE";
    FileOperationResult[FileOperationResult["FILE_MOVE_CONFLICT"] = 4] = "FILE_MOVE_CONFLICT";
    FileOperationResult[FileOperationResult["FILE_WRITE_LOCKED"] = 5] = "FILE_WRITE_LOCKED";
    FileOperationResult[FileOperationResult["FILE_PERMISSION_DENIED"] = 6] = "FILE_PERMISSION_DENIED";
    FileOperationResult[FileOperationResult["FILE_TOO_LARGE"] = 7] = "FILE_TOO_LARGE";
    FileOperationResult[FileOperationResult["FILE_INVALID_PATH"] = 8] = "FILE_INVALID_PATH";
    FileOperationResult[FileOperationResult["FILE_EXCEEDS_MEMORY_LIMIT"] = 9] = "FILE_EXCEEDS_MEMORY_LIMIT";
    FileOperationResult[FileOperationResult["FILE_NOT_DIRECTORY"] = 10] = "FILE_NOT_DIRECTORY";
    FileOperationResult[FileOperationResult["FILE_OTHER_ERROR"] = 11] = "FILE_OTHER_ERROR";
})(FileOperationResult || (FileOperationResult = {}));
//#endregion
//#region Settings
export const AutoSaveConfiguration = {
    OFF: 'off',
    AFTER_DELAY: 'afterDelay',
    ON_FOCUS_CHANGE: 'onFocusChange',
    ON_WINDOW_CHANGE: 'onWindowChange'
};
export const HotExitConfiguration = {
    OFF: 'off',
    ON_EXIT: 'onExit',
    ON_EXIT_AND_WINDOW_CLOSE: 'onExitAndWindowClose'
};
export const FILES_ASSOCIATIONS_CONFIG = 'files.associations';
export const FILES_EXCLUDE_CONFIG = 'files.exclude';
//#endregion
//#region Utilities
export var FileKind;
(function (FileKind) {
    FileKind[FileKind["FILE"] = 0] = "FILE";
    FileKind[FileKind["FOLDER"] = 1] = "FOLDER";
    FileKind[FileKind["ROOT_FOLDER"] = 2] = "ROOT_FOLDER";
})(FileKind || (FileKind = {}));
/**
 * A hint to disable etag checking for reading/writing.
 */
export const ETAG_DISABLED = '';
export function etag(stat) {
    if (typeof stat.size !== 'number' || typeof stat.mtime !== 'number') {
        return undefined;
    }
    return stat.mtime.toString(29) + stat.size.toString(31);
}
export async function whenProviderRegistered(file, fileService) {
    if (fileService.hasProvider(URI.from({ scheme: file.scheme }))) {
        return;
    }
    return new Promise(resolve => {
        const disposable = fileService.onDidChangeFileSystemProviderRegistrations(e => {
            if (e.scheme === file.scheme && e.added) {
                disposable.dispose();
                resolve();
            }
        });
    });
}
/**
 * Native only: limits for memory sizes
 */
export const MIN_MAX_MEMORY_SIZE_MB = 2048;
export const FALLBACK_MAX_MEMORY_SIZE_MB = 4096;
/**
 * Helper to format a raw byte size into a human readable label.
 */
export class ByteSize {
    static KB = 1024;
    static MB = ByteSize.KB * ByteSize.KB;
    static GB = ByteSize.MB * ByteSize.KB;
    static TB = ByteSize.GB * ByteSize.KB;
    static formatSize(size) {
        if (!isNumber(size)) {
            size = 0;
        }
        if (size < ByteSize.KB) {
            return localize('sizeB', "{0}B", size.toFixed(0));
        }
        if (size < ByteSize.MB) {
            return localize('sizeKB', "{0}KB", (size / ByteSize.KB).toFixed(2));
        }
        if (size < ByteSize.GB) {
            return localize('sizeMB', "{0}MB", (size / ByteSize.MB).toFixed(2));
        }
        if (size < ByteSize.TB) {
            return localize('sizeGB', "{0}GB", (size / ByteSize.GB).toFixed(2));
        }
        return localize('sizeTB', "{0}TB", (size / ByteSize.TB).toFixed(2));
    }
}
export var Arch;
(function (Arch) {
    Arch[Arch["IA32"] = 0] = "IA32";
    Arch[Arch["OTHER"] = 1] = "OTHER";
})(Arch || (Arch = {}));
export function getPlatformLimits(arch) {
    return {
        maxFileSize: arch === 0 /* Arch.IA32 */ ? 300 * ByteSize.MB : 16 * ByteSize.GB,
        maxHeapSize: arch === 0 /* Arch.IA32 */ ? 700 * ByteSize.MB : 2 * 700 * ByteSize.MB, // https://github.com/v8/v8/blob/5918a23a3d571b9625e5cce246bdd5b46ff7cd8b/src/heap/heap.cc#L149
    };
}
//#endregion
