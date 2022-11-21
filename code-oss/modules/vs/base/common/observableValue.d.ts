import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
/**
 * @deprecated Use {@link IObservable} instead.
 */
export interface IObservableValue<T> {
    onDidChange: Event<T>;
    readonly value: T;
}
/**
 * @deprecated Use {@link IObservable} instead.
 */
export declare const staticObservableValue: <T>(value: T) => IObservableValue<T>;
/**
 * @deprecated Use {@link IObservable} instead.
 */
export declare class MutableObservableValue<T> extends Disposable implements IObservableValue<T> {
    private _value;
    private readonly changeEmitter;
    readonly onDidChange: Event<T>;
    get value(): T;
    set value(v: T);
    constructor(_value: T);
}
