/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
/**
 * @deprecated Use {@link IObservable} instead.
 */
export const staticObservableValue = (value) => ({
    onDidChange: Event.None,
    value,
});
/**
 * @deprecated Use {@link IObservable} instead.
 */
export class MutableObservableValue extends Disposable {
    _value;
    changeEmitter = this._register(new Emitter());
    onDidChange = this.changeEmitter.event;
    get value() {
        return this._value;
    }
    set value(v) {
        if (v !== this._value) {
            this._value = v;
            this.changeEmitter.fire(v);
        }
    }
    constructor(_value) {
        super();
        this._value = _value;
    }
}
