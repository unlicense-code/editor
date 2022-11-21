/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { BracketElectricCharacterSupport } from 'vs/editor/common/languages/supports/electricCharacter';
import { RichEditBrackets } from 'vs/editor/common/languages/supports/richEditBrackets';
import { createFakeScopedLineTokens } from 'vs/editor/test/common/modesTestUtils';
const fakeLanguageId = 'test';
suite('Editor Modes - Auto Indentation', () => {
    function _testOnElectricCharacter(electricCharacterSupport, line, character, offset) {
        return electricCharacterSupport.onElectricCharacter(character, createFakeScopedLineTokens(line), offset);
    }
    function testDoesNothing(electricCharacterSupport, line, character, offset) {
        const actual = _testOnElectricCharacter(electricCharacterSupport, line, character, offset);
        assert.deepStrictEqual(actual, null);
    }
    function testMatchBracket(electricCharacterSupport, line, character, offset, matchOpenBracket) {
        const actual = _testOnElectricCharacter(electricCharacterSupport, line, character, offset);
        assert.deepStrictEqual(actual, { matchOpenBracket: matchOpenBracket });
    }
    test('getElectricCharacters uses all sources and dedups', () => {
        const sup = new BracketElectricCharacterSupport(new RichEditBrackets(fakeLanguageId, [
            ['{', '}'],
            ['(', ')']
        ]));
        assert.deepStrictEqual(sup.getElectricCharacters(), ['}', ')']);
    });
    test('matchOpenBracket', () => {
        const sup = new BracketElectricCharacterSupport(new RichEditBrackets(fakeLanguageId, [
            ['{', '}'],
            ['(', ')']
        ]));
        testDoesNothing(sup, [{ text: '\t{', type: 0 /* StandardTokenType.Other */ }], '\t', 1);
        testDoesNothing(sup, [{ text: '\t{', type: 0 /* StandardTokenType.Other */ }], '\t', 2);
        testDoesNothing(sup, [{ text: '\t\t', type: 0 /* StandardTokenType.Other */ }], '{', 3);
        testDoesNothing(sup, [{ text: '\t}', type: 0 /* StandardTokenType.Other */ }], '\t', 1);
        testDoesNothing(sup, [{ text: '\t}', type: 0 /* StandardTokenType.Other */ }], '\t', 2);
        testMatchBracket(sup, [{ text: '\t\t', type: 0 /* StandardTokenType.Other */ }], '}', 3, '}');
    });
});
