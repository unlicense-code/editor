/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { deepStrictEqual } from 'assert';
import { TerminalCapabilityStore, TerminalCapabilityStoreMultiplexer } from 'vs/platform/terminal/common/capabilities/terminalCapabilityStore';
suite('TerminalCapabilityStore', () => {
    let store;
    let addEvents;
    let removeEvents;
    setup(() => {
        store = new TerminalCapabilityStore();
        store.onDidAddCapability(e => addEvents.push(e));
        store.onDidRemoveCapability(e => removeEvents.push(e));
        addEvents = [];
        removeEvents = [];
    });
    teardown(() => store.dispose());
    test('should fire events when capabilities are added', () => {
        assertEvents(addEvents, []);
        store.add(0 /* TerminalCapability.CwdDetection */, null);
        assertEvents(addEvents, [0 /* TerminalCapability.CwdDetection */]);
    });
    test('should fire events when capabilities are removed', async () => {
        assertEvents(removeEvents, []);
        store.add(0 /* TerminalCapability.CwdDetection */, null);
        assertEvents(removeEvents, []);
        store.remove(0 /* TerminalCapability.CwdDetection */);
        assertEvents(removeEvents, [0 /* TerminalCapability.CwdDetection */]);
    });
    test('has should return whether a capability is present', () => {
        deepStrictEqual(store.has(0 /* TerminalCapability.CwdDetection */), false);
        store.add(0 /* TerminalCapability.CwdDetection */, null);
        deepStrictEqual(store.has(0 /* TerminalCapability.CwdDetection */), true);
        store.remove(0 /* TerminalCapability.CwdDetection */);
        deepStrictEqual(store.has(0 /* TerminalCapability.CwdDetection */), false);
    });
    test('items should reflect current state', () => {
        deepStrictEqual(Array.from(store.items), []);
        store.add(0 /* TerminalCapability.CwdDetection */, null);
        deepStrictEqual(Array.from(store.items), [0 /* TerminalCapability.CwdDetection */]);
        store.add(1 /* TerminalCapability.NaiveCwdDetection */, null);
        deepStrictEqual(Array.from(store.items), [0 /* TerminalCapability.CwdDetection */, 1 /* TerminalCapability.NaiveCwdDetection */]);
        store.remove(0 /* TerminalCapability.CwdDetection */);
        deepStrictEqual(Array.from(store.items), [1 /* TerminalCapability.NaiveCwdDetection */]);
    });
});
suite('TerminalCapabilityStoreMultiplexer', () => {
    let multiplexer;
    let store1;
    let store2;
    let addEvents;
    let removeEvents;
    setup(() => {
        multiplexer = new TerminalCapabilityStoreMultiplexer();
        multiplexer.onDidAddCapability(e => addEvents.push(e));
        multiplexer.onDidRemoveCapability(e => removeEvents.push(e));
        store1 = new TerminalCapabilityStore();
        store2 = new TerminalCapabilityStore();
        addEvents = [];
        removeEvents = [];
    });
    teardown(() => multiplexer.dispose());
    test('should fire events when capabilities are enabled', async () => {
        assertEvents(addEvents, []);
        multiplexer.add(store1);
        multiplexer.add(store2);
        store1.add(0 /* TerminalCapability.CwdDetection */, null);
        assertEvents(addEvents, [0 /* TerminalCapability.CwdDetection */]);
        store2.add(1 /* TerminalCapability.NaiveCwdDetection */, null);
        assertEvents(addEvents, [1 /* TerminalCapability.NaiveCwdDetection */]);
    });
    test('should fire events when capabilities are disabled', async () => {
        assertEvents(removeEvents, []);
        multiplexer.add(store1);
        multiplexer.add(store2);
        store1.add(0 /* TerminalCapability.CwdDetection */, null);
        store2.add(1 /* TerminalCapability.NaiveCwdDetection */, null);
        assertEvents(removeEvents, []);
        store1.remove(0 /* TerminalCapability.CwdDetection */);
        assertEvents(removeEvents, [0 /* TerminalCapability.CwdDetection */]);
        store2.remove(1 /* TerminalCapability.NaiveCwdDetection */);
        assertEvents(removeEvents, [1 /* TerminalCapability.NaiveCwdDetection */]);
    });
    test('should fire events when stores are added', async () => {
        assertEvents(addEvents, []);
        store1.add(0 /* TerminalCapability.CwdDetection */, null);
        assertEvents(addEvents, []);
        store2.add(1 /* TerminalCapability.NaiveCwdDetection */, null);
        multiplexer.add(store1);
        multiplexer.add(store2);
        assertEvents(addEvents, [0 /* TerminalCapability.CwdDetection */, 1 /* TerminalCapability.NaiveCwdDetection */]);
    });
    test('items should return items from all stores', () => {
        deepStrictEqual(Array.from(multiplexer.items).sort(), [].sort());
        multiplexer.add(store1);
        multiplexer.add(store2);
        store1.add(0 /* TerminalCapability.CwdDetection */, null);
        deepStrictEqual(Array.from(multiplexer.items).sort(), [0 /* TerminalCapability.CwdDetection */].sort());
        store1.add(2 /* TerminalCapability.CommandDetection */, null);
        store2.add(1 /* TerminalCapability.NaiveCwdDetection */, null);
        deepStrictEqual(Array.from(multiplexer.items).sort(), [0 /* TerminalCapability.CwdDetection */, 2 /* TerminalCapability.CommandDetection */, 1 /* TerminalCapability.NaiveCwdDetection */].sort());
        store2.remove(1 /* TerminalCapability.NaiveCwdDetection */);
        deepStrictEqual(Array.from(multiplexer.items).sort(), [0 /* TerminalCapability.CwdDetection */, 2 /* TerminalCapability.CommandDetection */].sort());
    });
    test('has should return whether a capability is present', () => {
        deepStrictEqual(multiplexer.has(0 /* TerminalCapability.CwdDetection */), false);
        multiplexer.add(store1);
        store1.add(0 /* TerminalCapability.CwdDetection */, null);
        deepStrictEqual(multiplexer.has(0 /* TerminalCapability.CwdDetection */), true);
        store1.remove(0 /* TerminalCapability.CwdDetection */);
        deepStrictEqual(multiplexer.has(0 /* TerminalCapability.CwdDetection */), false);
    });
});
function assertEvents(actual, expected) {
    deepStrictEqual(actual, expected);
    actual.length = 0;
}
