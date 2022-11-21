import { IChannel, IServerChannel, ProxyChannel } from 'vs/base/parts/ipc/common/ipc';
import { ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';
declare type ChannelClientCtor<T> = {
    new (channel: IChannel, ...args: any[]): T;
};
export interface IRemoteServiceWithChannelClientOptions<T> {
    readonly channelClientCtor: ChannelClientCtor<T>;
}
export interface IRemoteServiceWithProxyOptions {
    readonly proxyOptions?: ProxyChannel.ICreateProxyServiceOptions;
}
export declare const IMainProcessService: ServiceIdentifier<IMainProcessService>;
export interface IMainProcessService {
    readonly _serviceBrand: undefined;
    getChannel(channelName: string): IChannel;
    registerChannel(channelName: string, channel: IServerChannel<string>): void;
}
export declare function registerMainProcessRemoteService<T>(id: ServiceIdentifier<T>, channelName: string, options?: IRemoteServiceWithChannelClientOptions<T> | IRemoteServiceWithProxyOptions): void;
export declare const ISharedProcessService: ServiceIdentifier<ISharedProcessService>;
export interface ISharedProcessService {
    readonly _serviceBrand: undefined;
    getChannel(channelName: string): IChannel;
    registerChannel(channelName: string, channel: IServerChannel<string>): void;
    notifyRestored(): void;
}
export declare function registerSharedProcessRemoteService<T>(id: ServiceIdentifier<T>, channelName: string, options?: IRemoteServiceWithChannelClientOptions<T> | IRemoteServiceWithProxyOptions): void;
export {};
