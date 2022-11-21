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
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';
import { BaseCredentialsMainService } from 'vs/platform/credentials/common/credentialsMainService';
let CredentialsNativeMainService = class CredentialsNativeMainService extends BaseCredentialsMainService {
    environmentMainService;
    productService;
    windowsMainService;
    constructor(logService, environmentMainService, productService, windowsMainService) {
        super(logService);
        this.environmentMainService = environmentMainService;
        this.productService = productService;
        this.windowsMainService = windowsMainService;
    }
    // If the credentials service is running on the server, we add a suffix -server to differentiate from the location that the
    // client would store the credentials.
    async getSecretStoragePrefix() { return Promise.resolve(this.productService.urlProtocol); }
    async withKeytar() {
        if (this._keytarCache) {
            return this._keytarCache;
        }
        if (this.environmentMainService.disableKeytar) {
            this.logService.info('Keytar is disabled. Using in-memory credential store instead.');
            this._keytarCache = new InMemoryCredentialsProvider();
            return this._keytarCache;
        }
        const keytarCache = await import('keytar');
        // Try using keytar to see if it throws or not.
        await keytarCache.findCredentials('test-keytar-loads');
        this._keytarCache = keytarCache;
        return this._keytarCache;
    }
    surfaceKeytarLoadError = (err) => {
        this.windowsMainService.sendToFocused('vscode:showCredentialsError', err.message ?? err);
    };
};
CredentialsNativeMainService = __decorate([
    __param(0, ILogService),
    __param(1, INativeEnvironmentService),
    __param(2, IProductService),
    __param(3, IWindowsMainService)
], CredentialsNativeMainService);
export { CredentialsNativeMainService };
