import { VSBuffer, VSBufferReadable, VSBufferReadableStream } from 'vs/base/common/buffer';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { IExpression, IRelativePattern } from 'vs/base/common/glob';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ReadableStreamEvents } from 'vs/base/common/stream';
import { URI } from 'vs/base/common/uri';
export declare const IFileService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IFileService>;
export interface IFileService {
    readonly _serviceBrand: undefined;
    /**
     * An event that is fired when a file system provider is added or removed
     */
    readonly onDidChangeFileSystemProviderRegistrations: Event<IFileSystemProviderRegistrationEvent>;
    /**
     * An event that is fired when a registered file system provider changes its capabilities.
     */
    readonly onDidChangeFileSystemProviderCapabilities: Event<IFileSystemProviderCapabilitiesChangeEvent>;
    /**
     * An event that is fired when a file system provider is about to be activated. Listeners
     * can join this event with a long running promise to help in the activation process.
     */
    readonly onWillActivateFileSystemProvider: Event<IFileSystemProviderActivationEvent>;
    /**
     * Registers a file system provider for a certain scheme.
     */
    registerProvider(scheme: string, provider: IFileSystemProvider): IDisposable;
    /**
     * Returns a file system provider for a certain scheme.
     */
    getProvider(scheme: string): IFileSystemProvider | undefined;
    /**
     * Tries to activate a provider with the given scheme.
     */
    activateProvider(scheme: string): Promise<void>;
    /**
     * Checks if this file service can handle the given resource by
     * first activating any extension that wants to be activated
     * on the provided resource scheme to include extensions that
     * contribute file system providers for the given resource.
     */
    canHandleResource(resource: URI): Promise<boolean>;
    /**
     * Checks if the file service has a registered provider for the
     * provided resource.
     *
     * Note: this does NOT account for contributed providers from
     * extensions that have not been activated yet. To include those,
     * consider to call `await fileService.canHandleResource(resource)`.
     */
    hasProvider(resource: URI): boolean;
    /**
     * Checks if the provider for the provided resource has the provided file system capability.
     */
    hasCapability(resource: URI, capability: FileSystemProviderCapabilities): boolean;
    /**
     * List the schemes and capabilities for registered file system providers
     */
    listCapabilities(): Iterable<{
        scheme: string;
        capabilities: FileSystemProviderCapabilities;
    }>;
    /**
     * Allows to listen for file changes. The event will fire for every file within the opened workspace
     * (if any) as well as all files that have been watched explicitly using the #watch() API.
     */
    readonly onDidFilesChange: Event<FileChangesEvent>;
    /**
     * An event that is fired upon successful completion of a certain file operation.
     */
    readonly onDidRunOperation: Event<FileOperationEvent>;
    /**
     * Resolve the properties of a file/folder identified by the resource. For a folder, children
     * information is resolved as well depending on the provided options. Use `stat()` method if
     * you do not need children information.
     *
     * If the optional parameter "resolveTo" is specified in options, the stat service is asked
     * to provide a stat object that should contain the full graph of folders up to all of the
     * target resources.
     *
     * If the optional parameter "resolveSingleChildDescendants" is specified in options,
     * the stat service is asked to automatically resolve child folders that only
     * contain a single element.
     *
     * If the optional parameter "resolveMetadata" is specified in options,
     * the stat will contain metadata information such as size, mtime and etag.
     */
    resolve(resource: URI, options: IResolveMetadataFileOptions): Promise<IFileStatWithMetadata>;
    resolve(resource: URI, options?: IResolveFileOptions): Promise<IFileStat>;
    /**
     * Same as `resolve()` but supports resolving multiple resources in parallel.
     *
     * If one of the resolve targets fails to resolve returns a fake `IFileStat` instead of
     * making the whole call fail.
     */
    resolveAll(toResolve: {
        resource: URI;
        options: IResolveMetadataFileOptions;
    }[]): Promise<IFileStatResult[]>;
    resolveAll(toResolve: {
        resource: URI;
        options?: IResolveFileOptions;
    }[]): Promise<IFileStatResult[]>;
    /**
     * Same as `resolve()` but without resolving the children of a folder if the
     * resource is pointing to a folder.
     */
    stat(resource: URI): Promise<IFileStatWithPartialMetadata>;
    /**
     * Finds out if a file/folder identified by the resource exists.
     */
    exists(resource: URI): Promise<boolean>;
    /**
     * Read the contents of the provided resource unbuffered.
     */
    readFile(resource: URI, options?: IReadFileOptions, token?: CancellationToken): Promise<IFileContent>;
    /**
     * Read the contents of the provided resource buffered as stream.
     */
    readFileStream(resource: URI, options?: IReadFileStreamOptions, token?: CancellationToken): Promise<IFileStreamContent>;
    /**
     * Updates the content replacing its previous value.
     *
     * Emits a `FileOperation.WRITE` file operation event when successful.
     */
    writeFile(resource: URI, bufferOrReadableOrStream: VSBuffer | VSBufferReadable | VSBufferReadableStream, options?: IWriteFileOptions): Promise<IFileStatWithMetadata>;
    /**
     * Moves the file/folder to a new path identified by the resource.
     *
     * The optional parameter overwrite can be set to replace an existing file at the location.
     *
     * Emits a `FileOperation.MOVE` file operation event when successful.
     */
    move(source: URI, target: URI, overwrite?: boolean): Promise<IFileStatWithMetadata>;
    /**
     * Find out if a move operation is possible given the arguments. No changes on disk will
     * be performed. Returns an Error if the operation cannot be done.
     */
    canMove(source: URI, target: URI, overwrite?: boolean): Promise<Error | true>;
    /**
     * Copies the file/folder to a path identified by the resource. A folder is copied
     * recursively.
     *
     * Emits a `FileOperation.COPY` file operation event when successful.
     */
    copy(source: URI, target: URI, overwrite?: boolean): Promise<IFileStatWithMetadata>;
    /**
     * Find out if a copy operation is possible given the arguments. No changes on disk will
     * be performed. Returns an Error if the operation cannot be done.
     */
    canCopy(source: URI, target: URI, overwrite?: boolean): Promise<Error | true>;
    /**
     * Clones a file to a path identified by the resource. Folders are not supported.
     *
     * If the target path exists, it will be overwritten.
     */
    cloneFile(source: URI, target: URI): Promise<void>;
    /**
     * Creates a new file with the given path and optional contents. The returned promise
     * will have the stat model object as a result.
     *
     * The optional parameter content can be used as value to fill into the new file.
     *
     * Emits a `FileOperation.CREATE` file operation event when successful.
     */
    createFile(resource: URI, bufferOrReadableOrStream?: VSBuffer | VSBufferReadable | VSBufferReadableStream, options?: ICreateFileOptions): Promise<IFileStatWithMetadata>;
    /**
     * Find out if a file create operation is possible given the arguments. No changes on disk will
     * be performed. Returns an Error if the operation cannot be done.
     */
    canCreateFile(resource: URI, options?: ICreateFileOptions): Promise<Error | true>;
    /**
     * Creates a new folder with the given path. The returned promise
     * will have the stat model object as a result.
     *
     * Emits a `FileOperation.CREATE` file operation event when successful.
     */
    createFolder(resource: URI): Promise<IFileStatWithMetadata>;
    /**
     * Deletes the provided file. The optional useTrash parameter allows to
     * move the file to trash. The optional recursive parameter allows to delete
     * non-empty folders recursively.
     *
     * Emits a `FileOperation.DELETE` file operation event when successful.
     */
    del(resource: URI, options?: Partial<IFileDeleteOptions>): Promise<void>;
    /**
     * Find out if a delete operation is possible given the arguments. No changes on disk will
     * be performed. Returns an Error if the operation cannot be done.
     */
    canDelete(resource: URI, options?: Partial<IFileDeleteOptions>): Promise<Error | true>;
    /**
     * An event that signals an error when watching for file changes.
     */
    readonly onDidWatchError: Event<Error>;
    /**
     * Allows to start a watcher that reports file/folder change events on the provided resource.
     *
     * Note: recursive file watching is not supported from this method. Only events from files
     * that are direct children of the provided resource will be reported.
     */
    watch(resource: URI, options?: IWatchOptions): IDisposable;
    /**
     * Frees up any resources occupied by this service.
     */
    dispose(): void;
}
export interface IFileOverwriteOptions {
    /**
     * Set to `true` to overwrite a file if it exists. Will
     * throw an error otherwise if the file does exist.
     */
    readonly overwrite: boolean;
}
export interface IFileUnlockOptions {
    /**
     * Set to `true` to try to remove any write locks the file might
     * have. A file that is write locked will throw an error for any
     * attempt to write to unless `unlock: true` is provided.
     */
    readonly unlock: boolean;
}
export interface IFileAtomicReadOptions {
    /**
     * The optional `atomic` flag can be used to make sure
     * the `readFile` method is not running in parallel with
     * any `write` operations in the same process.
     *
     * Typically you should not need to use this flag but if
     * for example you are quickly reading a file right after
     * a file event occurred and the file changes a lot, there
     * is a chance that a read returns an empty or partial file
     * because a pending write has not finished yet.
     *
     * Note: this does not prevent the file from being written
     * to from a different process. If you need such atomic
     * operations, you better use a real database as storage.
     */
    readonly atomic: true;
}
export interface IFileReadStreamOptions {
    /**
     * Is an integer specifying where to begin reading from in the file. If position is undefined,
     * data will be read from the current file position.
     */
    readonly position?: number;
    /**
     * Is an integer specifying how many bytes to read from the file. By default, all bytes
     * will be read.
     */
    readonly length?: number;
    /**
     * If provided, the size of the file will be checked against the limits.
     */
    limits?: {
        readonly size?: number;
        readonly memory?: number;
    };
}
export interface IFileWriteOptions extends IFileOverwriteOptions, IFileUnlockOptions {
    /**
     * Set to `true` to create a file when it does not exist. Will
     * throw an error otherwise if the file does not exist.
     */
    readonly create: boolean;
}
export declare type IFileOpenOptions = IFileOpenForReadOptions | IFileOpenForWriteOptions;
export declare function isFileOpenForWriteOptions(options: IFileOpenOptions): options is IFileOpenForWriteOptions;
export interface IFileOpenForReadOptions {
    /**
     * A hint that the file should be opened for reading only.
     */
    readonly create: false;
}
export interface IFileOpenForWriteOptions extends IFileUnlockOptions {
    /**
     * A hint that the file should be opened for reading and writing.
     */
    readonly create: true;
}
export interface IFileDeleteOptions {
    /**
     * Set to `true` to recursively delete any children of the file. This
     * only applies to folders and can lead to an error unless provided
     * if the folder is not empty.
     */
    readonly recursive: boolean;
    /**
     * Set to `true` to attempt to move the file to trash
     * instead of deleting it permanently from disk. This
     * option maybe not be supported on all providers.
     */
    readonly useTrash: boolean;
}
export declare enum FileType {
    /**
     * File is unknown (neither file, directory nor symbolic link).
     */
    Unknown = 0,
    /**
     * File is a normal file.
     */
    File = 1,
    /**
     * File is a directory.
     */
    Directory = 2,
    /**
     * File is a symbolic link.
     *
     * Note: even when the file is a symbolic link, you can test for
     * `FileType.File` and `FileType.Directory` to know the type of
     * the target the link points to.
     */
    SymbolicLink = 64
}
export declare enum FilePermission {
    /**
     * File is readonly.
     */
    Readonly = 1
}
export interface IStat {
    /**
     * The file type.
     */
    readonly type: FileType;
    /**
     * The last modification date represented as millis from unix epoch.
     */
    readonly mtime: number;
    /**
     * The creation date represented as millis from unix epoch.
     */
    readonly ctime: number;
    /**
     * The size of the file in bytes.
     */
    readonly size: number;
    /**
     * The file permissions.
     */
    readonly permissions?: FilePermission;
}
export interface IWatchOptions {
    /**
     * Set to `true` to watch for changes recursively in a folder
     * and all of its children.
     */
    readonly recursive: boolean;
    /**
     * A set of glob patterns or paths to exclude from watching.
     */
    excludes: string[];
    /**
     * An optional set of glob patterns or paths to include for
     * watching. If not provided, all paths are considered for
     * events.
     */
    includes?: Array<string | IRelativePattern>;
}
export declare const enum FileSystemProviderCapabilities {
    /**
     * Provider supports unbuffered read/write.
     */
    FileReadWrite = 2,
    /**
     * Provider supports open/read/write/close low level file operations.
     */
    FileOpenReadWriteClose = 4,
    /**
     * Provider supports stream based reading.
     */
    FileReadStream = 16,
    /**
     * Provider supports copy operation.
     */
    FileFolderCopy = 8,
    /**
     * Provider is path case sensitive.
     */
    PathCaseSensitive = 1024,
    /**
     * All files of the provider are readonly.
     */
    Readonly = 2048,
    /**
     * Provider supports to delete via trash.
     */
    Trash = 4096,
    /**
     * Provider support to unlock files for writing.
     */
    FileWriteUnlock = 8192,
    /**
     * Provider support to read files atomically. This implies the
     * provider provides the `FileReadWrite` capability too.
     */
    FileAtomicRead = 16384,
    /**
     * Provider support to clone files atomically.
     */
    FileClone = 32768
}
export interface IFileSystemProvider {
    readonly capabilities: FileSystemProviderCapabilities;
    readonly onDidChangeCapabilities: Event<void>;
    readonly onDidChangeFile: Event<readonly IFileChange[]>;
    readonly onDidWatchError?: Event<string>;
    watch(resource: URI, opts: IWatchOptions): IDisposable;
    stat(resource: URI): Promise<IStat>;
    mkdir(resource: URI): Promise<void>;
    readdir(resource: URI): Promise<[string, FileType][]>;
    delete(resource: URI, opts: IFileDeleteOptions): Promise<void>;
    rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    copy?(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    readFile?(resource: URI): Promise<Uint8Array>;
    writeFile?(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void>;
    readFileStream?(resource: URI, opts: IFileReadStreamOptions, token: CancellationToken): ReadableStreamEvents<Uint8Array>;
    open?(resource: URI, opts: IFileOpenOptions): Promise<number>;
    close?(fd: number): Promise<void>;
    read?(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    write?(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    cloneFile?(from: URI, to: URI): Promise<void>;
}
export interface IFileSystemProviderWithFileReadWriteCapability extends IFileSystemProvider {
    readFile(resource: URI): Promise<Uint8Array>;
    writeFile(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void>;
}
export declare function hasReadWriteCapability(provider: IFileSystemProvider): provider is IFileSystemProviderWithFileReadWriteCapability;
export interface IFileSystemProviderWithFileFolderCopyCapability extends IFileSystemProvider {
    copy(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
}
export declare function hasFileFolderCopyCapability(provider: IFileSystemProvider): provider is IFileSystemProviderWithFileFolderCopyCapability;
export interface IFileSystemProviderWithFileCloneCapability extends IFileSystemProvider {
    cloneFile(from: URI, to: URI): Promise<void>;
}
export declare function hasFileCloneCapability(provider: IFileSystemProvider): provider is IFileSystemProviderWithFileCloneCapability;
export interface IFileSystemProviderWithOpenReadWriteCloseCapability extends IFileSystemProvider {
    open(resource: URI, opts: IFileOpenOptions): Promise<number>;
    close(fd: number): Promise<void>;
    read(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    write(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
}
export declare function hasOpenReadWriteCloseCapability(provider: IFileSystemProvider): provider is IFileSystemProviderWithOpenReadWriteCloseCapability;
export interface IFileSystemProviderWithFileReadStreamCapability extends IFileSystemProvider {
    readFileStream(resource: URI, opts: IFileReadStreamOptions, token: CancellationToken): ReadableStreamEvents<Uint8Array>;
}
export declare function hasFileReadStreamCapability(provider: IFileSystemProvider): provider is IFileSystemProviderWithFileReadStreamCapability;
export interface IFileSystemProviderWithFileAtomicReadCapability extends IFileSystemProvider {
    readFile(resource: URI, opts?: IFileAtomicReadOptions): Promise<Uint8Array>;
}
export declare function hasFileAtomicReadCapability(provider: IFileSystemProvider): provider is IFileSystemProviderWithFileAtomicReadCapability;
export declare enum FileSystemProviderErrorCode {
    FileExists = "EntryExists",
    FileNotFound = "EntryNotFound",
    FileNotADirectory = "EntryNotADirectory",
    FileIsADirectory = "EntryIsADirectory",
    FileExceedsMemoryLimit = "EntryExceedsMemoryLimit",
    FileTooLarge = "EntryTooLarge",
    FileWriteLocked = "EntryWriteLocked",
    NoPermissions = "NoPermissions",
    Unavailable = "Unavailable",
    Unknown = "Unknown"
}
export declare class FileSystemProviderError extends Error {
    readonly code: FileSystemProviderErrorCode;
    constructor(message: string, code: FileSystemProviderErrorCode);
}
export declare function createFileSystemProviderError(error: Error | string, code: FileSystemProviderErrorCode): FileSystemProviderError;
export declare function ensureFileSystemProviderError(error?: Error): Error;
export declare function markAsFileSystemProviderError(error: Error, code: FileSystemProviderErrorCode): Error;
export declare function toFileSystemProviderErrorCode(error: Error | undefined | null): FileSystemProviderErrorCode;
export declare function toFileOperationResult(error: Error): FileOperationResult;
export interface IFileSystemProviderRegistrationEvent {
    readonly added: boolean;
    readonly scheme: string;
    readonly provider?: IFileSystemProvider;
}
export interface IFileSystemProviderCapabilitiesChangeEvent {
    readonly provider: IFileSystemProvider;
    readonly scheme: string;
}
export interface IFileSystemProviderActivationEvent {
    readonly scheme: string;
    join(promise: Promise<void>): void;
}
export declare const enum FileOperation {
    CREATE = 0,
    DELETE = 1,
    MOVE = 2,
    COPY = 3,
    WRITE = 4
}
export interface IFileOperationEvent {
    readonly resource: URI;
    readonly operation: FileOperation;
    isOperation(operation: FileOperation.DELETE | FileOperation.WRITE): boolean;
    isOperation(operation: FileOperation.CREATE | FileOperation.MOVE | FileOperation.COPY): this is IFileOperationEventWithMetadata;
}
export interface IFileOperationEventWithMetadata extends IFileOperationEvent {
    readonly target: IFileStatWithMetadata;
}
export declare class FileOperationEvent implements IFileOperationEvent {
    readonly resource: URI;
    readonly operation: FileOperation;
    readonly target?: IFileStatWithMetadata | undefined;
    constructor(resource: URI, operation: FileOperation.DELETE | FileOperation.WRITE);
    constructor(resource: URI, operation: FileOperation.CREATE | FileOperation.MOVE | FileOperation.COPY, target: IFileStatWithMetadata);
    isOperation(operation: FileOperation.DELETE | FileOperation.WRITE): boolean;
    isOperation(operation: FileOperation.CREATE | FileOperation.MOVE | FileOperation.COPY): this is IFileOperationEventWithMetadata;
}
/**
 * Possible changes that can occur to a file.
 */
export declare const enum FileChangeType {
    UPDATED = 0,
    ADDED = 1,
    DELETED = 2
}
/**
 * Identifies a single change in a file.
 */
export interface IFileChange {
    /**
     * The type of change that occurred to the file.
     */
    readonly type: FileChangeType;
    /**
     * The unified resource identifier of the file that changed.
     */
    readonly resource: URI;
}
export declare class FileChangesEvent {
    private readonly added;
    private readonly updated;
    private readonly deleted;
    constructor(changes: readonly IFileChange[], ignorePathCasing: boolean);
    /**
     * Find out if the file change events match the provided resource.
     *
     * Note: when passing `FileChangeType.DELETED`, we consider a match
     * also when the parent of the resource got deleted.
     */
    contains(resource: URI, ...types: FileChangeType[]): boolean;
    /**
     * Find out if the file change events either match the provided
     * resource, or contain a child of this resource.
     */
    affects(resource: URI, ...types: FileChangeType[]): boolean;
    private doContains;
    /**
     * Returns if this event contains added files.
     */
    gotAdded(): boolean;
    /**
     * Returns if this event contains deleted files.
     */
    gotDeleted(): boolean;
    /**
     * Returns if this event contains updated files.
     */
    gotUpdated(): boolean;
    /**
     * @deprecated use the `contains` or `affects` method to efficiently find
     * out if the event relates to a given resource. these methods ensure:
     * - that there is no expensive lookup needed (by using a `TernarySearchTree`)
     * - correctly handles `FileChangeType.DELETED` events
     */
    readonly rawChanges: readonly IFileChange[];
    /**
     * @deprecated use the `contains` or `affects` method to efficiently find
     * out if the event relates to a given resource. these methods ensure:
     * - that there is no expensive lookup needed (by using a `TernarySearchTree`)
     * - correctly handles `FileChangeType.DELETED` events
     */
    readonly rawAdded: URI[];
    /**
    * @deprecated use the `contains` or `affects` method to efficiently find
    * out if the event relates to a given resource. these methods ensure:
    * - that there is no expensive lookup needed (by using a `TernarySearchTree`)
    * - correctly handles `FileChangeType.DELETED` events
    */
    readonly rawUpdated: URI[];
    /**
    * @deprecated use the `contains` or `affects` method to efficiently find
    * out if the event relates to a given resource. these methods ensure:
    * - that there is no expensive lookup needed (by using a `TernarySearchTree`)
    * - correctly handles `FileChangeType.DELETED` events
    */
    readonly rawDeleted: URI[];
}
export declare function isParent(path: string, candidate: string, ignoreCase?: boolean): boolean;
interface IBaseFileStat {
    /**
     * The unified resource identifier of this file or folder.
     */
    readonly resource: URI;
    /**
     * The name which is the last segment
     * of the {{path}}.
     */
    readonly name: string;
    /**
     * The size of the file.
     *
     * The value may or may not be resolved as
     * it is optional.
     */
    readonly size?: number;
    /**
     * The last modification date represented as millis from unix epoch.
     *
     * The value may or may not be resolved as
     * it is optional.
     */
    readonly mtime?: number;
    /**
     * The creation date represented as millis from unix epoch.
     *
     * The value may or may not be resolved as
     * it is optional.
     */
    readonly ctime?: number;
    /**
     * A unique identifier that represents the
     * current state of the file or directory.
     *
     * The value may or may not be resolved as
     * it is optional.
     */
    readonly etag?: string;
    /**
     * The file is read-only.
     */
    readonly readonly?: boolean;
}
export interface IBaseFileStatWithMetadata extends Required<IBaseFileStat> {
}
/**
 * A file resource with meta information and resolved children if any.
 */
export interface IFileStat extends IBaseFileStat {
    /**
     * The resource is a file.
     */
    readonly isFile: boolean;
    /**
     * The resource is a directory.
     */
    readonly isDirectory: boolean;
    /**
     * The resource is a symbolic link. Note: even when the
     * file is a symbolic link, you can test for `FileType.File`
     * and `FileType.Directory` to know the type of the target
     * the link points to.
     */
    readonly isSymbolicLink: boolean;
    /**
     * The children of the file stat or undefined if none.
     */
    children: IFileStat[] | undefined;
}
export interface IFileStatWithMetadata extends IFileStat, IBaseFileStatWithMetadata {
    readonly mtime: number;
    readonly ctime: number;
    readonly etag: string;
    readonly size: number;
    readonly readonly: boolean;
    readonly children: IFileStatWithMetadata[] | undefined;
}
export interface IFileStatResult {
    readonly stat?: IFileStat;
    readonly success: boolean;
}
export interface IFileStatResultWithMetadata extends IFileStatResult {
    readonly stat?: IFileStatWithMetadata;
}
export interface IFileStatWithPartialMetadata extends Omit<IFileStatWithMetadata, 'children'> {
}
export interface IFileContent extends IBaseFileStatWithMetadata {
    /**
     * The content of a file as buffer.
     */
    readonly value: VSBuffer;
}
export interface IFileStreamContent extends IBaseFileStatWithMetadata {
    /**
     * The content of a file as stream.
     */
    readonly value: VSBufferReadableStream;
}
export interface IBaseReadFileOptions extends IFileReadStreamOptions {
    /**
     * The optional etag parameter allows to return early from resolving the resource if
     * the contents on disk match the etag. This prevents accumulated reading of resources
     * that have been read already with the same etag.
     * It is the task of the caller to makes sure to handle this error case from the promise.
     */
    readonly etag?: string;
}
export interface IReadFileStreamOptions extends IBaseReadFileOptions {
}
export interface IReadFileOptions extends IBaseReadFileOptions {
    /**
     * The optional `atomic` flag can be used to make sure
     * the `readFile` method is not running in parallel with
     * any `write` operations in the same process.
     *
     * Typically you should not need to use this flag but if
     * for example you are quickly reading a file right after
     * a file event occurred and the file changes a lot, there
     * is a chance that a read returns an empty or partial file
     * because a pending write has not finished yet.
     *
     * Note: this does not prevent the file from being written
     * to from a different process. If you need such atomic
     * operations, you better use a real database as storage.
     */
    readonly atomic?: boolean;
}
export interface IWriteFileOptions {
    /**
     * The last known modification time of the file. This can be used to prevent dirty writes.
     */
    readonly mtime?: number;
    /**
     * The etag of the file. This can be used to prevent dirty writes.
     */
    readonly etag?: string;
    /**
     * Whether to attempt to unlock a file before writing.
     */
    readonly unlock?: boolean;
}
export interface IResolveFileOptions {
    /**
     * Automatically continue resolving children of a directory until the provided resources
     * are found.
     */
    readonly resolveTo?: readonly URI[];
    /**
     * Automatically continue resolving children of a directory if the number of children is 1.
     */
    readonly resolveSingleChildDescendants?: boolean;
    /**
     * Will resolve mtime, ctime, size and etag of files if enabled. This can have a negative impact
     * on performance and thus should only be used when these values are required.
     */
    readonly resolveMetadata?: boolean;
}
export interface IResolveMetadataFileOptions extends IResolveFileOptions {
    readonly resolveMetadata: true;
}
export interface ICreateFileOptions {
    /**
     * Overwrite the file to create if it already exists on disk. Otherwise
     * an error will be thrown (FILE_MODIFIED_SINCE).
     */
    readonly overwrite?: boolean;
}
export declare class FileOperationError extends Error {
    readonly fileOperationResult: FileOperationResult;
    readonly options?: (IReadFileOptions & IWriteFileOptions & ICreateFileOptions) | undefined;
    constructor(message: string, fileOperationResult: FileOperationResult, options?: (IReadFileOptions & IWriteFileOptions & ICreateFileOptions) | undefined);
}
export declare class NotModifiedSinceFileOperationError extends FileOperationError {
    readonly stat: IFileStatWithMetadata;
    constructor(message: string, stat: IFileStatWithMetadata, options?: IReadFileOptions);
}
export declare const enum FileOperationResult {
    FILE_IS_DIRECTORY = 0,
    FILE_NOT_FOUND = 1,
    FILE_NOT_MODIFIED_SINCE = 2,
    FILE_MODIFIED_SINCE = 3,
    FILE_MOVE_CONFLICT = 4,
    FILE_WRITE_LOCKED = 5,
    FILE_PERMISSION_DENIED = 6,
    FILE_TOO_LARGE = 7,
    FILE_INVALID_PATH = 8,
    FILE_EXCEEDS_MEMORY_LIMIT = 9,
    FILE_NOT_DIRECTORY = 10,
    FILE_OTHER_ERROR = 11
}
export declare const AutoSaveConfiguration: {
    OFF: string;
    AFTER_DELAY: string;
    ON_FOCUS_CHANGE: string;
    ON_WINDOW_CHANGE: string;
};
export declare const HotExitConfiguration: {
    OFF: string;
    ON_EXIT: string;
    ON_EXIT_AND_WINDOW_CLOSE: string;
};
export declare const FILES_ASSOCIATIONS_CONFIG = "files.associations";
export declare const FILES_EXCLUDE_CONFIG = "files.exclude";
export interface IFilesConfiguration {
    files: {
        associations: {
            [filepattern: string]: string;
        };
        exclude: IExpression;
        watcherExclude: {
            [filepattern: string]: boolean;
        };
        watcherInclude: string[];
        encoding: string;
        autoGuessEncoding: boolean;
        defaultLanguage: string;
        trimTrailingWhitespace: boolean;
        autoSave: string;
        autoSaveDelay: number;
        eol: string;
        enableTrash: boolean;
        hotExit: string;
        saveConflictResolution: 'askUser' | 'overwriteFileOnDisk';
    };
}
export declare enum FileKind {
    FILE = 0,
    FOLDER = 1,
    ROOT_FOLDER = 2
}
/**
 * A hint to disable etag checking for reading/writing.
 */
export declare const ETAG_DISABLED = "";
export declare function etag(stat: {
    mtime: number;
    size: number;
}): string;
export declare function etag(stat: {
    mtime: number | undefined;
    size: number | undefined;
}): string | undefined;
export declare function whenProviderRegistered(file: URI, fileService: IFileService): Promise<void>;
/**
 * Native only: limits for memory sizes
 */
export declare const MIN_MAX_MEMORY_SIZE_MB = 2048;
export declare const FALLBACK_MAX_MEMORY_SIZE_MB = 4096;
/**
 * Helper to format a raw byte size into a human readable label.
 */
export declare class ByteSize {
    static readonly KB = 1024;
    static readonly MB: number;
    static readonly GB: number;
    static readonly TB: number;
    static formatSize(size: number): string;
}
export interface IArchLimits {
    readonly maxFileSize: number;
    readonly maxHeapSize: number;
}
export declare const enum Arch {
    IA32 = 0,
    OTHER = 1
}
export declare function getPlatformLimits(arch: Arch): IArchLimits;
export {};
