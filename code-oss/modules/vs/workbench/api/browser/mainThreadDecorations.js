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
import { URI } from 'vs/base/common/uri';
import { Emitter } from 'vs/base/common/event';
import { dispose } from 'vs/base/common/lifecycle';
import { ExtHostContext, MainContext } from '../common/extHost.protocol';
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { IDecorationsService } from 'vs/workbench/services/decorations/common/decorations';
import { CancellationToken } from 'vs/base/common/cancellation';
class DecorationRequestsQueue {
    _proxy;
    _handle;
    _idPool = 0;
    _requests = new Map();
    _resolver = new Map();
    _timer;
    constructor(_proxy, _handle) {
        this._proxy = _proxy;
        this._handle = _handle;
        //
    }
    enqueue(uri, token) {
        const id = ++this._idPool;
        const result = new Promise(resolve => {
            this._requests.set(id, { id, uri });
            this._resolver.set(id, resolve);
            this._processQueue();
        });
        const sub = token.onCancellationRequested(() => {
            this._requests.delete(id);
            this._resolver.delete(id);
        });
        return result.finally(() => sub.dispose());
    }
    _processQueue() {
        if (typeof this._timer === 'number') {
            // already queued
            return;
        }
        this._timer = setTimeout(() => {
            // make request
            const requests = this._requests;
            const resolver = this._resolver;
            this._proxy.$provideDecorations(this._handle, [...requests.values()], CancellationToken.None).then(data => {
                for (const [id, resolve] of resolver) {
                    resolve(data[id]);
                }
            });
            // reset
            this._requests = new Map();
            this._resolver = new Map();
            this._timer = undefined;
        }, 0);
    }
}
let MainThreadDecorations = class MainThreadDecorations {
    _decorationsService;
    _provider = new Map();
    _proxy;
    constructor(context, _decorationsService) {
        this._decorationsService = _decorationsService;
        this._proxy = context.getProxy(ExtHostContext.ExtHostDecorations);
    }
    dispose() {
        this._provider.forEach(value => dispose(value));
        this._provider.clear();
    }
    $registerDecorationProvider(handle, label) {
        const emitter = new Emitter();
        const queue = new DecorationRequestsQueue(this._proxy, handle);
        const registration = this._decorationsService.registerDecorationsProvider({
            label,
            onDidChange: emitter.event,
            provideDecorations: async (uri, token) => {
                const data = await queue.enqueue(uri, token);
                if (!data) {
                    return undefined;
                }
                const [bubble, tooltip, letter, themeColor] = data;
                return {
                    weight: 10,
                    bubble: bubble ?? false,
                    color: themeColor?.id,
                    tooltip,
                    letter
                };
            }
        });
        this._provider.set(handle, [emitter, registration]);
    }
    $onDidChange(handle, resources) {
        const provider = this._provider.get(handle);
        if (provider) {
            const [emitter] = provider;
            emitter.fire(resources && resources.map(r => URI.revive(r)));
        }
    }
    $unregisterDecorationProvider(handle) {
        const provider = this._provider.get(handle);
        if (provider) {
            dispose(provider);
            this._provider.delete(handle);
        }
    }
};
MainThreadDecorations = __decorate([
    extHostNamedCustomer(MainContext.MainThreadDecorations),
    __param(1, IDecorationsService)
], MainThreadDecorations);
export { MainThreadDecorations };
