import type { derived } from 'vs/base/common/observableImpl/derived';
export interface IObservable<T, TChange = void> {
    readonly TChange: TChange;
    /**
     * Reads the current value.
     *
     * Must not be called from {@link IObserver.handleChange}.
     */
    get(): T;
    /**
     * Adds an observer.
     */
    addObserver(observer: IObserver): void;
    removeObserver(observer: IObserver): void;
    /**
     * Subscribes the reader to this observable and returns the current value of this observable.
     */
    read(reader: IReader): T;
    map<TNew>(fn: (value: T) => TNew): IObservable<TNew>;
    readonly debugName: string;
}
export interface IReader {
    /**
     * Reports an observable that was read.
     *
     * Is called by {@link IObservable.read}.
     */
    subscribeTo<T>(observable: IObservable<T, any>): void;
}
export interface IObserver {
    /**
     * Indicates that an update operation is about to begin.
     *
     * During an update, invariants might not hold for subscribed observables and
     * change events might be delayed.
     * However, all changes must be reported before all update operations are over.
     */
    beginUpdate<T>(observable: IObservable<T>): void;
    /**
     * Is called by a subscribed observable immediately after it notices a change.
     *
     * When {@link IObservable.get} returns and no change has been reported,
     * there has been no change for that observable.
     *
     * Implementations must not call into other observables!
     * The change should be processed when {@link IObserver.endUpdate} is called.
     */
    handleChange<T, TChange>(observable: IObservable<T, TChange>, change: TChange): void;
    /**
     * Indicates that an update operation has completed.
     */
    endUpdate<T>(observable: IObservable<T>): void;
}
export interface ISettable<T, TChange = void> {
    set(value: T, transaction: ITransaction | undefined, change: TChange): void;
}
export interface ITransaction {
    /**
     * Calls `Observer.beginUpdate` immediately
     * and `Observer.endUpdate` when the transaction is complete.
     */
    updateObserver(observer: IObserver, observable: IObservable<any, any>): void;
}
declare let _derived: typeof derived;
/**
 * @internal
 * This is to allow splitting files.
*/
export declare function _setDerived(derived: typeof _derived): void;
export declare abstract class ConvenientObservable<T, TChange> implements IObservable<T, TChange> {
    get TChange(): TChange;
    abstract get(): T;
    abstract addObserver(observer: IObserver): void;
    abstract removeObserver(observer: IObserver): void;
    /** @sealed */
    read(reader: IReader): T;
    /** @sealed */
    map<TNew>(fn: (value: T) => TNew): IObservable<TNew>;
    abstract get debugName(): string;
}
export declare abstract class BaseObservable<T, TChange = void> extends ConvenientObservable<T, TChange> {
    protected readonly observers: Set<IObserver>;
    /** @sealed */
    addObserver(observer: IObserver): void;
    /** @sealed */
    removeObserver(observer: IObserver): void;
    protected onFirstObserverAdded(): void;
    protected onLastObserverRemoved(): void;
}
export declare function transaction(fn: (tx: ITransaction) => void, getDebugName?: () => string): void;
export declare function getFunctionName(fn: Function): string | undefined;
export declare class TransactionImpl implements ITransaction {
    private readonly fn;
    private readonly _getDebugName?;
    private updatingObservers;
    constructor(fn: Function, _getDebugName?: (() => string) | undefined);
    getDebugName(): string | undefined;
    updateObserver(observer: IObserver, observable: IObservable<any>): void;
    finish(): void;
}
export interface ISettableObservable<T, TChange = void> extends IObservable<T, TChange>, ISettable<T, TChange> {
}
export declare function observableValue<T, TChange = void>(name: string, initialValue: T): ISettableObservable<T, TChange>;
export declare class ObservableValue<T, TChange = void> extends BaseObservable<T, TChange> implements ISettableObservable<T, TChange> {
    readonly debugName: string;
    private value;
    constructor(debugName: string, initialValue: T);
    get(): T;
    set(value: T, tx: ITransaction | undefined, change: TChange): void;
    toString(): string;
}
export {};
