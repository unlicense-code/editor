import { ErrorNoTelemetry } from 'vs/base/common/errors';
import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
export declare const IRemoteAuthorityResolverService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IRemoteAuthorityResolverService>;
export interface ResolvedAuthority {
    readonly authority: string;
    readonly host: string;
    readonly port: number;
    readonly connectionToken: string | undefined;
}
export interface ResolvedOptions {
    readonly extensionHostEnv?: {
        [key: string]: string | null;
    };
    readonly isTrusted?: boolean;
    readonly authenticationSession?: {
        id: string;
        providerId: string;
    };
}
export interface TunnelDescription {
    remoteAddress: {
        port: number;
        host: string;
    };
    localAddress: {
        port: number;
        host: string;
    } | string;
    privacy?: string;
    protocol?: string;
}
export interface TunnelPrivacy {
    themeIcon: string;
    id: string;
    label: string;
}
export interface TunnelInformation {
    environmentTunnels?: TunnelDescription[];
    features?: {
        elevation: boolean;
        public?: boolean;
        privacyOptions: TunnelPrivacy[];
    };
}
export interface ResolverResult {
    authority: ResolvedAuthority;
    options?: ResolvedOptions;
    tunnelInformation?: TunnelInformation;
}
export interface IRemoteConnectionData {
    host: string;
    port: number;
    connectionToken: string | undefined;
}
export declare enum RemoteAuthorityResolverErrorCode {
    Unknown = "Unknown",
    NotAvailable = "NotAvailable",
    TemporarilyNotAvailable = "TemporarilyNotAvailable",
    NoResolverFound = "NoResolverFound"
}
export declare class RemoteAuthorityResolverError extends ErrorNoTelemetry {
    static isNotAvailable(err: any): boolean;
    static isTemporarilyNotAvailable(err: any): boolean;
    static isNoResolverFound(err: any): err is RemoteAuthorityResolverError;
    static isHandled(err: any): boolean;
    readonly _message: string | undefined;
    readonly _code: RemoteAuthorityResolverErrorCode;
    readonly _detail: any;
    isHandled: boolean;
    constructor(message?: string, code?: RemoteAuthorityResolverErrorCode, detail?: any);
}
export interface IRemoteAuthorityResolverService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeConnectionData: Event<void>;
    resolveAuthority(authority: string): Promise<ResolverResult>;
    getConnectionData(authority: string): IRemoteConnectionData | null;
    /**
     * Get the canonical URI for a `vscode-remote://` URI.
     *
     * **NOTE**: This can throw e.g. in cases where there is no resolver installed for the specific remote authority.
     *
     * @param uri The `vscode-remote://` URI
     */
    getCanonicalURI(uri: URI): Promise<URI>;
    _clearResolvedAuthority(authority: string): void;
    _setResolvedAuthority(resolvedAuthority: ResolvedAuthority, resolvedOptions?: ResolvedOptions): void;
    _setResolvedAuthorityError(authority: string, err: any): void;
    _setAuthorityConnectionToken(authority: string, connectionToken: string): void;
    _setCanonicalURIProvider(provider: (uri: URI) => Promise<URI>): void;
}
