import { INavigator } from 'vs/base/common/navigator';
export declare class HistoryNavigator<T> implements INavigator<T> {
    private _history;
    private _limit;
    private _navigator;
    constructor(history?: readonly T[], limit?: number);
    getHistory(): T[];
    add(t: T): void;
    next(): T | null;
    previous(): T | null;
    current(): T | null;
    first(): T | null;
    last(): T | null;
    has(t: T): boolean;
    clear(): void;
    private _onChange;
    private _reduceToLimit;
    private _currentPosition;
    private _initialize;
    private get _elements();
}
export declare class HistoryNavigator2<T> {
    private capacity;
    private head;
    private tail;
    private cursor;
    private size;
    constructor(history: readonly T[], capacity?: number);
    add(value: T): void;
    /**
     * @returns old last value
     */
    replaceLast(value: T): T;
    isAtEnd(): boolean;
    current(): T;
    previous(): T;
    next(): T;
    has(t: T): boolean;
    resetCursor(): T;
    [Symbol.iterator](): Iterator<T>;
}
