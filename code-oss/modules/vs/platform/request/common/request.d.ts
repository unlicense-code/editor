import { CancellationToken } from 'vs/base/common/cancellation';
import { IRequestContext, IRequestOptions } from 'vs/base/parts/request/common/request';
import { ConfigurationScope } from 'vs/platform/configuration/common/configurationRegistry';
export declare const IRequestService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IRequestService>;
export interface IRequestService {
    readonly _serviceBrand: undefined;
    request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
    resolveProxy(url: string): Promise<string | undefined>;
}
export declare function isSuccess(context: IRequestContext): boolean;
export declare function asText(context: IRequestContext): Promise<string | null>;
export declare function asTextOrError(context: IRequestContext): Promise<string | null>;
export declare function asJson<T = {}>(context: IRequestContext): Promise<T | null>;
export interface IHTTPConfiguration {
    http?: {
        proxy?: string;
        proxyStrictSSL?: boolean;
        proxyAuthorization?: string;
    };
}
export declare function updateProxyConfigurationsScope(scope: ConfigurationScope): void;
