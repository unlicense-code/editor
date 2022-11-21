/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CancellationTokenSource } from 'vs/base/common/cancellation';
export class Cache {
    task;
    result = null;
    constructor(task) {
        this.task = task;
    }
    get() {
        if (this.result) {
            return this.result;
        }
        const cts = new CancellationTokenSource();
        const promise = this.task(cts.token);
        this.result = {
            promise,
            dispose: () => {
                this.result = null;
                cts.cancel();
                cts.dispose();
            }
        };
        return this.result;
    }
}
/**
 * Uses a LRU cache to make a given parametrized function cached.
 * Caches just the last value.
 * The key must be JSON serializable.
*/
export class LRUCachedFunction {
    fn;
    lastCache = undefined;
    lastArgKey = undefined;
    constructor(fn) {
        this.fn = fn;
    }
    get(arg) {
        const key = JSON.stringify(arg);
        if (this.lastArgKey !== key) {
            this.lastArgKey = key;
            this.lastCache = this.fn(arg);
        }
        return this.lastCache;
    }
}
/**
 * Uses an unbounded cache (referential equality) to memoize the results of the given function.
*/
export class CachedFunction {
    fn;
    _map = new Map();
    get cachedValues() {
        return this._map;
    }
    constructor(fn) {
        this.fn = fn;
    }
    get(arg) {
        if (this._map.has(arg)) {
            return this._map.get(arg);
        }
        const value = this.fn(arg);
        this._map.set(arg, value);
        return value;
    }
}
