import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { IViewLineTokens } from 'vs/editor/common/tokens/lineTokens';
export declare function fixBracketsInLine(tokens: IViewLineTokens, languageConfigurationService: ILanguageConfigurationService): string;
