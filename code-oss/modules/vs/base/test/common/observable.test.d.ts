import { ISettableObservable, ITransaction } from 'vs/base/common/observable';
import { BaseObservable, IObservable, IObserver } from 'vs/base/common/observableImpl/base';
export declare class LoggingObserver implements IObserver {
    readonly debugName: string;
    private readonly log;
    private count;
    constructor(debugName: string, log: Log);
    beginUpdate<T>(observable: IObservable<T, void>): void;
    handleChange<T, TChange>(observable: IObservable<T, TChange>, change: TChange): void;
    endUpdate<T>(observable: IObservable<T, void>): void;
}
export declare class LoggingObservableValue<T, TChange = void> extends BaseObservable<T, TChange> implements ISettableObservable<T, TChange> {
    readonly debugName: string;
    private readonly log;
    private value;
    constructor(debugName: string, initialValue: T, log: Log);
    protected onFirstObserverAdded(): void;
    protected onLastObserverRemoved(): void;
    get(): T;
    set(value: T, tx: ITransaction | undefined, change: TChange): void;
    toString(): string;
}
declare class Log {
    private readonly entries;
    log(message: string): void;
    getAndClearEntries(): string[];
}
export {};
