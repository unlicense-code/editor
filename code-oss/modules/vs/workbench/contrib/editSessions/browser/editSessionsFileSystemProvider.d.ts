import { IDisposable } from 'vs/base/common/lifecycle';
import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
import { FileSystemProviderCapabilities, FileType, IFileDeleteOptions, IFileOverwriteOptions, IFileSystemProviderWithFileReadWriteCapability, IStat, IWatchOptions } from 'vs/platform/files/common/files';
import { IEditSessionsStorageService } from 'vs/workbench/contrib/editSessions/common/editSessions';
export declare class EditSessionsFileSystemProvider implements IFileSystemProviderWithFileReadWriteCapability {
    private editSessionsStorageService;
    static readonly SCHEMA = "vscode-edit-sessions";
    constructor(editSessionsStorageService: IEditSessionsStorageService);
    readonly capabilities: FileSystemProviderCapabilities;
    readFile(resource: URI): Promise<Uint8Array>;
    stat(resource: URI): Promise<IStat>;
    readonly onDidChangeCapabilities: Event<any>;
    readonly onDidChangeFile: Event<any>;
    watch(resource: URI, opts: IWatchOptions): IDisposable;
    mkdir(resource: URI): Promise<void>;
    readdir(resource: URI): Promise<[string, FileType][]>;
    rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    delete(resource: URI, opts: IFileDeleteOptions): Promise<void>;
    writeFile(): Promise<void>;
}
