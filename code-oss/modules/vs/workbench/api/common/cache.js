/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class Cache {
    id;
    static enableDebugLogging = false;
    _data = new Map();
    _idPool = 1;
    constructor(id) {
        this.id = id;
    }
    add(item) {
        const id = this._idPool++;
        this._data.set(id, item);
        this.logDebugInfo();
        return id;
    }
    get(pid, id) {
        return this._data.has(pid) ? this._data.get(pid)[id] : undefined;
    }
    delete(id) {
        this._data.delete(id);
        this.logDebugInfo();
    }
    logDebugInfo() {
        if (!Cache.enableDebugLogging) {
            return;
        }
        console.log(`${this.id} cache size - ${this._data.size}`);
    }
}
