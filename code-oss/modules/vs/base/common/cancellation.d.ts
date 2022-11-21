import { IDisposable } from 'vs/base/common/lifecycle';
export interface CancellationToken {
    /**
     * A flag signalling is cancellation has been requested.
     */
    readonly isCancellationRequested: boolean;
    /**
     * An event which fires when cancellation is requested. This event
     * only ever fires `once` as cancellation can only happen once. Listeners
     * that are registered after cancellation will be called (next event loop run),
     * but also only once.
     *
     * @event
     */
    readonly onCancellationRequested: (listener: (e: any) => any, thisArgs?: any, disposables?: IDisposable[]) => IDisposable;
}
export declare namespace CancellationToken {
    function isCancellationToken(thing: unknown): thing is CancellationToken;
    const None: Readonly<CancellationToken>;
    const Cancelled: Readonly<CancellationToken>;
}
export declare class CancellationTokenSource {
    private _token?;
    private _parentListener?;
    constructor(parent?: CancellationToken);
    get token(): CancellationToken;
    cancel(): void;
    dispose(cancel?: boolean): void;
}
