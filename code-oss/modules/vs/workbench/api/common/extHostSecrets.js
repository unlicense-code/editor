/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { Emitter } from 'vs/base/common/event';
export class ExtensionSecrets {
    _id;
    #secretState;
    _onDidChange = new Emitter();
    onDidChange = this._onDidChange.event;
    constructor(extensionDescription, secretState) {
        this._id = ExtensionIdentifier.toKey(extensionDescription.identifier);
        this.#secretState = secretState;
        this.#secretState.onDidChangePassword(e => {
            if (e.extensionId === this._id) {
                this._onDidChange.fire({ key: e.key });
            }
        });
    }
    get(key) {
        return this.#secretState.get(this._id, key);
    }
    store(key, value) {
        return this.#secretState.store(this._id, key, value);
    }
    delete(key) {
        return this.#secretState.delete(this._id, key);
    }
}
