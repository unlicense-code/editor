import * as languages from 'vs/editor/common/languages';
import { ILanguageService } from 'vs/editor/common/languages/language';
import * as monarchCommon from 'vs/editor/standalone/common/monarch/monarchCommon';
import { IStandaloneThemeService } from 'vs/editor/standalone/common/standaloneTheme';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export declare type ILoadStatus = {
    loaded: true;
} | {
    loaded: false;
    promise: Promise<void>;
};
export declare class MonarchTokenizer implements languages.ITokenizationSupport {
    private readonly _configurationService;
    private readonly _languageService;
    private readonly _standaloneThemeService;
    private readonly _languageId;
    private readonly _lexer;
    private readonly _embeddedLanguages;
    embeddedLoaded: Promise<void>;
    private readonly _tokenizationRegistryListener;
    private _maxTokenizationLineLength;
    constructor(languageService: ILanguageService, standaloneThemeService: IStandaloneThemeService, languageId: string, lexer: monarchCommon.ILexer, _configurationService: IConfigurationService);
    dispose(): void;
    getLoadStatus(): ILoadStatus;
    getInitialState(): languages.IState;
    tokenize(line: string, hasEOL: boolean, lineState: languages.IState): languages.TokenizationResult;
    tokenizeEncoded(line: string, hasEOL: boolean, lineState: languages.IState): languages.EncodedTokenizationResult;
    private _tokenize;
    private _findLeavingNestedLanguageOffset;
    private _nestedTokenize;
    private _safeRuleName;
    private _myTokenize;
    private _getNestedEmbeddedLanguageData;
}
