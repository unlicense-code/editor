import { IDisposable } from 'vs/base/common/lifecycle';
import { IConstructorSignature, BrandedService } from 'vs/platform/instantiation/common/instantiation';
import { IExtensionHostProxy } from 'vs/workbench/services/extensions/common/extensionHostProxy';
import { ExtensionHostKind, IInternalExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IRPCProtocol, ProxyIdentifier } from 'vs/workbench/services/extensions/common/proxyIdentifier';
export interface IExtHostContext extends IRPCProtocol {
    readonly remoteAuthority: string | null;
    readonly extensionHostKind: ExtensionHostKind;
}
export interface IInternalExtHostContext extends IExtHostContext {
    readonly internalExtensionService: IInternalExtensionService;
    _setExtensionHostProxy(extensionHostProxy: IExtensionHostProxy): void;
    _setAllMainProxyIdentifiers(mainProxyIdentifiers: ProxyIdentifier<any>[]): void;
}
export declare type IExtHostNamedCustomer<T extends IDisposable> = [ProxyIdentifier<T>, IExtHostCustomerCtor<T>];
export declare type IExtHostCustomerCtor<T extends IDisposable> = IConstructorSignature<T, [IExtHostContext]>;
export declare function extHostNamedCustomer<T extends IDisposable>(id: ProxyIdentifier<T>): <Services extends BrandedService[]>(ctor: new (context: IExtHostContext, ...services: Services) => T) => void;
export declare function extHostCustomer<T extends IDisposable, Services extends BrandedService[]>(ctor: {
    new (context: IExtHostContext, ...services: Services): T;
}): void;
export declare namespace ExtHostCustomersRegistry {
    function getNamedCustomers(): IExtHostNamedCustomer<IDisposable>[];
    function getCustomers(): IExtHostCustomerCtor<IDisposable>[];
}
