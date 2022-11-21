import { URI } from 'vs/base/common/uri';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { IStateService } from 'vs/platform/state/node/state';
export declare class FileStorage {
    private readonly storagePath;
    private readonly logService;
    private readonly fileService;
    private storage;
    private lastSavedStorageContents;
    private readonly flushDelayer;
    private initializing;
    private closing;
    constructor(storagePath: URI, logService: ILogService, fileService: IFileService);
    init(): Promise<void>;
    private doInit;
    getItem<T>(key: string, defaultValue: T): T;
    getItem<T>(key: string, defaultValue?: T): T | undefined;
    setItem(key: string, data?: object | string | number | boolean | undefined | null): void;
    setItems(items: readonly {
        key: string;
        data?: object | string | number | boolean | undefined | null;
    }[]): void;
    removeItem(key: string): void;
    private save;
    private doSave;
    close(): Promise<void>;
}
export declare class StateService implements IStateService {
    readonly _serviceBrand: undefined;
    protected readonly fileStorage: FileStorage;
    constructor(environmentService: IEnvironmentService, logService: ILogService, fileService: IFileService);
    init(): Promise<void>;
    getItem<T>(key: string, defaultValue: T): T;
    getItem<T>(key: string, defaultValue?: T): T | undefined;
}
