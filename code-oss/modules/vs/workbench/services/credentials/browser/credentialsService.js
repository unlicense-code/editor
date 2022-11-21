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
import { InMemoryCredentialsProvider } from 'vs/platform/credentials/common/credentials';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IProductService } from 'vs/platform/product/common/productService';
import { ProxyChannel } from 'vs/base/parts/ipc/common/ipc';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
let BrowserCredentialsService = class BrowserCredentialsService extends Disposable {
    productService;
    _onDidChangePassword = this._register(new Emitter());
    onDidChangePassword = this._onDidChangePassword.event;
    credentialsProvider;
    _secretStoragePrefix;
    async getSecretStoragePrefix() { return this._secretStoragePrefix; }
    constructor(environmentService, remoteAgentService, productService) {
        super();
        this.productService = productService;
        if (environmentService.remoteAuthority && !environmentService.options?.credentialsProvider) {
            // If we have a remote authority but the embedder didn't provide a credentialsProvider,
            // we can use the CredentialsService on the remote side
            const remoteCredentialsService = ProxyChannel.toService(remoteAgentService.getConnection().getChannel('credentials'));
            this.credentialsProvider = remoteCredentialsService;
            this._secretStoragePrefix = remoteCredentialsService.getSecretStoragePrefix();
        }
        else {
            // fall back to InMemoryCredentialsProvider if none was given to us. This should really only be used
            // when running tests.
            this.credentialsProvider = environmentService.options?.credentialsProvider ?? new InMemoryCredentialsProvider();
            this._secretStoragePrefix = Promise.resolve(this.productService.urlProtocol);
        }
    }
    getPassword(service, account) {
        return this.credentialsProvider.getPassword(service, account);
    }
    async setPassword(service, account, password) {
        await this.credentialsProvider.setPassword(service, account, password);
        this._onDidChangePassword.fire({ service, account });
    }
    async deletePassword(service, account) {
        const didDelete = await this.credentialsProvider.deletePassword(service, account);
        if (didDelete) {
            this._onDidChangePassword.fire({ service, account });
        }
        return didDelete;
    }
    findPassword(service) {
        return this.credentialsProvider.findPassword(service);
    }
    findCredentials(service) {
        return this.credentialsProvider.findCredentials(service);
    }
    async clear() {
        if (this.credentialsProvider.clear) {
            return this.credentialsProvider.clear();
        }
    }
};
BrowserCredentialsService = __decorate([
    __param(0, IBrowserWorkbenchEnvironmentService),
    __param(1, IRemoteAgentService),
    __param(2, IProductService)
], BrowserCredentialsService);
export { BrowserCredentialsService };
