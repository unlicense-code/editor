/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { MainContext } from 'vs/workbench/api/common/extHost.protocol';
import { Emitter } from 'vs/base/common/event';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export class ExtHostSecretState {
    _proxy;
    _onDidChangePassword = new Emitter();
    onDidChangePassword = this._onDidChangePassword.event;
    constructor(mainContext) {
        this._proxy = mainContext.getProxy(MainContext.MainThreadSecretState);
    }
    async $onDidChangePassword(e) {
        this._onDidChangePassword.fire(e);
    }
    get(extensionId, key) {
        return this._proxy.$getPassword(extensionId, key);
    }
    store(extensionId, key, value) {
        return this._proxy.$setPassword(extensionId, key, value);
    }
    delete(extensionId, key) {
        return this._proxy.$deletePassword(extensionId, key);
    }
}
export const IExtHostSecretState = createDecorator('IExtHostSecretState');
