/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { toDisposable } from 'vs/base/common/lifecycle';
import { Schemas } from 'vs/base/common/network';
import { URI } from 'vs/base/common/uri';
import { MainContext } from './extHost.protocol';
export class ExtHostUriOpeners {
    static supportedSchemes = new Set([Schemas.http, Schemas.https]);
    _proxy;
    _openers = new Map();
    constructor(mainContext) {
        this._proxy = mainContext.getProxy(MainContext.MainThreadUriOpeners);
    }
    registerExternalUriOpener(extensionId, id, opener, metadata) {
        if (this._openers.has(id)) {
            throw new Error(`Opener with id '${id}' already registered`);
        }
        const invalidScheme = metadata.schemes.find(scheme => !ExtHostUriOpeners.supportedSchemes.has(scheme));
        if (invalidScheme) {
            throw new Error(`Scheme '${invalidScheme}' is not supported. Only http and https are currently supported.`);
        }
        this._openers.set(id, opener);
        this._proxy.$registerUriOpener(id, metadata.schemes, extensionId, metadata.label);
        return toDisposable(() => {
            this._openers.delete(id);
            this._proxy.$unregisterUriOpener(id);
        });
    }
    async $canOpenUri(id, uriComponents, token) {
        const opener = this._openers.get(id);
        if (!opener) {
            throw new Error(`Unknown opener with id: ${id}`);
        }
        const uri = URI.revive(uriComponents);
        return opener.canOpenExternalUri(uri, token);
    }
    async $openUri(id, context, token) {
        const opener = this._openers.get(id);
        if (!opener) {
            throw new Error(`Unknown opener id: '${id}'`);
        }
        return opener.openExternalUri(URI.revive(context.resolvedUri), {
            sourceUri: URI.revive(context.sourceUri)
        }, token);
    }
}
