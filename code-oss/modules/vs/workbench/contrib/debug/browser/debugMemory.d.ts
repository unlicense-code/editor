import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
import { IFileOpenOptions, IFileChange, IFileSystemProvider, IStat, IWatchOptions } from 'vs/platform/files/common/files';
import { IDebugService, IDebugSession } from 'vs/workbench/contrib/debug/common/debug';
export declare class DebugMemoryFileSystemProvider implements IFileSystemProvider {
    private readonly debugService;
    private memoryFdCounter;
    private readonly fdMemory;
    private readonly changeEmitter;
    /** @inheritdoc */
    readonly onDidChangeCapabilities: Event<any>;
    /** @inheritdoc */
    readonly onDidChangeFile: Event<readonly IFileChange[]>;
    /** @inheritdoc */
    readonly capabilities: number;
    constructor(debugService: IDebugService);
    watch(resource: URI, opts: IWatchOptions): import("vs/base/common/lifecycle").IDisposable;
    /** @inheritdoc */
    stat(file: URI): Promise<IStat>;
    /** @inheritdoc */
    mkdir(): never;
    /** @inheritdoc */
    readdir(): never;
    /** @inheritdoc */
    delete(): never;
    /** @inheritdoc */
    rename(): never;
    /** @inheritdoc */
    open(resource: URI, _opts: IFileOpenOptions): Promise<number>;
    /** @inheritdoc */
    close(fd: number): Promise<void>;
    /** @inheritdoc */
    writeFile(resource: URI, content: Uint8Array): Promise<void>;
    /** @inheritdoc */
    readFile(resource: URI): Promise<Uint8Array>;
    /** @inheritdoc */
    read(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    /** @inheritdoc */
    write(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    protected parseUri(uri: URI): {
        session: IDebugSession;
        offset: {
            fromOffset: number;
            toOffset: number;
        } | undefined;
        readOnly: boolean;
        sessionId: string;
        memoryReference: string;
    };
}
