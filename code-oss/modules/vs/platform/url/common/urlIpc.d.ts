import { CancellationToken } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
import { Client, IChannel, IClientRouter, IConnectionHub, IServerChannel } from 'vs/base/parts/ipc/common/ipc';
import { IOpenURLOptions, IURLHandler } from 'vs/platform/url/common/url';
export declare class URLHandlerChannel implements IServerChannel {
    private handler;
    constructor(handler: IURLHandler);
    listen<T>(_: unknown, event: string): Event<T>;
    call(_: unknown, command: string, arg?: any): Promise<any>;
}
export declare class URLHandlerChannelClient implements IURLHandler {
    private channel;
    constructor(channel: IChannel);
    handleURL(uri: URI, options?: IOpenURLOptions): Promise<boolean>;
}
export declare class URLHandlerRouter implements IClientRouter<string> {
    private next;
    constructor(next: IClientRouter<string>);
    routeCall(hub: IConnectionHub<string>, command: string, arg?: any, cancellationToken?: CancellationToken): Promise<Client<string>>;
    routeEvent(_: IConnectionHub<string>, event: string): Promise<Client<string>>;
}
