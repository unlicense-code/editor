/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CancellationToken } from 'vs/base/common/cancellation';
import { Emitter } from 'vs/base/common/event';
import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const IWebviewViewService = createDecorator('webviewViewService');
export class WebviewViewService extends Disposable {
    _serviceBrand;
    _resolvers = new Map();
    _awaitingRevival = new Map();
    _onNewResolverRegistered = this._register(new Emitter());
    onNewResolverRegistered = this._onNewResolverRegistered.event;
    register(viewType, resolver) {
        if (this._resolvers.has(viewType)) {
            throw new Error(`View resolver already registered for ${viewType}`);
        }
        this._resolvers.set(viewType, resolver);
        this._onNewResolverRegistered.fire({ viewType: viewType });
        const pending = this._awaitingRevival.get(viewType);
        if (pending) {
            resolver.resolve(pending.webview, CancellationToken.None).then(() => {
                this._awaitingRevival.delete(viewType);
                pending.resolve();
            });
        }
        return toDisposable(() => {
            this._resolvers.delete(viewType);
        });
    }
    resolve(viewType, webview, cancellation) {
        const resolver = this._resolvers.get(viewType);
        if (!resolver) {
            if (this._awaitingRevival.has(viewType)) {
                throw new Error('View already awaiting revival');
            }
            let resolve;
            const p = new Promise(r => resolve = r);
            this._awaitingRevival.set(viewType, { webview, resolve: resolve });
            return p;
        }
        return resolver.resolve(webview, cancellation);
    }
}
