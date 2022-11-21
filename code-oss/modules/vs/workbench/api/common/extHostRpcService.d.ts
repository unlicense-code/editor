import { ProxyIdentifier, IRPCProtocol, Proxied } from 'vs/workbench/services/extensions/common/proxyIdentifier';
export declare const IExtHostRpcService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtHostRpcService>;
export interface IExtHostRpcService extends IRPCProtocol {
    readonly _serviceBrand: undefined;
}
export declare class ExtHostRpcService implements IExtHostRpcService {
    readonly _serviceBrand: undefined;
    readonly getProxy: <T>(identifier: ProxyIdentifier<T>) => Proxied<T>;
    readonly set: <T, R extends T>(identifier: ProxyIdentifier<T>, instance: R) => R;
    readonly dispose: () => void;
    readonly assertRegistered: (identifiers: ProxyIdentifier<any>[]) => void;
    readonly drain: () => Promise<void>;
    constructor(rpcProtocol: IRPCProtocol);
}
