/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CancellationToken } from 'vs/base/common/cancellation';
import { Iterable } from 'vs/base/common/iterator';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { TestId } from 'vs/workbench/contrib/testing/common/testId';
export const ITestService = createDecorator('testService');
/**
 * Iterates through the item and its parents to the root.
 */
export const getCollectionItemParents = function* (collection, item) {
    for (const id of TestId.fromString(item.item.extId).idsToRoot()) {
        yield collection.getNodeById(id.toString());
    }
};
export const testCollectionIsEmpty = (collection) => !Iterable.some(collection.rootItems, r => r.children.size > 0);
export const getContextForTestItem = (collection, id) => {
    if (typeof id === 'string') {
        id = TestId.fromString(id);
    }
    if (id.isRoot) {
        return { controller: id.toString() };
    }
    const context = { $mid: 14 /* MarshalledId.TestItemContext */, tests: [] };
    for (const i of id.idsFromRoot()) {
        if (!i.isRoot) {
            const test = collection.getNodeById(i.toString());
            if (test) {
                context.tests.push(test);
            }
        }
    }
    return context;
};
/**
 * Ensures the test with the given ID exists in the collection, if possible.
 * If cancellation is requested, or the test cannot be found, it will return
 * undefined.
 */
export const expandAndGetTestById = async (collection, id, ct = CancellationToken.None) => {
    const idPath = [...TestId.fromString(id).idsFromRoot()];
    let expandToLevel = 0;
    for (let i = idPath.length - 1; !ct.isCancellationRequested && i >= expandToLevel;) {
        const id = idPath[i].toString();
        const existing = collection.getNodeById(id);
        if (!existing) {
            i--;
            continue;
        }
        if (i === idPath.length - 1) {
            return existing;
        }
        // expand children only if it looks like it's necessary
        if (!existing.children.has(idPath[i + 1].toString())) {
            await collection.expand(id, 0);
        }
        expandToLevel = i + 1; // avoid an infinite loop if the test does not exist
        i = idPath.length - 1;
    }
    return undefined;
};
/**
 * Waits for all test in the hierarchy to be fulfilled before returning.
 * If cancellation is requested, it will return early.
 */
export const getAllTestsInHierarchy = async (collection, ct = CancellationToken.None) => {
    if (ct.isCancellationRequested) {
        return;
    }
    let l;
    await Promise.race([
        Promise.all([...collection.rootItems].map(r => collection.expand(r.item.extId, Infinity))),
        new Promise(r => { l = ct.onCancellationRequested(r); }),
    ]).finally(() => l?.dispose());
};
/**
 * Waits for the test to no longer be in the "busy" state.
 */
export const waitForTestToBeIdle = (testService, test) => {
    if (!test.item.busy) {
        return;
    }
    return new Promise(resolve => {
        const l = testService.onDidProcessDiff(() => {
            if (testService.collection.getNodeById(test.item.extId)?.item.busy !== true) {
                resolve(); // removed, or no longer busy
                l.dispose();
            }
        });
    });
};
/**
 * Iterator that expands to and iterates through tests in the file. Iterates
 * in strictly descending order.
 */
export const testsInFile = async function* (testService, ident, uri, waitForIdle = true) {
    for (const test of testService.collection.all) {
        if (!test.item.uri) {
            continue;
        }
        if (ident.extUri.isEqual(uri, test.item.uri)) {
            yield test;
        }
        if (ident.extUri.isEqualOrParent(uri, test.item.uri)) {
            if (test.expand === 1 /* TestItemExpandState.Expandable */) {
                await testService.collection.expand(test.item.extId, 1);
            }
            if (waitForIdle) {
                await waitForTestToBeIdle(testService, test);
            }
        }
    }
};
