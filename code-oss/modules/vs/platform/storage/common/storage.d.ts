import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IStorage } from 'vs/base/parts/storage/common/storage';
import { IUserDataProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IAnyWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
export declare const IS_NEW_KEY = "__$__isNewStorageMarker";
export declare const TARGET_KEY = "__$__targetStorageMarker";
export declare const IStorageService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IStorageService>;
export declare enum WillSaveStateReason {
    /**
     * No specific reason to save state.
     */
    NONE = 0,
    /**
     * A hint that the workbench is about to shutdown.
     */
    SHUTDOWN = 1
}
export interface IWillSaveStateEvent {
    readonly reason: WillSaveStateReason;
}
export interface IStorageService {
    readonly _serviceBrand: undefined;
    /**
     * Emitted whenever data is updated or deleted.
     */
    readonly onDidChangeValue: Event<IStorageValueChangeEvent>;
    /**
     * Emitted whenever target of a storage entry changes.
     */
    readonly onDidChangeTarget: Event<IStorageTargetChangeEvent>;
    /**
     * Emitted when the storage is about to persist. This is the right time
     * to persist data to ensure it is stored before the application shuts
     * down.
     *
     * The will save state event allows to optionally ask for the reason of
     * saving the state, e.g. to find out if the state is saved due to a
     * shutdown.
     *
     * Note: this event may be fired many times, not only on shutdown to prevent
     * loss of state in situations where the shutdown is not sufficient to
     * persist the data properly.
     */
    readonly onWillSaveState: Event<IWillSaveStateEvent>;
    /**
     * Retrieve an element stored with the given key from storage. Use
     * the provided `defaultValue` if the element is `null` or `undefined`.
     *
     * @param scope allows to define the scope of the storage operation
     * to either the current workspace only, all workspaces or all profiles.
     */
    get(key: string, scope: StorageScope, fallbackValue: string): string;
    get(key: string, scope: StorageScope, fallbackValue?: string): string | undefined;
    /**
     * Retrieve an element stored with the given key from storage. Use
     * the provided `defaultValue` if the element is `null` or `undefined`.
     * The element will be converted to a `boolean`.
     *
     * @param scope allows to define the scope of the storage operation
     * to either the current workspace only, all workspaces or all profiles.
     */
    getBoolean(key: string, scope: StorageScope, fallbackValue: boolean): boolean;
    getBoolean(key: string, scope: StorageScope, fallbackValue?: boolean): boolean | undefined;
    /**
     * Retrieve an element stored with the given key from storage. Use
     * the provided `defaultValue` if the element is `null` or `undefined`.
     * The element will be converted to a `number` using `parseInt` with a
     * base of `10`.
     *
     * @param scope allows to define the scope of the storage operation
     * to either the current workspace only, all workspaces or all profiles.
     */
    getNumber(key: string, scope: StorageScope, fallbackValue: number): number;
    getNumber(key: string, scope: StorageScope, fallbackValue?: number): number | undefined;
    /**
     * Store a value under the given key to storage. The value will be
     * converted to a `string`. Storing either `undefined` or `null` will
     * remove the entry under the key.
     *
     * @param scope allows to define the scope of the storage operation
     * to either the current workspace only, all workspaces or all profiles.
     *
     * @param target allows to define the target of the storage operation
     * to either the current machine or user.
     */
    store(key: string, value: string | boolean | number | undefined | null, scope: StorageScope, target: StorageTarget): void;
    /**
     * Delete an element stored under the provided key from storage.
     *
     * The scope argument allows to define the scope of the storage
     * operation to either the current workspace only, all workspaces
     * or all profiles.
     */
    remove(key: string, scope: StorageScope): void;
    /**
     * Returns all the keys used in the storage for the provided `scope`
     * and `target`.
     *
     * Note: this will NOT return all keys stored in the storage layer.
     * Some keys may not have an associated `StorageTarget` and thus
     * will be excluded from the results.
     *
     * @param scope allows to define the scope for the keys
     * to either the current workspace only, all workspaces or all profiles.
     *
     * @param target allows to define the target for the keys
     * to either the current machine or user.
     */
    keys(scope: StorageScope, target: StorageTarget): string[];
    /**
     * Log the contents of the storage to the console.
     */
    log(): void;
    /**
     * Returns true if the storage service handles the provided scope.
     */
    hasScope(scope: IAnyWorkspaceIdentifier | IUserDataProfile): boolean;
    /**
     * Switch storage to another workspace or profile. Optionally preserve the
     * current data to the new storage.
     */
    switch(to: IAnyWorkspaceIdentifier | IUserDataProfile, preserveData: boolean): Promise<void>;
    /**
     * Whether the storage for the given scope was created during this session or
     * existed before.
     */
    isNew(scope: StorageScope): boolean;
    /**
     * Allows to flush state, e.g. in cases where a shutdown is
     * imminent. This will send out the `onWillSaveState` to ask
     * everyone for latest state.
     *
     * @returns a `Promise` that can be awaited on when all updates
     * to the underlying storage have been flushed.
     */
    flush(reason?: WillSaveStateReason): Promise<void>;
}
export declare const enum StorageScope {
    /**
     * The stored data will be scoped to all workspaces across all profiles.
     */
    APPLICATION = -1,
    /**
     * The stored data will be scoped to all workspaces of the same profile.
     */
    PROFILE = 0,
    /**
     * The stored data will be scoped to the current workspace.
     */
    WORKSPACE = 1
}
export declare const enum StorageTarget {
    /**
     * The stored data is user specific and applies across machines.
     */
    USER = 0,
    /**
     * The stored data is machine specific.
     */
    MACHINE = 1
}
export interface IStorageValueChangeEvent {
    /**
     * The scope for the storage entry that changed
     * or was removed.
     */
    readonly scope: StorageScope;
    /**
     * The `key` of the storage entry that was changed
     * or was removed.
     */
    readonly key: string;
    /**
     * The `target` can be `undefined` if a key is being
     * removed.
     */
    readonly target: StorageTarget | undefined;
}
export interface IStorageTargetChangeEvent {
    /**
     * The scope for the target that changed. Listeners
     * should use `keys(scope, target)` to get an updated
     * list of keys for the given `scope` and `target`.
     */
    readonly scope: StorageScope;
}
interface IKeyTargets {
    [key: string]: StorageTarget;
}
export interface IStorageServiceOptions {
    readonly flushInterval: number;
}
export declare function loadKeyTargets(storage: IStorage): IKeyTargets;
export declare abstract class AbstractStorageService extends Disposable implements IStorageService {
    private readonly options;
    readonly _serviceBrand: undefined;
    private static DEFAULT_FLUSH_INTERVAL;
    private readonly _onDidChangeValue;
    readonly onDidChangeValue: Event<IStorageValueChangeEvent>;
    private readonly _onDidChangeTarget;
    readonly onDidChangeTarget: Event<IStorageTargetChangeEvent>;
    private readonly _onWillSaveState;
    readonly onWillSaveState: Event<IWillSaveStateEvent>;
    private initializationPromise;
    private readonly flushWhenIdleScheduler;
    private readonly runFlushWhenIdle;
    constructor(options?: IStorageServiceOptions);
    private doFlushWhenIdle;
    protected shouldFlushWhenIdle(): boolean;
    protected stopFlushWhenIdle(): void;
    initialize(): Promise<void>;
    protected emitDidChangeValue(scope: StorageScope, key: string): void;
    protected emitWillSaveState(reason: WillSaveStateReason): void;
    get(key: string, scope: StorageScope, fallbackValue: string): string;
    get(key: string, scope: StorageScope): string | undefined;
    getBoolean(key: string, scope: StorageScope, fallbackValue: boolean): boolean;
    getBoolean(key: string, scope: StorageScope): boolean | undefined;
    getNumber(key: string, scope: StorageScope, fallbackValue: number): number;
    getNumber(key: string, scope: StorageScope): number | undefined;
    store(key: string, value: string | boolean | number | undefined | null, scope: StorageScope, target: StorageTarget): void;
    remove(key: string, scope: StorageScope): void;
    private withPausedEmitters;
    keys(scope: StorageScope, target: StorageTarget): string[];
    private updateKeyTarget;
    private _workspaceKeyTargets;
    private get workspaceKeyTargets();
    private _profileKeyTargets;
    private get profileKeyTargets();
    private _applicationKeyTargets;
    private get applicationKeyTargets();
    private getKeyTargets;
    private loadKeyTargets;
    isNew(scope: StorageScope): boolean;
    flush(reason?: WillSaveStateReason): Promise<void>;
    log(): Promise<void>;
    switch(to: IAnyWorkspaceIdentifier | IUserDataProfile, preserveData: boolean): Promise<void>;
    protected canSwitchProfile(from: IUserDataProfile, to: IUserDataProfile): boolean;
    protected switchData(oldStorage: Map<string, string>, newStorage: IStorage, scope: StorageScope, preserveData: boolean): void;
    abstract hasScope(scope: IAnyWorkspaceIdentifier | IUserDataProfile): boolean;
    protected abstract doInitialize(): Promise<void>;
    protected abstract getStorage(scope: StorageScope): IStorage | undefined;
    protected abstract getLogDetails(scope: StorageScope): string | undefined;
    protected abstract switchToProfile(toProfile: IUserDataProfile, preserveData: boolean): Promise<void>;
    protected abstract switchToWorkspace(toWorkspace: IAnyWorkspaceIdentifier | IUserDataProfile, preserveData: boolean): Promise<void>;
}
export declare function isProfileUsingDefaultStorage(profile: IUserDataProfile): boolean;
export declare class InMemoryStorageService extends AbstractStorageService {
    private readonly applicationStorage;
    private readonly profileStorage;
    private readonly workspaceStorage;
    constructor();
    protected getStorage(scope: StorageScope): IStorage;
    protected getLogDetails(scope: StorageScope): string | undefined;
    protected doInitialize(): Promise<void>;
    protected switchToProfile(): Promise<void>;
    protected switchToWorkspace(): Promise<void>;
    hasScope(scope: IAnyWorkspaceIdentifier | IUserDataProfile): boolean;
}
export declare function logStorage(application: Map<string, string>, profile: Map<string, string>, workspace: Map<string, string>, applicationPath: string, profilePath: string, workspacePath: string): Promise<void>;
export {};
