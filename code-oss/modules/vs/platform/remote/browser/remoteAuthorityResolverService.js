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
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { RemoteAuthorities } from 'vs/base/common/network';
import { IProductService } from 'vs/platform/product/common/productService';
import { getRemoteServerRootPath, parseAuthorityWithOptionalPort } from 'vs/platform/remote/common/remoteHosts';
let RemoteAuthorityResolverService = class RemoteAuthorityResolverService extends Disposable {
    _onDidChangeConnectionData = this._register(new Emitter());
    onDidChangeConnectionData = this._onDidChangeConnectionData.event;
    _promiseCache = new Map();
    _cache = new Map();
    _connectionToken;
    _connectionTokens;
    constructor(productService, connectionToken, resourceUriProvider) {
        super();
        this._connectionToken = connectionToken;
        this._connectionTokens = new Map();
        if (resourceUriProvider) {
            RemoteAuthorities.setDelegate(resourceUriProvider);
        }
        RemoteAuthorities.setServerRootPath(getRemoteServerRootPath(productService));
    }
    async resolveAuthority(authority) {
        let result = this._promiseCache.get(authority);
        if (!result) {
            result = this._doResolveAuthority(authority);
            this._promiseCache.set(authority, result);
        }
        return result;
    }
    async getCanonicalURI(uri) {
        return uri;
    }
    getConnectionData(authority) {
        if (!this._cache.has(authority)) {
            return null;
        }
        const resolverResult = this._cache.get(authority);
        const connectionToken = this._connectionTokens.get(authority) || resolverResult.authority.connectionToken;
        return {
            host: resolverResult.authority.host,
            port: resolverResult.authority.port,
            connectionToken: connectionToken
        };
    }
    async _doResolveAuthority(authority) {
        const connectionToken = await Promise.resolve(this._connectionTokens.get(authority) || this._connectionToken);
        const defaultPort = (/^https:/.test(window.location.href) ? 443 : 80);
        const { host, port } = parseAuthorityWithOptionalPort(authority, defaultPort);
        const result = { authority: { authority, host: host, port: port, connectionToken } };
        RemoteAuthorities.set(authority, result.authority.host, result.authority.port);
        this._cache.set(authority, result);
        this._onDidChangeConnectionData.fire();
        return result;
    }
    _clearResolvedAuthority(authority) {
    }
    _setResolvedAuthority(resolvedAuthority) {
    }
    _setResolvedAuthorityError(authority, err) {
    }
    _setAuthorityConnectionToken(authority, connectionToken) {
        this._connectionTokens.set(authority, connectionToken);
        RemoteAuthorities.setConnectionToken(authority, connectionToken);
        this._onDidChangeConnectionData.fire();
    }
    _setCanonicalURIProvider(provider) {
    }
};
RemoteAuthorityResolverService = __decorate([
    __param(0, IProductService)
], RemoteAuthorityResolverService);
export { RemoteAuthorityResolverService };
