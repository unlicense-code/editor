/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { URI } from 'vs/base/common/uri';
import { EditorState } from 'vs/editor/contrib/editorState/browser/editorState';
import { Position } from 'vs/editor/common/core/position';
import { Selection } from 'vs/editor/common/core/selection';
suite('Editor Core - Editor State', () => {
    const allFlags = (1 /* CodeEditorStateFlag.Value */
        | 2 /* CodeEditorStateFlag.Selection */
        | 4 /* CodeEditorStateFlag.Position */
        | 8 /* CodeEditorStateFlag.Scroll */);
    test('empty editor state should be valid', () => {
        const result = validate({}, {});
        assert.strictEqual(result, true);
    });
    test('different model URIs should be invalid', () => {
        const result = validate({ model: { uri: URI.parse('http://test1') } }, { model: { uri: URI.parse('http://test2') } });
        assert.strictEqual(result, false);
    });
    test('different model versions should be invalid', () => {
        const result = validate({ model: { version: 1 } }, { model: { version: 2 } });
        assert.strictEqual(result, false);
    });
    test('different positions should be invalid', () => {
        const result = validate({ position: new Position(1, 2) }, { position: new Position(2, 3) });
        assert.strictEqual(result, false);
    });
    test('different selections should be invalid', () => {
        const result = validate({ selection: new Selection(1, 2, 3, 4) }, { selection: new Selection(5, 2, 3, 4) });
        assert.strictEqual(result, false);
    });
    test('different scroll positions should be invalid', () => {
        const result = validate({ scroll: { left: 1, top: 2 } }, { scroll: { left: 3, top: 2 } });
        assert.strictEqual(result, false);
    });
    function validate(source, target) {
        const sourceEditor = createEditor(source), targetEditor = createEditor(target);
        const result = new EditorState(sourceEditor, allFlags).validate(targetEditor);
        return result;
    }
    function createEditor({ model, position, selection, scroll } = {}) {
        const mappedModel = model ? { uri: model.uri ? model.uri : URI.parse('http://dummy.org'), getVersionId: () => model.version } : null;
        return {
            getModel: () => mappedModel,
            getPosition: () => position,
            getSelection: () => selection,
            getScrollLeft: () => scroll && scroll.left,
            getScrollTop: () => scroll && scroll.top
        };
    }
});
