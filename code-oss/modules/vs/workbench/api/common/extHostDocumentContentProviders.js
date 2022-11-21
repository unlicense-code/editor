/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { onUnexpectedError } from 'vs/base/common/errors';
import { URI } from 'vs/base/common/uri';
import { Disposable } from 'vs/workbench/api/common/extHostTypes';
import { MainContext } from './extHost.protocol';
import { Schemas } from 'vs/base/common/network';
import { CancellationToken } from 'vs/base/common/cancellation';
import { splitLines } from 'vs/base/common/strings';
export class ExtHostDocumentContentProvider {
    _documentsAndEditors;
    _logService;
    static _handlePool = 0;
    _documentContentProviders = new Map();
    _proxy;
    constructor(mainContext, _documentsAndEditors, _logService) {
        this._documentsAndEditors = _documentsAndEditors;
        this._logService = _logService;
        this._proxy = mainContext.getProxy(MainContext.MainThreadDocumentContentProviders);
    }
    registerTextDocumentContentProvider(scheme, provider) {
        // todo@remote
        // check with scheme from fs-providers!
        if (Object.keys(Schemas).indexOf(scheme) >= 0) {
            throw new Error(`scheme '${scheme}' already registered`);
        }
        const handle = ExtHostDocumentContentProvider._handlePool++;
        this._documentContentProviders.set(handle, provider);
        this._proxy.$registerTextContentProvider(handle, scheme);
        let subscription;
        if (typeof provider.onDidChange === 'function') {
            subscription = provider.onDidChange(uri => {
                if (uri.scheme !== scheme) {
                    this._logService.warn(`Provider for scheme '${scheme}' is firing event for schema '${uri.scheme}' which will be IGNORED`);
                    return;
                }
                if (this._documentsAndEditors.getDocument(uri)) {
                    this.$provideTextDocumentContent(handle, uri).then(value => {
                        if (!value && typeof value !== 'string') {
                            return;
                        }
                        const document = this._documentsAndEditors.getDocument(uri);
                        if (!document) {
                            // disposed in the meantime
                            return;
                        }
                        // create lines and compare
                        const lines = splitLines(value);
                        // broadcast event when content changed
                        if (!document.equalLines(lines)) {
                            return this._proxy.$onVirtualDocumentChange(uri, value);
                        }
                    }, onUnexpectedError);
                }
            });
        }
        return new Disposable(() => {
            if (this._documentContentProviders.delete(handle)) {
                this._proxy.$unregisterTextContentProvider(handle);
            }
            if (subscription) {
                subscription.dispose();
                subscription = undefined;
            }
        });
    }
    $provideTextDocumentContent(handle, uri) {
        const provider = this._documentContentProviders.get(handle);
        if (!provider) {
            return Promise.reject(new Error(`unsupported uri-scheme: ${uri.scheme}`));
        }
        return Promise.resolve(provider.provideTextDocumentContent(URI.revive(uri), CancellationToken.None));
    }
}
