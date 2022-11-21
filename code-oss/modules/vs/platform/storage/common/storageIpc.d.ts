import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { UriDto } from 'vs/base/common/uri';
import { IChannel } from 'vs/base/parts/ipc/common/ipc';
import { IStorageDatabase, IStorageItemsChangeEvent, IUpdateRequest } from 'vs/base/parts/storage/common/storage';
import { IUserDataProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
import { ISerializedSingleFolderWorkspaceIdentifier, ISerializedWorkspaceIdentifier, IEmptyWorkspaceIdentifier, ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
export declare type Key = string;
export declare type Value = string;
export declare type Item = [Key, Value];
export interface IBaseSerializableStorageRequest {
    /**
     * Profile to correlate storage. Only used when no
     * workspace is provided. Can be undefined to denote
     * application scope.
     */
    readonly profile: UriDto<IUserDataProfile> | undefined;
    /**
     * Workspace to correlate storage. Can be undefined to
     * denote application or profile scope depending on profile.
     */
    readonly workspace: ISerializedWorkspaceIdentifier | ISerializedSingleFolderWorkspaceIdentifier | IEmptyWorkspaceIdentifier | undefined;
    /**
     * Additional payload for the request to perform.
     */
    readonly payload?: unknown;
}
export interface ISerializableUpdateRequest extends IBaseSerializableStorageRequest {
    insert?: Item[];
    delete?: Key[];
}
export interface ISerializableItemsChangeEvent {
    readonly changed?: Item[];
    readonly deleted?: Key[];
}
declare abstract class BaseStorageDatabaseClient extends Disposable implements IStorageDatabase {
    protected channel: IChannel;
    protected profile: UriDto<IUserDataProfile> | undefined;
    protected workspace: IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | IEmptyWorkspaceIdentifier | undefined;
    abstract readonly onDidChangeItemsExternal: Event<IStorageItemsChangeEvent>;
    constructor(channel: IChannel, profile: UriDto<IUserDataProfile> | undefined, workspace: IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | IEmptyWorkspaceIdentifier | undefined);
    getItems(): Promise<Map<string, string>>;
    updateItems(request: IUpdateRequest): Promise<void>;
    abstract close(): Promise<void>;
}
declare abstract class BaseProfileAwareStorageDatabaseClient extends BaseStorageDatabaseClient {
    private readonly _onDidChangeItemsExternal;
    readonly onDidChangeItemsExternal: Event<IStorageItemsChangeEvent>;
    constructor(channel: IChannel, profile: UriDto<IUserDataProfile> | undefined);
    private registerListeners;
    private onDidChangeStorage;
}
export declare class ApplicationStorageDatabaseClient extends BaseProfileAwareStorageDatabaseClient {
    constructor(channel: IChannel);
    close(): Promise<void>;
}
export declare class ProfileStorageDatabaseClient extends BaseProfileAwareStorageDatabaseClient {
    constructor(channel: IChannel, profile: UriDto<IUserDataProfile>);
    close(): Promise<void>;
}
export declare class WorkspaceStorageDatabaseClient extends BaseStorageDatabaseClient implements IStorageDatabase {
    readonly onDidChangeItemsExternal: Event<any>;
    constructor(channel: IChannel, workspace: IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | IEmptyWorkspaceIdentifier);
    close(): Promise<void>;
}
export declare class StorageClient {
    private readonly channel;
    constructor(channel: IChannel);
    isUsed(path: string): Promise<boolean>;
}
export {};
