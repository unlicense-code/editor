import { CancellationToken } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { IChannel, IServerChannel } from 'vs/base/parts/ipc/common/ipc';
import { IRequestContext, IRequestOptions } from 'vs/base/parts/request/common/request';
import { IRequestService } from 'vs/platform/request/common/request';
export declare class RequestChannel implements IServerChannel {
    private readonly service;
    constructor(service: IRequestService);
    listen(context: any, event: string): Event<any>;
    call(context: any, command: string, args?: any, token?: CancellationToken): Promise<any>;
}
export declare class RequestChannelClient implements IRequestService {
    private readonly channel;
    readonly _serviceBrand: undefined;
    constructor(channel: IChannel);
    request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
    resolveProxy(url: string): Promise<string | undefined>;
}
