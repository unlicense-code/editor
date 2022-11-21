import { Disposable } from 'vs/base/common/lifecycle';
import { IChannel, IServerChannel } from 'vs/base/parts/ipc/common/ipc';
import { IMainProcessService } from 'vs/platform/ipc/electron-sandbox/services';
/**
 * An implementation of `IMainProcessService` that leverages Electron's IPC.
 */
export declare class ElectronIPCMainProcessService extends Disposable implements IMainProcessService {
    readonly _serviceBrand: undefined;
    private mainProcessConnection;
    constructor(windowId: number);
    getChannel(channelName: string): IChannel;
    registerChannel(channelName: string, channel: IServerChannel<string>): void;
}
