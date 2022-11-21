import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IServerChannel } from 'vs/base/parts/ipc/common/ipc';
import { ILogService } from 'vs/platform/log/common/log';
import { IBaseSerializableStorageRequest } from 'vs/platform/storage/common/storageIpc';
import { IStorageMainService } from 'vs/platform/storage/electron-main/storageMainService';
export declare class StorageDatabaseChannel extends Disposable implements IServerChannel {
    private readonly logService;
    private readonly storageMainService;
    private static readonly STORAGE_CHANGE_DEBOUNCE_TIME;
    private readonly onDidChangeApplicationStorageEmitter;
    private readonly mapProfileToOnDidChangeProfileStorageEmitter;
    constructor(logService: ILogService, storageMainService: IStorageMainService);
    private registerStorageChangeListeners;
    private serializeStorageChangeEvents;
    listen(_: unknown, event: string, arg: IBaseSerializableStorageRequest): Event<any>;
    call(_: unknown, command: string, arg: IBaseSerializableStorageRequest): Promise<any>;
    private withStorageInitialized;
}
