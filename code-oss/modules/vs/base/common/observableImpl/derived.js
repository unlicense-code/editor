/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { BaseObservable, _setDerived } from 'vs/base/common/observableImpl/base';
import { getLogger } from 'vs/base/common/observableImpl/logging';
export function derived(debugName, computeFn) {
    return new Derived(debugName, computeFn);
}
_setDerived(derived);
export class Derived extends BaseObservable {
    _debugName;
    computeFn;
    hadValue = false;
    hasValue = false;
    value = undefined;
    updateCount = 0;
    _dependencies = new Set();
    get dependencies() {
        return this._dependencies;
    }
    /**
     * Dependencies that have to be removed when {@link runFn} ran through.
     */
    staleDependencies = new Set();
    get debugName() {
        return typeof this._debugName === 'function' ? this._debugName() : this._debugName;
    }
    constructor(_debugName, computeFn) {
        super();
        this._debugName = _debugName;
        this.computeFn = computeFn;
        getLogger()?.handleDerivedCreated(this);
    }
    onLastObserverRemoved() {
        /**
         * We are not tracking changes anymore, thus we have to assume
         * that our cache is invalid.
         */
        this.hasValue = false;
        this.hadValue = false;
        this.value = undefined;
        for (const d of this._dependencies) {
            d.removeObserver(this);
        }
        this._dependencies.clear();
    }
    get() {
        if (this.observers.size === 0) {
            // Cache is not valid and don't refresh the cache.
            // Observables should not be read in non-reactive contexts.
            const result = this.computeFn(this);
            // Clear new dependencies
            this.onLastObserverRemoved();
            return result;
        }
        if (this.updateCount > 0 && this.hasValue) {
            // Refresh dependencies
            for (const d of this._dependencies) {
                // Maybe `.get()` triggers `handleChange`?
                d.get();
                if (!this.hasValue) {
                    // The other dependencies will refresh on demand
                    break;
                }
            }
        }
        if (!this.hasValue) {
            const emptySet = this.staleDependencies;
            this.staleDependencies = this._dependencies;
            this._dependencies = emptySet;
            const oldValue = this.value;
            try {
                this.value = this.computeFn(this);
            }
            finally {
                // We don't want our observed observables to think that they are (not even temporarily) not being observed.
                // Thus, we only unsubscribe from observables that are definitely not read anymore.
                for (const o of this.staleDependencies) {
                    o.removeObserver(this);
                }
                this.staleDependencies.clear();
            }
            this.hasValue = true;
            const didChange = this.hadValue && oldValue !== this.value;
            getLogger()?.handleDerivedRecomputed(this, {
                oldValue,
                newValue: this.value,
                change: undefined,
                didChange
            });
            if (didChange) {
                for (const r of this.observers) {
                    r.handleChange(this, undefined);
                }
            }
        }
        return this.value;
    }
    // IObserver Implementation
    beginUpdate() {
        if (this.updateCount === 0) {
            for (const r of this.observers) {
                r.beginUpdate(this);
            }
        }
        this.updateCount++;
    }
    handleChange(_observable, _change) {
        if (this.hasValue) {
            this.hadValue = true;
            this.hasValue = false;
        }
        // Not in transaction: Recompute & inform observers immediately
        if (this.updateCount === 0 && this.observers.size > 0) {
            this.get();
        }
        // Otherwise, recompute in `endUpdate` or on demand.
    }
    endUpdate() {
        this.updateCount--;
        if (this.updateCount === 0) {
            if (this.observers.size > 0) {
                // Propagate invalidation
                this.get();
            }
            for (const r of this.observers) {
                r.endUpdate(this);
            }
        }
    }
    // IReader Implementation
    subscribeTo(observable) {
        this._dependencies.add(observable);
        // We are already added as observer for stale dependencies.
        if (!this.staleDependencies.delete(observable)) {
            observable.addObserver(this);
        }
    }
    toString() {
        return `LazyDerived<${this.debugName}>`;
    }
}
