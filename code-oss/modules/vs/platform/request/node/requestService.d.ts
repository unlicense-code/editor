/// <reference types="node" />
import * as http from 'http';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Disposable } from 'vs/base/common/lifecycle';
import { IRequestContext, IRequestOptions } from 'vs/base/parts/request/common/request';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { ILogService } from 'vs/platform/log/common/log';
import { IRequestService } from 'vs/platform/request/common/request';
import { Agent } from 'vs/platform/request/node/proxy';
export interface IRawRequestFunction {
    (options: http.RequestOptions, callback?: (res: http.IncomingMessage) => void): http.ClientRequest;
}
export interface NodeRequestOptions extends IRequestOptions {
    agent?: Agent;
    strictSSL?: boolean;
    getRawRequest?(options: IRequestOptions): IRawRequestFunction;
}
/**
 * This service exposes the `request` API, while using the global
 * or configured proxy settings.
 */
export declare class RequestService extends Disposable implements IRequestService {
    private readonly environmentService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private proxyUrl?;
    private strictSSL;
    private authorization?;
    private shellEnvErrorLogged?;
    constructor(configurationService: IConfigurationService, environmentService: INativeEnvironmentService, logService: ILogService);
    private configure;
    request(options: NodeRequestOptions, token: CancellationToken): Promise<IRequestContext>;
    private getNodeRequest;
    private _request;
    resolveProxy(url: string): Promise<string | undefined>;
}
