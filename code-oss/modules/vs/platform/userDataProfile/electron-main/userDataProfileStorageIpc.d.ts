import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IServerChannel } from 'vs/base/parts/ipc/common/ipc';
import { ILogService } from 'vs/platform/log/common/log';
import { IBaseSerializableStorageRequest } from 'vs/platform/storage/common/storageIpc';
import { IStorageMainService } from 'vs/platform/storage/electron-main/storageMainService';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
export declare class ProfileStorageChangesListenerChannel extends Disposable implements IServerChannel {
    private readonly storageMainService;
    private readonly userDataProfilesService;
    private readonly logService;
    private readonly _onDidChange;
    constructor(storageMainService: IStorageMainService, userDataProfilesService: IUserDataProfilesService, logService: ILogService);
    private registerStorageChangeListeners;
    private onDidChangeApplicationStorage;
    private onDidChangeProfileStorage;
    private triggerEvents;
    listen(_: unknown, event: string, arg: IBaseSerializableStorageRequest): Event<any>;
    call(_: unknown, command: string): Promise<any>;
}
