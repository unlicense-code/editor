import { Proxied, ProxyIdentifier } from 'vs/workbench/services/extensions/common/proxyIdentifier';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { ExtensionHostKind } from 'vs/workbench/services/extensions/common/extensions';
export declare function SingleProxyRPCProtocol(thing: any): IExtHostContext & IExtHostRpcService;
export declare class TestRPCProtocol implements IExtHostContext, IExtHostRpcService {
    _serviceBrand: undefined;
    remoteAuthority: never;
    extensionHostKind: ExtensionHostKind;
    private _callCountValue;
    private _idle?;
    private _completeIdle?;
    private readonly _locals;
    private readonly _proxies;
    constructor();
    drain(): Promise<void>;
    private get _callCount();
    private set _callCount(value);
    sync(): Promise<any>;
    getProxy<T>(identifier: ProxyIdentifier<T>): Proxied<T>;
    private _createProxy;
    set<T, R extends T>(identifier: ProxyIdentifier<T>, value: R): R;
    protected _remoteCall(proxyId: string, path: string, args: any[]): Promise<any>;
    dispose(): void;
    assertRegistered(identifiers: ProxyIdentifier<any>[]): void;
}
