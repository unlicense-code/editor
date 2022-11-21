import { URI } from 'vs/base/common/uri';
export declare namespace Schemas {
    /**
     * A schema that is used for models that exist in memory
     * only and that have no correspondence on a server or such.
     */
    const inMemory = "inmemory";
    /**
     * A schema that is used for setting files
     */
    const vscode = "vscode";
    /**
     * A schema that is used for internal private files
     */
    const internal = "private";
    /**
     * A walk-through document.
     */
    const walkThrough = "walkThrough";
    /**
     * An embedded code snippet.
     */
    const walkThroughSnippet = "walkThroughSnippet";
    const http = "http";
    const https = "https";
    const file = "file";
    const mailto = "mailto";
    const untitled = "untitled";
    const data = "data";
    const command = "command";
    const vscodeRemote = "vscode-remote";
    const vscodeRemoteResource = "vscode-remote-resource";
    const vscodeUserData = "vscode-userdata";
    const vscodeCustomEditor = "vscode-custom-editor";
    const vscodeNotebook = "vscode-notebook";
    const vscodeNotebookCell = "vscode-notebook-cell";
    const vscodeNotebookCellMetadata = "vscode-notebook-cell-metadata";
    const vscodeNotebookCellOutput = "vscode-notebook-cell-output";
    const vscodeInteractive = "vscode-interactive";
    const vscodeInteractiveInput = "vscode-interactive-input";
    const vscodeSettings = "vscode-settings";
    const vscodeWorkspaceTrust = "vscode-workspace-trust";
    const vscodeTerminal = "vscode-terminal";
    /**
     * Scheme used internally for webviews that aren't linked to a resource (i.e. not custom editors)
     */
    const webviewPanel = "webview-panel";
    /**
     * Scheme used for loading the wrapper html and script in webviews.
     */
    const vscodeWebview = "vscode-webview";
    /**
     * Scheme used for extension pages
     */
    const extension = "extension";
    /**
     * Scheme used as a replacement of `file` scheme to load
     * files with our custom protocol handler (desktop only).
     */
    const vscodeFileResource = "vscode-file";
    /**
     * Scheme used for temporary resources
     */
    const tmp = "tmp";
    /**
     * Scheme used vs live share
     */
    const vsls = "vsls";
    /**
     * Scheme used for the Source Control commit input's text document
     */
    const vscodeSourceControl = "vscode-scm";
}
export declare const connectionTokenCookieName = "vscode-tkn";
export declare const connectionTokenQueryName = "tkn";
declare class RemoteAuthoritiesImpl {
    private readonly _hosts;
    private readonly _ports;
    private readonly _connectionTokens;
    private _preferredWebSchema;
    private _delegate;
    private _remoteResourcesPath;
    setPreferredWebSchema(schema: 'http' | 'https'): void;
    setDelegate(delegate: (uri: URI) => URI): void;
    setServerRootPath(serverRootPath: string): void;
    set(authority: string, host: string, port: number): void;
    setConnectionToken(authority: string, connectionToken: string): void;
    getPreferredWebSchema(): 'http' | 'https';
    rewrite(uri: URI): URI;
}
export declare const RemoteAuthorities: RemoteAuthoritiesImpl;
/**
 * A string pointing to a path inside the app. It should not begin with ./ or ../
 */
export declare type AppResourcePath = (`a${string}` | `b${string}` | `c${string}` | `d${string}` | `e${string}` | `f${string}` | `g${string}` | `h${string}` | `i${string}` | `j${string}` | `k${string}` | `l${string}` | `m${string}` | `n${string}` | `o${string}` | `p${string}` | `q${string}` | `r${string}` | `s${string}` | `t${string}` | `u${string}` | `v${string}` | `w${string}` | `x${string}` | `y${string}` | `z${string}`);
export declare const builtinExtensionsPath: AppResourcePath;
export declare const nodeModulesPath: AppResourcePath;
export declare const nodeModulesAsarPath: AppResourcePath;
export declare const nodeModulesAsarUnpackedPath: AppResourcePath;
declare class FileAccessImpl {
    private static readonly FALLBACK_AUTHORITY;
    /**
     * Returns a URI to use in contexts where the browser is responsible
     * for loading (e.g. fetch()) or when used within the DOM.
     *
     * **Note:** use `dom.ts#asCSSUrl` whenever the URL is to be used in CSS context.
     */
    asBrowserUri(resourcePath: AppResourcePath | ''): URI;
    /**
     * Returns a URI to use in contexts where the browser is responsible
     * for loading (e.g. fetch()) or when used within the DOM.
     *
     * **Note:** use `dom.ts#asCSSUrl` whenever the URL is to be used in CSS context.
     */
    uriToBrowserUri(uri: URI): URI;
    /**
     * Returns the `file` URI to use in contexts where node.js
     * is responsible for loading.
     */
    asFileUri(resourcePath: AppResourcePath | ''): URI;
    /**
     * Returns the `file` URI to use in contexts where node.js
     * is responsible for loading.
     */
    uriToFileUri(uri: URI): URI;
    private toUri;
}
export declare const FileAccess: FileAccessImpl;
export declare namespace COI {
    const CoopAndCoep: Readonly<Record<string, string> | undefined>;
    /**
     * Extract desired headers from `vscode-coi` invocation
     */
    function getHeadersFromQuery(url: string | URI | URL): Record<string, string> | undefined;
    /**
     * Add the `vscode-coi` query attribute based on wanting `COOP` and `COEP`. Will be a noop when `crossOriginIsolated`
     * isn't enabled the current context
     */
    function addSearchParam(urlOrSearch: URLSearchParams | Record<string, string>, coop: boolean, coep: boolean): void;
}
export {};
