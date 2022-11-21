import { TokenizationResult, EncodedTokenizationResult, IState } from 'vs/editor/common/languages';
import { LanguageId } from 'vs/editor/common/encodedTokenAttributes';
export declare const NullState: IState;
export declare function nullTokenize(languageId: string, state: IState): TokenizationResult;
export declare function nullTokenizeEncoded(languageId: LanguageId, state: IState | null): EncodedTokenizationResult;
