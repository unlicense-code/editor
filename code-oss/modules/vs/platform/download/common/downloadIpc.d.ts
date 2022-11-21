import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
import { IURITransformer } from 'vs/base/common/uriIpc';
import { IChannel, IServerChannel } from 'vs/base/parts/ipc/common/ipc';
import { IDownloadService } from 'vs/platform/download/common/download';
export declare class DownloadServiceChannel implements IServerChannel {
    private readonly service;
    constructor(service: IDownloadService);
    listen(_: unknown, event: string, arg?: any): Event<any>;
    call(context: any, command: string, args?: any): Promise<any>;
}
export declare class DownloadServiceChannelClient implements IDownloadService {
    private channel;
    private getUriTransformer;
    readonly _serviceBrand: undefined;
    constructor(channel: IChannel, getUriTransformer: () => IURITransformer | null);
    download(from: URI, to: URI): Promise<void>;
}
