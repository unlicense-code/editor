/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { HistoryNavigator2 } from 'vs/base/common/history';
import { Disposable } from 'vs/base/common/lifecycle';
import { ResourceMap } from 'vs/base/common/map';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const IInteractiveHistoryService = createDecorator('IInteractiveHistoryService');
export class InteractiveHistoryService extends Disposable {
    #history;
    constructor() {
        super();
        this.#history = new ResourceMap();
    }
    addToHistory(uri, value) {
        if (!this.#history.has(uri)) {
            this.#history.set(uri, new HistoryNavigator2([value], 50));
            return;
        }
        const history = this.#history.get(uri);
        history.resetCursor();
        if (history?.current() !== value) {
            history?.add(value);
        }
    }
    getPreviousValue(uri) {
        const history = this.#history.get(uri);
        return history?.previous() ?? null;
    }
    getNextValue(uri) {
        const history = this.#history.get(uri);
        return history?.next() ?? null;
    }
    replaceLast(uri, value) {
        if (!this.#history.has(uri)) {
            this.#history.set(uri, new HistoryNavigator2([value], 50));
            return;
        }
        else {
            const history = this.#history.get(uri);
            if (history?.current() !== value) {
                history?.replaceLast(value);
            }
        }
    }
    clearHistory(uri) {
        this.#history.delete(uri);
    }
    has(uri) {
        return this.#history.has(uri) ? true : false;
    }
}
