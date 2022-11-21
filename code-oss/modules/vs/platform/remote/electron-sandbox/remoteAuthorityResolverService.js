var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
//
import * as errors from 'vs/base/common/errors';
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { RemoteAuthorities } from 'vs/base/common/network';
import { IProductService } from 'vs/platform/product/common/productService';
import { getRemoteServerRootPath } from 'vs/platform/remote/common/remoteHosts';
class PendingPromise {
    promise;
    input;
    result;
    _resolve;
    _reject;
    constructor(request) {
        this.input = request;
        this.promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
        this.result = null;
    }
    resolve(result) {
        this.result = result;
        this._resolve(this.result);
    }
    reject(err) {
        this._reject(err);
    }
}
let RemoteAuthorityResolverService = class RemoteAuthorityResolverService extends Disposable {
    _onDidChangeConnectionData = this._register(new Emitter());
    onDidChangeConnectionData = this._onDidChangeConnectionData.event;
    _resolveAuthorityRequests;
    _connectionTokens;
    _canonicalURIRequests;
    _canonicalURIProvider;
    constructor(productService) {
        super();
        this._resolveAuthorityRequests = new Map();
        this._connectionTokens = new Map();
        this._canonicalURIRequests = new Map();
        this._canonicalURIProvider = null;
        RemoteAuthorities.setServerRootPath(getRemoteServerRootPath(productService));
    }
    resolveAuthority(authority) {
        if (!this._resolveAuthorityRequests.has(authority)) {
            this._resolveAuthorityRequests.set(authority, new PendingPromise(authority));
        }
        return this._resolveAuthorityRequests.get(authority).promise;
    }
    async getCanonicalURI(uri) {
        const key = uri.toString();
        if (!this._canonicalURIRequests.has(key)) {
            const request = new PendingPromise(uri);
            this._canonicalURIProvider?.(request.input).then((uri) => request.resolve(uri), (err) => request.reject(err));
            this._canonicalURIRequests.set(key, request);
        }
        return this._canonicalURIRequests.get(key).promise;
    }
    getConnectionData(authority) {
        if (!this._resolveAuthorityRequests.has(authority)) {
            return null;
        }
        const request = this._resolveAuthorityRequests.get(authority);
        if (!request.result) {
            return null;
        }
        const connectionToken = this._connectionTokens.get(authority);
        return {
            host: request.result.authority.host,
            port: request.result.authority.port,
            connectionToken: connectionToken
        };
    }
    _clearResolvedAuthority(authority) {
        if (this._resolveAuthorityRequests.has(authority)) {
            this._resolveAuthorityRequests.get(authority).reject(errors.canceled());
            this._resolveAuthorityRequests.delete(authority);
        }
    }
    _setResolvedAuthority(resolvedAuthority, options) {
        if (this._resolveAuthorityRequests.has(resolvedAuthority.authority)) {
            const request = this._resolveAuthorityRequests.get(resolvedAuthority.authority);
            RemoteAuthorities.set(resolvedAuthority.authority, resolvedAuthority.host, resolvedAuthority.port);
            if (resolvedAuthority.connectionToken) {
                RemoteAuthorities.setConnectionToken(resolvedAuthority.authority, resolvedAuthority.connectionToken);
            }
            request.resolve({ authority: resolvedAuthority, options });
            this._onDidChangeConnectionData.fire();
        }
    }
    _setResolvedAuthorityError(authority, err) {
        if (this._resolveAuthorityRequests.has(authority)) {
            const request = this._resolveAuthorityRequests.get(authority);
            // Avoid that this error makes it to telemetry
            request.reject(errors.ErrorNoTelemetry.fromError(err));
        }
    }
    _setAuthorityConnectionToken(authority, connectionToken) {
        this._connectionTokens.set(authority, connectionToken);
        RemoteAuthorities.setConnectionToken(authority, connectionToken);
        this._onDidChangeConnectionData.fire();
    }
    _setCanonicalURIProvider(provider) {
        this._canonicalURIProvider = provider;
        this._canonicalURIRequests.forEach((value) => {
            this._canonicalURIProvider(value.input).then((uri) => value.resolve(uri), (err) => value.reject(err));
        });
    }
};
RemoteAuthorityResolverService = __decorate([
    __param(0, IProductService)
], RemoteAuthorityResolverService);
export { RemoteAuthorityResolverService };
