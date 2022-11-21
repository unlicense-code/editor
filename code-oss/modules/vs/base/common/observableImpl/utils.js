/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { toDisposable } from 'vs/base/common/lifecycle';
import { autorun } from 'vs/base/common/observableImpl/autorun';
import { BaseObservable, transaction, ConvenientObservable, observableValue, getFunctionName } from 'vs/base/common/observableImpl/base';
import { derived } from 'vs/base/common/observableImpl/derived';
import { getLogger } from 'vs/base/common/observableImpl/logging';
export function constObservable(value) {
    return new ConstObservable(value);
}
class ConstObservable extends ConvenientObservable {
    value;
    constructor(value) {
        super();
        this.value = value;
    }
    get debugName() {
        return this.toString();
    }
    get() {
        return this.value;
    }
    addObserver(observer) {
        // NO OP
    }
    removeObserver(observer) {
        // NO OP
    }
    toString() {
        return `Const: ${this.value}`;
    }
}
export function observableFromPromise(promise) {
    const observable = observableValue('promiseValue', {});
    promise.then((value) => {
        observable.set({ value }, undefined);
    });
    return observable;
}
export function waitForState(observable, predicate) {
    return new Promise(resolve => {
        let didRun = false;
        let shouldDispose = false;
        const d = autorun('waitForState', reader => {
            const currentState = observable.read(reader);
            if (predicate(currentState)) {
                if (!didRun) {
                    shouldDispose = true;
                }
                else {
                    d.dispose();
                }
                resolve(currentState);
            }
        });
        didRun = true;
        if (shouldDispose) {
            d.dispose();
        }
    });
}
export function observableFromEvent(event, getValue) {
    return new FromEventObservable(event, getValue);
}
export class FromEventObservable extends BaseObservable {
    event;
    getValue;
    value;
    hasValue = false;
    subscription;
    constructor(event, getValue) {
        super();
        this.event = event;
        this.getValue = getValue;
    }
    getDebugName() {
        return getFunctionName(this.getValue);
    }
    get debugName() {
        const name = this.getDebugName();
        return 'From Event' + (name ? `: ${name}` : '');
    }
    onFirstObserverAdded() {
        this.subscription = this.event(this.handleEvent);
    }
    handleEvent = (args) => {
        const newValue = this.getValue(args);
        const didChange = this.value !== newValue;
        getLogger()?.handleFromEventObservableTriggered(this, { oldValue: this.value, newValue, change: undefined, didChange });
        if (didChange) {
            this.value = newValue;
            if (this.hasValue) {
                transaction((tx) => {
                    for (const o of this.observers) {
                        tx.updateObserver(o, this);
                        o.handleChange(this, undefined);
                    }
                }, () => {
                    const name = this.getDebugName();
                    return 'Event fired' + (name ? `: ${name}` : '');
                });
            }
            this.hasValue = true;
        }
    };
    onLastObserverRemoved() {
        this.subscription.dispose();
        this.subscription = undefined;
        this.hasValue = false;
        this.value = undefined;
    }
    get() {
        if (this.subscription) {
            if (!this.hasValue) {
                this.handleEvent(undefined);
            }
            return this.value;
        }
        else {
            // no cache, as there are no subscribers to keep it updated
            return this.getValue(undefined);
        }
    }
}
(function (observableFromEvent) {
    observableFromEvent.Observer = FromEventObservable;
})(observableFromEvent || (observableFromEvent = {}));
export function observableSignalFromEvent(debugName, event) {
    return new FromEventObservableSignal(debugName, event);
}
class FromEventObservableSignal extends BaseObservable {
    debugName;
    event;
    subscription;
    constructor(debugName, event) {
        super();
        this.debugName = debugName;
        this.event = event;
    }
    onFirstObserverAdded() {
        this.subscription = this.event(this.handleEvent);
    }
    handleEvent = () => {
        transaction((tx) => {
            for (const o of this.observers) {
                tx.updateObserver(o, this);
                o.handleChange(this, undefined);
            }
        }, () => this.debugName);
    };
    onLastObserverRemoved() {
        this.subscription.dispose();
        this.subscription = undefined;
    }
    get() {
        // NO OP
    }
}
export function observableSignal(debugName) {
    return new ObservableSignal(debugName);
}
class ObservableSignal extends BaseObservable {
    debugName;
    constructor(debugName) {
        super();
        this.debugName = debugName;
    }
    trigger(tx) {
        if (!tx) {
            transaction(tx => {
                this.trigger(tx);
            }, () => `Trigger signal ${this.debugName}`);
            return;
        }
        for (const o of this.observers) {
            tx.updateObserver(o, this);
            o.handleChange(this, undefined);
        }
    }
    get() {
        // NO OP
    }
}
export function debouncedObservable(observable, debounceMs, disposableStore) {
    const debouncedObservable = observableValue('debounced', undefined);
    let timeout = undefined;
    disposableStore.add(autorun('debounce', reader => {
        const value = observable.read(reader);
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            transaction(tx => {
                debouncedObservable.set(value, tx);
            });
        }, debounceMs);
    }));
    return debouncedObservable;
}
export function wasEventTriggeredRecently(event, timeoutMs, disposableStore) {
    const observable = observableValue('triggeredRecently', false);
    let timeout = undefined;
    disposableStore.add(event(() => {
        observable.set(true, undefined);
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            observable.set(false, undefined);
        }, timeoutMs);
    }));
    return observable;
}
/**
 * This ensures the observable is kept up-to-date.
 * This is useful when the observables `get` method is used.
*/
export function keepAlive(observable) {
    const o = new KeepAliveObserver();
    observable.addObserver(o);
    return toDisposable(() => {
        observable.removeObserver(o);
    });
}
class KeepAliveObserver {
    beginUpdate(observable) {
        // NO OP
    }
    handleChange(observable, change) {
        // NO OP
    }
    endUpdate(observable) {
        // NO OP
    }
}
export function derivedObservableWithCache(name, computeFn) {
    let lastValue = undefined;
    const observable = derived(name, reader => {
        lastValue = computeFn(reader, lastValue);
        return lastValue;
    });
    return observable;
}
export function derivedObservableWithWritableCache(name, computeFn) {
    let lastValue = undefined;
    const counter = observableValue('derivedObservableWithWritableCache.counter', 0);
    const observable = derived(name, reader => {
        counter.read(reader);
        lastValue = computeFn(reader, lastValue);
        return lastValue;
    });
    return Object.assign(observable, {
        clearCache: (transaction) => {
            lastValue = undefined;
            counter.set(counter.get() + 1, transaction);
        },
    });
}
