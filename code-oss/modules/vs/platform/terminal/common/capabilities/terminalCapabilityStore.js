/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
export class TerminalCapabilityStore extends Disposable {
    _map = new Map();
    _onDidRemoveCapability = this._register(new Emitter());
    onDidRemoveCapability = this._onDidRemoveCapability.event;
    _onDidAddCapability = this._register(new Emitter());
    onDidAddCapability = this._onDidAddCapability.event;
    get items() {
        return this._map.keys();
    }
    add(capability, impl) {
        this._map.set(capability, impl);
        this._onDidAddCapability.fire(capability);
    }
    get(capability) {
        // HACK: This isn't totally safe since the Map key and value are not connected
        return this._map.get(capability);
    }
    remove(capability) {
        if (!this._map.has(capability)) {
            return;
        }
        this._map.delete(capability);
        this._onDidRemoveCapability.fire(capability);
    }
    has(capability) {
        return this._map.has(capability);
    }
}
export class TerminalCapabilityStoreMultiplexer extends Disposable {
    _stores = [];
    _onDidRemoveCapability = this._register(new Emitter());
    onDidRemoveCapability = this._onDidRemoveCapability.event;
    _onDidAddCapability = this._register(new Emitter());
    onDidAddCapability = this._onDidAddCapability.event;
    get items() {
        return this._items();
    }
    *_items() {
        for (const store of this._stores) {
            for (const c of store.items) {
                yield c;
            }
        }
    }
    has(capability) {
        for (const store of this._stores) {
            for (const c of store.items) {
                if (c === capability) {
                    return true;
                }
            }
        }
        return false;
    }
    get(capability) {
        for (const store of this._stores) {
            const c = store.get(capability);
            if (c) {
                return c;
            }
        }
        return undefined;
    }
    add(store) {
        this._stores.push(store);
        for (const capability of store.items) {
            this._onDidAddCapability.fire(capability);
        }
        store.onDidAddCapability(e => this._onDidAddCapability.fire(e));
        store.onDidRemoveCapability(e => this._onDidRemoveCapability.fire(e));
    }
}
