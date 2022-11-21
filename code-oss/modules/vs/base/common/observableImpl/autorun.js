/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { DisposableStore, toDisposable } from 'vs/base/common/lifecycle';
import { getLogger } from 'vs/base/common/observableImpl/logging';
export function autorun(debugName, fn) {
    return new AutorunObserver(debugName, fn, undefined);
}
export function autorunHandleChanges(debugName, options, fn) {
    return new AutorunObserver(debugName, fn, options.handleChange);
}
export function autorunWithStore(fn, debugName) {
    const store = new DisposableStore();
    const disposable = autorun(debugName, reader => {
        store.clear();
        fn(reader, store);
    });
    return toDisposable(() => {
        disposable.dispose();
        store.dispose();
    });
}
export class AutorunObserver {
    debugName;
    runFn;
    _handleChange;
    needsToRun = true;
    updateCount = 0;
    disposed = false;
    /**
     * The actual dependencies.
    */
    _dependencies = new Set();
    get dependencies() {
        return this._dependencies;
    }
    /**
     * Dependencies that have to be removed when {@link runFn} ran through.
    */
    staleDependencies = new Set();
    constructor(debugName, runFn, _handleChange) {
        this.debugName = debugName;
        this.runFn = runFn;
        this._handleChange = _handleChange;
        getLogger()?.handleAutorunCreated(this);
        this.runIfNeeded();
    }
    subscribeTo(observable) {
        // In case the run action disposes the autorun
        if (this.disposed) {
            return;
        }
        this._dependencies.add(observable);
        if (!this.staleDependencies.delete(observable)) {
            observable.addObserver(this);
        }
    }
    handleChange(observable, change) {
        const shouldReact = this._handleChange ? this._handleChange({
            changedObservable: observable,
            change,
            didChange: o => o === observable,
        }) : true;
        this.needsToRun = this.needsToRun || shouldReact;
        if (this.updateCount === 0) {
            this.runIfNeeded();
        }
    }
    beginUpdate() {
        this.updateCount++;
    }
    endUpdate() {
        this.updateCount--;
        if (this.updateCount === 0) {
            this.runIfNeeded();
        }
    }
    runIfNeeded() {
        if (!this.needsToRun) {
            return;
        }
        // Assert: this.staleDependencies is an empty set.
        const emptySet = this.staleDependencies;
        this.staleDependencies = this._dependencies;
        this._dependencies = emptySet;
        this.needsToRun = false;
        getLogger()?.handleAutorunTriggered(this);
        try {
            this.runFn(this);
        }
        finally {
            // We don't want our observed observables to think that they are (not even temporarily) not being observed.
            // Thus, we only unsubscribe from observables that are definitely not read anymore.
            for (const o of this.staleDependencies) {
                o.removeObserver(this);
            }
            this.staleDependencies.clear();
        }
    }
    dispose() {
        this.disposed = true;
        for (const o of this._dependencies) {
            o.removeObserver(this);
        }
        this._dependencies.clear();
    }
    toString() {
        return `Autorun<${this.debugName}>`;
    }
}
(function (autorun) {
    autorun.Observer = AutorunObserver;
})(autorun || (autorun = {}));
export function autorunDelta(name, observable, handler) {
    let _lastValue;
    return autorun(name, (reader) => {
        const newValue = observable.read(reader);
        const lastValue = _lastValue;
        _lastValue = newValue;
        handler({ lastValue, newValue });
    });
}
