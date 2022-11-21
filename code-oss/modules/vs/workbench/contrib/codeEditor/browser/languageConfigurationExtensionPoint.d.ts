import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { ITextMateService } from 'vs/workbench/services/textMate/browser/textMate';
import { IExtensionResourceLoaderService } from 'vs/platform/extensionResourceLoader/common/extensionResourceLoader';
import { Disposable } from 'vs/base/common/lifecycle';
export declare class LanguageConfigurationFileHandler extends Disposable {
    private readonly _languageService;
    private readonly _extensionResourceLoaderService;
    private readonly _extensionService;
    private readonly _languageConfigurationService;
    /**
     * A map from language id to a hash computed from the config files locations.
     */
    private readonly _done;
    constructor(textMateService: ITextMateService, _languageService: ILanguageService, _extensionResourceLoaderService: IExtensionResourceLoaderService, _extensionService: IExtensionService, _languageConfigurationService: ILanguageConfigurationService);
    private _loadConfigurationsForMode;
    private _readConfigFile;
    private _extractValidCommentRule;
    private _extractValidBrackets;
    private _extractValidAutoClosingPairs;
    private _extractValidSurroundingPairs;
    private _extractValidColorizedBracketPairs;
    private _extractValidOnEnterRules;
    private _handleConfig;
    private _parseRegex;
    private _mapIndentationRules;
}
