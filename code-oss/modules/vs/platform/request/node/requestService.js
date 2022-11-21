/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { parse as parseUrl } from 'url';
import { Promises } from 'vs/base/common/async';
import { streamToBufferReadableStream } from 'vs/base/common/buffer';
import { CancellationError } from 'vs/base/common/errors';
import { Disposable } from 'vs/base/common/lifecycle';
import { isBoolean, isNumber } from 'vs/base/common/types';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { getResolvedShellEnv } from 'vs/platform/shell/node/shellEnv';
import { ILogService } from 'vs/platform/log/common/log';
import { getProxyAgent } from 'vs/platform/request/node/proxy';
import { createGunzip } from 'zlib';
/**
 * This service exposes the `request` API, while using the global
 * or configured proxy settings.
 */
let RequestService = class RequestService extends Disposable {
    environmentService;
    logService;
    proxyUrl;
    strictSSL;
    authorization;
    shellEnvErrorLogged;
    constructor(configurationService, environmentService, logService) {
        super();
        this.environmentService = environmentService;
        this.logService = logService;
        this.configure(configurationService.getValue());
        this._register(configurationService.onDidChangeConfiguration(() => this.configure(configurationService.getValue()), this));
    }
    configure(config) {
        this.proxyUrl = config.http && config.http.proxy;
        this.strictSSL = !!(config.http && config.http.proxyStrictSSL);
        this.authorization = config.http && config.http.proxyAuthorization;
    }
    async request(options, token) {
        this.logService.trace('RequestService#request (node) - begin', options.url);
        const { proxyUrl, strictSSL } = this;
        let shellEnv = undefined;
        try {
            shellEnv = await getResolvedShellEnv(this.logService, this.environmentService.args, process.env);
        }
        catch (error) {
            if (!this.shellEnvErrorLogged) {
                this.shellEnvErrorLogged = true;
                this.logService.error('RequestService#request (node) resolving shell environment failed', error);
            }
        }
        const env = {
            ...process.env,
            ...shellEnv
        };
        const agent = options.agent ? options.agent : await getProxyAgent(options.url || '', env, { proxyUrl, strictSSL });
        options.agent = agent;
        options.strictSSL = strictSSL;
        if (this.authorization) {
            options.headers = {
                ...(options.headers || {}),
                'Proxy-Authorization': this.authorization
            };
        }
        try {
            const res = await this._request(options, token);
            this.logService.trace('RequestService#request (node) - success', options.url);
            return res;
        }
        catch (error) {
            this.logService.trace('RequestService#request (node) - error', options.url, error);
            throw error;
        }
    }
    async getNodeRequest(options) {
        const endpoint = parseUrl(options.url);
        const module = endpoint.protocol === 'https:' ? await import('https') : await import('http');
        return module.request;
    }
    _request(options, token) {
        return Promises.withAsyncBody(async (c, e) => {
            const endpoint = parseUrl(options.url);
            const rawRequest = options.getRawRequest
                ? options.getRawRequest(options)
                : await this.getNodeRequest(options);
            const opts = {
                hostname: endpoint.hostname,
                port: endpoint.port ? parseInt(endpoint.port) : (endpoint.protocol === 'https:' ? 443 : 80),
                protocol: endpoint.protocol,
                path: endpoint.path,
                method: options.type || 'GET',
                headers: options.headers,
                agent: options.agent,
                rejectUnauthorized: isBoolean(options.strictSSL) ? options.strictSSL : true
            };
            if (options.user && options.password) {
                opts.auth = options.user + ':' + options.password;
            }
            const req = rawRequest(opts, (res) => {
                const followRedirects = isNumber(options.followRedirects) ? options.followRedirects : 3;
                if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && followRedirects > 0 && res.headers['location']) {
                    this._request({
                        ...options,
                        url: res.headers['location'],
                        followRedirects: followRedirects - 1
                    }, token).then(c, e);
                }
                else {
                    let stream = res;
                    if (res.headers['content-encoding'] === 'gzip') {
                        stream = res.pipe(createGunzip());
                    }
                    c({ res, stream: streamToBufferReadableStream(stream) });
                }
            });
            req.on('error', e);
            if (options.timeout) {
                req.setTimeout(options.timeout);
            }
            if (options.data) {
                if (typeof options.data === 'string') {
                    req.write(options.data);
                }
            }
            req.end();
            token.onCancellationRequested(() => {
                req.abort();
                e(new CancellationError());
            });
        });
    }
    async resolveProxy(url) {
        return undefined; // currently not implemented in node
    }
};
RequestService = __decorate([
    __param(0, IConfigurationService),
    __param(1, INativeEnvironmentService),
    __param(2, ILogService)
], RequestService);
export { RequestService };
