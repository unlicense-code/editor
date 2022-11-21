import { VSBuffer } from 'vs/base/common/buffer';
import { Event } from 'vs/base/common/event';
import { SocketDiagnosticsEventType } from 'vs/base/parts/ipc/common/ipc.net';
import { IConnectCallback, ISocketFactory } from 'vs/platform/remote/common/remoteAgentConnection';
export interface IWebSocketFactory {
    create(url: string, debugLabel: string): IWebSocket;
}
export interface IWebSocketCloseEvent {
    /**
     * Returns the WebSocket connection close code provided by the server.
     */
    readonly code: number;
    /**
     * Returns the WebSocket connection close reason provided by the server.
     */
    readonly reason: string;
    /**
     * Returns true if the connection closed cleanly; false otherwise.
     */
    readonly wasClean: boolean;
    /**
     * Underlying event.
     */
    readonly event: any | undefined;
}
export interface IWebSocket {
    readonly onData: Event<ArrayBuffer>;
    readonly onOpen: Event<void>;
    readonly onClose: Event<IWebSocketCloseEvent | void>;
    readonly onError: Event<any>;
    traceSocketEvent?(type: SocketDiagnosticsEventType, data?: VSBuffer | Uint8Array | ArrayBuffer | ArrayBufferView | any): void;
    send(data: ArrayBuffer | ArrayBufferView): void;
    close(): void;
}
export declare class BrowserSocketFactory implements ISocketFactory {
    private readonly _webSocketFactory;
    constructor(webSocketFactory: IWebSocketFactory | null | undefined);
    connect(host: string, port: number, path: string, query: string, debugLabel: string, callback: IConnectCallback): void;
}
