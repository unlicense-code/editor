export interface IDisposableTracker {
    /**
     * Is called on construction of a disposable.
    */
    trackDisposable(disposable: IDisposable): void;
    /**
     * Is called when a disposable is registered as child of another disposable (e.g. {@link DisposableStore}).
     * If parent is `null`, the disposable is removed from its former parent.
    */
    setParent(child: IDisposable, parent: IDisposable | null): void;
    /**
     * Is called after a disposable is disposed.
    */
    markAsDisposed(disposable: IDisposable): void;
    /**
     * Indicates that the given object is a singleton which does not need to be disposed.
    */
    markAsSingleton(disposable: IDisposable): void;
}
export declare function setDisposableTracker(tracker: IDisposableTracker | null): void;
/**
 * Indicates that the given object is a singleton which does not need to be disposed.
*/
export declare function markAsSingleton<T extends IDisposable>(singleton: T): T;
/**
 * An object that performs a cleanup operation when `.dispose()` is called.
 *
 * Some examples of how disposables are used:
 *
 * - An event listener that removes itself when `.dispose()` is called.
 * - A resource such as a file system watcher that cleans up the resource when `.dispose()` is called.
 * - The return value from registering a provider. When `.dispose()` is called, the provider is unregistered.
 */
export interface IDisposable {
    dispose(): void;
}
/**
 * Check if `thing` is {@link IDisposable disposable}.
 */
export declare function isDisposable<E extends object>(thing: E): thing is E & IDisposable;
/**
 * Disposes of the value(s) passed in.
 */
export declare function dispose<T extends IDisposable>(disposable: T): T;
export declare function dispose<T extends IDisposable>(disposable: T | undefined): T | undefined;
export declare function dispose<T extends IDisposable, A extends Iterable<T> = Iterable<T>>(disposables: A): A;
export declare function dispose<T extends IDisposable>(disposables: Array<T>): Array<T>;
export declare function dispose<T extends IDisposable>(disposables: ReadonlyArray<T>): ReadonlyArray<T>;
export declare function disposeIfDisposable<T extends IDisposable | object>(disposables: Array<T>): Array<T>;
/**
 * Combine multiple disposable values into a single {@link IDisposable}.
 */
export declare function combinedDisposable(...disposables: IDisposable[]): IDisposable;
/**
 * Turn a function that implements dispose into an {@link IDisposable}.
 */
export declare function toDisposable(fn: () => void): IDisposable;
/**
 * Manages a collection of disposable values.
 *
 * This is the preferred way to manage multiple disposables. A `DisposableStore` is safer to work with than an
 * `IDisposable[]` as it considers edge cases, such as registering the same value multiple times or adding an item to a
 * store that has already been disposed of.
 */
export declare class DisposableStore implements IDisposable {
    static DISABLE_DISPOSED_WARNING: boolean;
    private readonly _toDispose;
    private _isDisposed;
    constructor();
    /**
     * Dispose of all registered disposables and mark this object as disposed.
     *
     * Any future disposables added to this object will be disposed of on `add`.
     */
    dispose(): void;
    /**
     * @return `true` if this object has been disposed of.
     */
    get isDisposed(): boolean;
    /**
     * Dispose of all registered disposables but do not mark this object as disposed.
     */
    clear(): void;
    /**
     * Add a new {@link IDisposable disposable} to the collection.
     */
    add<T extends IDisposable>(o: T): T;
}
/**
 * Abstract base class for a {@link IDisposable disposable} object.
 *
 * Subclasses can {@linkcode _register} disposables that will be automatically cleaned up when this object is disposed of.
 */
export declare abstract class Disposable implements IDisposable {
    /**
     * A disposable that does nothing when it is disposed of.
     *
     * TODO: This should not be a static property.
     */
    static readonly None: Readonly<IDisposable>;
    protected readonly _store: DisposableStore;
    constructor();
    dispose(): void;
    /**
     * Adds `o` to the collection of disposables managed by this object.
     */
    protected _register<T extends IDisposable>(o: T): T;
}
/**
 * Manages the lifecycle of a disposable value that may be changed.
 *
 * This ensures that when the disposable value is changed, the previously held disposable is disposed of. You can
 * also register a `MutableDisposable` on a `Disposable` to ensure it is automatically cleaned up.
 */
export declare class MutableDisposable<T extends IDisposable> implements IDisposable {
    private _value?;
    private _isDisposed;
    constructor();
    get value(): T | undefined;
    set value(value: T | undefined);
    /**
     * Resets the stored value and disposed of the previously stored value.
     */
    clear(): void;
    dispose(): void;
    /**
     * Clears the value, but does not dispose it.
     * The old value is returned.
    */
    clearAndLeak(): T | undefined;
}
export declare class RefCountedDisposable {
    private readonly _disposable;
    private _counter;
    constructor(_disposable: IDisposable);
    acquire(): this;
    release(): this;
}
/**
 * A safe disposable can be `unset` so that a leaked reference (listener)
 * can be cut-off.
 */
export declare class SafeDisposable implements IDisposable {
    dispose: () => void;
    unset: () => void;
    isset: () => boolean;
    constructor();
    set(fn: Function): this;
}
export interface IReference<T> extends IDisposable {
    readonly object: T;
}
export declare abstract class ReferenceCollection<T> {
    private readonly references;
    acquire(key: string, ...args: any[]): IReference<T>;
    protected abstract createReferencedObject(key: string, ...args: any[]): T;
    protected abstract destroyReferencedObject(key: string, object: T): void;
}
/**
 * Unwraps a reference collection of promised values. Makes sure
 * references are disposed whenever promises get rejected.
 */
export declare class AsyncReferenceCollection<T> {
    private referenceCollection;
    constructor(referenceCollection: ReferenceCollection<Promise<T>>);
    acquire(key: string, ...args: any[]): Promise<IReference<T>>;
}
export declare class ImmortalReference<T> implements IReference<T> {
    object: T;
    constructor(object: T);
    dispose(): void;
}
export declare function disposeOnReturn(fn: (store: DisposableStore) => void): void;
/**
 * A map the manages the lifecycle of the values that it stores.
 */
export declare class DisposableMap<K, V extends IDisposable = IDisposable> implements IDisposable {
    private readonly _store;
    private _isDisposed;
    constructor();
    /**
     * Disposes of all stored values and mark this object as disposed.
     *
     * Trying to use this object after it has been disposed of is an error.
     */
    dispose(): void;
    /**
     * Disposes of all stored values and clear the map, but DO NOT mark this object as disposed.
     */
    clearAndDisposeAll(): void;
    has(key: K): boolean;
    get(key: K): V | undefined;
    set(key: K, value: V, skipDisposeOnOverwrite?: boolean): void;
    /**
     * Delete the value stored for `key` from this map and also dispose of it.
     */
    deleteAndDispose(key: K): void;
    [Symbol.iterator](): IterableIterator<[K, V]>;
}
