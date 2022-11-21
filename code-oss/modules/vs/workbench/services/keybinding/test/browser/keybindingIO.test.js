/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { KeyChord } from 'vs/base/common/keyCodes';
import { SimpleKeybinding, createKeybinding, ScanCodeBinding } from 'vs/base/common/keybindings';
import { KeybindingParser } from 'vs/base/common/keybindingParser';
import { USLayoutResolvedKeybinding } from 'vs/platform/keybinding/common/usLayoutResolvedKeybinding';
import { KeybindingIO } from 'vs/workbench/services/keybinding/common/keybindingIO';
suite('keybindingIO', () => {
    test('serialize/deserialize', () => {
        function testOneSerialization(keybinding, expected, msg, OS) {
            const usLayoutResolvedKeybinding = new USLayoutResolvedKeybinding(createKeybinding(keybinding, OS), OS);
            const actualSerialized = usLayoutResolvedKeybinding.getUserSettingsLabel();
            assert.strictEqual(actualSerialized, expected, expected + ' - ' + msg);
        }
        function testSerialization(keybinding, expectedWin, expectedMac, expectedLinux) {
            testOneSerialization(keybinding, expectedWin, 'win', 1 /* OperatingSystem.Windows */);
            testOneSerialization(keybinding, expectedMac, 'mac', 2 /* OperatingSystem.Macintosh */);
            testOneSerialization(keybinding, expectedLinux, 'linux', 3 /* OperatingSystem.Linux */);
        }
        function testOneDeserialization(keybinding, _expected, msg, OS) {
            const actualDeserialized = KeybindingParser.parseKeybinding(keybinding, OS);
            const expected = createKeybinding(_expected, OS);
            assert.deepStrictEqual(actualDeserialized, expected, keybinding + ' - ' + msg);
        }
        function testDeserialization(inWin, inMac, inLinux, expected) {
            testOneDeserialization(inWin, expected, 'win', 1 /* OperatingSystem.Windows */);
            testOneDeserialization(inMac, expected, 'mac', 2 /* OperatingSystem.Macintosh */);
            testOneDeserialization(inLinux, expected, 'linux', 3 /* OperatingSystem.Linux */);
        }
        function testRoundtrip(keybinding, expectedWin, expectedMac, expectedLinux) {
            testSerialization(keybinding, expectedWin, expectedMac, expectedLinux);
            testDeserialization(expectedWin, expectedMac, expectedLinux, keybinding);
        }
        testRoundtrip(21 /* KeyCode.Digit0 */, '0', '0', '0');
        testRoundtrip(31 /* KeyCode.KeyA */, 'a', 'a', 'a');
        testRoundtrip(16 /* KeyCode.UpArrow */, 'up', 'up', 'up');
        testRoundtrip(17 /* KeyCode.RightArrow */, 'right', 'right', 'right');
        testRoundtrip(18 /* KeyCode.DownArrow */, 'down', 'down', 'down');
        testRoundtrip(15 /* KeyCode.LeftArrow */, 'left', 'left', 'left');
        // one modifier
        testRoundtrip(512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'alt+a', 'alt+a', 'alt+a');
        testRoundtrip(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 'ctrl+a', 'cmd+a', 'ctrl+a');
        testRoundtrip(1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */, 'shift+a', 'shift+a', 'shift+a');
        testRoundtrip(256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'win+a', 'ctrl+a', 'meta+a');
        // two modifiers
        testRoundtrip(2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'ctrl+alt+a', 'alt+cmd+a', 'ctrl+alt+a');
        testRoundtrip(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */, 'ctrl+shift+a', 'shift+cmd+a', 'ctrl+shift+a');
        testRoundtrip(2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'ctrl+win+a', 'ctrl+cmd+a', 'ctrl+meta+a');
        testRoundtrip(1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'shift+alt+a', 'shift+alt+a', 'shift+alt+a');
        testRoundtrip(1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'shift+win+a', 'ctrl+shift+a', 'shift+meta+a');
        testRoundtrip(512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'alt+win+a', 'ctrl+alt+a', 'alt+meta+a');
        // three modifiers
        testRoundtrip(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'ctrl+shift+alt+a', 'shift+alt+cmd+a', 'ctrl+shift+alt+a');
        testRoundtrip(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'ctrl+shift+win+a', 'ctrl+shift+cmd+a', 'ctrl+shift+meta+a');
        testRoundtrip(1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'shift+alt+win+a', 'ctrl+shift+alt+a', 'shift+alt+meta+a');
        // all modifiers
        testRoundtrip(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'ctrl+shift+alt+win+a', 'ctrl+shift+alt+cmd+a', 'ctrl+shift+alt+meta+a');
        // chords
        testRoundtrip(KeyChord(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */), 'ctrl+a ctrl+a', 'cmd+a cmd+a', 'ctrl+a ctrl+a');
        testRoundtrip(KeyChord(2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */, 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */), 'ctrl+up ctrl+up', 'cmd+up cmd+up', 'ctrl+up ctrl+up');
        // OEM keys
        testRoundtrip(80 /* KeyCode.Semicolon */, ';', ';', ';');
        testRoundtrip(81 /* KeyCode.Equal */, '=', '=', '=');
        testRoundtrip(82 /* KeyCode.Comma */, ',', ',', ',');
        testRoundtrip(83 /* KeyCode.Minus */, '-', '-', '-');
        testRoundtrip(84 /* KeyCode.Period */, '.', '.', '.');
        testRoundtrip(85 /* KeyCode.Slash */, '/', '/', '/');
        testRoundtrip(86 /* KeyCode.Backquote */, '`', '`', '`');
        testRoundtrip(110 /* KeyCode.ABNT_C1 */, 'abnt_c1', 'abnt_c1', 'abnt_c1');
        testRoundtrip(111 /* KeyCode.ABNT_C2 */, 'abnt_c2', 'abnt_c2', 'abnt_c2');
        testRoundtrip(87 /* KeyCode.BracketLeft */, '[', '[', '[');
        testRoundtrip(88 /* KeyCode.Backslash */, '\\', '\\', '\\');
        testRoundtrip(89 /* KeyCode.BracketRight */, ']', ']', ']');
        testRoundtrip(90 /* KeyCode.Quote */, '\'', '\'', '\'');
        testRoundtrip(91 /* KeyCode.OEM_8 */, 'oem_8', 'oem_8', 'oem_8');
        testRoundtrip(92 /* KeyCode.IntlBackslash */, 'oem_102', 'oem_102', 'oem_102');
        // OEM aliases
        testDeserialization('OEM_1', 'OEM_1', 'OEM_1', 80 /* KeyCode.Semicolon */);
        testDeserialization('OEM_PLUS', 'OEM_PLUS', 'OEM_PLUS', 81 /* KeyCode.Equal */);
        testDeserialization('OEM_COMMA', 'OEM_COMMA', 'OEM_COMMA', 82 /* KeyCode.Comma */);
        testDeserialization('OEM_MINUS', 'OEM_MINUS', 'OEM_MINUS', 83 /* KeyCode.Minus */);
        testDeserialization('OEM_PERIOD', 'OEM_PERIOD', 'OEM_PERIOD', 84 /* KeyCode.Period */);
        testDeserialization('OEM_2', 'OEM_2', 'OEM_2', 85 /* KeyCode.Slash */);
        testDeserialization('OEM_3', 'OEM_3', 'OEM_3', 86 /* KeyCode.Backquote */);
        testDeserialization('ABNT_C1', 'ABNT_C1', 'ABNT_C1', 110 /* KeyCode.ABNT_C1 */);
        testDeserialization('ABNT_C2', 'ABNT_C2', 'ABNT_C2', 111 /* KeyCode.ABNT_C2 */);
        testDeserialization('OEM_4', 'OEM_4', 'OEM_4', 87 /* KeyCode.BracketLeft */);
        testDeserialization('OEM_5', 'OEM_5', 'OEM_5', 88 /* KeyCode.Backslash */);
        testDeserialization('OEM_6', 'OEM_6', 'OEM_6', 89 /* KeyCode.BracketRight */);
        testDeserialization('OEM_7', 'OEM_7', 'OEM_7', 90 /* KeyCode.Quote */);
        testDeserialization('OEM_8', 'OEM_8', 'OEM_8', 91 /* KeyCode.OEM_8 */);
        testDeserialization('OEM_102', 'OEM_102', 'OEM_102', 92 /* KeyCode.IntlBackslash */);
        // accepts '-' as separator
        testDeserialization('ctrl-shift-alt-win-a', 'ctrl-shift-alt-cmd-a', 'ctrl-shift-alt-meta-a', 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */);
        // various input mistakes
        testDeserialization(' ctrl-shift-alt-win-A ', ' shift-alt-cmd-Ctrl-A ', ' ctrl-shift-alt-META-A ', 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */);
    });
    test('deserialize scan codes', () => {
        assert.deepStrictEqual(KeybindingParser.parseUserBinding('ctrl+shift+[comma] ctrl+/'), [new ScanCodeBinding(true, true, false, false, 60 /* ScanCode.Comma */), new SimpleKeybinding(true, false, false, false, 85 /* KeyCode.Slash */)]);
    });
    test('issue #10452 - invalid command', () => {
        const strJSON = `[{ "key": "ctrl+k ctrl+f", "command": ["firstcommand", "seccondcommand"] }]`;
        const userKeybinding = JSON.parse(strJSON)[0];
        const keybindingItem = KeybindingIO.readUserKeybindingItem(userKeybinding);
        assert.strictEqual(keybindingItem.command, null);
    });
    test('issue #10452 - invalid when', () => {
        const strJSON = `[{ "key": "ctrl+k ctrl+f", "command": "firstcommand", "when": [] }]`;
        const userKeybinding = JSON.parse(strJSON)[0];
        const keybindingItem = KeybindingIO.readUserKeybindingItem(userKeybinding);
        assert.strictEqual(keybindingItem.when, undefined);
    });
    test('issue #10452 - invalid key', () => {
        const strJSON = `[{ "key": [], "command": "firstcommand" }]`;
        const userKeybinding = JSON.parse(strJSON)[0];
        const keybindingItem = KeybindingIO.readUserKeybindingItem(userKeybinding);
        assert.deepStrictEqual(keybindingItem.parts, []);
    });
    test('issue #10452 - invalid key 2', () => {
        const strJSON = `[{ "key": "", "command": "firstcommand" }]`;
        const userKeybinding = JSON.parse(strJSON)[0];
        const keybindingItem = KeybindingIO.readUserKeybindingItem(userKeybinding);
        assert.deepStrictEqual(keybindingItem.parts, []);
    });
    test('test commands args', () => {
        const strJSON = `[{ "key": "ctrl+k ctrl+f", "command": "firstcommand", "when": [], "args": { "text": "theText" } }]`;
        const userKeybinding = JSON.parse(strJSON)[0];
        const keybindingItem = KeybindingIO.readUserKeybindingItem(userKeybinding);
        assert.strictEqual(keybindingItem.commandArgs.text, 'theText');
    });
});
