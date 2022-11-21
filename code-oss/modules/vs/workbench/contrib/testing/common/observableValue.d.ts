import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { StoredValue } from 'vs/workbench/contrib/testing/common/storedValue';
export interface IObservableValue<T> {
    onDidChange: Event<T>;
    readonly value: T;
}
export declare const staticObservableValue: <T>(value: T) => IObservableValue<T>;
export declare class MutableObservableValue<T> extends Disposable implements IObservableValue<T> {
    private _value;
    private readonly changeEmitter;
    readonly onDidChange: Event<T>;
    get value(): T;
    set value(v: T);
    static stored<T>(stored: StoredValue<T>, defaultValue: T): MutableObservableValue<T>;
    constructor(_value: T);
}
