import { IViewLineTokens } from 'vs/editor/common/tokens/lineTokens';
import { ILanguageIdCodec, ITokenizationSupport } from 'vs/editor/common/languages';
import { ILanguageService } from 'vs/editor/common/languages/language';
export declare type IReducedTokenizationSupport = Omit<ITokenizationSupport, 'tokenize'>;
export declare function tokenizeToStringSync(languageService: ILanguageService, text: string, languageId: string): string;
export declare function tokenizeToString(languageService: ILanguageService, text: string, languageId: string | null): Promise<string>;
export declare function tokenizeLineToHTML(text: string, viewLineTokens: IViewLineTokens, colorMap: string[], startOffset: number, endOffset: number, tabSize: number, useNbsp: boolean): string;
export declare function _tokenizeToString(text: string, languageIdCodec: ILanguageIdCodec, tokenizationSupport: IReducedTokenizationSupport): string;
