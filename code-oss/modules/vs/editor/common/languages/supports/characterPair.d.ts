import { IAutoClosingPair, StandardAutoClosingPairConditional, LanguageConfiguration } from 'vs/editor/common/languages/languageConfiguration';
export declare class CharacterPairSupport {
    static readonly DEFAULT_AUTOCLOSE_BEFORE_LANGUAGE_DEFINED = ";:.,=}])> \n\t";
    static readonly DEFAULT_AUTOCLOSE_BEFORE_WHITESPACE = " \n\t";
    private readonly _autoClosingPairs;
    private readonly _surroundingPairs;
    private readonly _autoCloseBefore;
    constructor(config: LanguageConfiguration);
    getAutoClosingPairs(): StandardAutoClosingPairConditional[];
    getAutoCloseBeforeSet(): string;
    getSurroundingPairs(): IAutoClosingPair[];
}
