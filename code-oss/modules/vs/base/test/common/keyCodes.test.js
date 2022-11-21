/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { EVENT_KEY_CODE_MAP, IMMUTABLE_CODE_TO_KEY_CODE, IMMUTABLE_KEY_CODE_TO_CODE, KeyChord, KeyCodeUtils, NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE, ScanCodeUtils } from 'vs/base/common/keyCodes';
import { ChordKeybinding, createKeybinding, SimpleKeybinding } from 'vs/base/common/keybindings';
suite('keyCodes', () => {
    function testBinaryEncoding(expected, k, OS) {
        assert.deepStrictEqual(createKeybinding(k, OS), expected);
    }
    test('mapping for Minus', () => {
        // [147, 83, 0, ScanCode.Minus, 'Minus', KeyCode.US_MINUS, '-', 189, 'VK_OEM_MINUS', '-', 'OEM_MINUS'],
        assert.strictEqual(EVENT_KEY_CODE_MAP[189], 83 /* KeyCode.Minus */);
        assert.strictEqual(NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE['VK_OEM_MINUS'], 83 /* KeyCode.Minus */);
        assert.strictEqual(ScanCodeUtils.lowerCaseToEnum('minus'), 51 /* ScanCode.Minus */);
        assert.strictEqual(ScanCodeUtils.toEnum('Minus'), 51 /* ScanCode.Minus */);
        assert.strictEqual(ScanCodeUtils.toString(51 /* ScanCode.Minus */), 'Minus');
        assert.strictEqual(IMMUTABLE_CODE_TO_KEY_CODE[51 /* ScanCode.Minus */], -1 /* KeyCode.DependsOnKbLayout */);
        assert.strictEqual(IMMUTABLE_KEY_CODE_TO_CODE[83 /* KeyCode.Minus */], -1 /* ScanCode.DependsOnKbLayout */);
        assert.strictEqual(KeyCodeUtils.toString(83 /* KeyCode.Minus */), '-');
        assert.strictEqual(KeyCodeUtils.fromString('-'), 83 /* KeyCode.Minus */);
        assert.strictEqual(KeyCodeUtils.toUserSettingsUS(83 /* KeyCode.Minus */), '-');
        assert.strictEqual(KeyCodeUtils.toUserSettingsGeneral(83 /* KeyCode.Minus */), 'OEM_MINUS');
        assert.strictEqual(KeyCodeUtils.fromUserSettings('-'), 83 /* KeyCode.Minus */);
        assert.strictEqual(KeyCodeUtils.fromUserSettings('OEM_MINUS'), 83 /* KeyCode.Minus */);
        assert.strictEqual(KeyCodeUtils.fromUserSettings('oem_minus'), 83 /* KeyCode.Minus */);
    });
    test('mapping for Space', () => {
        // [21, 10, 1, ScanCode.Space, 'Space', KeyCode.Space, 'Space', 32, 'VK_SPACE', empty, empty],
        assert.strictEqual(EVENT_KEY_CODE_MAP[32], 10 /* KeyCode.Space */);
        assert.strictEqual(NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE['VK_SPACE'], 10 /* KeyCode.Space */);
        assert.strictEqual(ScanCodeUtils.lowerCaseToEnum('space'), 50 /* ScanCode.Space */);
        assert.strictEqual(ScanCodeUtils.toEnum('Space'), 50 /* ScanCode.Space */);
        assert.strictEqual(ScanCodeUtils.toString(50 /* ScanCode.Space */), 'Space');
        assert.strictEqual(IMMUTABLE_CODE_TO_KEY_CODE[50 /* ScanCode.Space */], 10 /* KeyCode.Space */);
        assert.strictEqual(IMMUTABLE_KEY_CODE_TO_CODE[10 /* KeyCode.Space */], 50 /* ScanCode.Space */);
        assert.strictEqual(KeyCodeUtils.toString(10 /* KeyCode.Space */), 'Space');
        assert.strictEqual(KeyCodeUtils.fromString('Space'), 10 /* KeyCode.Space */);
        assert.strictEqual(KeyCodeUtils.toUserSettingsUS(10 /* KeyCode.Space */), 'Space');
        assert.strictEqual(KeyCodeUtils.toUserSettingsGeneral(10 /* KeyCode.Space */), 'Space');
        assert.strictEqual(KeyCodeUtils.fromUserSettings('Space'), 10 /* KeyCode.Space */);
        assert.strictEqual(KeyCodeUtils.fromUserSettings('space'), 10 /* KeyCode.Space */);
    });
    test('MAC binary encoding', () => {
        function test(expected, k) {
            testBinaryEncoding(expected, k, 2 /* OperatingSystem.Macintosh */);
        }
        test(null, 0);
        test(new SimpleKeybinding(false, false, false, false, 3 /* KeyCode.Enter */).toChord(), 3 /* KeyCode.Enter */);
        test(new SimpleKeybinding(true, false, false, false, 3 /* KeyCode.Enter */).toChord(), 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
        test(new SimpleKeybinding(false, false, true, false, 3 /* KeyCode.Enter */).toChord(), 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */);
        test(new SimpleKeybinding(true, false, true, false, 3 /* KeyCode.Enter */).toChord(), 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
        test(new SimpleKeybinding(false, true, false, false, 3 /* KeyCode.Enter */).toChord(), 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */);
        test(new SimpleKeybinding(true, true, false, false, 3 /* KeyCode.Enter */).toChord(), 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
        test(new SimpleKeybinding(false, true, true, false, 3 /* KeyCode.Enter */).toChord(), 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */);
        test(new SimpleKeybinding(true, true, true, false, 3 /* KeyCode.Enter */).toChord(), 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
        test(new SimpleKeybinding(false, false, false, true, 3 /* KeyCode.Enter */).toChord(), 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */);
        test(new SimpleKeybinding(true, false, false, true, 3 /* KeyCode.Enter */).toChord(), 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
        test(new SimpleKeybinding(false, false, true, true, 3 /* KeyCode.Enter */).toChord(), 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */);
        test(new SimpleKeybinding(true, false, true, true, 3 /* KeyCode.Enter */).toChord(), 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
        test(new SimpleKeybinding(false, true, false, true, 3 /* KeyCode.Enter */).toChord(), 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */);
        test(new SimpleKeybinding(true, true, false, true, 3 /* KeyCode.Enter */).toChord(), 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
        test(new SimpleKeybinding(false, true, true, true, 3 /* KeyCode.Enter */).toChord(), 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */);
        test(new SimpleKeybinding(true, true, true, true, 3 /* KeyCode.Enter */).toChord(), 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
        test(new ChordKeybinding([
            new SimpleKeybinding(false, false, false, false, 3 /* KeyCode.Enter */),
            new SimpleKeybinding(false, false, false, false, 2 /* KeyCode.Tab */)
        ]), KeyChord(3 /* KeyCode.Enter */, 2 /* KeyCode.Tab */));
        test(new ChordKeybinding([
            new SimpleKeybinding(false, false, false, true, 55 /* KeyCode.KeyY */),
            new SimpleKeybinding(false, false, false, false, 56 /* KeyCode.KeyZ */)
        ]), KeyChord(2048 /* KeyMod.CtrlCmd */ | 55 /* KeyCode.KeyY */, 56 /* KeyCode.KeyZ */));
    });
    test('WINDOWS & LINUX binary encoding', () => {
        [3 /* OperatingSystem.Linux */, 1 /* OperatingSystem.Windows */].forEach((OS) => {
            function test(expected, k) {
                testBinaryEncoding(expected, k, OS);
            }
            test(null, 0);
            test(new SimpleKeybinding(false, false, false, false, 3 /* KeyCode.Enter */).toChord(), 3 /* KeyCode.Enter */);
            test(new SimpleKeybinding(false, false, false, true, 3 /* KeyCode.Enter */).toChord(), 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
            test(new SimpleKeybinding(false, false, true, false, 3 /* KeyCode.Enter */).toChord(), 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */);
            test(new SimpleKeybinding(false, false, true, true, 3 /* KeyCode.Enter */).toChord(), 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
            test(new SimpleKeybinding(false, true, false, false, 3 /* KeyCode.Enter */).toChord(), 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */);
            test(new SimpleKeybinding(false, true, false, true, 3 /* KeyCode.Enter */).toChord(), 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
            test(new SimpleKeybinding(false, true, true, false, 3 /* KeyCode.Enter */).toChord(), 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */);
            test(new SimpleKeybinding(false, true, true, true, 3 /* KeyCode.Enter */).toChord(), 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
            test(new SimpleKeybinding(true, false, false, false, 3 /* KeyCode.Enter */).toChord(), 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */);
            test(new SimpleKeybinding(true, false, false, true, 3 /* KeyCode.Enter */).toChord(), 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
            test(new SimpleKeybinding(true, false, true, false, 3 /* KeyCode.Enter */).toChord(), 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */);
            test(new SimpleKeybinding(true, false, true, true, 3 /* KeyCode.Enter */).toChord(), 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
            test(new SimpleKeybinding(true, true, false, false, 3 /* KeyCode.Enter */).toChord(), 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */);
            test(new SimpleKeybinding(true, true, false, true, 3 /* KeyCode.Enter */).toChord(), 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
            test(new SimpleKeybinding(true, true, true, false, 3 /* KeyCode.Enter */).toChord(), 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */);
            test(new SimpleKeybinding(true, true, true, true, 3 /* KeyCode.Enter */).toChord(), 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
            test(new ChordKeybinding([
                new SimpleKeybinding(false, false, false, false, 3 /* KeyCode.Enter */),
                new SimpleKeybinding(false, false, false, false, 2 /* KeyCode.Tab */)
            ]), KeyChord(3 /* KeyCode.Enter */, 2 /* KeyCode.Tab */));
            test(new ChordKeybinding([
                new SimpleKeybinding(true, false, false, false, 55 /* KeyCode.KeyY */),
                new SimpleKeybinding(false, false, false, false, 56 /* KeyCode.KeyZ */)
            ]), KeyChord(2048 /* KeyMod.CtrlCmd */ | 55 /* KeyCode.KeyY */, 56 /* KeyCode.KeyZ */));
        });
    });
});
