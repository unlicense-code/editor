/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import * as nls from 'vs/nls';
import * as dom from 'vs/base/browser/dom';
import { Color } from 'vs/base/common/color';
import { onUnexpectedError } from 'vs/base/common/errors';
import { Emitter } from 'vs/base/common/event';
import * as resources from 'vs/base/common/resources';
import * as types from 'vs/base/common/types';
import { equals as equalArray } from 'vs/base/common/arrays';
import { TokenizationRegistry } from 'vs/editor/common/languages';
import { nullTokenizeEncoded } from 'vs/editor/common/languages/nullTokenize';
import { generateTokensCSSForColorMap } from 'vs/editor/common/languages/supports/tokenization';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ILogService } from 'vs/platform/log/common/log';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { grammarsExtPoint } from 'vs/workbench/services/textMate/common/TMGrammars';
import { IWorkbenchThemeService } from 'vs/workbench/services/themes/common/workbenchThemeService';
import { Disposable, dispose } from 'vs/base/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { missingTMGrammarErrorMessage, TMGrammarFactory } from 'vs/workbench/services/textMate/common/TMGrammarFactory';
import { IExtensionResourceLoaderService } from 'vs/platform/extensionResourceLoader/common/extensionResourceLoader';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { TMTokenization } from 'vs/workbench/services/textMate/common/TMTokenization';
let AbstractTextMateService = class AbstractTextMateService extends Disposable {
    _languageService;
    _themeService;
    _extensionResourceLoaderService;
    _notificationService;
    _logService;
    _configurationService;
    _progressService;
    _serviceBrand;
    _onDidEncounterLanguage = this._register(new Emitter());
    onDidEncounterLanguage = this._onDidEncounterLanguage.event;
    _styleElement;
    _createdModes;
    _encounteredLanguages;
    _debugMode;
    _debugModePrintFunc;
    _grammarDefinitions;
    _grammarFactory;
    _tokenizersRegistrations;
    _currentTheme;
    _currentTokenColorMap;
    constructor(_languageService, _themeService, _extensionResourceLoaderService, _notificationService, _logService, _configurationService, _progressService) {
        super();
        this._languageService = _languageService;
        this._themeService = _themeService;
        this._extensionResourceLoaderService = _extensionResourceLoaderService;
        this._notificationService = _notificationService;
        this._logService = _logService;
        this._configurationService = _configurationService;
        this._progressService = _progressService;
        this._styleElement = dom.createStyleSheet();
        this._styleElement.className = 'vscode-tokens-styles';
        this._createdModes = [];
        this._encounteredLanguages = [];
        this._debugMode = false;
        this._debugModePrintFunc = () => { };
        this._grammarDefinitions = null;
        this._grammarFactory = null;
        this._tokenizersRegistrations = [];
        this._currentTheme = null;
        this._currentTokenColorMap = null;
        grammarsExtPoint.setHandler((extensions) => {
            this._grammarDefinitions = null;
            if (this._grammarFactory) {
                this._grammarFactory.dispose();
                this._grammarFactory = null;
                this._onDidDisposeGrammarFactory();
            }
            this._tokenizersRegistrations = dispose(this._tokenizersRegistrations);
            this._grammarDefinitions = [];
            for (const extension of extensions) {
                const grammars = extension.value;
                for (const grammar of grammars) {
                    if (!this._validateGrammarExtensionPoint(extension.description.extensionLocation, grammar, extension.collector)) {
                        continue;
                    }
                    const grammarLocation = resources.joinPath(extension.description.extensionLocation, grammar.path);
                    const embeddedLanguages = Object.create(null);
                    if (grammar.embeddedLanguages) {
                        const scopes = Object.keys(grammar.embeddedLanguages);
                        for (let i = 0, len = scopes.length; i < len; i++) {
                            const scope = scopes[i];
                            const language = grammar.embeddedLanguages[scope];
                            if (typeof language !== 'string') {
                                // never hurts to be too careful
                                continue;
                            }
                            if (this._languageService.isRegisteredLanguageId(language)) {
                                embeddedLanguages[scope] = this._languageService.languageIdCodec.encodeLanguageId(language);
                            }
                        }
                    }
                    const tokenTypes = Object.create(null);
                    if (grammar.tokenTypes) {
                        const scopes = Object.keys(grammar.tokenTypes);
                        for (const scope of scopes) {
                            const tokenType = grammar.tokenTypes[scope];
                            switch (tokenType) {
                                case 'string':
                                    tokenTypes[scope] = 2 /* StandardTokenType.String */;
                                    break;
                                case 'other':
                                    tokenTypes[scope] = 0 /* StandardTokenType.Other */;
                                    break;
                                case 'comment':
                                    tokenTypes[scope] = 1 /* StandardTokenType.Comment */;
                                    break;
                            }
                        }
                    }
                    let validLanguageId = null;
                    if (grammar.language && this._languageService.isRegisteredLanguageId(grammar.language)) {
                        validLanguageId = grammar.language;
                    }
                    function asStringArray(array, defaultValue) {
                        if (!Array.isArray(array)) {
                            return defaultValue;
                        }
                        if (!array.every(e => typeof e === 'string')) {
                            return defaultValue;
                        }
                        return array;
                    }
                    this._grammarDefinitions.push({
                        location: grammarLocation,
                        language: validLanguageId ? validLanguageId : undefined,
                        scopeName: grammar.scopeName,
                        embeddedLanguages: embeddedLanguages,
                        tokenTypes: tokenTypes,
                        injectTo: grammar.injectTo,
                        balancedBracketSelectors: asStringArray(grammar.balancedBracketScopes, ['*']),
                        unbalancedBracketSelectors: asStringArray(grammar.unbalancedBracketScopes, []),
                    });
                    if (validLanguageId) {
                        this._tokenizersRegistrations.push(TokenizationRegistry.registerFactory(validLanguageId, this._createFactory(validLanguageId)));
                    }
                }
            }
            for (const createMode of this._createdModes) {
                TokenizationRegistry.getOrCreate(createMode);
            }
        });
        this._updateTheme(this._grammarFactory, this._themeService.getColorTheme(), true);
        this._register(this._themeService.onDidColorThemeChange(() => {
            this._updateTheme(this._grammarFactory, this._themeService.getColorTheme(), false);
        }));
        this._languageService.onDidEncounterLanguage((languageId) => {
            this._createdModes.push(languageId);
        });
    }
    startDebugMode(printFn, onStop) {
        if (this._debugMode) {
            this._notificationService.error(nls.localize('alreadyDebugging', "Already Logging."));
            return;
        }
        this._debugModePrintFunc = printFn;
        this._debugMode = true;
        if (this._debugMode) {
            this._progressService.withProgress({
                location: 15 /* ProgressLocation.Notification */,
                buttons: [nls.localize('stop', "Stop")]
            }, (progress) => {
                progress.report({
                    message: nls.localize('progress1', "Preparing to log TM Grammar parsing. Press Stop when finished.")
                });
                return this._getVSCodeOniguruma().then((vscodeOniguruma) => {
                    vscodeOniguruma.setDefaultDebugCall(true);
                    progress.report({
                        message: nls.localize('progress2', "Now logging TM Grammar parsing. Press Stop when finished.")
                    });
                    return new Promise((resolve, reject) => { });
                });
            }, (choice) => {
                this._getVSCodeOniguruma().then((vscodeOniguruma) => {
                    this._debugModePrintFunc = () => { };
                    this._debugMode = false;
                    vscodeOniguruma.setDefaultDebugCall(false);
                    onStop();
                });
            });
        }
    }
    _canCreateGrammarFactory() {
        // Check if extension point is ready
        return (this._grammarDefinitions ? true : false);
    }
    async _getOrCreateGrammarFactory() {
        if (this._grammarFactory) {
            return this._grammarFactory;
        }
        const [vscodeTextmate, vscodeOniguruma] = await Promise.all([import('vscode-textmate'), this._getVSCodeOniguruma()]);
        const onigLib = Promise.resolve({
            createOnigScanner: (sources) => vscodeOniguruma.createOnigScanner(sources),
            createOnigString: (str) => vscodeOniguruma.createOnigString(str)
        });
        // Avoid duplicate instantiations
        if (this._grammarFactory) {
            return this._grammarFactory;
        }
        this._grammarFactory = new TMGrammarFactory({
            logTrace: (msg) => this._logService.trace(msg),
            logError: (msg, err) => this._logService.error(msg, err),
            readFile: (resource) => this._extensionResourceLoaderService.readExtensionResource(resource)
        }, this._grammarDefinitions || [], vscodeTextmate, onigLib);
        this._onDidCreateGrammarFactory(this._grammarDefinitions || []);
        this._updateTheme(this._grammarFactory, this._themeService.getColorTheme(), true);
        return this._grammarFactory;
    }
    _createFactory(languageId) {
        return {
            createTokenizationSupport: async () => {
                if (!this._languageService.isRegisteredLanguageId(languageId)) {
                    return null;
                }
                if (!this._canCreateGrammarFactory()) {
                    return null;
                }
                const encodedLanguageId = this._languageService.languageIdCodec.encodeLanguageId(languageId);
                try {
                    const grammarFactory = await this._getOrCreateGrammarFactory();
                    if (!grammarFactory.has(languageId)) {
                        return null;
                    }
                    const r = await grammarFactory.createGrammar(languageId, encodedLanguageId);
                    if (!r.grammar) {
                        return null;
                    }
                    const tokenization = new TMTokenization(r.grammar, r.initialState, r.containsEmbeddedLanguages);
                    tokenization.onDidEncounterLanguage((encodedLanguageId) => {
                        if (!this._encounteredLanguages[encodedLanguageId]) {
                            const languageId = this._languageService.languageIdCodec.decodeLanguageId(encodedLanguageId);
                            this._encounteredLanguages[encodedLanguageId] = true;
                            this._onDidEncounterLanguage.fire(languageId);
                        }
                    });
                    return new TMTokenizationSupportWithLineLimit(languageId, encodedLanguageId, tokenization, this._configurationService);
                }
                catch (err) {
                    if (err.message && err.message === missingTMGrammarErrorMessage) {
                        // Don't log this error message
                        return null;
                    }
                    onUnexpectedError(err);
                    return null;
                }
            }
        };
    }
    static _toColorMap(colorMap) {
        const result = [null];
        for (let i = 1, len = colorMap.length; i < len; i++) {
            result[i] = Color.fromHex(colorMap[i]);
        }
        return result;
    }
    _updateTheme(grammarFactory, colorTheme, forceUpdate) {
        if (!forceUpdate && this._currentTheme && this._currentTokenColorMap && AbstractTextMateService.equalsTokenRules(this._currentTheme.settings, colorTheme.tokenColors) && equalArray(this._currentTokenColorMap, colorTheme.tokenColorMap)) {
            return;
        }
        this._currentTheme = { name: colorTheme.label, settings: colorTheme.tokenColors };
        this._currentTokenColorMap = colorTheme.tokenColorMap;
        this._doUpdateTheme(grammarFactory, this._currentTheme, this._currentTokenColorMap);
    }
    _doUpdateTheme(grammarFactory, theme, tokenColorMap) {
        grammarFactory?.setTheme(theme, tokenColorMap);
        const colorMap = AbstractTextMateService._toColorMap(tokenColorMap);
        const cssRules = generateTokensCSSForColorMap(colorMap);
        this._styleElement.textContent = cssRules;
        TokenizationRegistry.setColorMap(colorMap);
    }
    static equalsTokenRules(a, b) {
        if (!b || !a || b.length !== a.length) {
            return false;
        }
        for (let i = b.length - 1; i >= 0; i--) {
            const r1 = b[i];
            const r2 = a[i];
            if (r1.scope !== r2.scope) {
                return false;
            }
            const s1 = r1.settings;
            const s2 = r2.settings;
            if (s1 && s2) {
                if (s1.fontStyle !== s2.fontStyle || s1.foreground !== s2.foreground || s1.background !== s2.background) {
                    return false;
                }
            }
            else if (!s1 || !s2) {
                return false;
            }
        }
        return true;
    }
    _validateGrammarExtensionPoint(extensionLocation, syntax, collector) {
        if (syntax.language && ((typeof syntax.language !== 'string') || !this._languageService.isRegisteredLanguageId(syntax.language))) {
            collector.error(nls.localize('invalid.language', "Unknown language in `contributes.{0}.language`. Provided value: {1}", grammarsExtPoint.name, String(syntax.language)));
            return false;
        }
        if (!syntax.scopeName || (typeof syntax.scopeName !== 'string')) {
            collector.error(nls.localize('invalid.scopeName', "Expected string in `contributes.{0}.scopeName`. Provided value: {1}", grammarsExtPoint.name, String(syntax.scopeName)));
            return false;
        }
        if (!syntax.path || (typeof syntax.path !== 'string')) {
            collector.error(nls.localize('invalid.path.0', "Expected string in `contributes.{0}.path`. Provided value: {1}", grammarsExtPoint.name, String(syntax.path)));
            return false;
        }
        if (syntax.injectTo && (!Array.isArray(syntax.injectTo) || syntax.injectTo.some(scope => typeof scope !== 'string'))) {
            collector.error(nls.localize('invalid.injectTo', "Invalid value in `contributes.{0}.injectTo`. Must be an array of language scope names. Provided value: {1}", grammarsExtPoint.name, JSON.stringify(syntax.injectTo)));
            return false;
        }
        if (syntax.embeddedLanguages && !types.isObject(syntax.embeddedLanguages)) {
            collector.error(nls.localize('invalid.embeddedLanguages', "Invalid value in `contributes.{0}.embeddedLanguages`. Must be an object map from scope name to language. Provided value: {1}", grammarsExtPoint.name, JSON.stringify(syntax.embeddedLanguages)));
            return false;
        }
        if (syntax.tokenTypes && !types.isObject(syntax.tokenTypes)) {
            collector.error(nls.localize('invalid.tokenTypes', "Invalid value in `contributes.{0}.tokenTypes`. Must be an object map from scope name to token type. Provided value: {1}", grammarsExtPoint.name, JSON.stringify(syntax.tokenTypes)));
            return false;
        }
        const grammarLocation = resources.joinPath(extensionLocation, syntax.path);
        if (!resources.isEqualOrParent(grammarLocation, extensionLocation)) {
            collector.warn(nls.localize('invalid.path.1', "Expected `contributes.{0}.path` ({1}) to be included inside extension's folder ({2}). This might make the extension non-portable.", grammarsExtPoint.name, grammarLocation.path, extensionLocation.path));
        }
        return true;
    }
    async createGrammar(languageId) {
        if (!this._languageService.isRegisteredLanguageId(languageId)) {
            return null;
        }
        const grammarFactory = await this._getOrCreateGrammarFactory();
        if (!grammarFactory.has(languageId)) {
            return null;
        }
        const encodedLanguageId = this._languageService.languageIdCodec.encodeLanguageId(languageId);
        const { grammar } = await grammarFactory.createGrammar(languageId, encodedLanguageId);
        return grammar;
    }
    _onDidCreateGrammarFactory(grammarDefinitions) {
    }
    _onDidDisposeGrammarFactory() {
    }
    _vscodeOniguruma = null;
    _getVSCodeOniguruma() {
        if (!this._vscodeOniguruma) {
            this._vscodeOniguruma = this._doGetVSCodeOniguruma();
        }
        return this._vscodeOniguruma;
    }
    async _doGetVSCodeOniguruma() {
        const [vscodeOniguruma, wasm] = await Promise.all([import('vscode-oniguruma'), this._loadVSCodeOnigurumWASM()]);
        const options = {
            data: wasm,
            print: (str) => {
                this._debugModePrintFunc(str);
            }
        };
        await vscodeOniguruma.loadWASM(options);
        return vscodeOniguruma;
    }
};
AbstractTextMateService = __decorate([
    __param(0, ILanguageService),
    __param(1, IWorkbenchThemeService),
    __param(2, IExtensionResourceLoaderService),
    __param(3, INotificationService),
    __param(4, ILogService),
    __param(5, IConfigurationService),
    __param(6, IProgressService)
], AbstractTextMateService);
export { AbstractTextMateService };
let TMTokenizationSupportWithLineLimit = class TMTokenizationSupportWithLineLimit {
    _configurationService;
    _languageId;
    _encodedLanguageId;
    _actual;
    _maxTokenizationLineLength;
    constructor(languageId, encodedLanguageId, actual, _configurationService) {
        this._configurationService = _configurationService;
        this._languageId = languageId;
        this._encodedLanguageId = encodedLanguageId;
        this._actual = actual;
        this._maxTokenizationLineLength = this._configurationService.getValue('editor.maxTokenizationLineLength', {
            overrideIdentifier: this._languageId
        });
        this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('editor.maxTokenizationLineLength')) {
                this._maxTokenizationLineLength = this._configurationService.getValue('editor.maxTokenizationLineLength', {
                    overrideIdentifier: this._languageId
                });
            }
        });
    }
    getInitialState() {
        return this._actual.getInitialState();
    }
    tokenize(line, hasEOL, state) {
        throw new Error('Not supported!');
    }
    tokenizeEncoded(line, hasEOL, state) {
        // Do not attempt to tokenize if a line is too long
        if (line.length >= this._maxTokenizationLineLength) {
            return nullTokenizeEncoded(this._encodedLanguageId, state);
        }
        return this._actual.tokenizeEncoded(line, hasEOL, state);
    }
};
TMTokenizationSupportWithLineLimit = __decorate([
    __param(3, IConfigurationService)
], TMTokenizationSupportWithLineLimit);
