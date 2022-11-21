import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IFileDeleteOptions, IFileOverwriteOptions, FileType, IFileWriteOptions, IFileService, IFileSystemProvider, IFileSystemProviderWithFileReadWriteCapability, IStat, IWatchOptions } from 'vs/platform/files/common/files';
interface ILocalHistoryResource {
    /**
     * The location of the local history entry to read from.
     */
    readonly location: URI;
    /**
     * The associated resource the local history entry is about.
     */
    readonly associatedResource: URI;
}
/**
 * A wrapper around a standard file system provider
 * that is entirely readonly.
 */
export declare class LocalHistoryFileSystemProvider implements IFileSystemProvider, IFileSystemProviderWithFileReadWriteCapability {
    private readonly fileService;
    static readonly SCHEMA = "vscode-local-history";
    static toLocalHistoryFileSystem(resource: ILocalHistoryResource): URI;
    static fromLocalHistoryFileSystem(resource: URI): ILocalHistoryResource;
    private static readonly EMPTY_RESOURCE;
    static readonly EMPTY: ILocalHistoryResource;
    get capabilities(): number;
    constructor(fileService: IFileService);
    private readonly mapSchemeToProvider;
    private withProvider;
    stat(resource: URI): Promise<IStat>;
    readFile(resource: URI): Promise<Uint8Array>;
    readonly onDidChangeCapabilities: Event<any>;
    readonly onDidChangeFile: Event<any>;
    writeFile(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void>;
    mkdir(resource: URI): Promise<void>;
    readdir(resource: URI): Promise<[string, FileType][]>;
    rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    delete(resource: URI, opts: IFileDeleteOptions): Promise<void>;
    watch(resource: URI, opts: IWatchOptions): IDisposable;
}
export {};
