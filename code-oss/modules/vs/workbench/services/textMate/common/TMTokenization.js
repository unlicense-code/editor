/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { EncodedTokenizationResult } from 'vs/editor/common/languages';
import { TokenMetadata } from 'vs/editor/common/encodedTokenAttributes';
import { Disposable } from 'vs/base/common/lifecycle';
export class TMTokenization extends Disposable {
    _grammar;
    _containsEmbeddedLanguages;
    _seenLanguages;
    _initialState;
    _onDidEncounterLanguage = this._register(new Emitter());
    onDidEncounterLanguage = this._onDidEncounterLanguage.event;
    constructor(grammar, initialState, containsEmbeddedLanguages) {
        super();
        this._grammar = grammar;
        this._initialState = initialState;
        this._containsEmbeddedLanguages = containsEmbeddedLanguages;
        this._seenLanguages = [];
    }
    getInitialState() {
        return this._initialState;
    }
    tokenize(line, hasEOL, state) {
        throw new Error('Not supported!');
    }
    tokenizeEncoded(line, hasEOL, state) {
        const textMateResult = this._grammar.tokenizeLine2(line, state, 500);
        if (textMateResult.stoppedEarly) {
            console.warn(`Time limit reached when tokenizing line: ${line.substring(0, 100)}`);
            // return the state at the beginning of the line
            return new EncodedTokenizationResult(textMateResult.tokens, state);
        }
        if (this._containsEmbeddedLanguages) {
            const seenLanguages = this._seenLanguages;
            const tokens = textMateResult.tokens;
            // Must check if any of the embedded languages was hit
            for (let i = 0, len = (tokens.length >>> 1); i < len; i++) {
                const metadata = tokens[(i << 1) + 1];
                const languageId = TokenMetadata.getLanguageId(metadata);
                if (!seenLanguages[languageId]) {
                    seenLanguages[languageId] = true;
                    this._onDidEncounterLanguage.fire(languageId);
                }
            }
        }
        let endState;
        // try to save an object if possible
        if (state.equals(textMateResult.ruleStack)) {
            endState = state;
        }
        else {
            endState = textMateResult.ruleStack;
        }
        return new EncodedTokenizationResult(textMateResult.tokens, endState);
    }
}
