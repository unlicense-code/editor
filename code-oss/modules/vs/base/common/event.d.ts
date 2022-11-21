import { CancellationToken } from 'vs/base/common/cancellation';
import { DisposableStore, IDisposable, SafeDisposable } from 'vs/base/common/lifecycle';
import { LinkedList } from 'vs/base/common/linkedList';
import { IObservable } from 'vs/base/common/observable';
/**
 * To an event a function with one or zero parameters
 * can be subscribed. The event is the subscriber function itself.
 */
export interface Event<T> {
    (listener: (e: T) => any, thisArgs?: any, disposables?: IDisposable[] | DisposableStore): IDisposable;
}
export declare namespace Event {
    const None: Event<any>;
    /**
     * Given an event, returns another event which debounces calls and defers the listeners to a later task via a shared
     * `setTimeout`. The event is converted into a signal (`Event<void>`) to avoid additional object creation as a
     * result of merging events and to try prevent race conditions that could arise when using related deferred and
     * non-deferred events.
     *
     * This is useful for deferring non-critical work (eg. general UI updates) to ensure it does not block critical work
     * (eg. latency of keypress to text rendered).
     *
     * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
     * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
     * returned event causes this utility to leak a listener on the original event.
     */
    function defer(event: Event<unknown>, disposable?: DisposableStore): Event<void>;
    /**
     * Given an event, returns another event which only fires once.
     */
    function once<T>(event: Event<T>): Event<T>;
    /**
     * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
     * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
     * returned event causes this utility to leak a listener on the original event.
     */
    function map<I, O>(event: Event<I>, map: (i: I) => O, disposable?: DisposableStore): Event<O>;
    /**
     * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
     * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
     * returned event causes this utility to leak a listener on the original event.
     */
    function forEach<I>(event: Event<I>, each: (i: I) => void, disposable?: DisposableStore): Event<I>;
    /**
     * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
     * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
     * returned event causes this utility to leak a listener on the original event.
     */
    function filter<T, U>(event: Event<T | U>, filter: (e: T | U) => e is T, disposable?: DisposableStore): Event<T>;
    function filter<T>(event: Event<T>, filter: (e: T) => boolean, disposable?: DisposableStore): Event<T>;
    function filter<T, R>(event: Event<T | R>, filter: (e: T | R) => e is R, disposable?: DisposableStore): Event<R>;
    /**
     * Given an event, returns the same event but typed as `Event<void>`.
     */
    function signal<T>(event: Event<T>): Event<void>;
    /**
     * Given a collection of events, returns a single event which emits
     * whenever any of the provided events emit.
     */
    function any<T>(...events: Event<T>[]): Event<T>;
    function any(...events: Event<any>[]): Event<void>;
    /**
     * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
     * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
     * returned event causes this utility to leak a listener on the original event.
     */
    function reduce<I, O>(event: Event<I>, merge: (last: O | undefined, event: I) => O, initial?: O, disposable?: DisposableStore): Event<O>;
    /**
     * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
     * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
     * returned event causes this utility to leak a listener on the original event.
     */
    function debounce<T>(event: Event<T>, merge: (last: T | undefined, event: T) => T, delay?: number, leading?: boolean, leakWarningThreshold?: number, disposable?: DisposableStore): Event<T>;
    /**
     * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
     * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
     * returned event causes this utility to leak a listener on the original event.
     */
    function debounce<I, O>(event: Event<I>, merge: (last: O | undefined, event: I) => O, delay?: number, leading?: boolean, leakWarningThreshold?: number, disposable?: DisposableStore): Event<O>;
    /**
     * Debounces an event, firing after some delay (default=0) with an array of all event original objects.
     *
     * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
     * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
     * returned event causes this utility to leak a listener on the original event.
     */
    function accumulate<T>(event: Event<T>, delay?: number, disposable?: DisposableStore): Event<T[]>;
    /**
     * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
     * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
     * returned event causes this utility to leak a listener on the original event.
     */
    function latch<T>(event: Event<T>, equals?: (a: T, b: T) => boolean, disposable?: DisposableStore): Event<T>;
    /**
     * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
     * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
     * returned event causes this utility to leak a listener on the original event.
     */
    function split<T, U>(event: Event<T | U>, isT: (e: T | U) => e is T, disposable?: DisposableStore): [Event<T>, Event<U>];
    /**
     * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
     * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
     * returned event causes this utility to leak a listener on the original event.
     */
    function buffer<T>(event: Event<T>, flushAfterTimeout?: boolean, _buffer?: T[]): Event<T>;
    interface IChainableEvent<T> extends IDisposable {
        event: Event<T>;
        map<O>(fn: (i: T) => O): IChainableEvent<O>;
        forEach(fn: (i: T) => void): IChainableEvent<T>;
        filter(fn: (e: T) => boolean): IChainableEvent<T>;
        filter<R>(fn: (e: T | R) => e is R): IChainableEvent<R>;
        reduce<R>(merge: (last: R | undefined, event: T) => R, initial?: R): IChainableEvent<R>;
        latch(): IChainableEvent<T>;
        debounce(merge: (last: T | undefined, event: T) => T, delay?: number, leading?: boolean, leakWarningThreshold?: number): IChainableEvent<T>;
        debounce<R>(merge: (last: R | undefined, event: T) => R, delay?: number, leading?: boolean, leakWarningThreshold?: number): IChainableEvent<R>;
        on(listener: (e: T) => any, thisArgs?: any, disposables?: IDisposable[] | DisposableStore): IDisposable;
        once(listener: (e: T) => any, thisArgs?: any, disposables?: IDisposable[]): IDisposable;
    }
    function chain<T>(event: Event<T>): IChainableEvent<T>;
    interface NodeEventEmitter {
        on(event: string | symbol, listener: Function): unknown;
        removeListener(event: string | symbol, listener: Function): unknown;
    }
    function fromNodeEventEmitter<T>(emitter: NodeEventEmitter, eventName: string, map?: (...args: any[]) => T): Event<T>;
    interface DOMEventEmitter {
        addEventListener(event: string | symbol, listener: Function): void;
        removeEventListener(event: string | symbol, listener: Function): void;
    }
    function fromDOMEventEmitter<T>(emitter: DOMEventEmitter, eventName: string, map?: (...args: any[]) => T): Event<T>;
    function toPromise<T>(event: Event<T>): Promise<T>;
    function runAndSubscribe<T>(event: Event<T>, handler: (e: T | undefined) => any): IDisposable;
    function runAndSubscribeWithStore<T>(event: Event<T>, handler: (e: T | undefined, disposableStore: DisposableStore) => any): IDisposable;
    function fromObservable<T>(obs: IObservable<T, any>, store?: DisposableStore): Event<T>;
}
export interface EmitterOptions {
    /**
     * Optional function that's called *before* the very first listener is added
     */
    onWillAddFirstListener?: Function;
    /**
     * Optional function that's called *after* the very first listener is added
     */
    onDidAddFirstListener?: Function;
    /**
     * Optional function that's called after a listener is added
     */
    onDidAddListener?: Function;
    /**
     * Optional function that's called *after* remove the very last listener
     */
    onDidRemoveLastListener?: Function;
    /**
     * Number of listeners that are allowed before assuming a leak. Default to
     * a globally configured value
     *
     * @see setGlobalLeakWarningThreshold
     */
    leakWarningThreshold?: number;
    /**
     * Pass in a delivery queue, which is useful for ensuring
     * in order event delivery across multiple emitters.
     */
    deliveryQueue?: EventDeliveryQueue;
    /** ONLY enable this during development */
    _profName?: string;
}
export declare class EventProfiling {
    static readonly all: Set<EventProfiling>;
    private static _idPool;
    readonly name: string;
    listenerCount: number;
    invocationCount: number;
    elapsedOverall: number;
    durations: number[];
    private _stopWatch?;
    constructor(name: string);
    start(listenerCount: number): void;
    stop(): void;
}
export declare function setGlobalLeakWarningThreshold(n: number): IDisposable;
declare class Stacktrace {
    readonly value: string;
    static create(): Stacktrace;
    private constructor();
    print(): void;
}
declare class Listener<T> {
    readonly callback: (e: T) => void;
    readonly callbackThis: any | undefined;
    readonly stack: Stacktrace | undefined;
    readonly subscription: SafeDisposable;
    constructor(callback: (e: T) => void, callbackThis: any | undefined, stack: Stacktrace | undefined);
    invoke(e: T): void;
}
/**
 * The Emitter can be used to expose an Event to the public
 * to fire it from the insides.
 * Sample:
    class Document {

        private readonly _onDidChange = new Emitter<(value:string)=>any>();

        public onDidChange = this._onDidChange.event;

        // getter-style
        // get onDidChange(): Event<(value:string)=>any> {
        // 	return this._onDidChange.event;
        // }

        private _doIt() {
            //...
            this._onDidChange.fire(value);
        }
    }
 */
export declare class Emitter<T> {
    private readonly _options?;
    private readonly _leakageMon?;
    private readonly _perfMon?;
    private _disposed;
    private _event?;
    private _deliveryQueue?;
    protected _listeners?: LinkedList<Listener<T>>;
    constructor(options?: EmitterOptions);
    dispose(): void;
    /**
     * For the public to allow to subscribe
     * to events from this Emitter
     */
    get event(): Event<T>;
    /**
     * To be kept private to fire an event to
     * subscribers
     */
    fire(event: T): void;
    hasListeners(): boolean;
}
export declare class EventDeliveryQueue {
    protected _queue: LinkedList<EventDeliveryQueueElement<any>>;
    get size(): number;
    push<T>(emitter: Emitter<T>, listener: Listener<T>, event: T): void;
    clear<T>(emitter: Emitter<T>): void;
    deliver(): void;
}
declare class EventDeliveryQueueElement<T = any> {
    readonly emitter: Emitter<T>;
    readonly listener: Listener<T>;
    readonly event: T;
    constructor(emitter: Emitter<T>, listener: Listener<T>, event: T);
}
export interface IWaitUntil {
    token: CancellationToken;
    waitUntil(thenable: Promise<unknown>): void;
}
export declare type IWaitUntilData<T> = Omit<Omit<T, 'waitUntil'>, 'token'>;
export declare class AsyncEmitter<T extends IWaitUntil> extends Emitter<T> {
    private _asyncDeliveryQueue?;
    fireAsync(data: IWaitUntilData<T>, token: CancellationToken, promiseJoin?: (p: Promise<unknown>, listener: Function) => Promise<unknown>): Promise<void>;
}
export declare class PauseableEmitter<T> extends Emitter<T> {
    private _isPaused;
    protected _eventQueue: LinkedList<T>;
    private _mergeFn?;
    constructor(options?: EmitterOptions & {
        merge?: (input: T[]) => T;
    });
    pause(): void;
    resume(): void;
    fire(event: T): void;
}
export declare class DebounceEmitter<T> extends PauseableEmitter<T> {
    private readonly _delay;
    private _handle;
    constructor(options: EmitterOptions & {
        merge: (input: T[]) => T;
        delay?: number;
    });
    fire(event: T): void;
}
/**
 * An emitter which queue all events and then process them at the
 * end of the event loop.
 */
export declare class MicrotaskEmitter<T> extends Emitter<T> {
    private _queuedEvents;
    private _mergeFn?;
    constructor(options?: EmitterOptions & {
        merge?: (input: T[]) => T;
    });
    fire(event: T): void;
}
export declare class EventMultiplexer<T> implements IDisposable {
    private readonly emitter;
    private hasListeners;
    private events;
    constructor();
    get event(): Event<T>;
    add(event: Event<T>): IDisposable;
    private onFirstListenerAdd;
    private onLastListenerRemove;
    private hook;
    private unhook;
    dispose(): void;
}
/**
 * The EventBufferer is useful in situations in which you want
 * to delay firing your events during some code.
 * You can wrap that code and be sure that the event will not
 * be fired during that wrap.
 *
 * ```
 * const emitter: Emitter;
 * const delayer = new EventDelayer();
 * const delayedEvent = delayer.wrapEvent(emitter.event);
 *
 * delayedEvent(console.log);
 *
 * delayer.bufferEvents(() => {
 *   emitter.fire(); // event will not be fired yet
 * });
 *
 * // event will only be fired at this point
 * ```
 */
export declare class EventBufferer {
    private buffers;
    wrapEvent<T>(event: Event<T>): Event<T>;
    bufferEvents<R = void>(fn: () => R): R;
}
/**
 * A Relay is an event forwarder which functions as a replugabble event pipe.
 * Once created, you can connect an input event to it and it will simply forward
 * events from that input event through its own `event` property. The `input`
 * can be changed at any point in time.
 */
export declare class Relay<T> implements IDisposable {
    private listening;
    private inputEvent;
    private inputEventListener;
    private readonly emitter;
    readonly event: Event<T>;
    set input(event: Event<T>);
    dispose(): void;
}
export {};
