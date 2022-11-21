import { IChannel, IServerChannel, StaticRouter } from 'vs/base/parts/ipc/common/ipc';
import { Server as MessagePortServer } from 'vs/base/parts/ipc/electron-browser/ipc.mp';
import { IMainProcessService } from 'vs/platform/ipc/electron-sandbox/services';
/**
 * An implementation of `IMainProcessService` that leverages MessagePorts.
 */
export declare class MessagePortMainProcessService implements IMainProcessService {
    private server;
    private router;
    readonly _serviceBrand: undefined;
    constructor(server: MessagePortServer, router: StaticRouter);
    getChannel(channelName: string): IChannel;
    registerChannel(channelName: string, channel: IServerChannel<string>): void;
}
