import { Event } from 'vs/base/common/event';
import { IChannel, IServerChannel } from 'vs/base/parts/ipc/common/ipc';
import { IUpdateService, State } from 'vs/platform/update/common/update';
export declare class UpdateChannel implements IServerChannel {
    private service;
    constructor(service: IUpdateService);
    listen(_: unknown, event: string): Event<any>;
    call(_: unknown, command: string, arg?: any): Promise<any>;
}
export declare class UpdateChannelClient implements IUpdateService {
    private readonly channel;
    readonly _serviceBrand: undefined;
    private readonly _onStateChange;
    readonly onStateChange: Event<State>;
    private _state;
    get state(): State;
    set state(state: State);
    constructor(channel: IChannel);
    checkForUpdates(explicit: boolean): Promise<void>;
    downloadUpdate(): Promise<void>;
    applyUpdate(): Promise<void>;
    quitAndInstall(): Promise<void>;
    isLatestVersion(): Promise<boolean>;
    _applySpecificUpdate(packagePath: string): Promise<void>;
}
