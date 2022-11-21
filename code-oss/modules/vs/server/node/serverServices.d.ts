import { Event } from 'vs/base/common/event';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { IMessagePassingProtocol, IPCServer } from 'vs/base/parts/ipc/common/ipc';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { RemoteAgentConnectionContext } from 'vs/platform/remote/common/remoteAgentEnvironment';
import { ServerConnectionToken } from 'vs/server/node/serverConnectionToken';
import { ServerParsedArgs } from 'vs/server/node/serverEnvironmentService';
export declare function setupServerServices(connectionToken: ServerConnectionToken, args: ServerParsedArgs, REMOTE_DATA_FOLDER: string, disposables: DisposableStore): Promise<{
    socketServer: SocketServer<RemoteAgentConnectionContext>;
    instantiationService: IInstantiationService;
}>;
export declare class SocketServer<TContext = string> extends IPCServer<TContext> {
    private _onDidConnectEmitter;
    constructor();
    acceptConnection(protocol: IMessagePassingProtocol, onDidClientDisconnect: Event<void>): void;
}
