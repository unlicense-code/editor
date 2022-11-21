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
import { ProxyChannel } from 'vs/base/parts/ipc/common/ipc';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ILogService } from 'vs/platform/log/common/log';
import { IEncryptionService } from 'vs/workbench/services/encryption/common/encryptionService';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
let EncryptionService = class EncryptionService {
    constructor(remoteAgentService, environmentService, logService) {
        // This allows the remote side to handle any encryption requests
        if (environmentService.remoteAuthority && !environmentService.options?.credentialsProvider) {
            logService.trace('EncryptionService#constructor - Detected remote environment, registering proxy for encryption instead');
            return ProxyChannel.toService(remoteAgentService.getConnection().getChannel('encryption'));
        }
    }
    encrypt(value) {
        return Promise.resolve(value);
    }
    decrypt(value) {
        return Promise.resolve(value);
    }
};
EncryptionService = __decorate([
    __param(0, IRemoteAgentService),
    __param(1, IBrowserWorkbenchEnvironmentService),
    __param(2, ILogService)
], EncryptionService);
export { EncryptionService };
registerSingleton(IEncryptionService, EncryptionService, 1 /* InstantiationType.Delayed */);
