import { IReader, IObservable, BaseObservable, IObserver } from 'vs/base/common/observableImpl/base';
export declare function derived<T>(debugName: string | (() => string), computeFn: (reader: IReader) => T): IObservable<T>;
export declare class Derived<T> extends BaseObservable<T, void> implements IReader, IObserver {
    private readonly _debugName;
    private readonly computeFn;
    private hadValue;
    private hasValue;
    private value;
    private updateCount;
    private _dependencies;
    get dependencies(): ReadonlySet<IObservable<any>>;
    /**
     * Dependencies that have to be removed when {@link runFn} ran through.
     */
    private staleDependencies;
    get debugName(): string;
    constructor(_debugName: string | (() => string), computeFn: (reader: IReader) => T);
    protected onLastObserverRemoved(): void;
    get(): T;
    beginUpdate(): void;
    handleChange<T, TChange>(_observable: IObservable<T, TChange>, _change: TChange): void;
    endUpdate(): void;
    subscribeTo<T>(observable: IObservable<T>): void;
    toString(): string;
}
