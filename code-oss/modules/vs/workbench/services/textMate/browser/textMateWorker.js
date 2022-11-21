/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { URI } from 'vs/base/common/uri';
import { TMGrammarFactory } from 'vs/workbench/services/textMate/common/TMGrammarFactory';
import { MirrorTextModel } from 'vs/editor/common/model/mirrorTextModel';
import { TokenizationStateStore } from 'vs/editor/common/model/textModelTokens';
import { ContiguousMultilineTokensBuilder } from 'vs/editor/common/tokens/contiguousMultilineTokensBuilder';
import { countEOL } from 'vs/editor/common/core/eolCounter';
import { LineTokens } from 'vs/editor/common/tokens/lineTokens';
import { FileAccess, nodeModulesAsarPath, nodeModulesPath } from 'vs/base/common/network';
import { TMTokenization } from 'vs/workbench/services/textMate/common/TMTokenization';
const textmateModuleLocation = `${nodeModulesPath}/vscode-textmate`;
const textmateModuleLocationAsar = `${nodeModulesAsarPath}/vscode-textmate`;
const onigurumaModuleLocation = `${nodeModulesPath}/vscode-oniguruma`;
const onigurumaModuleLocationAsar = `${nodeModulesAsarPath}/vscode-oniguruma`;
class TextMateWorkerModel extends MirrorTextModel {
    _tokenizationStateStore;
    _worker;
    _languageId;
    _encodedLanguageId;
    _isDisposed;
    constructor(uri, lines, eol, versionId, worker, languageId, encodedLanguageId) {
        super(uri, lines, eol, versionId);
        this._tokenizationStateStore = null;
        this._worker = worker;
        this._languageId = languageId;
        this._encodedLanguageId = encodedLanguageId;
        this._isDisposed = false;
        this._resetTokenization();
    }
    dispose() {
        this._isDisposed = true;
        super.dispose();
    }
    onLanguageId(languageId, encodedLanguageId) {
        this._languageId = languageId;
        this._encodedLanguageId = encodedLanguageId;
        this._resetTokenization();
    }
    onEvents(e) {
        super.onEvents(e);
        if (this._tokenizationStateStore) {
            for (let i = 0; i < e.changes.length; i++) {
                const change = e.changes[i];
                const [eolCount] = countEOL(change.text);
                this._tokenizationStateStore.applyEdits(change.range, eolCount);
            }
        }
        this._ensureTokens();
    }
    _resetTokenization() {
        this._tokenizationStateStore = null;
        const languageId = this._languageId;
        const encodedLanguageId = this._encodedLanguageId;
        this._worker.getOrCreateGrammar(languageId, encodedLanguageId).then((r) => {
            if (this._isDisposed || languageId !== this._languageId || encodedLanguageId !== this._encodedLanguageId || !r) {
                return;
            }
            if (r.grammar) {
                const tokenizationSupport = new TMTokenization(r.grammar, r.initialState, false);
                this._tokenizationStateStore = new TokenizationStateStore(tokenizationSupport, tokenizationSupport.getInitialState());
            }
            else {
                this._tokenizationStateStore = null;
            }
            this._ensureTokens();
        });
    }
    _ensureTokens() {
        if (!this._tokenizationStateStore) {
            return;
        }
        const builder = new ContiguousMultilineTokensBuilder();
        const lineCount = this._lines.length;
        // Validate all states up to and including endLineIndex
        for (let lineIndex = this._tokenizationStateStore.invalidLineStartIndex; lineIndex < lineCount; lineIndex++) {
            const text = this._lines[lineIndex];
            const lineStartState = this._tokenizationStateStore.getBeginState(lineIndex);
            const r = this._tokenizationStateStore.tokenizationSupport.tokenizeEncoded(text, true, lineStartState);
            LineTokens.convertToEndOffset(r.tokens, text.length);
            builder.add(lineIndex + 1, r.tokens);
            this._tokenizationStateStore.setEndState(lineCount, lineIndex, r.endState);
            lineIndex = this._tokenizationStateStore.invalidLineStartIndex - 1; // -1 because the outer loop increments it
        }
        this._worker._setTokens(this._uri, this._versionId, builder.serialize());
    }
}
export class TextMateWorker {
    _host;
    _models;
    _grammarCache;
    _grammarFactory;
    constructor(ctx, createData) {
        this._host = ctx.host;
        this._models = Object.create(null);
        this._grammarCache = [];
        const grammarDefinitions = createData.grammarDefinitions.map((def) => {
            return {
                location: URI.revive(def.location),
                language: def.language,
                scopeName: def.scopeName,
                embeddedLanguages: def.embeddedLanguages,
                tokenTypes: def.tokenTypes,
                injectTo: def.injectTo,
                balancedBracketSelectors: def.balancedBracketSelectors,
                unbalancedBracketSelectors: def.unbalancedBracketSelectors,
            };
        });
        this._grammarFactory = this._loadTMGrammarFactory(grammarDefinitions);
    }
    async _loadTMGrammarFactory(grammarDefinitions) {
        // TODO: asar support
        const useAsar = false; // this._environmentService.isBuilt && !isWeb
        const textmateLocation = useAsar ? textmateModuleLocation : textmateModuleLocationAsar;
        const onigurumaLocation = useAsar ? onigurumaModuleLocation : onigurumaModuleLocationAsar;
        const textmateMain = `${textmateLocation}/release/main.js`;
        const onigurumaMain = `${onigurumaLocation}/release/main.js`;
        const onigurumaWASM = `${onigurumaLocation}/release/onig.wasm`;
        const vscodeTextmate = await import(FileAccess.asBrowserUri(textmateMain).toString(true));
        const vscodeOniguruma = await import(FileAccess.asBrowserUri(onigurumaMain).toString(true));
        const response = await fetch(FileAccess.asBrowserUri(onigurumaWASM).toString(true));
        // Using the response directly only works if the server sets the MIME type 'application/wasm'.
        // Otherwise, a TypeError is thrown when using the streaming compiler.
        // We therefore use the non-streaming compiler :(.
        const bytes = await response.arrayBuffer();
        await vscodeOniguruma.loadWASM(bytes);
        const onigLib = Promise.resolve({
            createOnigScanner: (sources) => vscodeOniguruma.createOnigScanner(sources),
            createOnigString: (str) => vscodeOniguruma.createOnigString(str)
        });
        return new TMGrammarFactory({
            logTrace: (msg) => { },
            logError: (msg, err) => console.error(msg, err),
            readFile: (resource) => this._host.readFile(resource)
        }, grammarDefinitions, vscodeTextmate, onigLib);
    }
    acceptNewModel(data) {
        const uri = URI.revive(data.uri);
        const key = uri.toString();
        this._models[key] = new TextMateWorkerModel(uri, data.lines, data.EOL, data.versionId, this, data.languageId, data.encodedLanguageId);
    }
    acceptModelChanged(strURL, e) {
        this._models[strURL].onEvents(e);
    }
    acceptModelLanguageChanged(strURL, newLanguageId, newEncodedLanguageId) {
        this._models[strURL].onLanguageId(newLanguageId, newEncodedLanguageId);
    }
    acceptRemovedModel(strURL) {
        if (this._models[strURL]) {
            this._models[strURL].dispose();
            delete this._models[strURL];
        }
    }
    async getOrCreateGrammar(languageId, encodedLanguageId) {
        const grammarFactory = await this._grammarFactory;
        if (!grammarFactory) {
            return Promise.resolve(null);
        }
        if (!this._grammarCache[encodedLanguageId]) {
            this._grammarCache[encodedLanguageId] = grammarFactory.createGrammar(languageId, encodedLanguageId);
        }
        return this._grammarCache[encodedLanguageId];
    }
    async acceptTheme(theme, colorMap) {
        const grammarFactory = await this._grammarFactory;
        grammarFactory?.setTheme(theme, colorMap);
    }
    _setTokens(resource, versionId, tokens) {
        this._host.setTokens(resource, versionId, tokens);
    }
}
export function create(ctx, createData) {
    return new TextMateWorker(ctx, createData);
}
