import { Emitter, Event } from 'vs/base/common/event';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IStorage } from 'vs/base/parts/storage/common/storage';
import { ISQLiteStorageDatabaseLoggingOptions } from 'vs/base/parts/storage/node/storage';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { IUserDataProfile, IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IEmptyWorkspaceIdentifier, ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
export interface IStorageMainOptions {
    /**
     * If enabled, storage will not persist to disk
     * but into memory.
     */
    useInMemoryStorage?: boolean;
}
/**
 * Provides access to application, profile and workspace storage from
 * the electron-main side that is the owner of all storage connections.
 */
export interface IStorageMain extends IDisposable {
    /**
     * Emitted whenever data is updated or deleted.
     */
    readonly onDidChangeStorage: Event<IStorageChangeEvent>;
    /**
     * Emitted when the storage is closed.
     */
    readonly onDidCloseStorage: Event<void>;
    /**
     * Access to all cached items of this storage service.
     */
    readonly items: Map<string, string>;
    /**
     * Allows to join on the `init` call having completed
     * to be able to safely use the storage.
     */
    readonly whenInit: Promise<void>;
    /**
     * Provides access to the `IStorage` implementation which will be
     * in-memory for as long as the storage has not been initialized.
     */
    readonly storage: IStorage;
    /**
     * The file path of the underlying storage file if any.
     */
    readonly path: string | undefined;
    /**
     * Required call to ensure the service can be used.
     */
    init(): Promise<void>;
    /**
     * Retrieve an element stored with the given key from storage. Use
     * the provided defaultValue if the element is null or undefined.
     */
    get(key: string, fallbackValue: string): string;
    get(key: string, fallbackValue?: string): string | undefined;
    /**
     * Store a string value under the given key to storage. The value will
     * be converted to a string.
     */
    set(key: string, value: string | boolean | number | undefined | null): void;
    /**
     * Delete an element stored under the provided key from storage.
     */
    delete(key: string): void;
    /**
     * Close the storage connection.
     */
    close(): Promise<void>;
}
export interface IStorageChangeEvent {
    key: string;
}
declare abstract class BaseStorageMain extends Disposable implements IStorageMain {
    protected readonly logService: ILogService;
    private readonly fileService;
    private static readonly LOG_SLOW_CLOSE_THRESHOLD;
    protected readonly _onDidChangeStorage: Emitter<IStorageChangeEvent>;
    readonly onDidChangeStorage: Event<IStorageChangeEvent>;
    private readonly _onDidCloseStorage;
    readonly onDidCloseStorage: Event<void>;
    private _storage;
    get storage(): IStorage;
    abstract get path(): string | undefined;
    private initializePromise;
    private readonly whenInitPromise;
    readonly whenInit: Promise<void>;
    private state;
    constructor(logService: ILogService, fileService: IFileService);
    init(): Promise<void>;
    protected createLoggingOptions(): ISQLiteStorageDatabaseLoggingOptions;
    protected doInit(storage: IStorage): Promise<void>;
    protected abstract doCreate(): Promise<IStorage>;
    get items(): Map<string, string>;
    get(key: string, fallbackValue: string): string;
    get(key: string, fallbackValue?: string): string | undefined;
    set(key: string, value: string | boolean | number | undefined | null): Promise<void>;
    delete(key: string): Promise<void>;
    close(): Promise<void>;
    private logSlowClose;
    private doClose;
}
declare class BaseProfileAwareStorageMain extends BaseStorageMain {
    private readonly profile;
    private readonly options;
    private static readonly STORAGE_NAME;
    get path(): string | undefined;
    constructor(profile: IUserDataProfile, options: IStorageMainOptions, logService: ILogService, fileService: IFileService);
    protected doCreate(): Promise<IStorage>;
}
export declare class ProfileStorageMain extends BaseProfileAwareStorageMain {
    constructor(profile: IUserDataProfile, options: IStorageMainOptions, logService: ILogService, fileService: IFileService);
}
export declare class ApplicationStorageMain extends BaseProfileAwareStorageMain {
    constructor(options: IStorageMainOptions, userDataProfileService: IUserDataProfilesService, logService: ILogService, fileService: IFileService);
    protected doInit(storage: IStorage): Promise<void>;
    private updateTelemetryState;
}
export declare class WorkspaceStorageMain extends BaseStorageMain {
    private workspace;
    private readonly options;
    private readonly environmentService;
    private static readonly WORKSPACE_STORAGE_NAME;
    private static readonly WORKSPACE_META_NAME;
    get path(): string | undefined;
    constructor(workspace: IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | IEmptyWorkspaceIdentifier, options: IStorageMainOptions, logService: ILogService, environmentService: IEnvironmentService, fileService: IFileService);
    protected doCreate(): Promise<IStorage>;
    private prepareWorkspaceStorageFolder;
    private ensureWorkspaceStorageFolderMeta;
}
export declare class InMemoryStorageMain extends BaseStorageMain {
    get path(): string | undefined;
    protected doCreate(): Promise<IStorage>;
}
export {};
