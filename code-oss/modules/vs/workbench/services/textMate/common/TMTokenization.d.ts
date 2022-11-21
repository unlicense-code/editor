import { Event } from 'vs/base/common/event';
import { IState, ITokenizationSupport, TokenizationResult, EncodedTokenizationResult } from 'vs/editor/common/languages';
import { LanguageId } from 'vs/editor/common/encodedTokenAttributes';
import type { IGrammar, StackElement } from 'vscode-textmate';
import { Disposable } from 'vs/base/common/lifecycle';
export declare class TMTokenization extends Disposable implements ITokenizationSupport {
    private readonly _grammar;
    private readonly _containsEmbeddedLanguages;
    private readonly _seenLanguages;
    private readonly _initialState;
    private readonly _onDidEncounterLanguage;
    readonly onDidEncounterLanguage: Event<LanguageId>;
    constructor(grammar: IGrammar, initialState: StackElement, containsEmbeddedLanguages: boolean);
    getInitialState(): IState;
    tokenize(line: string, hasEOL: boolean, state: IState): TokenizationResult;
    tokenizeEncoded(line: string, hasEOL: boolean, state: StackElement): EncodedTokenizationResult;
}
