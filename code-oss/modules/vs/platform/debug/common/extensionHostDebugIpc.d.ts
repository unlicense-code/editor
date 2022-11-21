import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IChannel, IServerChannel } from 'vs/base/parts/ipc/common/ipc';
import { IAttachSessionEvent, ICloseSessionEvent, IExtensionHostDebugService, IOpenExtensionWindowResult, IReloadSessionEvent, ITerminateSessionEvent } from 'vs/platform/debug/common/extensionHostDebug';
export declare class ExtensionHostDebugBroadcastChannel<TContext> implements IServerChannel<TContext> {
    static readonly ChannelName = "extensionhostdebugservice";
    private readonly _onCloseEmitter;
    private readonly _onReloadEmitter;
    private readonly _onTerminateEmitter;
    private readonly _onAttachEmitter;
    call(ctx: TContext, command: string, arg?: any): Promise<any>;
    listen(ctx: TContext, event: string, arg?: any): Event<any>;
}
export declare class ExtensionHostDebugChannelClient extends Disposable implements IExtensionHostDebugService {
    private channel;
    readonly _serviceBrand: undefined;
    constructor(channel: IChannel);
    reload(sessionId: string): void;
    get onReload(): Event<IReloadSessionEvent>;
    close(sessionId: string): void;
    get onClose(): Event<ICloseSessionEvent>;
    attachSession(sessionId: string, port: number, subId?: string): void;
    get onAttachSession(): Event<IAttachSessionEvent>;
    terminateSession(sessionId: string, subId?: string): void;
    get onTerminateSession(): Event<ITerminateSessionEvent>;
    openExtensionDevelopmentHostWindow(args: string[], debugRenderer: boolean): Promise<IOpenExtensionWindowResult>;
}
