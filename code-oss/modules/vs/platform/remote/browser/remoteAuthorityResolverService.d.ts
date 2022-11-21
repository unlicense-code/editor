import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IProductService } from 'vs/platform/product/common/productService';
import { IRemoteAuthorityResolverService, IRemoteConnectionData, ResolvedAuthority, ResolverResult } from 'vs/platform/remote/common/remoteAuthorityResolver';
export declare class RemoteAuthorityResolverService extends Disposable implements IRemoteAuthorityResolverService {
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeConnectionData;
    readonly onDidChangeConnectionData: import("vs/base/common/event").Event<void>;
    private readonly _promiseCache;
    private readonly _cache;
    private readonly _connectionToken;
    private readonly _connectionTokens;
    constructor(productService: IProductService, connectionToken: Promise<string> | string | undefined, resourceUriProvider: ((uri: URI) => URI) | undefined);
    resolveAuthority(authority: string): Promise<ResolverResult>;
    getCanonicalURI(uri: URI): Promise<URI>;
    getConnectionData(authority: string): IRemoteConnectionData | null;
    private _doResolveAuthority;
    _clearResolvedAuthority(authority: string): void;
    _setResolvedAuthority(resolvedAuthority: ResolvedAuthority): void;
    _setResolvedAuthorityError(authority: string, err: any): void;
    _setAuthorityConnectionToken(authority: string, connectionToken: string): void;
    _setCanonicalURIProvider(provider: (uri: URI) => Promise<URI>): void;
}
