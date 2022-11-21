/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable } from 'vs/base/common/lifecycle';
import { TMScopeRegistry } from 'vs/workbench/services/textMate/common/TMScopeRegistry';
export const missingTMGrammarErrorMessage = 'No TM Grammar registered for this language.';
export class TMGrammarFactory extends Disposable {
    _host;
    _initialState;
    _scopeRegistry;
    _injections;
    _injectedEmbeddedLanguages;
    _languageToScope;
    _grammarRegistry;
    constructor(host, grammarDefinitions, vscodeTextmate, onigLib) {
        super();
        this._host = host;
        this._initialState = vscodeTextmate.INITIAL;
        this._scopeRegistry = this._register(new TMScopeRegistry());
        this._injections = {};
        this._injectedEmbeddedLanguages = {};
        this._languageToScope = new Map();
        this._grammarRegistry = this._register(new vscodeTextmate.Registry({
            onigLib: onigLib,
            loadGrammar: async (scopeName) => {
                const grammarDefinition = this._scopeRegistry.getGrammarDefinition(scopeName);
                if (!grammarDefinition) {
                    this._host.logTrace(`No grammar found for scope ${scopeName}`);
                    return null;
                }
                const location = grammarDefinition.location;
                try {
                    const content = await this._host.readFile(location);
                    return vscodeTextmate.parseRawGrammar(content, location.path);
                }
                catch (e) {
                    this._host.logError(`Unable to load and parse grammar for scope ${scopeName} from ${location}`, e);
                    return null;
                }
            },
            getInjections: (scopeName) => {
                const scopeParts = scopeName.split('.');
                let injections = [];
                for (let i = 1; i <= scopeParts.length; i++) {
                    const subScopeName = scopeParts.slice(0, i).join('.');
                    injections = [...injections, ...(this._injections[subScopeName] || [])];
                }
                return injections;
            }
        }));
        for (const validGrammar of grammarDefinitions) {
            this._scopeRegistry.register(validGrammar);
            if (validGrammar.injectTo) {
                for (const injectScope of validGrammar.injectTo) {
                    let injections = this._injections[injectScope];
                    if (!injections) {
                        this._injections[injectScope] = injections = [];
                    }
                    injections.push(validGrammar.scopeName);
                }
                if (validGrammar.embeddedLanguages) {
                    for (const injectScope of validGrammar.injectTo) {
                        let injectedEmbeddedLanguages = this._injectedEmbeddedLanguages[injectScope];
                        if (!injectedEmbeddedLanguages) {
                            this._injectedEmbeddedLanguages[injectScope] = injectedEmbeddedLanguages = [];
                        }
                        injectedEmbeddedLanguages.push(validGrammar.embeddedLanguages);
                    }
                }
            }
            if (validGrammar.language) {
                this._languageToScope.set(validGrammar.language, validGrammar.scopeName);
            }
        }
    }
    has(languageId) {
        return this._languageToScope.has(languageId);
    }
    setTheme(theme, colorMap) {
        this._grammarRegistry.setTheme(theme, colorMap);
    }
    getColorMap() {
        return this._grammarRegistry.getColorMap();
    }
    async createGrammar(languageId, encodedLanguageId) {
        const scopeName = this._languageToScope.get(languageId);
        if (typeof scopeName !== 'string') {
            // No TM grammar defined
            throw new Error(missingTMGrammarErrorMessage);
        }
        const grammarDefinition = this._scopeRegistry.getGrammarDefinition(scopeName);
        if (!grammarDefinition) {
            // No TM grammar defined
            throw new Error(missingTMGrammarErrorMessage);
        }
        const embeddedLanguages = grammarDefinition.embeddedLanguages;
        if (this._injectedEmbeddedLanguages[scopeName]) {
            const injectedEmbeddedLanguages = this._injectedEmbeddedLanguages[scopeName];
            for (const injected of injectedEmbeddedLanguages) {
                for (const scope of Object.keys(injected)) {
                    embeddedLanguages[scope] = injected[scope];
                }
            }
        }
        const containsEmbeddedLanguages = (Object.keys(embeddedLanguages).length > 0);
        let grammar;
        try {
            grammar = await this._grammarRegistry.loadGrammarWithConfiguration(scopeName, encodedLanguageId, {
                embeddedLanguages,
                tokenTypes: grammarDefinition.tokenTypes,
                balancedBracketSelectors: grammarDefinition.balancedBracketSelectors,
                unbalancedBracketSelectors: grammarDefinition.unbalancedBracketSelectors,
            });
        }
        catch (err) {
            if (err.message && err.message.startsWith('No grammar provided for')) {
                // No TM grammar defined
                throw new Error(missingTMGrammarErrorMessage);
            }
            throw err;
        }
        return {
            languageId: languageId,
            grammar: grammar,
            initialState: this._initialState,
            containsEmbeddedLanguages: containsEmbeddedLanguages
        };
    }
}
