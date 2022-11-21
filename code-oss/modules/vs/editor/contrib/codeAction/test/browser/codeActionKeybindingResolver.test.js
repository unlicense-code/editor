/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { ChordKeybinding, SimpleKeybinding } from 'vs/base/common/keybindings';
import { organizeImportsCommandId, refactorCommandId } from 'vs/editor/contrib/codeAction/browser/codeAction';
import { CodeActionKeybindingResolver } from 'vs/editor/contrib/codeAction/browser/codeActionKeybindingResolver';
import { CodeActionKind } from 'vs/editor/contrib/codeAction/common/types';
import { ResolvedKeybindingItem } from 'vs/platform/keybinding/common/resolvedKeybindingItem';
import { USLayoutResolvedKeybinding } from 'vs/platform/keybinding/common/usLayoutResolvedKeybinding';
suite('CodeActionKeybindingResolver', () => {
    const refactorKeybinding = createCodeActionKeybinding(31 /* KeyCode.KeyA */, refactorCommandId, { kind: CodeActionKind.Refactor.value });
    const refactorExtractKeybinding = createCodeActionKeybinding(32 /* KeyCode.KeyB */, refactorCommandId, { kind: CodeActionKind.Refactor.append('extract').value });
    const organizeImportsKeybinding = createCodeActionKeybinding(33 /* KeyCode.KeyC */, organizeImportsCommandId, undefined);
    test('Should match refactor keybindings', async function () {
        const resolver = new CodeActionKeybindingResolver(createMockKeyBindingService([refactorKeybinding])).getResolver();
        assert.strictEqual(resolver({ title: '' }), undefined);
        assert.strictEqual(resolver({ title: '', kind: CodeActionKind.Refactor.value }), refactorKeybinding.resolvedKeybinding);
        assert.strictEqual(resolver({ title: '', kind: CodeActionKind.Refactor.append('extract').value }), refactorKeybinding.resolvedKeybinding);
        assert.strictEqual(resolver({ title: '', kind: CodeActionKind.QuickFix.value }), undefined);
    });
    test('Should prefer most specific keybinding', async function () {
        const resolver = new CodeActionKeybindingResolver(createMockKeyBindingService([refactorKeybinding, refactorExtractKeybinding, organizeImportsKeybinding])).getResolver();
        assert.strictEqual(resolver({ title: '', kind: CodeActionKind.Refactor.value }), refactorKeybinding.resolvedKeybinding);
        assert.strictEqual(resolver({ title: '', kind: CodeActionKind.Refactor.append('extract').value }), refactorExtractKeybinding.resolvedKeybinding);
    });
    test('Organize imports should still return a keybinding even though it does not have args', async function () {
        const resolver = new CodeActionKeybindingResolver(createMockKeyBindingService([refactorKeybinding, refactorExtractKeybinding, organizeImportsKeybinding])).getResolver();
        assert.strictEqual(resolver({ title: '', kind: CodeActionKind.SourceOrganizeImports.value }), organizeImportsKeybinding.resolvedKeybinding);
    });
});
function createMockKeyBindingService(items) {
    return {
        getKeybindings: () => {
            return items;
        },
    };
}
function createCodeActionKeybinding(keycode, command, commandArgs) {
    return new ResolvedKeybindingItem(new USLayoutResolvedKeybinding(new ChordKeybinding([new SimpleKeybinding(false, true, false, false, keycode)]), 3 /* OperatingSystem.Linux */), command, commandArgs, undefined, false, null, false);
}
