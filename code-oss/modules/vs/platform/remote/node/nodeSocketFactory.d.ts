import { IConnectCallback } from 'vs/platform/remote/common/remoteAgentConnection';
export declare const nodeSocketFactory: {
    connect(host: string, port: number, path: string, query: string, debugLabel: string, callback: IConnectCallback): void;
};
