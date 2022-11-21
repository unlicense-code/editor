/// <reference types="node" />
/// <reference types="node" />
import * as net from 'net';
import * as stream from 'stream';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { IDebugAdapterExecutable, IDebugAdapterNamedPipeServer, IDebugAdapterServer } from 'vs/workbench/contrib/debug/common/debug';
import { AbstractDebugAdapter } from '../common/abstractDebugAdapter';
/**
 * An implementation that communicates via two streams with the debug adapter.
 */
export declare abstract class StreamDebugAdapter extends AbstractDebugAdapter {
    private static readonly TWO_CRLF;
    private static readonly HEADER_LINESEPARATOR;
    private static readonly HEADER_FIELDSEPARATOR;
    private outputStream;
    private rawData;
    private contentLength;
    constructor();
    protected connect(readable: stream.Readable, writable: stream.Writable): void;
    sendMessage(message: DebugProtocol.ProtocolMessage): void;
    private handleData;
}
export declare abstract class NetworkDebugAdapter extends StreamDebugAdapter {
    protected socket?: net.Socket;
    protected abstract createConnection(connectionListener: () => void): net.Socket;
    startSession(): Promise<void>;
    stopSession(): Promise<void>;
}
/**
 * An implementation that connects to a debug adapter via a socket.
*/
export declare class SocketDebugAdapter extends NetworkDebugAdapter {
    private adapterServer;
    constructor(adapterServer: IDebugAdapterServer);
    protected createConnection(connectionListener: () => void): net.Socket;
}
/**
 * An implementation that connects to a debug adapter via a NamedPipe (on Windows)/UNIX Domain Socket (on non-Windows).
 */
export declare class NamedPipeDebugAdapter extends NetworkDebugAdapter {
    private adapterServer;
    constructor(adapterServer: IDebugAdapterNamedPipeServer);
    protected createConnection(connectionListener: () => void): net.Socket;
}
/**
 * An implementation that launches the debug adapter as a separate process and communicates via stdin/stdout.
*/
export declare class ExecutableDebugAdapter extends StreamDebugAdapter {
    private adapterExecutable;
    private debugType;
    private serverProcess;
    constructor(adapterExecutable: IDebugAdapterExecutable, debugType: string);
    startSession(): Promise<void>;
    stopSession(): Promise<void>;
    private static extract;
    static platformAdapterExecutable(extensionDescriptions: IExtensionDescription[], debugType: string): IDebugAdapterExecutable | undefined;
}
