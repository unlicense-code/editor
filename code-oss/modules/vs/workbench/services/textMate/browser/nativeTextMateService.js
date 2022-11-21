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
import { ITextMateService } from 'vs/workbench/services/textMate/browser/textMate';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { AbstractTextMateService } from 'vs/workbench/services/textMate/browser/abstractTextMateService';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IWorkbenchThemeService } from 'vs/workbench/services/themes/common/workbenchThemeService';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ILogService } from 'vs/platform/log/common/log';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { createWebWorker } from 'vs/editor/browser/services/webWorker';
import { IModelService } from 'vs/editor/common/services/model';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { ContiguousMultilineTokensBuilder } from 'vs/editor/common/tokens/contiguousMultilineTokensBuilder';
import { IExtensionResourceLoaderService } from 'vs/platform/extensionResourceLoader/common/extensionResourceLoader';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { FileAccess, nodeModulesAsarUnpackedPath, nodeModulesPath } from 'vs/base/common/network';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
const RUN_TEXTMATE_IN_WORKER = false;
class ModelWorkerTextMateTokenizer extends Disposable {
    _worker;
    _languageIdCodec;
    _model;
    _isSynced;
    _pendingChanges = [];
    constructor(worker, languageIdCodec, model) {
        super();
        this._worker = worker;
        this._languageIdCodec = languageIdCodec;
        this._model = model;
        this._isSynced = false;
        this._register(this._model.onDidChangeAttached(() => this._onDidChangeAttached()));
        this._onDidChangeAttached();
        this._register(this._model.onDidChangeContent((e) => {
            if (this._isSynced) {
                this._worker.acceptModelChanged(this._model.uri.toString(), e);
                this._pendingChanges.push(e);
            }
        }));
        this._register(this._model.onDidChangeLanguage((e) => {
            if (this._isSynced) {
                const languageId = this._model.getLanguageId();
                const encodedLanguageId = this._languageIdCodec.encodeLanguageId(languageId);
                this._worker.acceptModelLanguageChanged(this._model.uri.toString(), languageId, encodedLanguageId);
            }
        }));
    }
    _onDidChangeAttached() {
        if (this._model.isAttachedToEditor()) {
            if (!this._isSynced) {
                this._beginSync();
            }
        }
        else {
            if (this._isSynced) {
                this._endSync();
            }
        }
    }
    _beginSync() {
        this._isSynced = true;
        const languageId = this._model.getLanguageId();
        const encodedLanguageId = this._languageIdCodec.encodeLanguageId(languageId);
        this._worker.acceptNewModel({
            uri: this._model.uri,
            versionId: this._model.getVersionId(),
            lines: this._model.getLinesContent(),
            EOL: this._model.getEOL(),
            languageId,
            encodedLanguageId
        });
    }
    _endSync() {
        this._isSynced = false;
        this._worker.acceptRemovedModel(this._model.uri.toString());
    }
    dispose() {
        super.dispose();
        this._endSync();
    }
    _confirm(versionId) {
        while (this._pendingChanges.length > 0 && this._pendingChanges[0].versionId <= versionId) {
            this._pendingChanges.shift();
        }
    }
    setTokens(versionId, rawTokens) {
        this._confirm(versionId);
        const tokens = ContiguousMultilineTokensBuilder.deserialize(new Uint8Array(rawTokens));
        for (let i = 0; i < this._pendingChanges.length; i++) {
            const change = this._pendingChanges[i];
            for (let j = 0; j < tokens.length; j++) {
                for (let k = 0; k < change.changes.length; k++) {
                    tokens[j].applyEdit(change.changes[k].range, change.changes[k].text);
                }
            }
        }
        this._model.tokenization.setTokens(tokens);
    }
}
let TextMateWorkerHost = class TextMateWorkerHost {
    textMateService;
    _extensionResourceLoaderService;
    constructor(textMateService, _extensionResourceLoaderService) {
        this.textMateService = textMateService;
        this._extensionResourceLoaderService = _extensionResourceLoaderService;
    }
    async readFile(_resource) {
        const resource = URI.revive(_resource);
        return this._extensionResourceLoaderService.readExtensionResource(resource);
    }
    async setTokens(_resource, versionId, tokens) {
        const resource = URI.revive(_resource);
        this.textMateService.setTokens(resource, versionId, tokens);
    }
};
TextMateWorkerHost = __decorate([
    __param(1, IExtensionResourceLoaderService)
], TextMateWorkerHost);
export { TextMateWorkerHost };
let TextMateService = class TextMateService extends AbstractTextMateService {
    _modelService;
    _environmentService;
    _languageConfigurationService;
    _worker;
    _workerProxy;
    _tokenizers;
    constructor(languageService, themeService, extensionResourceLoaderService, notificationService, logService, configurationService, progressService, _modelService, _environmentService, _languageConfigurationService) {
        super(languageService, themeService, extensionResourceLoaderService, notificationService, logService, configurationService, progressService);
        this._modelService = _modelService;
        this._environmentService = _environmentService;
        this._languageConfigurationService = _languageConfigurationService;
        this._worker = null;
        this._workerProxy = null;
        this._tokenizers = Object.create(null);
        this._register(this._modelService.onModelAdded(model => this._onModelAdded(model)));
        this._register(this._modelService.onModelRemoved(model => this._onModelRemoved(model)));
        this._modelService.getModels().forEach((model) => this._onModelAdded(model));
    }
    _onModelAdded(model) {
        if (!this._workerProxy) {
            return;
        }
        if (model.isTooLargeForSyncing()) {
            return;
        }
        const key = model.uri.toString();
        const tokenizer = new ModelWorkerTextMateTokenizer(this._workerProxy, this._languageService.languageIdCodec, model);
        this._tokenizers[key] = tokenizer;
    }
    _onModelRemoved(model) {
        const key = model.uri.toString();
        if (this._tokenizers[key]) {
            this._tokenizers[key].dispose();
            delete this._tokenizers[key];
        }
    }
    async _loadVSCodeOnigurumWASM() {
        const response = await fetch(this._environmentService.isBuilt
            ? FileAccess.asBrowserUri(`${nodeModulesAsarUnpackedPath}/vscode-oniguruma/release/onig.wasm`).toString(true)
            : FileAccess.asBrowserUri(`${nodeModulesPath}/vscode-oniguruma/release/onig.wasm`).toString(true));
        return response;
    }
    _onDidCreateGrammarFactory(grammarDefinitions) {
        this._killWorker();
        if (RUN_TEXTMATE_IN_WORKER) {
            const workerHost = new TextMateWorkerHost(this, this._extensionResourceLoaderService);
            const createData = { grammarDefinitions };
            const worker = createWebWorker(this._modelService, this._languageConfigurationService, {
                createData,
                label: 'textMateWorker',
                moduleId: 'vs/workbench/services/textMate/browser/textMateWorker',
                host: workerHost
            });
            this._worker = worker;
            worker.getProxy().then((proxy) => {
                if (this._worker !== worker) {
                    // disposed in the meantime
                    return;
                }
                this._workerProxy = proxy;
                if (this._currentTheme && this._currentTokenColorMap) {
                    this._workerProxy.acceptTheme(this._currentTheme, this._currentTokenColorMap);
                }
                this._modelService.getModels().forEach((model) => this._onModelAdded(model));
            });
        }
    }
    _doUpdateTheme(grammarFactory, theme, colorMap) {
        super._doUpdateTheme(grammarFactory, theme, colorMap);
        if (this._currentTheme && this._currentTokenColorMap && this._workerProxy) {
            this._workerProxy.acceptTheme(this._currentTheme, this._currentTokenColorMap);
        }
    }
    _onDidDisposeGrammarFactory() {
        this._killWorker();
    }
    _killWorker() {
        for (const key of Object.keys(this._tokenizers)) {
            this._tokenizers[key].dispose();
        }
        this._tokenizers = Object.create(null);
        if (this._worker) {
            this._worker.dispose();
            this._worker = null;
        }
        this._workerProxy = null;
    }
    setTokens(resource, versionId, tokens) {
        const key = resource.toString();
        if (!this._tokenizers[key]) {
            return;
        }
        this._tokenizers[key].setTokens(versionId, tokens);
    }
};
TextMateService = __decorate([
    __param(0, ILanguageService),
    __param(1, IWorkbenchThemeService),
    __param(2, IExtensionResourceLoaderService),
    __param(3, INotificationService),
    __param(4, ILogService),
    __param(5, IConfigurationService),
    __param(6, IProgressService),
    __param(7, IModelService),
    __param(8, IWorkbenchEnvironmentService),
    __param(9, ILanguageConfigurationService)
], TextMateService);
export { TextMateService };
registerSingleton(ITextMateService, TextMateService, 0 /* InstantiationType.Eager */);
