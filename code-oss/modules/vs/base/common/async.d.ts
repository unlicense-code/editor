import { CancellationToken, CancellationTokenSource } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IExtUri } from 'vs/base/common/resources';
import { URI } from 'vs/base/common/uri';
export declare function isThenable<T>(obj: unknown): obj is Promise<T>;
export interface CancelablePromise<T> extends Promise<T> {
    cancel(): void;
}
export declare function createCancelablePromise<T>(callback: (token: CancellationToken) => Promise<T>): CancelablePromise<T>;
/**
 * Returns a promise that resolves with `undefined` as soon as the passed token is cancelled.
 * @see {@link raceCancellationError}
 */
export declare function raceCancellation<T>(promise: Promise<T>, token: CancellationToken): Promise<T | undefined>;
/**
 * Returns a promise that resolves with `defaultValue` as soon as the passed token is cancelled.
 * @see {@link raceCancellationError}
 */
export declare function raceCancellation<T>(promise: Promise<T>, token: CancellationToken, defaultValue: T): Promise<T>;
/**
 * Returns a promise that rejects with an {@CancellationError} as soon as the passed token is cancelled.
 * @see {@link raceCancellation}
 */
export declare function raceCancellationError<T>(promise: Promise<T>, token: CancellationToken): Promise<T>;
/**
 * Returns as soon as one of the promises is resolved and cancels remaining promises
 */
export declare function raceCancellablePromises<T>(cancellablePromises: CancelablePromise<T>[]): Promise<T>;
export declare function raceTimeout<T>(promise: Promise<T>, timeout: number, onTimeout?: () => void): Promise<T | undefined>;
export declare function asPromise<T>(callback: () => T | Thenable<T>): Promise<T>;
export interface ITask<T> {
    (): T;
}
/**
 * A helper to prevent accumulation of sequential async tasks.
 *
 * Imagine a mail man with the sole task of delivering letters. As soon as
 * a letter submitted for delivery, he drives to the destination, delivers it
 * and returns to his base. Imagine that during the trip, N more letters were submitted.
 * When the mail man returns, he picks those N letters and delivers them all in a
 * single trip. Even though N+1 submissions occurred, only 2 deliveries were made.
 *
 * The throttler implements this via the queue() method, by providing it a task
 * factory. Following the example:
 *
 * 		const throttler = new Throttler();
 * 		const letters = [];
 *
 * 		function deliver() {
 * 			const lettersToDeliver = letters;
 * 			letters = [];
 * 			return makeTheTrip(lettersToDeliver);
 * 		}
 *
 * 		function onLetterReceived(l) {
 * 			letters.push(l);
 * 			throttler.queue(deliver);
 * 		}
 */
export declare class Throttler {
    private activePromise;
    private queuedPromise;
    private queuedPromiseFactory;
    constructor();
    queue<T>(promiseFactory: ITask<Promise<T>>): Promise<T>;
}
export declare class Sequencer {
    private current;
    queue<T>(promiseTask: ITask<Promise<T>>): Promise<T>;
}
export declare class SequencerByKey<TKey> {
    private promiseMap;
    queue<T>(key: TKey, promiseTask: ITask<Promise<T>>): Promise<T>;
}
/** Can be passed into the Delayed to defer using a microtask */
export declare const MicrotaskDelay: unique symbol;
/**
 * A helper to delay (debounce) execution of a task that is being requested often.
 *
 * Following the throttler, now imagine the mail man wants to optimize the number of
 * trips proactively. The trip itself can be long, so he decides not to make the trip
 * as soon as a letter is submitted. Instead he waits a while, in case more
 * letters are submitted. After said waiting period, if no letters were submitted, he
 * decides to make the trip. Imagine that N more letters were submitted after the first
 * one, all within a short period of time between each other. Even though N+1
 * submissions occurred, only 1 delivery was made.
 *
 * The delayer offers this behavior via the trigger() method, into which both the task
 * to be executed and the waiting period (delay) must be passed in as arguments. Following
 * the example:
 *
 * 		const delayer = new Delayer(WAITING_PERIOD);
 * 		const letters = [];
 *
 * 		function letterReceived(l) {
 * 			letters.push(l);
 * 			delayer.trigger(() => { return makeTheTrip(); });
 * 		}
 */
export declare class Delayer<T> implements IDisposable {
    defaultDelay: number | typeof MicrotaskDelay;
    private deferred;
    private completionPromise;
    private doResolve;
    private doReject;
    private task;
    constructor(defaultDelay: number | typeof MicrotaskDelay);
    trigger(task: ITask<T | Promise<T>>, delay?: number | typeof MicrotaskDelay): Promise<T>;
    isTriggered(): boolean;
    cancel(): void;
    private cancelTimeout;
    dispose(): void;
}
/**
 * A helper to delay execution of a task that is being requested often, while
 * preventing accumulation of consecutive executions, while the task runs.
 *
 * The mail man is clever and waits for a certain amount of time, before going
 * out to deliver letters. While the mail man is going out, more letters arrive
 * and can only be delivered once he is back. Once he is back the mail man will
 * do one more trip to deliver the letters that have accumulated while he was out.
 */
export declare class ThrottledDelayer<T> {
    private delayer;
    private throttler;
    constructor(defaultDelay: number);
    trigger(promiseFactory: ITask<Promise<T>>, delay?: number): Promise<T>;
    isTriggered(): boolean;
    cancel(): void;
    dispose(): void;
}
/**
 * A barrier that is initially closed and then becomes opened permanently.
 */
export declare class Barrier {
    private _isOpen;
    private _promise;
    private _completePromise;
    constructor();
    isOpen(): boolean;
    open(): void;
    wait(): Promise<boolean>;
}
/**
 * A barrier that is initially closed and then becomes opened permanently after a certain period of
 * time or when open is called explicitly
 */
export declare class AutoOpenBarrier extends Barrier {
    private readonly _timeout;
    constructor(autoOpenTimeMs: number);
    open(): void;
}
export declare function timeout(millis: number): CancelablePromise<void>;
export declare function timeout(millis: number, token: CancellationToken): Promise<void>;
export declare function disposableTimeout(handler: () => void, timeout?: number): IDisposable;
/**
 * Runs the provided list of promise factories in sequential order. The returned
 * promise will complete to an array of results from each promise.
 */
export declare function sequence<T>(promiseFactories: ITask<Promise<T>>[]): Promise<T[]>;
export declare function first<T>(promiseFactories: ITask<Promise<T>>[], shouldStop?: (t: T) => boolean, defaultValue?: T | null): Promise<T | null>;
/**
 * Returns the result of the first promise that matches the "shouldStop",
 * running all promises in parallel. Supports cancelable promises.
 */
export declare function firstParallel<T>(promiseList: Promise<T>[], shouldStop?: (t: T) => boolean, defaultValue?: T | null): Promise<T | null>;
export declare function firstParallel<T, R extends T>(promiseList: Promise<T>[], shouldStop: (t: T) => t is R, defaultValue?: R | null): Promise<R | null>;
export interface ILimiter<T> {
    readonly size: number;
    queue(factory: ITask<Promise<T>>): Promise<T>;
}
/**
 * A helper to queue N promises and run them all with a max degree of parallelism. The helper
 * ensures that at any time no more than M promises are running at the same time.
 */
export declare class Limiter<T> implements ILimiter<T> {
    private _size;
    private runningPromises;
    private readonly maxDegreeOfParalellism;
    private readonly outstandingPromises;
    private readonly _onDrained;
    constructor(maxDegreeOfParalellism: number);
    /**
     * An event that fires when every promise in the queue
     * has started to execute. In other words: no work is
     * pending to be scheduled.
     *
     * This is NOT an event that signals when all promises
     * have finished though.
     */
    get onDrained(): Event<void>;
    get size(): number;
    queue(factory: ITask<Promise<T>>): Promise<T>;
    private consume;
    private consumed;
    dispose(): void;
}
/**
 * A queue is handles one promise at a time and guarantees that at any time only one promise is executing.
 */
export declare class Queue<T> extends Limiter<T> {
    constructor();
}
/**
 * A helper to organize queues per resource. The ResourceQueue makes sure to manage queues per resource
 * by disposing them once the queue is empty.
 */
export declare class ResourceQueue implements IDisposable {
    private readonly queues;
    private readonly drainers;
    whenDrained(): Promise<void>;
    private isDrained;
    queueFor(resource: URI, extUri?: IExtUri): ILimiter<void>;
    private onDidQueueDrain;
    private releaseDrainers;
    dispose(): void;
}
export declare class TimeoutTimer implements IDisposable {
    private _token;
    constructor();
    constructor(runner: () => void, timeout: number);
    dispose(): void;
    cancel(): void;
    cancelAndSet(runner: () => void, timeout: number): void;
    setIfNotSet(runner: () => void, timeout: number): void;
}
export declare class IntervalTimer implements IDisposable {
    private _token;
    constructor();
    dispose(): void;
    cancel(): void;
    cancelAndSet(runner: () => void, interval: number): void;
}
export declare class RunOnceScheduler {
    protected runner: ((...args: unknown[]) => void) | null;
    private timeoutToken;
    private timeout;
    private timeoutHandler;
    constructor(runner: (...args: any[]) => void, delay: number);
    /**
     * Dispose RunOnceScheduler
     */
    dispose(): void;
    /**
     * Cancel current scheduled runner (if any).
     */
    cancel(): void;
    /**
     * Cancel previous runner (if any) & schedule a new runner.
     */
    schedule(delay?: number): void;
    get delay(): number;
    set delay(value: number);
    /**
     * Returns true if scheduled.
     */
    isScheduled(): boolean;
    private onTimeout;
    protected doRun(): void;
}
/**
 * Same as `RunOnceScheduler`, but doesn't count the time spent in sleep mode.
 * > **NOTE**: Only offers 1s resolution.
 *
 * When calling `setTimeout` with 3hrs, and putting the computer immediately to sleep
 * for 8hrs, `setTimeout` will fire **as soon as the computer wakes from sleep**. But
 * this scheduler will execute 3hrs **after waking the computer from sleep**.
 */
export declare class ProcessTimeRunOnceScheduler {
    private runner;
    private timeout;
    private counter;
    private intervalToken;
    private intervalHandler;
    constructor(runner: () => void, delay: number);
    dispose(): void;
    cancel(): void;
    /**
     * Cancel previous runner (if any) & schedule a new runner.
     */
    schedule(delay?: number): void;
    /**
     * Returns true if scheduled.
     */
    isScheduled(): boolean;
    private onInterval;
}
export declare class RunOnceWorker<T> extends RunOnceScheduler {
    private units;
    constructor(runner: (units: T[]) => void, timeout: number);
    work(unit: T): void;
    protected doRun(): void;
    dispose(): void;
}
export interface IThrottledWorkerOptions {
    /**
     * maximum of units the worker will pass onto handler at once
     */
    maxWorkChunkSize: number;
    /**
     * maximum of units the worker will keep in memory for processing
     */
    maxBufferedWork: number | undefined;
    /**
     * delay before processing the next round of chunks when chunk size exceeds limits
     */
    throttleDelay: number;
}
/**
 * The `ThrottledWorker` will accept units of work `T`
 * to handle. The contract is:
 * * there is a maximum of units the worker can handle at once (via `maxWorkChunkSize`)
 * * there is a maximum of units the worker will keep in memory for processing (via `maxBufferedWork`)
 * * after having handled `maxWorkChunkSize` units, the worker needs to rest (via `throttleDelay`)
 */
export declare class ThrottledWorker<T> extends Disposable {
    private options;
    private readonly handler;
    private readonly pendingWork;
    private readonly throttler;
    private disposed;
    constructor(options: IThrottledWorkerOptions, handler: (units: T[]) => void);
    /**
     * The number of work units that are pending to be processed.
     */
    get pending(): number;
    /**
     * Add units to be worked on. Use `pending` to figure out
     * how many units are not yet processed after this method
     * was called.
     *
     * @returns whether the work was accepted or not. If the
     * worker is disposed, it will not accept any more work.
     * If the number of pending units would become larger
     * than `maxPendingWork`, more work will also not be accepted.
     */
    work(units: readonly T[]): boolean;
    private doWork;
    dispose(): void;
}
export interface IdleDeadline {
    readonly didTimeout: boolean;
    timeRemaining(): number;
}
/**
 * Execute the callback the next time the browser is idle, returning an
 * {@link IDisposable} that will cancel the callback when disposed. This wraps
 * [requestIdleCallback] so it will fallback to [setTimeout] if the environment
 * doesn't support it.
 *
 * @param callback The callback to run when idle, this includes an
 * [IdleDeadline] that provides the time alloted for the idle callback by the
 * browser. Not respecting this deadline will result in a degraded user
 * experience.
 * @param timeout A timeout at which point to queue no longer wait for an idle
 * callback but queue it on the regular event loop (like setTimeout). Typically
 * this should not be used.
 *
 * [IdleDeadline]: https://developer.mozilla.org/en-US/docs/Web/API/IdleDeadline
 * [requestIdleCallback]: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback
 * [setTimeout]: https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout
 */
export declare let runWhenIdle: (callback: (idle: IdleDeadline) => void, timeout?: number) => IDisposable;
/**
 * An implementation of the "idle-until-urgent"-strategy as introduced
 * here: https://philipwalton.com/articles/idle-until-urgent/
 */
export declare class IdleValue<T> {
    private readonly _executor;
    private readonly _handle;
    private _didRun;
    private _value?;
    private _error;
    constructor(executor: () => T);
    dispose(): void;
    get value(): T;
    get isInitialized(): boolean;
}
export declare function retry<T>(task: ITask<Promise<T>>, delay: number, retries: number): Promise<T>;
interface INextTask {
    readonly promise: Promise<void>;
    readonly promiseResolve: () => void;
    readonly promiseReject: (error: Error) => void;
    run: () => Promise<void>;
}
export interface ITaskSequentializerWithPendingTask {
    readonly pending: Promise<void>;
}
export interface ITaskSequentializerWithNextTask {
    readonly next: INextTask;
}
export declare class TaskSequentializer {
    private _pending?;
    private _next?;
    hasPending(taskId?: number): this is ITaskSequentializerWithPendingTask;
    get pending(): Promise<void> | undefined;
    cancelPending(): void;
    setPending(taskId: number, promise: Promise<void>, onCancel?: () => void): Promise<void>;
    private donePending;
    private triggerNext;
    setNext(run: () => Promise<void>): Promise<void>;
    hasNext(): this is ITaskSequentializerWithNextTask;
    join(): Promise<void>;
}
/**
 * The `IntervalCounter` allows to count the number
 * of calls to `increment()` over a duration of
 * `interval`. This utility can be used to conditionally
 * throttle a frequent task when a certain threshold
 * is reached.
 */
export declare class IntervalCounter {
    private readonly interval;
    private readonly nowFn;
    private lastIncrementTime;
    private value;
    constructor(interval: number, nowFn?: () => number);
    increment(): number;
}
export declare type ValueCallback<T = unknown> = (value: T | Promise<T>) => void;
/**
 * Creates a promise whose resolution or rejection can be controlled imperatively.
 */
export declare class DeferredPromise<T> {
    private completeCallback;
    private errorCallback;
    private rejected;
    private resolved;
    get isRejected(): boolean;
    get isResolved(): boolean;
    get isSettled(): boolean;
    readonly p: Promise<T>;
    constructor();
    complete(value: T): Promise<void>;
    error(err: unknown): Promise<void>;
    cancel(): void;
}
export declare namespace Promises {
    /**
     * A drop-in replacement for `Promise.all` with the only difference
     * that the method awaits every promise to either fulfill or reject.
     *
     * Similar to `Promise.all`, only the first error will be returned
     * if any.
     */
    function settled<T>(promises: Promise<T>[]): Promise<T[]>;
    /**
     * A helper to create a new `Promise<T>` with a body that is a promise
     * itself. By default, an error that raises from the async body will
     * end up as a unhandled rejection, so this utility properly awaits the
     * body and rejects the promise as a normal promise does without async
     * body.
     *
     * This method should only be used in rare cases where otherwise `async`
     * cannot be used (e.g. when callbacks are involved that require this).
     */
    function withAsyncBody<T, E = Error>(bodyFn: (resolve: (value: T) => unknown, reject: (error: E) => unknown) => Promise<unknown>): Promise<T>;
}
/**
 * An object that allows to emit async values asynchronously or bring the iterable to an error state using `reject()`.
 * This emitter is valid only for the duration of the executor (until the promise returned by the executor settles).
 */
export interface AsyncIterableEmitter<T> {
    /**
     * The value will be appended at the end.
     *
     * **NOTE** If `reject()` has already been called, this method has no effect.
     */
    emitOne(value: T): void;
    /**
     * The values will be appended at the end.
     *
     * **NOTE** If `reject()` has already been called, this method has no effect.
     */
    emitMany(values: T[]): void;
    /**
     * Writing an error will permanently invalidate this iterable.
     * The current users will receive an error thrown, as will all future users.
     *
     * **NOTE** If `reject()` have already been called, this method has no effect.
     */
    reject(error: Error): void;
}
/**
 * An executor for the `AsyncIterableObject` that has access to an emitter.
 */
export interface AyncIterableExecutor<T> {
    /**
     * @param emitter An object that allows to emit async values valid only for the duration of the executor.
     */
    (emitter: AsyncIterableEmitter<T>): void | Promise<void>;
}
/**
 * A rich implementation for an `AsyncIterable<T>`.
 */
export declare class AsyncIterableObject<T> implements AsyncIterable<T> {
    static fromArray<T>(items: T[]): AsyncIterableObject<T>;
    static fromPromise<T>(promise: Promise<T[]>): AsyncIterableObject<T>;
    static fromPromises<T>(promises: Promise<T>[]): AsyncIterableObject<T>;
    static merge<T>(iterables: AsyncIterable<T>[]): AsyncIterableObject<T>;
    static EMPTY: AsyncIterableObject<any>;
    private _state;
    private _results;
    private _error;
    private readonly _onStateChanged;
    constructor(executor: AyncIterableExecutor<T>);
    [Symbol.asyncIterator](): AsyncIterator<T, undefined, undefined>;
    static map<T, R>(iterable: AsyncIterable<T>, mapFn: (item: T) => R): AsyncIterableObject<R>;
    map<R>(mapFn: (item: T) => R): AsyncIterableObject<R>;
    static filter<T>(iterable: AsyncIterable<T>, filterFn: (item: T) => boolean): AsyncIterableObject<T>;
    filter(filterFn: (item: T) => boolean): AsyncIterableObject<T>;
    static coalesce<T>(iterable: AsyncIterable<T | undefined | null>): AsyncIterableObject<T>;
    coalesce(): AsyncIterableObject<NonNullable<T>>;
    static toPromise<T>(iterable: AsyncIterable<T>): Promise<T[]>;
    toPromise(): Promise<T[]>;
    /**
     * The value will be appended at the end.
     *
     * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
     */
    private emitOne;
    /**
     * The values will be appended at the end.
     *
     * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
     */
    private emitMany;
    /**
     * Calling `resolve()` will mark the result array as complete.
     *
     * **NOTE** `resolve()` must be called, otherwise all consumers of this iterable will hang indefinitely, similar to a non-resolved promise.
     * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
     */
    private resolve;
    /**
     * Writing an error will permanently invalidate this iterable.
     * The current users will receive an error thrown, as will all future users.
     *
     * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
     */
    private reject;
}
export declare class CancelableAsyncIterableObject<T> extends AsyncIterableObject<T> {
    private readonly _source;
    constructor(_source: CancellationTokenSource, executor: AyncIterableExecutor<T>);
    cancel(): void;
}
export declare function createCancelableAsyncIterable<T>(callback: (token: CancellationToken) => AsyncIterable<T>): CancelableAsyncIterableObject<T>;
export {};
