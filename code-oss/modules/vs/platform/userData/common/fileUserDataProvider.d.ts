import { Event } from 'vs/base/common/event';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IFileSystemProviderWithFileReadWriteCapability, IFileChange, IWatchOptions, IStat, IFileOverwriteOptions, FileType, IFileWriteOptions, IFileDeleteOptions, IFileSystemProviderWithFileReadStreamCapability, IFileReadStreamOptions, IFileSystemProviderWithFileAtomicReadCapability, IFileSystemProviderWithFileFolderCopyCapability } from 'vs/platform/files/common/files';
import { URI } from 'vs/base/common/uri';
import { CancellationToken } from 'vs/base/common/cancellation';
import { ReadableStreamEvents } from 'vs/base/common/stream';
import { ILogService } from 'vs/platform/log/common/log';
/**
 * This is a wrapper on top of the local filesystem provider which will
 * 	- Convert the user data resources to file system scheme and vice-versa
 *  - Enforces atomic reads for user data
 */
export declare class FileUserDataProvider extends Disposable implements IFileSystemProviderWithFileReadWriteCapability, IFileSystemProviderWithFileReadStreamCapability, IFileSystemProviderWithFileAtomicReadCapability, IFileSystemProviderWithFileFolderCopyCapability {
    private readonly fileSystemScheme;
    private readonly fileSystemProvider;
    private readonly userDataScheme;
    private readonly logService;
    get capabilities(): number;
    readonly onDidChangeCapabilities: Event<void>;
    private readonly _onDidChangeFile;
    readonly onDidChangeFile: Event<readonly IFileChange[]>;
    private readonly watchResources;
    constructor(fileSystemScheme: string, fileSystemProvider: IFileSystemProviderWithFileReadWriteCapability & (IFileSystemProviderWithFileReadStreamCapability | IFileSystemProviderWithFileAtomicReadCapability | IFileSystemProviderWithFileFolderCopyCapability), userDataScheme: string, logService: ILogService);
    watch(resource: URI, opts: IWatchOptions): IDisposable;
    stat(resource: URI): Promise<IStat>;
    mkdir(resource: URI): Promise<void>;
    rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    readFile(resource: URI): Promise<Uint8Array>;
    readFileStream(resource: URI, opts: IFileReadStreamOptions, token: CancellationToken): ReadableStreamEvents<Uint8Array>;
    readdir(resource: URI): Promise<[string, FileType][]>;
    writeFile(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void>;
    delete(resource: URI, opts: IFileDeleteOptions): Promise<void>;
    copy(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    private handleFileChanges;
    private toFileSystemResource;
    private toUserDataResource;
}
