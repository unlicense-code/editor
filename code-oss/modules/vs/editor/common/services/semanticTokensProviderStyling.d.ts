import { SemanticTokensLegend, SemanticTokens } from 'vs/editor/common/languages';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ILogService } from 'vs/platform/log/common/log';
import { SparseMultilineTokens } from 'vs/editor/common/tokens/sparseMultilineTokens';
import { ILanguageService } from 'vs/editor/common/languages/language';
export declare class SemanticTokensProviderStyling {
    private readonly _legend;
    private readonly _themeService;
    private readonly _languageService;
    private readonly _logService;
    private readonly _hashTable;
    private _hasWarnedOverlappingTokens;
    private _hasWarnedInvalidLengthTokens;
    private _hasWarnedInvalidEditStart;
    constructor(_legend: SemanticTokensLegend, _themeService: IThemeService, _languageService: ILanguageService, _logService: ILogService);
    getMetadata(tokenTypeIndex: number, tokenModifierSet: number, languageId: string): number;
    warnOverlappingSemanticTokens(lineNumber: number, startColumn: number): void;
    warnInvalidLengthSemanticTokens(lineNumber: number, startColumn: number): void;
    warnInvalidEditStart(previousResultId: string | undefined, resultId: string | undefined, editIndex: number, editStart: number, maxExpectedStart: number): void;
}
export declare function toMultilineTokens2(tokens: SemanticTokens, styling: SemanticTokensProviderStyling, languageId: string): SparseMultilineTokens[];
