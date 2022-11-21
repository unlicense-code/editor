import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IFileDeleteOptions, IFileOpenOptions, IFileOverwriteOptions, FileSystemProviderCapabilities, FileType, IFileWriteOptions, IFileChange, IFileSystemProvider, IStat, IWatchOptions } from 'vs/platform/files/common/files';
export declare class NullFileSystemProvider implements IFileSystemProvider {
    private disposableFactory;
    capabilities: FileSystemProviderCapabilities;
    private readonly _onDidChangeCapabilities;
    readonly onDidChangeCapabilities: Event<void>;
    private readonly _onDidChangeFile;
    readonly onDidChangeFile: Event<readonly IFileChange[]>;
    constructor(disposableFactory?: () => IDisposable);
    emitFileChangeEvents(changes: IFileChange[]): void;
    setCapabilities(capabilities: FileSystemProviderCapabilities): void;
    watch(resource: URI, opts: IWatchOptions): IDisposable;
    stat(resource: URI): Promise<IStat>;
    mkdir(resource: URI): Promise<void>;
    readdir(resource: URI): Promise<[string, FileType][]>;
    delete(resource: URI, opts: IFileDeleteOptions): Promise<void>;
    rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    copy?(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    readFile?(resource: URI): Promise<Uint8Array>;
    writeFile?(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void>;
    open?(resource: URI, opts: IFileOpenOptions): Promise<number>;
    close?(fd: number): Promise<void>;
    read?(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    write?(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
}
