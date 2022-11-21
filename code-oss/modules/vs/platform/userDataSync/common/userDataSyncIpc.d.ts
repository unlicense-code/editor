import { IStringDictionary } from 'vs/base/common/collections';
import { Event } from 'vs/base/common/event';
import { FormattingOptions } from 'vs/base/common/jsonFormatter';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IChannel, IServerChannel } from 'vs/base/parts/ipc/common/ipc';
import { IUserDataAutoSyncService, IUserDataSyncStore, IUserDataSyncStoreManagementService, IUserDataSyncUtilService, UserDataSyncStoreType } from 'vs/platform/userDataSync/common/userDataSync';
import { IUserDataSyncAccountService } from 'vs/platform/userDataSync/common/userDataSyncAccount';
import { IUserDataSyncMachinesService } from 'vs/platform/userDataSync/common/userDataSyncMachines';
export declare class UserDataAutoSyncChannel implements IServerChannel {
    private readonly service;
    constructor(service: IUserDataAutoSyncService);
    listen(_: unknown, event: string): Event<any>;
    call(context: any, command: string, args?: any): Promise<any>;
}
export declare class UserDataSycnUtilServiceChannel implements IServerChannel {
    private readonly service;
    constructor(service: IUserDataSyncUtilService);
    listen(_: unknown, event: string): Event<any>;
    call(context: any, command: string, args?: any): Promise<any>;
}
export declare class UserDataSyncUtilServiceClient implements IUserDataSyncUtilService {
    private readonly channel;
    readonly _serviceBrand: undefined;
    constructor(channel: IChannel);
    resolveDefaultIgnoredSettings(): Promise<string[]>;
    resolveUserBindings(userbindings: string[]): Promise<IStringDictionary<string>>;
    resolveFormattingOptions(file: URI): Promise<FormattingOptions>;
}
export declare class UserDataSyncMachinesServiceChannel implements IServerChannel {
    private readonly service;
    constructor(service: IUserDataSyncMachinesService);
    listen(_: unknown, event: string): Event<any>;
    call(context: any, command: string, args?: any): Promise<any>;
}
export declare class UserDataSyncAccountServiceChannel implements IServerChannel {
    private readonly service;
    constructor(service: IUserDataSyncAccountService);
    listen(_: unknown, event: string): Event<any>;
    call(context: any, command: string, args?: any): Promise<any>;
}
export declare class UserDataSyncStoreManagementServiceChannel implements IServerChannel {
    private readonly service;
    constructor(service: IUserDataSyncStoreManagementService);
    listen(_: unknown, event: string): Event<any>;
    call(context: any, command: string, args?: any): Promise<any>;
}
export declare class UserDataSyncStoreManagementServiceChannelClient extends Disposable {
    private readonly channel;
    readonly onDidChangeUserDataSyncStore: Event<void>;
    constructor(channel: IChannel);
    switch(type: UserDataSyncStoreType): Promise<void>;
    getPreviousUserDataSyncStore(): Promise<IUserDataSyncStore>;
    private revive;
}
