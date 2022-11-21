import { VSBuffer } from 'vs/base/common/buffer';
import { Event } from 'vs/base/common/event';
import { NodeSocket, WebSocketNodeSocket } from 'vs/base/parts/ipc/node/ipc.net';
import { ILogService } from 'vs/platform/log/common/log';
import { IRemoteExtensionHostStartParams } from 'vs/platform/remote/common/remoteAgentConnection';
import { IServerEnvironmentService } from 'vs/server/node/serverEnvironmentService';
import { IProcessEnvironment } from 'vs/base/common/platform';
import { IExtensionHostStatusService } from 'vs/server/node/extensionHostStatusService';
export declare function buildUserEnvironment(startParamsEnv: {
    [key: string]: string | null;
} | undefined, withUserShellEnvironment: boolean, language: string, environmentService: IServerEnvironmentService, logService: ILogService): Promise<IProcessEnvironment>;
export declare class ExtensionHostConnection {
    private readonly _reconnectionToken;
    private readonly _environmentService;
    private readonly _logService;
    private readonly _extensionHostStatusService;
    private _onClose;
    readonly onClose: Event<void>;
    private readonly _canSendSocket;
    private _disposed;
    private _remoteAddress;
    private _extensionHostProcess;
    private _connectionData;
    constructor(_reconnectionToken: string, remoteAddress: string, socket: NodeSocket | WebSocketNodeSocket, initialDataChunk: VSBuffer, _environmentService: IServerEnvironmentService, _logService: ILogService, _extensionHostStatusService: IExtensionHostStatusService);
    private get _logPrefix();
    private _log;
    private _logError;
    private _pipeSockets;
    private _sendSocketToExtensionHost;
    shortenReconnectionGraceTimeIfNecessary(): void;
    acceptReconnection(remoteAddress: string, _socket: NodeSocket | WebSocketNodeSocket, initialDataChunk: VSBuffer): void;
    private _cleanResources;
    start(startParams: IRemoteExtensionHostStartParams): Promise<void>;
    private _listenOnPipe;
}
