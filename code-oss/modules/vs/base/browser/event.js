/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
export class DomEmitter {
    emitter;
    get event() {
        return this.emitter.event;
    }
    constructor(element, type, useCapture) {
        const fn = (e) => this.emitter.fire(e);
        this.emitter = new Emitter({
            onWillAddFirstListener: () => element.addEventListener(type, fn, useCapture),
            onDidRemoveLastListener: () => element.removeEventListener(type, fn, useCapture)
        });
    }
    dispose() {
        this.emitter.dispose();
    }
}
