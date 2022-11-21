import { PersistentProtocol, ISocket } from 'vs/base/parts/ipc/common/ipc.net';
import { ILogService } from 'vs/platform/log/common/log';
import { Event } from 'vs/base/common/event';
import { VSBuffer } from 'vs/base/common/buffer';
export declare class ManagementConnection {
    private readonly _logService;
    private readonly _reconnectionToken;
    private _onClose;
    readonly onClose: Event<void>;
    private readonly _reconnectionGraceTime;
    private readonly _reconnectionShortGraceTime;
    private _remoteAddress;
    readonly protocol: PersistentProtocol;
    private _disposed;
    private _disconnectRunner1;
    private _disconnectRunner2;
    constructor(_logService: ILogService, _reconnectionToken: string, remoteAddress: string, protocol: PersistentProtocol);
    private _log;
    shortenReconnectionGraceTimeIfNecessary(): void;
    private _cleanResources;
    acceptReconnection(remoteAddress: string, socket: ISocket, initialDataChunk: VSBuffer): void;
}
