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
import { ILogService } from 'vs/platform/log/common/log';
import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { IProductService } from 'vs/platform/product/common/productService';
import { BaseCredentialsMainService } from 'vs/platform/credentials/common/credentialsMainService';
let CredentialsWebMainService = class CredentialsWebMainService extends BaseCredentialsMainService {
    environmentMainService;
    productService;
    // Since we fallback to the in-memory credentials provider, we do not need to surface any Keytar load errors
    // to the user.
    surfaceKeytarLoadError;
    constructor(logService, environmentMainService, productService) {
        super(logService);
        this.environmentMainService = environmentMainService;
        this.productService = productService;
    }
    // If the credentials service is running on the server, we add a suffix -server to differentiate from the location that the
    // client would store the credentials.
    async getSecretStoragePrefix() { return Promise.resolve(`${this.productService.urlProtocol}-server`); }
    async withKeytar() {
        if (this._keytarCache) {
            return this._keytarCache;
        }
        if (this.environmentMainService.disableKeytar) {
            this.logService.info('Keytar is disabled. Using in-memory credential store instead.');
            this._keytarCache = new InMemoryCredentialsProvider();
            return this._keytarCache;
        }
        try {
            this._keytarCache = await import('keytar');
            // Try using keytar to see if it throws or not.
            await this._keytarCache.findCredentials('test-keytar-loads');
        }
        catch (e) {
            this.logService.warn(`Using the in-memory credential store as the operating system's credential store could not be accessed. Please see https://aka.ms/vscode-server-keyring on how to set this up. Details: ${e.message ?? e}`);
            this._keytarCache = new InMemoryCredentialsProvider();
        }
        return this._keytarCache;
    }
};
CredentialsWebMainService = __decorate([
    __param(0, ILogService),
    __param(1, INativeEnvironmentService),
    __param(2, IProductService)
], CredentialsWebMainService);
export { CredentialsWebMainService };
