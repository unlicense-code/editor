import { Event } from 'vs/base/common/event';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IFileDeleteOptions, IFileOverwriteOptions, FileSystemProviderCapabilities, FileType, IFileWriteOptions, IFileChange, IFileSystemProviderWithFileReadWriteCapability, IStat, IWatchOptions } from 'vs/platform/files/common/files';
declare class File implements IStat {
    type: FileType.File;
    ctime: number;
    mtime: number;
    size: number;
    name: string;
    data?: Uint8Array;
    constructor(name: string);
}
declare class Directory implements IStat {
    type: FileType.Directory;
    ctime: number;
    mtime: number;
    size: number;
    name: string;
    entries: Map<string, File | Directory>;
    constructor(name: string);
}
export declare type Entry = File | Directory;
export declare class InMemoryFileSystemProvider extends Disposable implements IFileSystemProviderWithFileReadWriteCapability {
    private _onDidChangeCapabilities;
    readonly onDidChangeCapabilities: Event<void>;
    private _capabilities;
    get capabilities(): FileSystemProviderCapabilities;
    setReadOnly(readonly: boolean): void;
    root: Directory;
    stat(resource: URI): Promise<IStat>;
    readdir(resource: URI): Promise<[string, FileType][]>;
    readFile(resource: URI): Promise<Uint8Array>;
    writeFile(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void>;
    rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    delete(resource: URI, opts: IFileDeleteOptions): Promise<void>;
    mkdir(resource: URI): Promise<void>;
    private _lookup;
    private _lookupAsDirectory;
    private _lookupAsFile;
    private _lookupParentDirectory;
    private readonly _onDidChangeFile;
    readonly onDidChangeFile: Event<readonly IFileChange[]>;
    private _bufferedChanges;
    private _fireSoonHandle?;
    watch(resource: URI, opts: IWatchOptions): IDisposable;
    private _fireSoon;
}
export {};
