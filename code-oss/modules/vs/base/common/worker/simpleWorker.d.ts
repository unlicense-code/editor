import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
export interface IWorker extends IDisposable {
    getId(): number;
    postMessage(message: Message, transfer: ArrayBuffer[]): void;
}
export interface IWorkerCallback {
    (message: Message): void;
}
export interface IWorkerFactory {
    create(moduleId: string, callback: IWorkerCallback, onErrorCallback: (err: any) => void): IWorker;
}
export declare function logOnceWebWorkerWarning(err: any): void;
declare const enum MessageType {
    Request = 0,
    Reply = 1,
    SubscribeEvent = 2,
    Event = 3,
    UnsubscribeEvent = 4
}
declare class RequestMessage {
    readonly vsWorker: number;
    readonly req: string;
    readonly method: string;
    readonly args: any[];
    readonly type = MessageType.Request;
    constructor(vsWorker: number, req: string, method: string, args: any[]);
}
declare class ReplyMessage {
    readonly vsWorker: number;
    readonly seq: string;
    readonly res: any;
    readonly err: any;
    readonly type = MessageType.Reply;
    constructor(vsWorker: number, seq: string, res: any, err: any);
}
declare class SubscribeEventMessage {
    readonly vsWorker: number;
    readonly req: string;
    readonly eventName: string;
    readonly arg: any;
    readonly type = MessageType.SubscribeEvent;
    constructor(vsWorker: number, req: string, eventName: string, arg: any);
}
declare class EventMessage {
    readonly vsWorker: number;
    readonly req: string;
    readonly event: any;
    readonly type = MessageType.Event;
    constructor(vsWorker: number, req: string, event: any);
}
declare class UnsubscribeEventMessage {
    readonly vsWorker: number;
    readonly req: string;
    readonly type = MessageType.UnsubscribeEvent;
    constructor(vsWorker: number, req: string);
}
declare type Message = RequestMessage | ReplyMessage | SubscribeEventMessage | EventMessage | UnsubscribeEventMessage;
export interface IWorkerClient<W> {
    getProxyObject(): Promise<W>;
    dispose(): void;
}
/**
 * Main thread side
 */
export declare class SimpleWorkerClient<W extends object, H extends object> extends Disposable implements IWorkerClient<W> {
    private readonly _worker;
    private readonly _onModuleLoaded;
    private readonly _protocol;
    private readonly _lazyProxy;
    constructor(workerFactory: IWorkerFactory, moduleId: string, host: H);
    getProxyObject(): Promise<W>;
    private _request;
    private _onError;
}
export interface IRequestHandler {
    _requestHandlerBrand: any;
    [prop: string]: any;
}
export interface IRequestHandlerFactory<H> {
    (host: H): IRequestHandler;
}
/**
 * Worker side
 */
export declare class SimpleWorkerServer<H extends object> {
    private _requestHandlerFactory;
    private _requestHandler;
    private _protocol;
    constructor(postMessage: (msg: Message, transfer?: ArrayBuffer[]) => void, requestHandlerFactory: IRequestHandlerFactory<H> | null);
    onmessage(msg: any): void;
    private _handleMessage;
    private _handleEvent;
    private initialize;
}
/**
 * Called on the worker side
 */
export declare function create(postMessage: (msg: Message, transfer?: ArrayBuffer[]) => void): SimpleWorkerServer<any>;
export {};
