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
import { Disposable } from 'vs/base/common/lifecycle';
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { ICredentialsService } from 'vs/platform/credentials/common/credentials';
import { IEncryptionService } from 'vs/workbench/services/encryption/common/encryptionService';
import { ExtHostContext, MainContext } from '../common/extHost.protocol';
import { ILogService } from 'vs/platform/log/common/log';
let MainThreadSecretState = class MainThreadSecretState extends Disposable {
    credentialsService;
    encryptionService;
    logService;
    _proxy;
    secretStoragePrefix = this.credentialsService.getSecretStoragePrefix();
    constructor(extHostContext, credentialsService, encryptionService, logService) {
        super();
        this.credentialsService = credentialsService;
        this.encryptionService = encryptionService;
        this.logService = logService;
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostSecretState);
        this._register(this.credentialsService.onDidChangePassword(async (e) => {
            const extensionId = e.service.substring((await this.secretStoragePrefix).length);
            this._proxy.$onDidChangePassword({ extensionId, key: e.account });
        }));
    }
    async getFullKey(extensionId) {
        return `${await this.secretStoragePrefix}${extensionId}`;
    }
    async $getPassword(extensionId, key) {
        this.logService.trace(`MainThreadSecretState#getPassword: Getting password for ${extensionId} extension: `, key);
        const fullKey = await this.getFullKey(extensionId);
        const password = await this.credentialsService.getPassword(fullKey, key);
        if (!password) {
            this.logService.trace('MainThreadSecretState#getPassword: No password found for: ', key);
            return undefined;
        }
        let decrypted;
        try {
            this.logService.trace('MainThreadSecretState#getPassword: Decrypting password for: ', key);
            decrypted = await this.encryptionService.decrypt(password);
        }
        catch (e) {
            this.logService.error(e);
            this.logService.trace('MainThreadSecretState#getPassword: Trying migration for: ', key);
            // If we are on a platform that newly started encrypting secrets before storing them,
            // then passwords previously stored were stored un-encrypted (NOTE: but still being stored in a secure keyring).
            // When we try to decrypt a password that wasn't encrypted previously, the encryption service will throw.
            // To recover gracefully, we first try to encrypt & store the password (essentially migrating the secret to the new format)
            // and then we try to read it and decrypt again.
            const encryptedForSet = await this.encryptionService.encrypt(password);
            await this.credentialsService.setPassword(fullKey, key, encryptedForSet);
            const passwordEncrypted = await this.credentialsService.getPassword(fullKey, key);
            decrypted = passwordEncrypted && await this.encryptionService.decrypt(passwordEncrypted);
        }
        if (decrypted) {
            try {
                const value = JSON.parse(decrypted);
                if (value.extensionId === extensionId) {
                    this.logService.trace('MainThreadSecretState#getPassword: Password found for: ', key);
                    return value.content;
                }
            }
            catch (parseError) {
                this.logService.error(parseError);
                // If we can't parse the decrypted value, then it's not a valid secret so we should try to delete it
                try {
                    await this.credentialsService.deletePassword(fullKey, key);
                }
                catch (e) {
                    this.logService.error(e);
                }
                throw new Error('Unable to parse decrypted password');
            }
        }
        this.logService.trace('MainThreadSecretState#getPassword: No password found for: ', key);
        return undefined;
    }
    async $setPassword(extensionId, key, value) {
        this.logService.trace(`MainThreadSecretState#setPassword: Setting password for ${extensionId} extension: `, key);
        const fullKey = await this.getFullKey(extensionId);
        const toEncrypt = JSON.stringify({
            extensionId,
            content: value
        });
        this.logService.trace('MainThreadSecretState#setPassword: Encrypting password for: ', key);
        const encrypted = await this.encryptionService.encrypt(toEncrypt);
        this.logService.trace('MainThreadSecretState#setPassword: Storing password for: ', key);
        return await this.credentialsService.setPassword(fullKey, key, encrypted);
    }
    async $deletePassword(extensionId, key) {
        try {
            const fullKey = await this.getFullKey(extensionId);
            await this.credentialsService.deletePassword(fullKey, key);
        }
        catch (_) {
            throw new Error('Cannot delete password');
        }
    }
};
MainThreadSecretState = __decorate([
    extHostNamedCustomer(MainContext.MainThreadSecretState),
    __param(1, ICredentialsService),
    __param(2, IEncryptionService),
    __param(3, ILogService)
], MainThreadSecretState);
export { MainThreadSecretState };
