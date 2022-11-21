import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IProductService } from 'vs/platform/product/common/productService';
import { IRemoteAuthorityResolverService, IRemoteConnectionData, ResolvedAuthority, ResolvedOptions, ResolverResult } from 'vs/platform/remote/common/remoteAuthorityResolver';
export declare class RemoteAuthorityResolverService extends Disposable implements IRemoteAuthorityResolverService {
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeConnectionData;
    readonly onDidChangeConnectionData: import("vs/base/common/event").Event<void>;
    private readonly _resolveAuthorityRequests;
    private readonly _connectionTokens;
    private readonly _canonicalURIRequests;
    private _canonicalURIProvider;
    constructor(productService: IProductService);
    resolveAuthority(authority: string): Promise<ResolverResult>;
    getCanonicalURI(uri: URI): Promise<URI>;
    getConnectionData(authority: string): IRemoteConnectionData | null;
    _clearResolvedAuthority(authority: string): void;
    _setResolvedAuthority(resolvedAuthority: ResolvedAuthority, options?: ResolvedOptions): void;
    _setResolvedAuthorityError(authority: string, err: any): void;
    _setAuthorityConnectionToken(authority: string, connectionToken: string): void;
    _setCanonicalURIProvider(provider: (uri: URI) => Promise<URI>): void;
}
