/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { createKeybinding, createSimpleKeybinding } from 'vs/base/common/keybindings';
import { KeyChord } from 'vs/base/common/keyCodes';
import { OS } from 'vs/base/common/platform';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { KeybindingResolver } from 'vs/platform/keybinding/common/keybindingResolver';
import { ResolvedKeybindingItem } from 'vs/platform/keybinding/common/resolvedKeybindingItem';
import { USLayoutResolvedKeybinding } from 'vs/platform/keybinding/common/usLayoutResolvedKeybinding';
function createContext(ctx) {
    return {
        getValue: (key) => {
            return ctx[key];
        }
    };
}
suite('KeybindingResolver', () => {
    function kbItem(keybinding, command, commandArgs, when, isDefault) {
        const resolvedKeybinding = (keybinding !== 0 ? new USLayoutResolvedKeybinding(createKeybinding(keybinding, OS), OS) : undefined);
        return new ResolvedKeybindingItem(resolvedKeybinding, command, commandArgs, when, isDefault, null, false);
    }
    function getDispatchStr(runtimeKb) {
        return USLayoutResolvedKeybinding.getDispatchStr(runtimeKb);
    }
    test('resolve key', () => {
        const keybinding = 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 56 /* KeyCode.KeyZ */;
        const runtimeKeybinding = createSimpleKeybinding(keybinding, OS);
        const contextRules = ContextKeyExpr.equals('bar', 'baz');
        const keybindingItem = kbItem(keybinding, 'yes', null, contextRules, true);
        assert.strictEqual(contextRules.evaluate(createContext({ bar: 'baz' })), true);
        assert.strictEqual(contextRules.evaluate(createContext({ bar: 'bz' })), false);
        const resolver = new KeybindingResolver([keybindingItem], [], () => { });
        assert.strictEqual(resolver.resolve(createContext({ bar: 'baz' }), null, getDispatchStr(runtimeKeybinding)).commandId, 'yes');
        assert.strictEqual(resolver.resolve(createContext({ bar: 'bz' }), null, getDispatchStr(runtimeKeybinding)), null);
    });
    test('resolve key with arguments', () => {
        const commandArgs = { text: 'no' };
        const keybinding = 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 56 /* KeyCode.KeyZ */;
        const runtimeKeybinding = createSimpleKeybinding(keybinding, OS);
        const contextRules = ContextKeyExpr.equals('bar', 'baz');
        const keybindingItem = kbItem(keybinding, 'yes', commandArgs, contextRules, true);
        const resolver = new KeybindingResolver([keybindingItem], [], () => { });
        assert.strictEqual(resolver.resolve(createContext({ bar: 'baz' }), null, getDispatchStr(runtimeKeybinding)).commandArgs, commandArgs);
    });
    test('KeybindingResolver.handleRemovals simple 1', () => {
        const defaults = [
            kbItem(31 /* KeyCode.KeyA */, 'yes1', null, ContextKeyExpr.equals('1', 'a'), true)
        ];
        const overrides = [
            kbItem(32 /* KeyCode.KeyB */, 'yes2', null, ContextKeyExpr.equals('2', 'b'), false)
        ];
        const actual = KeybindingResolver.handleRemovals([...defaults, ...overrides]);
        assert.deepStrictEqual(actual, [
            kbItem(31 /* KeyCode.KeyA */, 'yes1', null, ContextKeyExpr.equals('1', 'a'), true),
            kbItem(32 /* KeyCode.KeyB */, 'yes2', null, ContextKeyExpr.equals('2', 'b'), false),
        ]);
    });
    test('KeybindingResolver.handleRemovals simple 2', () => {
        const defaults = [
            kbItem(31 /* KeyCode.KeyA */, 'yes1', null, ContextKeyExpr.equals('1', 'a'), true),
            kbItem(32 /* KeyCode.KeyB */, 'yes2', null, ContextKeyExpr.equals('2', 'b'), true)
        ];
        const overrides = [
            kbItem(33 /* KeyCode.KeyC */, 'yes3', null, ContextKeyExpr.equals('3', 'c'), false)
        ];
        const actual = KeybindingResolver.handleRemovals([...defaults, ...overrides]);
        assert.deepStrictEqual(actual, [
            kbItem(31 /* KeyCode.KeyA */, 'yes1', null, ContextKeyExpr.equals('1', 'a'), true),
            kbItem(32 /* KeyCode.KeyB */, 'yes2', null, ContextKeyExpr.equals('2', 'b'), true),
            kbItem(33 /* KeyCode.KeyC */, 'yes3', null, ContextKeyExpr.equals('3', 'c'), false),
        ]);
    });
    test('KeybindingResolver.handleRemovals removal with not matching when', () => {
        const defaults = [
            kbItem(31 /* KeyCode.KeyA */, 'yes1', null, ContextKeyExpr.equals('1', 'a'), true),
            kbItem(32 /* KeyCode.KeyB */, 'yes2', null, ContextKeyExpr.equals('2', 'b'), true)
        ];
        const overrides = [
            kbItem(31 /* KeyCode.KeyA */, '-yes1', null, ContextKeyExpr.equals('1', 'b'), false)
        ];
        const actual = KeybindingResolver.handleRemovals([...defaults, ...overrides]);
        assert.deepStrictEqual(actual, [
            kbItem(31 /* KeyCode.KeyA */, 'yes1', null, ContextKeyExpr.equals('1', 'a'), true),
            kbItem(32 /* KeyCode.KeyB */, 'yes2', null, ContextKeyExpr.equals('2', 'b'), true)
        ]);
    });
    test('KeybindingResolver.handleRemovals removal with not matching keybinding', () => {
        const defaults = [
            kbItem(31 /* KeyCode.KeyA */, 'yes1', null, ContextKeyExpr.equals('1', 'a'), true),
            kbItem(32 /* KeyCode.KeyB */, 'yes2', null, ContextKeyExpr.equals('2', 'b'), true)
        ];
        const overrides = [
            kbItem(32 /* KeyCode.KeyB */, '-yes1', null, ContextKeyExpr.equals('1', 'a'), false)
        ];
        const actual = KeybindingResolver.handleRemovals([...defaults, ...overrides]);
        assert.deepStrictEqual(actual, [
            kbItem(31 /* KeyCode.KeyA */, 'yes1', null, ContextKeyExpr.equals('1', 'a'), true),
            kbItem(32 /* KeyCode.KeyB */, 'yes2', null, ContextKeyExpr.equals('2', 'b'), true)
        ]);
    });
    test('KeybindingResolver.handleRemovals removal with matching keybinding and when', () => {
        const defaults = [
            kbItem(31 /* KeyCode.KeyA */, 'yes1', null, ContextKeyExpr.equals('1', 'a'), true),
            kbItem(32 /* KeyCode.KeyB */, 'yes2', null, ContextKeyExpr.equals('2', 'b'), true)
        ];
        const overrides = [
            kbItem(31 /* KeyCode.KeyA */, '-yes1', null, ContextKeyExpr.equals('1', 'a'), false)
        ];
        const actual = KeybindingResolver.handleRemovals([...defaults, ...overrides]);
        assert.deepStrictEqual(actual, [
            kbItem(32 /* KeyCode.KeyB */, 'yes2', null, ContextKeyExpr.equals('2', 'b'), true)
        ]);
    });
    test('KeybindingResolver.handleRemovals removal with unspecified keybinding', () => {
        const defaults = [
            kbItem(31 /* KeyCode.KeyA */, 'yes1', null, ContextKeyExpr.equals('1', 'a'), true),
            kbItem(32 /* KeyCode.KeyB */, 'yes2', null, ContextKeyExpr.equals('2', 'b'), true)
        ];
        const overrides = [
            kbItem(0, '-yes1', null, ContextKeyExpr.equals('1', 'a'), false)
        ];
        const actual = KeybindingResolver.handleRemovals([...defaults, ...overrides]);
        assert.deepStrictEqual(actual, [
            kbItem(32 /* KeyCode.KeyB */, 'yes2', null, ContextKeyExpr.equals('2', 'b'), true)
        ]);
    });
    test('KeybindingResolver.handleRemovals removal with unspecified when', () => {
        const defaults = [
            kbItem(31 /* KeyCode.KeyA */, 'yes1', null, ContextKeyExpr.equals('1', 'a'), true),
            kbItem(32 /* KeyCode.KeyB */, 'yes2', null, ContextKeyExpr.equals('2', 'b'), true)
        ];
        const overrides = [
            kbItem(31 /* KeyCode.KeyA */, '-yes1', null, undefined, false)
        ];
        const actual = KeybindingResolver.handleRemovals([...defaults, ...overrides]);
        assert.deepStrictEqual(actual, [
            kbItem(32 /* KeyCode.KeyB */, 'yes2', null, ContextKeyExpr.equals('2', 'b'), true)
        ]);
    });
    test('KeybindingResolver.handleRemovals removal with unspecified when and unspecified keybinding', () => {
        const defaults = [
            kbItem(31 /* KeyCode.KeyA */, 'yes1', null, ContextKeyExpr.equals('1', 'a'), true),
            kbItem(32 /* KeyCode.KeyB */, 'yes2', null, ContextKeyExpr.equals('2', 'b'), true)
        ];
        const overrides = [
            kbItem(0, '-yes1', null, undefined, false)
        ];
        const actual = KeybindingResolver.handleRemovals([...defaults, ...overrides]);
        assert.deepStrictEqual(actual, [
            kbItem(32 /* KeyCode.KeyB */, 'yes2', null, ContextKeyExpr.equals('2', 'b'), true)
        ]);
    });
    test('issue #138997 KeybindingResolver.handleRemovals removal in default list', () => {
        const defaults = [
            kbItem(31 /* KeyCode.KeyA */, 'yes1', null, undefined, true),
            kbItem(32 /* KeyCode.KeyB */, 'yes2', null, undefined, true),
            kbItem(0, '-yes1', null, undefined, false)
        ];
        const overrides = [];
        const actual = KeybindingResolver.handleRemovals([...defaults, ...overrides]);
        assert.deepStrictEqual(actual, [
            kbItem(32 /* KeyCode.KeyB */, 'yes2', null, undefined, true)
        ]);
    });
    test('issue #612#issuecomment-222109084 cannot remove keybindings for commands with ^', () => {
        const defaults = [
            kbItem(31 /* KeyCode.KeyA */, '^yes1', null, ContextKeyExpr.equals('1', 'a'), true),
            kbItem(32 /* KeyCode.KeyB */, 'yes2', null, ContextKeyExpr.equals('2', 'b'), true)
        ];
        const overrides = [
            kbItem(31 /* KeyCode.KeyA */, '-yes1', null, undefined, false)
        ];
        const actual = KeybindingResolver.handleRemovals([...defaults, ...overrides]);
        assert.deepStrictEqual(actual, [
            kbItem(32 /* KeyCode.KeyB */, 'yes2', null, ContextKeyExpr.equals('2', 'b'), true)
        ]);
    });
    test('issue #140884 Unable to reassign F1 as keybinding for Show All Commands', () => {
        const defaults = [
            kbItem(31 /* KeyCode.KeyA */, 'command1', null, undefined, true),
        ];
        const overrides = [
            kbItem(31 /* KeyCode.KeyA */, '-command1', null, undefined, false),
            kbItem(31 /* KeyCode.KeyA */, 'command1', null, undefined, false),
        ];
        const actual = KeybindingResolver.handleRemovals([...defaults, ...overrides]);
        assert.deepStrictEqual(actual, [
            kbItem(31 /* KeyCode.KeyA */, 'command1', null, undefined, false)
        ]);
    });
    test('issue #141638: Keyboard Shortcuts: Change When Expression might actually remove keybinding in Insiders', () => {
        const defaults = [
            kbItem(31 /* KeyCode.KeyA */, 'command1', null, undefined, true),
        ];
        const overrides = [
            kbItem(31 /* KeyCode.KeyA */, 'command1', null, ContextKeyExpr.equals('a', '1'), false),
            kbItem(31 /* KeyCode.KeyA */, '-command1', null, undefined, false),
        ];
        const actual = KeybindingResolver.handleRemovals([...defaults, ...overrides]);
        assert.deepStrictEqual(actual, [
            kbItem(31 /* KeyCode.KeyA */, 'command1', null, ContextKeyExpr.equals('a', '1'), false)
        ]);
    });
    test('issue #157751: Auto-quoting of context keys prevents removal of keybindings via UI', () => {
        const defaults = [
            kbItem(31 /* KeyCode.KeyA */, 'command1', null, ContextKeyExpr.deserialize(`editorTextFocus && activeEditor != workbench.editor.notebook && editorLangId in julia.supportedLanguageIds`), true),
        ];
        const overrides = [
            kbItem(31 /* KeyCode.KeyA */, '-command1', null, ContextKeyExpr.deserialize(`editorTextFocus && activeEditor != 'workbench.editor.notebook' && editorLangId in 'julia.supportedLanguageIds'`), false),
        ];
        const actual = KeybindingResolver.handleRemovals([...defaults, ...overrides]);
        assert.deepStrictEqual(actual, []);
    });
    test('issue #160604: Remove keybindings with when clause does not work', () => {
        const defaults = [
            kbItem(31 /* KeyCode.KeyA */, 'command1', null, undefined, true),
        ];
        const overrides = [
            kbItem(31 /* KeyCode.KeyA */, '-command1', null, ContextKeyExpr.true(), false),
        ];
        const actual = KeybindingResolver.handleRemovals([...defaults, ...overrides]);
        assert.deepStrictEqual(actual, []);
    });
    test('contextIsEntirelyIncluded', () => {
        const toContextKeyExpression = (expr) => {
            if (typeof expr === 'string' || !expr) {
                return ContextKeyExpr.deserialize(expr);
            }
            return expr;
        };
        const assertIsIncluded = (a, b) => {
            assert.strictEqual(KeybindingResolver.whenIsEntirelyIncluded(toContextKeyExpression(a), toContextKeyExpression(b)), true);
        };
        const assertIsNotIncluded = (a, b) => {
            assert.strictEqual(KeybindingResolver.whenIsEntirelyIncluded(toContextKeyExpression(a), toContextKeyExpression(b)), false);
        };
        assertIsIncluded(null, null);
        assertIsIncluded(null, ContextKeyExpr.true());
        assertIsIncluded(ContextKeyExpr.true(), null);
        assertIsIncluded(ContextKeyExpr.true(), ContextKeyExpr.true());
        assertIsIncluded('key1', null);
        assertIsIncluded('key1', '');
        assertIsIncluded('key1', 'key1');
        assertIsIncluded('key1', ContextKeyExpr.true());
        assertIsIncluded('!key1', '');
        assertIsIncluded('!key1', '!key1');
        assertIsIncluded('key2', '');
        assertIsIncluded('key2', 'key2');
        assertIsIncluded('key1 && key1 && key2 && key2', 'key2');
        assertIsIncluded('key1 && key2', 'key2');
        assertIsIncluded('key1 && key2', 'key1');
        assertIsIncluded('key1 && key2', '');
        assertIsIncluded('key1', 'key1 || key2');
        assertIsIncluded('key1 || !key1', 'key2 || !key2');
        assertIsIncluded('key1', 'key1 || key2 && key3');
        assertIsNotIncluded('key1', '!key1');
        assertIsNotIncluded('!key1', 'key1');
        assertIsNotIncluded('key1 && key2', 'key3');
        assertIsNotIncluded('key1 && key2', 'key4');
        assertIsNotIncluded('key1', 'key2');
        assertIsNotIncluded('key1 || key2', 'key2');
        assertIsNotIncluded('', 'key2');
        assertIsNotIncluded(null, 'key2');
    });
    test('resolve command', () => {
        function _kbItem(keybinding, command, when) {
            return kbItem(keybinding, command, null, when, true);
        }
        const items = [
            // This one will never match because its "when" is always overwritten by another one
            _kbItem(54 /* KeyCode.KeyX */, 'first', ContextKeyExpr.and(ContextKeyExpr.equals('key1', true), ContextKeyExpr.notEquals('key2', false))),
            // This one always overwrites first
            _kbItem(54 /* KeyCode.KeyX */, 'second', ContextKeyExpr.equals('key2', true)),
            // This one is a secondary mapping for `second`
            _kbItem(56 /* KeyCode.KeyZ */, 'second', undefined),
            // This one sometimes overwrites first
            _kbItem(54 /* KeyCode.KeyX */, 'third', ContextKeyExpr.equals('key3', true)),
            // This one is always overwritten by another one
            _kbItem(2048 /* KeyMod.CtrlCmd */ | 55 /* KeyCode.KeyY */, 'fourth', ContextKeyExpr.equals('key4', true)),
            // This one overwrites with a chord the previous one
            _kbItem(KeyChord(2048 /* KeyMod.CtrlCmd */ | 55 /* KeyCode.KeyY */, 56 /* KeyCode.KeyZ */), 'fifth', undefined),
            // This one has no keybinding
            _kbItem(0, 'sixth', undefined),
            _kbItem(KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 51 /* KeyCode.KeyU */), 'seventh', undefined),
            _kbItem(KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */), 'seventh', undefined),
            _kbItem(KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 51 /* KeyCode.KeyU */), 'uncomment lines', undefined),
            _kbItem(KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */), 'comment lines', undefined),
            _kbItem(KeyChord(2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */), 'unreachablechord', undefined),
            _kbItem(2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */, 'eleven', undefined)
        ];
        const resolver = new KeybindingResolver(items, [], () => { });
        const testKey = (commandId, expectedKeys) => {
            // Test lookup
            const lookupResult = resolver.lookupKeybindings(commandId);
            assert.strictEqual(lookupResult.length, expectedKeys.length, 'Length mismatch @ commandId ' + commandId);
            for (let i = 0, len = lookupResult.length; i < len; i++) {
                const expected = new USLayoutResolvedKeybinding(createKeybinding(expectedKeys[i], OS), OS);
                assert.strictEqual(lookupResult[i].resolvedKeybinding.getUserSettingsLabel(), expected.getUserSettingsLabel(), 'value mismatch @ commandId ' + commandId);
            }
        };
        const testResolve = (ctx, _expectedKey, commandId) => {
            const expectedKey = createKeybinding(_expectedKey, OS);
            let previousPart = null;
            for (let i = 0, len = expectedKey.parts.length; i < len; i++) {
                const part = getDispatchStr(expectedKey.parts[i]);
                const result = resolver.resolve(ctx, previousPart, part);
                if (i === len - 1) {
                    // if it's the final part, then we should find a valid command,
                    // and there should not be a chord.
                    assert.ok(result !== null, `Enters chord for ${commandId} at part ${i}`);
                    assert.strictEqual(result.commandId, commandId, `Enters chord for ${commandId} at part ${i}`);
                    assert.strictEqual(result.enterChord, false, `Enters chord for ${commandId} at part ${i}`);
                }
                else {
                    // if it's not the final part, then we should not find a valid command,
                    // and there should be a chord.
                    assert.ok(result !== null, `Enters chord for ${commandId} at part ${i}`);
                    assert.strictEqual(result.commandId, null, `Enters chord for ${commandId} at part ${i}`);
                    assert.strictEqual(result.enterChord, true, `Enters chord for ${commandId} at part ${i}`);
                }
                previousPart = part;
            }
        };
        testKey('first', []);
        testKey('second', [56 /* KeyCode.KeyZ */, 54 /* KeyCode.KeyX */]);
        testResolve(createContext({ key2: true }), 54 /* KeyCode.KeyX */, 'second');
        testResolve(createContext({}), 56 /* KeyCode.KeyZ */, 'second');
        testKey('third', [54 /* KeyCode.KeyX */]);
        testResolve(createContext({ key3: true }), 54 /* KeyCode.KeyX */, 'third');
        testKey('fourth', []);
        testKey('fifth', [KeyChord(2048 /* KeyMod.CtrlCmd */ | 55 /* KeyCode.KeyY */, 56 /* KeyCode.KeyZ */)]);
        testResolve(createContext({}), KeyChord(2048 /* KeyMod.CtrlCmd */ | 55 /* KeyCode.KeyY */, 56 /* KeyCode.KeyZ */), 'fifth');
        testKey('seventh', [KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */)]);
        testResolve(createContext({}), KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */), 'seventh');
        testKey('uncomment lines', [KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 51 /* KeyCode.KeyU */)]);
        testResolve(createContext({}), KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 51 /* KeyCode.KeyU */), 'uncomment lines');
        testKey('comment lines', [KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */)]);
        testResolve(createContext({}), KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */), 'comment lines');
        testKey('unreachablechord', []);
        testKey('eleven', [2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */]);
        testResolve(createContext({}), 2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */, 'eleven');
        testKey('sixth', []);
    });
});
