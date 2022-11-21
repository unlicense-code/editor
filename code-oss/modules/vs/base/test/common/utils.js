/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { setDisposableTracker } from 'vs/base/common/lifecycle';
import { join } from 'vs/base/common/path';
import { isWindows } from 'vs/base/common/platform';
import { URI } from 'vs/base/common/uri';
export function toResource(path) {
    if (isWindows) {
        return URI.file(join('C:\\', btoa(this.test.fullTitle()), path));
    }
    return URI.file(join('/', btoa(this.test.fullTitle()), path));
}
export function suiteRepeat(n, description, callback) {
    for (let i = 0; i < n; i++) {
        suite(`${description} (iteration ${i})`, callback);
    }
}
export function testRepeat(n, description, callback) {
    for (let i = 0; i < n; i++) {
        test(`${description} (iteration ${i})`, callback);
    }
}
export async function assertThrowsAsync(block, message = 'Missing expected exception') {
    try {
        await block();
    }
    catch {
        return;
    }
    const err = message instanceof Error ? message : new Error(message);
    throw err;
}
export class DisposableTracker {
    livingDisposables = new Map();
    getDisposableData(d) {
        let val = this.livingDisposables.get(d);
        if (!val) {
            val = { parent: null, source: null, isSingleton: false };
            this.livingDisposables.set(d, val);
        }
        return val;
    }
    trackDisposable(d) {
        const data = this.getDisposableData(d);
        if (!data.source) {
            data.source = new Error().stack;
        }
    }
    setParent(child, parent) {
        const data = this.getDisposableData(child);
        data.parent = parent;
    }
    markAsDisposed(x) {
        this.livingDisposables.delete(x);
    }
    markAsSingleton(disposable) {
        this.getDisposableData(disposable).isSingleton = true;
    }
    getRootParent(data, cache) {
        const cacheValue = cache.get(data);
        if (cacheValue) {
            return cacheValue;
        }
        const result = data.parent ? this.getRootParent(this.getDisposableData(data.parent), cache) : data;
        cache.set(data, result);
        return result;
    }
    getTrackedDisposables() {
        const rootParentCache = new Map();
        const leaking = [...this.livingDisposables.entries()]
            .filter(([, v]) => v.source !== null && !this.getRootParent(v, rootParentCache).isSingleton)
            .map(([k]) => k)
            .flat();
        return leaking;
    }
    ensureNoLeakingDisposables() {
        const rootParentCache = new Map();
        const leaking = [...this.livingDisposables.values()]
            .filter(v => v.source !== null && !this.getRootParent(v, rootParentCache).isSingleton);
        if (leaking.length > 0) {
            const count = 10;
            const firstLeaking = leaking.slice(0, count);
            const remainingCount = leaking.length - count;
            const separator = '--------------------\n\n';
            let s = firstLeaking.map(l => l.source).join(separator);
            if (remainingCount > 0) {
                s += `${separator}+ ${remainingCount} more`;
            }
            throw new Error(`These disposables were not disposed:\n${s}`);
        }
    }
}
/**
 * Use this function to ensure that all disposables are cleaned up at the end of each test in the current suite.
 *
 * Use `markAsSingleton` if disposable singletons are created lazily that are allowed to outlive the test.
 * Make sure that the singleton properly registers all child disposables so that they are excluded too.
*/
export function ensureNoDisposablesAreLeakedInTestSuite() {
    let tracker;
    setup(() => {
        tracker = new DisposableTracker();
        setDisposableTracker(tracker);
    });
    teardown(function () {
        setDisposableTracker(null);
        if (this.currentTest?.state !== 'failed') {
            tracker.ensureNoLeakingDisposables();
        }
    });
}
export function throwIfDisposablesAreLeaked(body) {
    const tracker = new DisposableTracker();
    setDisposableTracker(tracker);
    body();
    setDisposableTracker(null);
    tracker.ensureNoLeakingDisposables();
}
export async function throwIfDisposablesAreLeakedAsync(body) {
    const tracker = new DisposableTracker();
    setDisposableTracker(tracker);
    await body();
    setDisposableTracker(null);
    tracker.ensureNoLeakingDisposables();
}
