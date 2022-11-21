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
import * as crypto from 'crypto';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
let ExtensionUrlTrustService = class ExtensionUrlTrustService {
    productService;
    logService;
    trustedExtensionUrlPublicKeys = new Map();
    constructor(productService, logService) {
        this.productService = productService;
        this.logService = logService;
    }
    async isExtensionUrlTrusted(extensionId, url) {
        if (!this.productService.trustedExtensionUrlPublicKeys) {
            this.logService.trace('ExtensionUrlTrustService#isExtensionUrlTrusted', 'There are no configured trusted keys');
            return false;
        }
        const match = /^(.*)#([^#]+)$/.exec(url);
        if (!match) {
            this.logService.trace('ExtensionUrlTrustService#isExtensionUrlTrusted', 'Uri has no fragment', url);
            return false;
        }
        const [, originalUrl, fragment] = match;
        let keys = this.trustedExtensionUrlPublicKeys.get(extensionId);
        if (!keys) {
            keys = this.productService.trustedExtensionUrlPublicKeys[extensionId];
            if (!keys || keys.length === 0) {
                this.logService.trace('ExtensionUrlTrustService#isExtensionUrlTrusted', 'Extension doesn\'t have any trusted keys', extensionId);
                return false;
            }
            this.trustedExtensionUrlPublicKeys.set(extensionId, [...keys]);
        }
        const fragmentBuffer = Buffer.from(decodeURIComponent(fragment), 'base64');
        if (fragmentBuffer.length <= 6) {
            this.logService.trace('ExtensionUrlTrustService#isExtensionUrlTrusted', 'Uri fragment is not a signature', url);
            return false;
        }
        const timestampBuffer = fragmentBuffer.slice(0, 6);
        const timestamp = fragmentBuffer.readUIntBE(0, 6);
        const diff = Date.now() - timestamp;
        if (diff < 0 || diff > 3600000) { // 1 hour
            this.logService.trace('ExtensionUrlTrustService#isExtensionUrlTrusted', 'Signed uri has expired', url);
            return false;
        }
        const signatureBuffer = fragmentBuffer.slice(6);
        const verify = crypto.createVerify('SHA256');
        verify.write(timestampBuffer);
        verify.write(Buffer.from(originalUrl));
        verify.end();
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            if (key === null) { // failed to be parsed before
                continue;
            }
            else if (typeof key === 'string') { // needs to be parsed
                try {
                    key = crypto.createPublicKey({ key: Buffer.from(key, 'base64'), format: 'der', type: 'spki' });
                    keys[i] = key;
                }
                catch (err) {
                    this.logService.warn('ExtensionUrlTrustService#isExtensionUrlTrusted', `Failed to parse trusted extension uri public key #${i + 1} for ${extensionId}:`, err);
                    keys[i] = null;
                    continue;
                }
            }
            if (verify.verify(key, signatureBuffer)) {
                this.logService.trace('ExtensionUrlTrustService#isExtensionUrlTrusted', 'Signed uri is valid', url);
                return true;
            }
        }
        this.logService.trace('ExtensionUrlTrustService#isExtensionUrlTrusted', 'Signed uri could not be verified', url);
        return false;
    }
};
ExtensionUrlTrustService = __decorate([
    __param(0, IProductService),
    __param(1, ILogService)
], ExtensionUrlTrustService);
export { ExtensionUrlTrustService };
