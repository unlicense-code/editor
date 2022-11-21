import { URI } from 'vs/base/common/uri';
export declare function getRemoteAuthority(uri: URI): string | undefined;
export declare function getRemoteName(authority: string): string;
export declare function getRemoteName(authority: undefined): undefined;
export declare function getRemoteName(authority: string | undefined): string | undefined;
/**
 * The root path to use when accessing the remote server. The path contains the quality and commit of the current build.
 * @param product
 * @returns
 */
export declare function getRemoteServerRootPath(product: {
    quality?: string;
    commit?: string;
}): string;
export declare function parseAuthorityWithPort(authority: string): {
    host: string;
    port: number;
};
export declare function parseAuthorityWithOptionalPort(authority: string, defaultPort: number): {
    host: string;
    port: number;
};
