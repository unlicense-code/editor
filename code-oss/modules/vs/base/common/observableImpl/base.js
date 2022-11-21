/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { getLogger } from 'vs/base/common/observableImpl/logging';
let _derived;
/**
 * @internal
 * This is to allow splitting files.
*/
export function _setDerived(derived) {
    _derived = derived;
}
export class ConvenientObservable {
    get TChange() { return null; }
    /** @sealed */
    read(reader) {
        reader.subscribeTo(this);
        return this.get();
    }
    /** @sealed */
    map(fn) {
        return _derived(() => {
            const name = getFunctionName(fn);
            return name !== undefined ? name : `${this.debugName} (mapped)`;
        }, (reader) => fn(this.read(reader)));
    }
}
export class BaseObservable extends ConvenientObservable {
    observers = new Set();
    /** @sealed */
    addObserver(observer) {
        const len = this.observers.size;
        this.observers.add(observer);
        if (len === 0) {
            this.onFirstObserverAdded();
        }
    }
    /** @sealed */
    removeObserver(observer) {
        const deleted = this.observers.delete(observer);
        if (deleted && this.observers.size === 0) {
            this.onLastObserverRemoved();
        }
    }
    onFirstObserverAdded() { }
    onLastObserverRemoved() { }
}
export function transaction(fn, getDebugName) {
    const tx = new TransactionImpl(fn, getDebugName);
    try {
        getLogger()?.handleBeginTransaction(tx);
        fn(tx);
    }
    finally {
        tx.finish();
        getLogger()?.handleEndTransaction();
    }
}
export function getFunctionName(fn) {
    const fnSrc = fn.toString();
    // Pattern: /** @description ... */
    const regexp = /\/\*\*\s*@description\s*([^*]*)\*\//;
    const match = regexp.exec(fnSrc);
    const result = match ? match[1] : undefined;
    return result?.trim();
}
export class TransactionImpl {
    fn;
    _getDebugName;
    updatingObservers = [];
    constructor(fn, _getDebugName) {
        this.fn = fn;
        this._getDebugName = _getDebugName;
    }
    getDebugName() {
        if (this._getDebugName) {
            return this._getDebugName();
        }
        return getFunctionName(this.fn);
    }
    updateObserver(observer, observable) {
        this.updatingObservers.push({ observer, observable });
        observer.beginUpdate(observable);
    }
    finish() {
        const updatingObservers = this.updatingObservers;
        // Prevent anyone from updating observers from now on.
        this.updatingObservers = null;
        for (const { observer, observable } of updatingObservers) {
            observer.endUpdate(observable);
        }
    }
}
export function observableValue(name, initialValue) {
    return new ObservableValue(name, initialValue);
}
export class ObservableValue extends BaseObservable {
    debugName;
    value;
    constructor(debugName, initialValue) {
        super();
        this.debugName = debugName;
        this.value = initialValue;
    }
    get() {
        return this.value;
    }
    set(value, tx, change) {
        if (this.value === value) {
            return;
        }
        if (!tx) {
            transaction((tx) => {
                this.set(value, tx, change);
            }, () => `Setting ${this.debugName}`);
            return;
        }
        const oldValue = this.value;
        this.value = value;
        getLogger()?.handleObservableChanged(this, { oldValue, newValue: value, change, didChange: true });
        for (const observer of this.observers) {
            tx.updateObserver(observer, this);
            observer.handleChange(this, change);
        }
    }
    toString() {
        return `${this.debugName}: ${this.value}`;
    }
}
