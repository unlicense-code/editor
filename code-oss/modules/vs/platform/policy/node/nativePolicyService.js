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
import { AbstractPolicyService } from 'vs/platform/policy/common/policy';
import { Throttler } from 'vs/base/common/async';
import { createWatcher } from 'vscode-policy-watcher';
import { MutableDisposable } from 'vs/base/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
let NativePolicyService = class NativePolicyService extends AbstractPolicyService {
    logService;
    productName;
    throttler = new Throttler();
    watcher = this._register(new MutableDisposable());
    constructor(logService, productName) {
        super();
        this.logService = logService;
        this.productName = productName;
    }
    async _updatePolicyDefinitions(policyDefinitions) {
        this.logService.trace(`NativePolicyService#_updatePolicyDefinitions - Found ${policyDefinitions.length} policy definitions`);
        await this.throttler.queue(() => new Promise((c, e) => {
            try {
                this.watcher.value = createWatcher(this.productName, policyDefinitions, update => {
                    this._onDidPolicyChange(update);
                    c();
                });
            }
            catch (err) {
                this.logService.error(`NativePolicyService#_updatePolicyDefinitions - Error creating watcher:`, err);
                e(err);
            }
        }));
    }
    _onDidPolicyChange(update) {
        this.logService.trace(`NativePolicyService#_onDidPolicyChange - Updated policy values: ${Object.keys(update).join(', ')}`);
        for (const key in update) {
            const value = update[key];
            if (value === undefined) {
                this.policies.delete(key);
            }
            else {
                this.policies.set(key, value);
            }
        }
        this._onDidChange.fire(Object.keys(update));
    }
};
NativePolicyService = __decorate([
    __param(0, ILogService)
], NativePolicyService);
export { NativePolicyService };
