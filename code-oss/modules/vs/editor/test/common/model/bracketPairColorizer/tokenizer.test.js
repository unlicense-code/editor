/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { LanguageAgnosticBracketTokens } from 'vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/brackets';
import { lengthAdd, lengthsToRange, lengthZero } from 'vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length';
import { DenseKeyProvider } from 'vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/smallImmutableSet';
import { TextBufferTokenizer } from 'vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/tokenizer';
import { EncodedTokenizationResult, TokenizationRegistry } from 'vs/editor/common/languages';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { createModelServices, instantiateTextModel } from 'vs/editor/test/common/testTextModel';
suite('Bracket Pair Colorizer - Tokenizer', () => {
    test('Basic', () => {
        const mode1 = 'testMode1';
        const disposableStore = new DisposableStore();
        const instantiationService = createModelServices(disposableStore);
        const languageConfigurationService = instantiationService.get(ILanguageConfigurationService);
        const languageService = instantiationService.get(ILanguageService);
        disposableStore.add(languageService.registerLanguage({ id: mode1 }));
        const encodedMode1 = languageService.languageIdCodec.encodeLanguageId(mode1);
        const denseKeyProvider = new DenseKeyProvider();
        const tStandard = (text) => new TokenInfo(text, encodedMode1, 0 /* StandardTokenType.Other */, true);
        const tComment = (text) => new TokenInfo(text, encodedMode1, 1 /* StandardTokenType.Comment */, true);
        const document = new TokenizedDocument([
            tStandard(' { } '), tStandard('be'), tStandard('gin end'), tStandard('\n'),
            tStandard('hello'), tComment('{'), tStandard('}'),
        ]);
        disposableStore.add(TokenizationRegistry.register(mode1, document.getTokenizationSupport()));
        disposableStore.add(languageConfigurationService.register(mode1, {
            brackets: [['{', '}'], ['[', ']'], ['(', ')'], ['begin', 'end']],
        }));
        const model = disposableStore.add(instantiateTextModel(instantiationService, document.getText(), mode1));
        model.tokenization.forceTokenization(model.getLineCount());
        const brackets = new LanguageAgnosticBracketTokens(denseKeyProvider, l => languageConfigurationService.getLanguageConfiguration(l));
        const tokens = readAllTokens(new TextBufferTokenizer(model, brackets));
        assert.deepStrictEqual(toArr(tokens, model, denseKeyProvider), [
            { text: ' ', bracketId: null, bracketIds: [], kind: 'Text' },
            {
                text: '{',
                bracketId: 'testMode1:::{',
                bracketIds: ['testMode1:::{'],
                kind: 'OpeningBracket',
            },
            { text: ' ', bracketId: null, bracketIds: [], kind: 'Text' },
            {
                text: '}',
                bracketId: 'testMode1:::{',
                bracketIds: ['testMode1:::{'],
                kind: 'ClosingBracket',
            },
            { text: ' ', bracketId: null, bracketIds: [], kind: 'Text' },
            {
                text: 'begin',
                bracketId: 'testMode1:::begin',
                bracketIds: ['testMode1:::begin'],
                kind: 'OpeningBracket',
            },
            { text: ' ', bracketId: null, bracketIds: [], kind: 'Text' },
            {
                text: 'end',
                bracketId: 'testMode1:::begin',
                bracketIds: ['testMode1:::begin'],
                kind: 'ClosingBracket',
            },
            { text: '\nhello{', bracketId: null, bracketIds: [], kind: 'Text' },
            {
                text: '}',
                bracketId: 'testMode1:::{',
                bracketIds: ['testMode1:::{'],
                kind: 'ClosingBracket',
            },
        ]);
        disposableStore.dispose();
    });
});
function readAllTokens(tokenizer) {
    const tokens = new Array();
    while (true) {
        const token = tokenizer.read();
        if (!token) {
            break;
        }
        tokens.push(token);
    }
    return tokens;
}
function toArr(tokens, model, keyProvider) {
    const result = new Array();
    let offset = lengthZero;
    for (const token of tokens) {
        result.push(tokenToObj(token, offset, model, keyProvider));
        offset = lengthAdd(offset, token.length);
    }
    return result;
}
function tokenToObj(token, offset, model, keyProvider) {
    return {
        text: model.getValueInRange(lengthsToRange(offset, lengthAdd(offset, token.length))),
        bracketId: keyProvider.reverseLookup(token.bracketId) || null,
        bracketIds: keyProvider.reverseLookupSet(token.bracketIds),
        kind: {
            [2 /* TokenKind.ClosingBracket */]: 'ClosingBracket',
            [1 /* TokenKind.OpeningBracket */]: 'OpeningBracket',
            [0 /* TokenKind.Text */]: 'Text',
        }[token.kind]
    };
}
export class TokenizedDocument {
    tokensByLine;
    constructor(tokens) {
        const tokensByLine = new Array();
        let curLine = new Array();
        for (const token of tokens) {
            const lines = token.text.split('\n');
            let first = true;
            while (lines.length > 0) {
                if (!first) {
                    tokensByLine.push(curLine);
                    curLine = new Array();
                }
                else {
                    first = false;
                }
                if (lines[0].length > 0) {
                    curLine.push(token.withText(lines[0]));
                }
                lines.pop();
            }
        }
        tokensByLine.push(curLine);
        this.tokensByLine = tokensByLine;
    }
    getText() {
        return this.tokensByLine.map(t => t.map(t => t.text).join('')).join('\n');
    }
    getTokenizationSupport() {
        class State {
            lineNumber;
            constructor(lineNumber) {
                this.lineNumber = lineNumber;
            }
            clone() {
                return new State(this.lineNumber);
            }
            equals(other) {
                return this.lineNumber === other.lineNumber;
            }
        }
        return {
            getInitialState: () => new State(0),
            tokenize: () => { throw new Error('Method not implemented.'); },
            tokenizeEncoded: (line, hasEOL, state) => {
                const state2 = state;
                const tokens = this.tokensByLine[state2.lineNumber];
                const arr = new Array();
                let offset = 0;
                for (const t of tokens) {
                    arr.push(offset, t.getMetadata());
                    offset += t.text.length;
                }
                return new EncodedTokenizationResult(new Uint32Array(arr), new State(state2.lineNumber + 1));
            }
        };
    }
}
export class TokenInfo {
    text;
    languageId;
    tokenType;
    hasBalancedBrackets;
    constructor(text, languageId, tokenType, hasBalancedBrackets) {
        this.text = text;
        this.languageId = languageId;
        this.tokenType = tokenType;
        this.hasBalancedBrackets = hasBalancedBrackets;
    }
    getMetadata() {
        return ((((this.languageId << 0 /* MetadataConsts.LANGUAGEID_OFFSET */) |
            (this.tokenType << 8 /* MetadataConsts.TOKEN_TYPE_OFFSET */)) >>>
            0) |
            (this.hasBalancedBrackets ? 1024 /* MetadataConsts.BALANCED_BRACKETS_MASK */ : 0));
    }
    withText(text) {
        return new TokenInfo(text, this.languageId, this.tokenType, this.hasBalancedBrackets);
    }
}
