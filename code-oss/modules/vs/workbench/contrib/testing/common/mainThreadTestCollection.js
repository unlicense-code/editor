/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Iterable } from 'vs/base/common/iterator';
import { AbstractIncrementalTestCollection } from 'vs/workbench/contrib/testing/common/testTypes';
export class MainThreadTestCollection extends AbstractIncrementalTestCollection {
    expandActual;
    busyProvidersChangeEmitter = new Emitter();
    expandPromises = new WeakMap();
    /**
     * @inheritdoc
     */
    get busyProviders() {
        return this.busyControllerCount;
    }
    /**
     * @inheritdoc
     */
    get rootItems() {
        return this.roots;
    }
    /**
     * @inheritdoc
     */
    get all() {
        return this.getIterator();
    }
    get rootIds() {
        return Iterable.map(this.roots.values(), r => r.item.extId);
    }
    onBusyProvidersChange = this.busyProvidersChangeEmitter.event;
    constructor(expandActual) {
        super();
        this.expandActual = expandActual;
    }
    /**
     * @inheritdoc
     */
    expand(testId, levels) {
        const test = this.items.get(testId);
        if (!test) {
            return Promise.resolve();
        }
        // simple cache to avoid duplicate/unnecessary expansion calls
        const existing = this.expandPromises.get(test);
        if (existing && existing.pendingLvl >= levels) {
            return existing.prom;
        }
        const prom = this.expandActual(test.item.extId, levels);
        const record = { doneLvl: existing ? existing.doneLvl : -1, pendingLvl: levels, prom };
        this.expandPromises.set(test, record);
        return prom.then(() => {
            record.doneLvl = levels;
        });
    }
    /**
     * @inheritdoc
     */
    getNodeById(id) {
        return this.items.get(id);
    }
    /**
     * @inheritdoc
     */
    getReviverDiff() {
        const ops = [{ op: 4 /* TestDiffOpType.IncrementPendingExtHosts */, amount: this.pendingRootCount }];
        const queue = [this.rootIds];
        while (queue.length) {
            for (const child of queue.pop()) {
                const item = this.items.get(child);
                ops.push({
                    op: 0 /* TestDiffOpType.Add */,
                    item: {
                        controllerId: item.controllerId,
                        expand: item.expand,
                        item: item.item,
                    }
                });
                queue.push(item.children);
            }
        }
        return ops;
    }
    /**
     * Applies the diff to the collection.
     */
    apply(diff) {
        const prevBusy = this.busyControllerCount;
        super.apply(diff);
        if (prevBusy !== this.busyControllerCount) {
            this.busyProvidersChangeEmitter.fire(this.busyControllerCount);
        }
    }
    /**
     * Clears everything from the collection, and returns a diff that applies
     * that action.
     */
    clear() {
        const ops = [];
        for (const root of this.roots) {
            ops.push({ op: 3 /* TestDiffOpType.Remove */, itemId: root.item.extId });
        }
        this.roots.clear();
        this.items.clear();
        return ops;
    }
    /**
     * @override
     */
    createItem(internal) {
        return { ...internal, children: new Set() };
    }
    *getIterator() {
        const queue = [this.rootIds];
        while (queue.length) {
            for (const id of queue.pop()) {
                const node = this.getNodeById(id);
                yield node;
                queue.push(node.children);
            }
        }
    }
}
