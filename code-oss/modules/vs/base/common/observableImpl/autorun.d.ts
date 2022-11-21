import { DisposableStore, IDisposable } from 'vs/base/common/lifecycle';
import { IReader, IObservable, IObserver } from 'vs/base/common/observableImpl/base';
export declare function autorun(debugName: string, fn: (reader: IReader) => void): IDisposable;
interface IChangeContext {
    readonly changedObservable: IObservable<any, any>;
    readonly change: unknown;
    didChange<T, TChange>(observable: IObservable<T, TChange>): this is {
        change: TChange;
    };
}
export declare function autorunHandleChanges(debugName: string, options: {
    /**
     * Returns if this change should cause a re-run of the autorun.
    */
    handleChange: (context: IChangeContext) => boolean;
}, fn: (reader: IReader) => void): IDisposable;
export declare function autorunWithStore(fn: (reader: IReader, store: DisposableStore) => void, debugName: string): IDisposable;
export declare class AutorunObserver implements IObserver, IReader, IDisposable {
    readonly debugName: string;
    private readonly runFn;
    private readonly _handleChange;
    needsToRun: boolean;
    private updateCount;
    private disposed;
    /**
     * The actual dependencies.
    */
    private _dependencies;
    get dependencies(): Set<IObservable<any, void>>;
    /**
     * Dependencies that have to be removed when {@link runFn} ran through.
    */
    private staleDependencies;
    constructor(debugName: string, runFn: (reader: IReader) => void, _handleChange: ((context: IChangeContext) => boolean) | undefined);
    subscribeTo<T>(observable: IObservable<T>): void;
    handleChange<T, TChange>(observable: IObservable<T, TChange>, change: TChange): void;
    beginUpdate(): void;
    endUpdate(): void;
    private runIfNeeded;
    dispose(): void;
    toString(): string;
}
export declare namespace autorun {
    const Observer: typeof AutorunObserver;
}
export declare function autorunDelta<T>(name: string, observable: IObservable<T>, handler: (args: {
    lastValue: T | undefined;
    newValue: T;
}) => void): IDisposable;
export {};
