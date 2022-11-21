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
import { ThrottledDelayer } from 'vs/base/common/async';
import { Event } from 'vs/base/common/event';
import { Iterable } from 'vs/base/common/iterator';
import { isObject } from 'vs/base/common/types';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { AbstractPolicyService } from 'vs/platform/policy/common/policy';
function keysDiff(a, b) {
    const result = [];
    for (const key of Iterable.concat(a.keys(), b.keys())) {
        if (a.get(key) !== b.get(key)) {
            result.push(key);
        }
    }
    return result;
}
let FilePolicyService = class FilePolicyService extends AbstractPolicyService {
    file;
    fileService;
    logService;
    throttledDelayer = this._register(new ThrottledDelayer(500));
    constructor(file, fileService, logService) {
        super();
        this.file = file;
        this.fileService = fileService;
        this.logService = logService;
        const onDidChangePolicyFile = Event.filter(fileService.onDidFilesChange, e => e.affects(file));
        this._register(fileService.watch(file));
        this._register(onDidChangePolicyFile(() => this.throttledDelayer.trigger(() => this.refresh())));
    }
    async _updatePolicyDefinitions() {
        await this.refresh();
    }
    async read() {
        const policies = new Map();
        try {
            const content = await this.fileService.readFile(this.file);
            const raw = JSON.parse(content.value.toString());
            if (!isObject(raw)) {
                throw new Error('Policy file isn\'t a JSON object');
            }
            for (const key of Object.keys(raw)) {
                if (this.policyDefinitions[key]) {
                    policies.set(key, raw[key]);
                }
            }
        }
        catch (error) {
            if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                this.logService.error(`[FilePolicyService] Failed to read policies`, error);
            }
        }
        return policies;
    }
    async refresh() {
        const policies = await this.read();
        const diff = keysDiff(this.policies, policies);
        this.policies = policies;
        if (diff.length > 0) {
            this._onDidChange.fire(diff);
        }
    }
};
FilePolicyService = __decorate([
    __param(1, IFileService),
    __param(2, ILogService)
], FilePolicyService);
export { FilePolicyService };
