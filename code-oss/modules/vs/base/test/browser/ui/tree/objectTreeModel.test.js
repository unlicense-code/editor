/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { ObjectTreeModel } from 'vs/base/browser/ui/tree/objectTreeModel';
import { timeout } from 'vs/base/common/async';
function toList(arr) {
    return {
        splice(start, deleteCount, elements) {
            // console.log(`splice (${start}, ${deleteCount}, ${elements.length} [${elements.join(', ')}] )`); // debugging
            arr.splice(start, deleteCount, ...elements);
        },
        updateElementHeight() { }
    };
}
function toArray(list) {
    return list.map(i => i.element);
}
suite('ObjectTreeModel', function () {
    test('ctor', () => {
        const list = [];
        const model = new ObjectTreeModel('test', toList(list));
        assert(model);
        assert.strictEqual(list.length, 0);
        assert.strictEqual(model.size, 0);
    });
    test('flat', () => {
        const list = [];
        const model = new ObjectTreeModel('test', toList(list));
        model.setChildren(null, [
            { element: 0 },
            { element: 1 },
            { element: 2 }
        ]);
        assert.deepStrictEqual(toArray(list), [0, 1, 2]);
        assert.strictEqual(model.size, 3);
        model.setChildren(null, [
            { element: 3 },
            { element: 4 },
            { element: 5 },
        ]);
        assert.deepStrictEqual(toArray(list), [3, 4, 5]);
        assert.strictEqual(model.size, 3);
        model.setChildren(null);
        assert.deepStrictEqual(toArray(list), []);
        assert.strictEqual(model.size, 0);
    });
    test('nested', () => {
        const list = [];
        const model = new ObjectTreeModel('test', toList(list));
        model.setChildren(null, [
            {
                element: 0, children: [
                    { element: 10 },
                    { element: 11 },
                    { element: 12 },
                ]
            },
            { element: 1 },
            { element: 2 }
        ]);
        assert.deepStrictEqual(toArray(list), [0, 10, 11, 12, 1, 2]);
        assert.strictEqual(model.size, 6);
        model.setChildren(12, [
            { element: 120 },
            { element: 121 }
        ]);
        assert.deepStrictEqual(toArray(list), [0, 10, 11, 12, 120, 121, 1, 2]);
        assert.strictEqual(model.size, 8);
        model.setChildren(0);
        assert.deepStrictEqual(toArray(list), [0, 1, 2]);
        assert.strictEqual(model.size, 3);
        model.setChildren(null);
        assert.deepStrictEqual(toArray(list), []);
        assert.strictEqual(model.size, 0);
    });
    test('setChildren on collapsed node', () => {
        const list = [];
        const model = new ObjectTreeModel('test', toList(list));
        model.setChildren(null, [
            { element: 0, collapsed: true }
        ]);
        assert.deepStrictEqual(toArray(list), [0]);
        model.setChildren(0, [
            { element: 1 },
            { element: 2 }
        ]);
        assert.deepStrictEqual(toArray(list), [0]);
        model.setCollapsed(0, false);
        assert.deepStrictEqual(toArray(list), [0, 1, 2]);
    });
    test('setChildren on expanded, unrevealed node', () => {
        const list = [];
        const model = new ObjectTreeModel('test', toList(list));
        model.setChildren(null, [
            {
                element: 1, collapsed: true, children: [
                    { element: 11, collapsed: false }
                ]
            },
            { element: 2 }
        ]);
        assert.deepStrictEqual(toArray(list), [1, 2]);
        model.setChildren(11, [
            { element: 111 },
            { element: 112 }
        ]);
        assert.deepStrictEqual(toArray(list), [1, 2]);
        model.setCollapsed(1, false);
        assert.deepStrictEqual(toArray(list), [1, 11, 111, 112, 2]);
    });
    test('collapse state is preserved with strict identity', () => {
        const list = [];
        const model = new ObjectTreeModel('test', toList(list), { collapseByDefault: true });
        const data = [{ element: 'father', children: [{ element: 'child' }] }];
        model.setChildren(null, data);
        assert.deepStrictEqual(toArray(list), ['father']);
        model.setCollapsed('father', false);
        assert.deepStrictEqual(toArray(list), ['father', 'child']);
        model.setChildren(null, data);
        assert.deepStrictEqual(toArray(list), ['father', 'child']);
        const data2 = [{ element: 'father', children: [{ element: 'child' }] }, { element: 'uncle' }];
        model.setChildren(null, data2);
        assert.deepStrictEqual(toArray(list), ['father', 'child', 'uncle']);
        model.setChildren(null, [{ element: 'uncle' }]);
        assert.deepStrictEqual(toArray(list), ['uncle']);
        model.setChildren(null, data2);
        assert.deepStrictEqual(toArray(list), ['father', 'uncle']);
        model.setChildren(null, data);
        assert.deepStrictEqual(toArray(list), ['father']);
    });
    test('sorter', () => {
        const compare = (a, b) => a < b ? -1 : 1;
        const list = [];
        const model = new ObjectTreeModel('test', toList(list), { sorter: { compare(a, b) { return compare(a, b); } } });
        const data = [
            { element: 'cars', children: [{ element: 'sedan' }, { element: 'convertible' }, { element: 'compact' }] },
            { element: 'airplanes', children: [{ element: 'passenger' }, { element: 'jet' }] },
            { element: 'bicycles', children: [{ element: 'dutch' }, { element: 'mountain' }, { element: 'electric' }] },
        ];
        model.setChildren(null, data);
        assert.deepStrictEqual(toArray(list), ['airplanes', 'jet', 'passenger', 'bicycles', 'dutch', 'electric', 'mountain', 'cars', 'compact', 'convertible', 'sedan']);
    });
    test('resort', () => {
        let compare = () => 0;
        const list = [];
        const model = new ObjectTreeModel('test', toList(list), { sorter: { compare(a, b) { return compare(a, b); } } });
        const data = [
            { element: 'cars', children: [{ element: 'sedan' }, { element: 'convertible' }, { element: 'compact' }] },
            { element: 'airplanes', children: [{ element: 'passenger' }, { element: 'jet' }] },
            { element: 'bicycles', children: [{ element: 'dutch' }, { element: 'mountain' }, { element: 'electric' }] },
        ];
        model.setChildren(null, data);
        assert.deepStrictEqual(toArray(list), ['cars', 'sedan', 'convertible', 'compact', 'airplanes', 'passenger', 'jet', 'bicycles', 'dutch', 'mountain', 'electric']);
        // lexicographical
        compare = (a, b) => a < b ? -1 : 1;
        // non-recursive
        model.resort(null, false);
        assert.deepStrictEqual(toArray(list), ['airplanes', 'passenger', 'jet', 'bicycles', 'dutch', 'mountain', 'electric', 'cars', 'sedan', 'convertible', 'compact']);
        // recursive
        model.resort();
        assert.deepStrictEqual(toArray(list), ['airplanes', 'jet', 'passenger', 'bicycles', 'dutch', 'electric', 'mountain', 'cars', 'compact', 'convertible', 'sedan']);
        // reverse
        compare = (a, b) => a < b ? 1 : -1;
        // scoped
        model.resort('cars');
        assert.deepStrictEqual(toArray(list), ['airplanes', 'jet', 'passenger', 'bicycles', 'dutch', 'electric', 'mountain', 'cars', 'sedan', 'convertible', 'compact']);
        // recursive
        model.resort();
        assert.deepStrictEqual(toArray(list), ['cars', 'sedan', 'convertible', 'compact', 'bicycles', 'mountain', 'electric', 'dutch', 'airplanes', 'passenger', 'jet']);
    });
    test('expandTo', () => {
        const list = [];
        const model = new ObjectTreeModel('test', toList(list), { collapseByDefault: true });
        model.setChildren(null, [
            {
                element: 0, children: [
                    { element: 10, children: [{ element: 100, children: [{ element: 1000 }] }] },
                    { element: 11 },
                    { element: 12 },
                ]
            },
            { element: 1 },
            { element: 2 }
        ]);
        assert.deepStrictEqual(toArray(list), [0, 1, 2]);
        model.expandTo(1000);
        assert.deepStrictEqual(toArray(list), [0, 10, 100, 1000, 11, 12, 1, 2]);
    });
    test('issue #95641', async () => {
        const list = [];
        let fn = (_) => true;
        const filter = new class {
            filter(element, parentVisibility) {
                if (element === 'file') {
                    return 2 /* TreeVisibility.Recurse */;
                }
                return fn(element) ? 1 /* TreeVisibility.Visible */ : parentVisibility;
            }
        };
        const model = new ObjectTreeModel('test', toList(list), { filter });
        model.setChildren(null, [{ element: 'file', children: [{ element: 'hello' }] }]);
        assert.deepStrictEqual(toArray(list), ['file', 'hello']);
        fn = (el) => el === 'world';
        model.refilter();
        assert.deepStrictEqual(toArray(list), []);
        model.setChildren('file', [{ element: 'world' }]);
        await timeout(0); // wait for refilter microtask
        assert.deepStrictEqual(toArray(list), ['file', 'world']);
        model.setChildren('file', [{ element: 'hello' }]);
        await timeout(0); // wait for refilter microtask
        assert.deepStrictEqual(toArray(list), []);
        model.setChildren('file', [{ element: 'world' }]);
        await timeout(0); // wait for refilter microtask
        assert.deepStrictEqual(toArray(list), ['file', 'world']);
    });
});
