import { Event } from 'vs/base/common/event';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
export declare enum StorageHint {
    STORAGE_DOES_NOT_EXIST = 0
}
export interface IStorageOptions {
    readonly hint?: StorageHint;
}
export interface IUpdateRequest {
    readonly insert?: Map<string, string>;
    readonly delete?: Set<string>;
}
export interface IStorageItemsChangeEvent {
    readonly changed?: Map<string, string>;
    readonly deleted?: Set<string>;
}
export declare function isStorageItemsChangeEvent(thing: unknown): thing is IStorageItemsChangeEvent;
export interface IStorageDatabase {
    readonly onDidChangeItemsExternal: Event<IStorageItemsChangeEvent>;
    getItems(): Promise<Map<string, string>>;
    updateItems(request: IUpdateRequest): Promise<void>;
    close(recovery?: () => Map<string, string>): Promise<void>;
}
export interface IStorage extends IDisposable {
    readonly onDidChangeStorage: Event<string>;
    readonly items: Map<string, string>;
    readonly size: number;
    init(): Promise<void>;
    get(key: string, fallbackValue: string): string;
    get(key: string, fallbackValue?: string): string | undefined;
    getBoolean(key: string, fallbackValue: boolean): boolean;
    getBoolean(key: string, fallbackValue?: boolean): boolean | undefined;
    getNumber(key: string, fallbackValue: number): number;
    getNumber(key: string, fallbackValue?: number): number | undefined;
    set(key: string, value: string | boolean | number | undefined | null): Promise<void>;
    delete(key: string): Promise<void>;
    flush(delay?: number): Promise<void>;
    whenFlushed(): Promise<void>;
    close(): Promise<void>;
}
export declare enum StorageState {
    None = 0,
    Initialized = 1,
    Closed = 2
}
export declare class Storage extends Disposable implements IStorage {
    protected readonly database: IStorageDatabase;
    private readonly options;
    private static readonly DEFAULT_FLUSH_DELAY;
    private readonly _onDidChangeStorage;
    readonly onDidChangeStorage: Event<string>;
    private state;
    private cache;
    private readonly flushDelayer;
    private pendingDeletes;
    private pendingInserts;
    private pendingClose;
    private readonly whenFlushedCallbacks;
    constructor(database: IStorageDatabase, options?: IStorageOptions);
    private registerListeners;
    private onDidChangeItemsExternal;
    private accept;
    get items(): Map<string, string>;
    get size(): number;
    init(): Promise<void>;
    get(key: string, fallbackValue: string): string;
    get(key: string, fallbackValue?: string): string | undefined;
    getBoolean(key: string, fallbackValue: boolean): boolean;
    getBoolean(key: string, fallbackValue?: boolean): boolean | undefined;
    getNumber(key: string, fallbackValue: number): number;
    getNumber(key: string, fallbackValue?: number): number | undefined;
    set(key: string, value: string | boolean | number | null | undefined): Promise<void>;
    delete(key: string): Promise<void>;
    close(): Promise<void>;
    private doClose;
    private get hasPending();
    private flushPending;
    flush(delay?: number): Promise<void>;
    private doFlush;
    whenFlushed(): Promise<void>;
    dispose(): void;
}
export declare class InMemoryStorageDatabase implements IStorageDatabase {
    readonly onDidChangeItemsExternal: Event<any>;
    private readonly items;
    getItems(): Promise<Map<string, string>>;
    updateItems(request: IUpdateRequest): Promise<void>;
    close(): Promise<void>;
}
