/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { MainContext } from './extHost.protocol';
import { URI } from 'vs/base/common/uri';
import { toDisposable } from 'vs/base/common/lifecycle';
import { onUnexpectedError } from 'vs/base/common/errors';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
export class ExtHostUrls {
    static HandlePool = 0;
    _proxy;
    handles = new Set();
    handlers = new Map();
    constructor(mainContext) {
        this._proxy = mainContext.getProxy(MainContext.MainThreadUrls);
    }
    registerUriHandler(extensionId, handler) {
        if (this.handles.has(ExtensionIdentifier.toKey(extensionId))) {
            throw new Error(`Protocol handler already registered for extension ${extensionId}`);
        }
        const handle = ExtHostUrls.HandlePool++;
        this.handles.add(ExtensionIdentifier.toKey(extensionId));
        this.handlers.set(handle, handler);
        this._proxy.$registerUriHandler(handle, extensionId);
        return toDisposable(() => {
            this.handles.delete(ExtensionIdentifier.toKey(extensionId));
            this.handlers.delete(handle);
            this._proxy.$unregisterUriHandler(handle);
        });
    }
    $handleExternalUri(handle, uri) {
        const handler = this.handlers.get(handle);
        if (!handler) {
            return Promise.resolve(undefined);
        }
        try {
            handler.handleUri(URI.revive(uri));
        }
        catch (err) {
            onUnexpectedError(err);
        }
        return Promise.resolve(undefined);
    }
    async createAppUri(uri) {
        return URI.revive(await this._proxy.$createAppUri(uri));
    }
}
