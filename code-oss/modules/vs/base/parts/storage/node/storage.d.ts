import { Event } from 'vs/base/common/event';
import { IStorageDatabase, IStorageItemsChangeEvent, IUpdateRequest } from 'vs/base/parts/storage/common/storage';
export interface ISQLiteStorageDatabaseOptions {
    readonly logging?: ISQLiteStorageDatabaseLoggingOptions;
}
export interface ISQLiteStorageDatabaseLoggingOptions {
    logError?: (error: string | Error) => void;
    logTrace?: (msg: string) => void;
}
export declare class SQLiteStorageDatabase implements IStorageDatabase {
    private readonly path;
    private readonly options;
    static readonly IN_MEMORY_PATH = ":memory:";
    get onDidChangeItemsExternal(): Event<IStorageItemsChangeEvent>;
    private static readonly BUSY_OPEN_TIMEOUT;
    private static readonly MAX_HOST_PARAMETERS;
    private readonly name;
    private readonly logger;
    private readonly whenConnected;
    constructor(path: string, options?: ISQLiteStorageDatabaseOptions);
    getItems(): Promise<Map<string, string>>;
    updateItems(request: IUpdateRequest): Promise<void>;
    private doUpdateItems;
    close(recovery?: () => Map<string, string>): Promise<void>;
    private doClose;
    private backup;
    private toBackupPath;
    checkIntegrity(full: boolean): Promise<string>;
    private connect;
    private handleSQLiteError;
    private doConnect;
    private exec;
    private get;
    private all;
    private transaction;
    private prepare;
}
