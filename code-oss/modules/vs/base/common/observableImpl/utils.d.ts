import { DisposableStore, IDisposable } from 'vs/base/common/lifecycle';
import { IObservable, BaseObservable, IReader, ITransaction } from 'vs/base/common/observableImpl/base';
import { Event } from 'vs/base/common/event';
export declare function constObservable<T>(value: T): IObservable<T>;
export declare function observableFromPromise<T>(promise: Promise<T>): IObservable<{
    value?: T;
}>;
export declare function waitForState<T, TState extends T>(observable: IObservable<T>, predicate: (state: T) => state is TState): Promise<TState>;
export declare function waitForState<T>(observable: IObservable<T>, predicate: (state: T) => boolean): Promise<T>;
export declare function observableFromEvent<T, TArgs = unknown>(event: Event<TArgs>, getValue: (args: TArgs | undefined) => T): IObservable<T>;
export declare class FromEventObservable<TArgs, T> extends BaseObservable<T> {
    private readonly event;
    private readonly getValue;
    private value;
    private hasValue;
    private subscription;
    constructor(event: Event<TArgs>, getValue: (args: TArgs | undefined) => T);
    private getDebugName;
    get debugName(): string;
    protected onFirstObserverAdded(): void;
    private readonly handleEvent;
    protected onLastObserverRemoved(): void;
    get(): T;
}
export declare namespace observableFromEvent {
    const Observer: typeof FromEventObservable;
}
export declare function observableSignalFromEvent(debugName: string, event: Event<any>): IObservable<void>;
export declare function observableSignal(debugName: string): IObservableSignal;
export interface IObservableSignal extends IObservable<void> {
    trigger(tx: ITransaction | undefined): void;
}
export declare function debouncedObservable<T>(observable: IObservable<T>, debounceMs: number, disposableStore: DisposableStore): IObservable<T | undefined>;
export declare function wasEventTriggeredRecently(event: Event<any>, timeoutMs: number, disposableStore: DisposableStore): IObservable<boolean>;
/**
 * This ensures the observable is kept up-to-date.
 * This is useful when the observables `get` method is used.
*/
export declare function keepAlive(observable: IObservable<any>): IDisposable;
export declare function derivedObservableWithCache<T>(name: string, computeFn: (reader: IReader, lastValue: T | undefined) => T): IObservable<T>;
export declare function derivedObservableWithWritableCache<T>(name: string, computeFn: (reader: IReader, lastValue: T | undefined) => T): IObservable<T> & {
    clearCache(transaction: ITransaction): void;
};
