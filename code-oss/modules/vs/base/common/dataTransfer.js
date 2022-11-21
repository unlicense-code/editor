/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { distinct } from 'vs/base/common/arrays';
import { generateUuid } from 'vs/base/common/uuid';
export function createStringDataTransferItem(stringOrPromise) {
    return {
        id: generateUuid(),
        asString: async () => stringOrPromise,
        asFile: () => undefined,
        value: typeof stringOrPromise === 'string' ? stringOrPromise : undefined,
    };
}
export function createFileDataTransferItem(fileName, uri, data) {
    return {
        id: generateUuid(),
        asString: async () => '',
        asFile: () => ({ name: fileName, uri, data }),
        value: undefined,
    };
}
export class VSDataTransfer {
    _entries = new Map();
    get size() {
        return this._entries.size;
    }
    has(mimeType) {
        return this._entries.has(this.toKey(mimeType));
    }
    get(mimeType) {
        return this._entries.get(this.toKey(mimeType))?.[0];
    }
    append(mimeType, value) {
        const existing = this._entries.get(mimeType);
        if (existing) {
            existing.push(value);
        }
        else {
            this._entries.set(this.toKey(mimeType), [value]);
        }
    }
    replace(mimeType, value) {
        this._entries.set(this.toKey(mimeType), [value]);
    }
    delete(mimeType) {
        this._entries.delete(this.toKey(mimeType));
    }
    *entries() {
        for (const [mine, items] of this._entries.entries()) {
            for (const item of items) {
                yield [mine, item];
            }
        }
    }
    values() {
        return Array.from(this._entries.values()).flat();
    }
    forEach(f) {
        for (const [mime, item] of this.entries()) {
            f(item, mime);
        }
    }
    toKey(mimeType) {
        return mimeType.toLowerCase();
    }
}
export const UriList = Object.freeze({
    // http://amundsen.com/hypermedia/urilist/
    create: (entries) => {
        return distinct(entries.map(x => x.toString())).join('\r\n');
    },
    split: (str) => {
        return str.split('\r\n');
    },
    parse: (str) => {
        return UriList.split(str).filter(value => !value.startsWith('#'));
    }
});
