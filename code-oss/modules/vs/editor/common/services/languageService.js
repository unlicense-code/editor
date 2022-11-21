/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { LanguagesRegistry } from 'vs/editor/common/services/languagesRegistry';
import { firstOrDefault } from 'vs/base/common/arrays';
import { TokenizationRegistry } from 'vs/editor/common/languages';
import { PLAINTEXT_LANGUAGE_ID } from 'vs/editor/common/languages/modesRegistry';
export class LanguageService extends Disposable {
    _serviceBrand;
    static instanceCount = 0;
    _encounteredLanguages;
    _registry;
    languageIdCodec;
    _onDidEncounterLanguage = this._register(new Emitter());
    onDidEncounterLanguage = this._onDidEncounterLanguage.event;
    _onDidChange = this._register(new Emitter({ leakWarningThreshold: 200 /* https://github.com/microsoft/vscode/issues/119968 */ }));
    onDidChange = this._onDidChange.event;
    constructor(warnOnOverwrite = false) {
        super();
        LanguageService.instanceCount++;
        this._encounteredLanguages = new Set();
        this._registry = this._register(new LanguagesRegistry(true, warnOnOverwrite));
        this.languageIdCodec = this._registry.languageIdCodec;
        this._register(this._registry.onDidChange(() => this._onDidChange.fire()));
    }
    dispose() {
        LanguageService.instanceCount--;
        super.dispose();
    }
    registerLanguage(def) {
        return this._registry.registerLanguage(def);
    }
    isRegisteredLanguageId(languageId) {
        return this._registry.isRegisteredLanguageId(languageId);
    }
    getRegisteredLanguageIds() {
        return this._registry.getRegisteredLanguageIds();
    }
    getSortedRegisteredLanguageNames() {
        return this._registry.getSortedRegisteredLanguageNames();
    }
    getLanguageName(languageId) {
        return this._registry.getLanguageName(languageId);
    }
    getMimeType(languageId) {
        return this._registry.getMimeType(languageId);
    }
    getIcon(languageId) {
        return this._registry.getIcon(languageId);
    }
    getExtensions(languageId) {
        return this._registry.getExtensions(languageId);
    }
    getFilenames(languageId) {
        return this._registry.getFilenames(languageId);
    }
    getConfigurationFiles(languageId) {
        return this._registry.getConfigurationFiles(languageId);
    }
    getLanguageIdByLanguageName(languageName) {
        return this._registry.getLanguageIdByLanguageName(languageName);
    }
    getLanguageIdByMimeType(mimeType) {
        return this._registry.getLanguageIdByMimeType(mimeType);
    }
    guessLanguageIdByFilepathOrFirstLine(resource, firstLine) {
        const languageIds = this._registry.guessLanguageIdByFilepathOrFirstLine(resource, firstLine);
        return firstOrDefault(languageIds, null);
    }
    createById(languageId) {
        return new LanguageSelection(this.onDidChange, () => {
            return this._createAndGetLanguageIdentifier(languageId);
        });
    }
    createByMimeType(mimeType) {
        return new LanguageSelection(this.onDidChange, () => {
            const languageId = this.getLanguageIdByMimeType(mimeType);
            return this._createAndGetLanguageIdentifier(languageId);
        });
    }
    createByFilepathOrFirstLine(resource, firstLine) {
        return new LanguageSelection(this.onDidChange, () => {
            const languageId = this.guessLanguageIdByFilepathOrFirstLine(resource, firstLine);
            return this._createAndGetLanguageIdentifier(languageId);
        });
    }
    _createAndGetLanguageIdentifier(languageId) {
        if (!languageId || !this.isRegisteredLanguageId(languageId)) {
            // Fall back to plain text if language is unknown
            languageId = PLAINTEXT_LANGUAGE_ID;
        }
        if (!this._encounteredLanguages.has(languageId)) {
            this._encounteredLanguages.add(languageId);
            // Ensure tokenizers are created
            TokenizationRegistry.getOrCreate(languageId);
            // Fire event
            this._onDidEncounterLanguage.fire(languageId);
        }
        return languageId;
    }
}
class LanguageSelection {
    _onDidChangeLanguages;
    _selector;
    languageId;
    _listener = null;
    _emitter = null;
    constructor(_onDidChangeLanguages, _selector) {
        this._onDidChangeLanguages = _onDidChangeLanguages;
        this._selector = _selector;
        this.languageId = this._selector();
    }
    _dispose() {
        if (this._listener) {
            this._listener.dispose();
            this._listener = null;
        }
        if (this._emitter) {
            this._emitter.dispose();
            this._emitter = null;
        }
    }
    get onDidChange() {
        if (!this._listener) {
            this._listener = this._onDidChangeLanguages(() => this._evaluate());
        }
        if (!this._emitter) {
            this._emitter = new Emitter({
                onDidRemoveLastListener: () => {
                    this._dispose();
                }
            });
        }
        return this._emitter.event;
    }
    _evaluate() {
        const languageId = this._selector();
        if (languageId === this.languageId) {
            // no change
            return;
        }
        this.languageId = languageId;
        this._emitter?.fire(this.languageId);
    }
}
