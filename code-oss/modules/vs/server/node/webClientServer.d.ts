/// <reference types="node" />
/// <reference types="node" />
import * as http from 'http';
import * as url from 'url';
import { ILogService } from 'vs/platform/log/common/log';
import { IServerEnvironmentService } from 'vs/server/node/serverEnvironmentService';
import { IProductService } from 'vs/platform/product/common/productService';
import { ServerConnectionToken } from 'vs/server/node/serverConnectionToken';
import { IRequestService } from 'vs/platform/request/common/request';
/**
 * Return an error to the client.
 */
export declare function serveError(req: http.IncomingMessage, res: http.ServerResponse, errorCode: number, errorMessage: string): Promise<void>;
export declare const enum CacheControl {
    NO_CACHING = 0,
    ETAG = 1,
    NO_EXPIRY = 2
}
/**
 * Serve a file at a given path or 404 if the file is missing.
 */
export declare function serveFile(filePath: string, cacheControl: CacheControl, logService: ILogService, req: http.IncomingMessage, res: http.ServerResponse, responseHeaders: Record<string, string>): Promise<void>;
export declare class WebClientServer {
    private readonly _connectionToken;
    private readonly _environmentService;
    private readonly _logService;
    private readonly _requestService;
    private readonly _productService;
    private readonly _webExtensionResourceUrlTemplate;
    private readonly _staticRoute;
    private readonly _callbackRoute;
    private readonly _webExtensionRoute;
    constructor(_connectionToken: ServerConnectionToken, _environmentService: IServerEnvironmentService, _logService: ILogService, _requestService: IRequestService, _productService: IProductService);
    /**
     * Handle web resources (i.e. only needed by the web client).
     * **NOTE**: This method is only invoked when the server has web bits.
     * **NOTE**: This method is only invoked after the connection token has been validated.
     */
    handle(req: http.IncomingMessage, res: http.ServerResponse, parsedUrl: url.UrlWithParsedQuery): Promise<void>;
    /**
     * Handle HTTP requests for /static/*
     */
    private _handleStatic;
    private _getResourceURLTemplateAuthority;
    /**
     * Handle extension resources
     */
    private _handleWebExtensionResource;
    /**
     * Handle HTTP requests for /
     */
    private _handleRoot;
    private _getScriptCspHashes;
    /**
     * Handle HTTP requests for /callback
     */
    private _handleCallback;
}
