import { IChannel, IServerChannel } from 'vs/base/parts/ipc/common/ipc';
import { ILogService } from 'vs/platform/log/common/log';
import { Disposable } from 'vs/base/common/lifecycle';
import { ISharedProcessService } from 'vs/platform/ipc/electron-sandbox/services';
export declare class SharedProcessService extends Disposable implements ISharedProcessService {
    readonly windowId: number;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly withSharedProcessConnection;
    private readonly restoredBarrier;
    constructor(windowId: number, logService: ILogService);
    private connect;
    notifyRestored(): void;
    getChannel(channelName: string): IChannel;
    registerChannel(channelName: string, channel: IServerChannel<string>): void;
}
