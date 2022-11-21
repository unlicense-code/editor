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
import { ILogService } from 'vs/platform/log/common/log';
let EncryptionMainService = class EncryptionMainService {
    machineId;
    logService;
    constructor(machineId, logService) {
        this.machineId = machineId;
        this.logService = logService;
    }
    encryption() {
        return new Promise((resolve, reject) => require(['vscode-encrypt'], resolve, reject));
    }
    async encrypt(value) {
        let encryption;
        try {
            encryption = await this.encryption();
        }
        catch (e) {
            return value;
        }
        try {
            return encryption.encrypt(this.machineId, value);
        }
        catch (e) {
            this.logService.error(e);
            return value;
        }
    }
    async decrypt(value) {
        let encryption;
        try {
            encryption = await this.encryption();
        }
        catch (e) {
            return value;
        }
        try {
            return encryption.decrypt(this.machineId, value);
        }
        catch (e) {
            this.logService.error(e);
            return value;
        }
    }
};
EncryptionMainService = __decorate([
    __param(1, ILogService)
], EncryptionMainService);
export { EncryptionMainService };
