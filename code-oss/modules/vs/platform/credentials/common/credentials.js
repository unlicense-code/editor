/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const ICredentialsService = createDecorator('credentialsService');
export const ICredentialsMainService = createDecorator('credentialsMainService');
export class InMemoryCredentialsProvider {
    secretVault = {};
    async getPassword(service, account) {
        return this.secretVault[service]?.[account] ?? null;
    }
    async setPassword(service, account, password) {
        this.secretVault[service] = this.secretVault[service] ?? {};
        this.secretVault[service][account] = password;
    }
    async deletePassword(service, account) {
        if (!this.secretVault[service]?.[account]) {
            return false;
        }
        delete this.secretVault[service][account];
        if (Object.keys(this.secretVault[service]).length === 0) {
            delete this.secretVault[service];
        }
        return true;
    }
    async findPassword(service) {
        return JSON.stringify(this.secretVault[service]) ?? null;
    }
    async findCredentials(service) {
        const credentials = [];
        for (const account of Object.keys(this.secretVault[service] || {})) {
            credentials.push({ account, password: this.secretVault[service][account] });
        }
        return credentials;
    }
    async clear() {
        this.secretVault = {};
    }
}
