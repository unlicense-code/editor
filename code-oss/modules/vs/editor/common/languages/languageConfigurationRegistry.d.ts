import { Event } from 'vs/base/common/event';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { ITextModel } from 'vs/editor/common/model';
import { EnterAction, FoldingRules, IAutoClosingPair, IndentationRule, LanguageConfiguration, AutoClosingPairs } from 'vs/editor/common/languages/languageConfiguration';
import { ScopedLineTokens } from 'vs/editor/common/languages/supports';
import { CharacterPairSupport } from 'vs/editor/common/languages/supports/characterPair';
import { BracketElectricCharacterSupport } from 'vs/editor/common/languages/supports/electricCharacter';
import { IndentRulesSupport } from 'vs/editor/common/languages/supports/indentRules';
import { RichEditBrackets } from 'vs/editor/common/languages/supports/richEditBrackets';
import { EditorAutoIndentStrategy } from 'vs/editor/common/config/editorOptions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { LanguageBracketsConfiguration } from 'vs/editor/common/languages/supports/languageBracketsConfiguration';
/**
 * Interface used to support insertion of mode specific comments.
 */
export interface ICommentsConfiguration {
    lineCommentToken?: string;
    blockCommentStartToken?: string;
    blockCommentEndToken?: string;
}
export interface ILanguageConfigurationService {
    readonly _serviceBrand: undefined;
    onDidChange: Event<LanguageConfigurationServiceChangeEvent>;
    /**
     * @param priority Use a higher number for higher priority
     */
    register(languageId: string, configuration: LanguageConfiguration, priority?: number): IDisposable;
    getLanguageConfiguration(languageId: string): ResolvedLanguageConfiguration;
}
export declare class LanguageConfigurationServiceChangeEvent {
    readonly languageId: string | undefined;
    constructor(languageId: string | undefined);
    affects(languageId: string): boolean;
}
export declare const ILanguageConfigurationService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ILanguageConfigurationService>;
export declare class LanguageConfigurationService extends Disposable implements ILanguageConfigurationService {
    private readonly configurationService;
    private readonly languageService;
    _serviceBrand: undefined;
    private readonly _registry;
    private readonly onDidChangeEmitter;
    readonly onDidChange: Event<LanguageConfigurationServiceChangeEvent>;
    private readonly configurations;
    constructor(configurationService: IConfigurationService, languageService: ILanguageService);
    register(languageId: string, configuration: LanguageConfiguration, priority?: number): IDisposable;
    getLanguageConfiguration(languageId: string): ResolvedLanguageConfiguration;
}
export declare function getIndentationAtPosition(model: ITextModel, lineNumber: number, column: number): string;
export declare function getScopedLineTokens(model: ITextModel, lineNumber: number, columnNumber?: number): ScopedLineTokens;
export declare class LanguageConfigurationChangeEvent {
    readonly languageId: string;
    constructor(languageId: string);
}
export declare class LanguageConfigurationRegistry extends Disposable {
    private readonly _entries;
    private readonly _onDidChange;
    readonly onDidChange: Event<LanguageConfigurationChangeEvent>;
    constructor();
    /**
     * @param priority Use a higher number for higher priority
     */
    register(languageId: string, configuration: LanguageConfiguration, priority?: number): IDisposable;
    getLanguageConfiguration(languageId: string): ResolvedLanguageConfiguration | null;
}
/**
 * Immutable.
*/
export declare class ResolvedLanguageConfiguration {
    readonly languageId: string;
    readonly underlyingConfig: LanguageConfiguration;
    private _brackets;
    private _electricCharacter;
    private readonly _onEnterSupport;
    readonly comments: ICommentsConfiguration | null;
    readonly characterPair: CharacterPairSupport;
    readonly wordDefinition: RegExp;
    readonly indentRulesSupport: IndentRulesSupport | null;
    readonly indentationRules: IndentationRule | undefined;
    readonly foldingRules: FoldingRules;
    readonly bracketsNew: LanguageBracketsConfiguration;
    constructor(languageId: string, underlyingConfig: LanguageConfiguration);
    getWordDefinition(): RegExp;
    get brackets(): RichEditBrackets | null;
    get electricCharacter(): BracketElectricCharacterSupport | null;
    onEnter(autoIndent: EditorAutoIndentStrategy, previousLineText: string, beforeEnterText: string, afterEnterText: string): EnterAction | null;
    getAutoClosingPairs(): AutoClosingPairs;
    getAutoCloseBeforeSet(): string;
    getSurroundingPairs(): IAutoClosingPair[];
    private static _handleComments;
}
