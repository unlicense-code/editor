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
import { Disposable } from 'vs/base/common/lifecycle';
import { ILanguageDetectionService, LanguageDetectionStatsId } from 'vs/workbench/services/languageDetection/common/languageDetectionWorkerService';
import { FileAccess, nodeModulesAsarPath, nodeModulesPath, Schemas } from 'vs/base/common/network';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { URI } from 'vs/base/common/uri';
import { isWeb } from 'vs/base/common/platform';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IModelService } from 'vs/editor/common/services/model';
import { SimpleWorkerClient } from 'vs/base/common/worker/simpleWorker';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { EditorWorkerClient, EditorWorkerHost } from 'vs/editor/browser/services/editorWorkerService';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { IDiagnosticsService } from 'vs/platform/diagnostics/common/diagnostics';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { LRUCache } from 'vs/base/common/map';
import { ILogService } from 'vs/platform/log/common/log';
const TOP_LANG_COUNTS = 12;
const regexpModuleLocation = `${nodeModulesPath}/vscode-regexp-languagedetection`;
const regexpModuleLocationAsar = `${nodeModulesAsarPath}/vscode-regexp-languagedetection`;
const moduleLocation = `${nodeModulesPath}/@vscode/vscode-languagedetection`;
const moduleLocationAsar = `${nodeModulesAsarPath}/@vscode/vscode-languagedetection`;
let LanguageDetectionService = class LanguageDetectionService extends Disposable {
    _environmentService;
    _configurationService;
    _diagnosticsService;
    _workspaceContextService;
    _editorService;
    _logService;
    static enablementSettingKey = 'workbench.editor.languageDetection';
    static historyBasedEnablementConfig = 'workbench.editor.historyBasedLanguageDetection';
    static preferHistoryConfig = 'workbench.editor.preferHistoryBasedLanguageDetection';
    static workspaceOpenedLanguagesStorageKey = 'workbench.editor.languageDetectionOpenedLanguages.workspace';
    static globalOpenedLanguagesStorageKey = 'workbench.editor.languageDetectionOpenedLanguages.global';
    _serviceBrand;
    _languageDetectionWorkerClient;
    hasResolvedWorkspaceLanguageIds = false;
    workspaceLanguageIds = new Set();
    sessionOpenedLanguageIds = new Set();
    historicalGlobalOpenedLanguageIds = new LRUCache(TOP_LANG_COUNTS);
    historicalWorkspaceOpenedLanguageIds = new LRUCache(TOP_LANG_COUNTS);
    dirtyBiases = true;
    langBiases = {};
    constructor(_environmentService, languageService, _configurationService, _diagnosticsService, _workspaceContextService, modelService, _editorService, telemetryService, storageService, _logService, languageConfigurationService) {
        super();
        this._environmentService = _environmentService;
        this._configurationService = _configurationService;
        this._diagnosticsService = _diagnosticsService;
        this._workspaceContextService = _workspaceContextService;
        this._editorService = _editorService;
        this._logService = _logService;
        this._languageDetectionWorkerClient = new LanguageDetectionWorkerClient(modelService, languageService, telemetryService, 
        // TODO: See if it's possible to bundle vscode-languagedetection
        this._environmentService.isBuilt && !isWeb
            ? FileAccess.asBrowserUri(`${moduleLocationAsar}/dist/lib/index.js`).toString(true)
            : FileAccess.asBrowserUri(`${moduleLocation}/dist/lib/index.js`).toString(true), this._environmentService.isBuilt && !isWeb
            ? FileAccess.asBrowserUri(`${moduleLocationAsar}/model/model.json`).toString(true)
            : FileAccess.asBrowserUri(`${moduleLocation}/model/model.json`).toString(true), this._environmentService.isBuilt && !isWeb
            ? FileAccess.asBrowserUri(`${moduleLocationAsar}/model/group1-shard1of1.bin`).toString(true)
            : FileAccess.asBrowserUri(`${moduleLocation}/model/group1-shard1of1.bin`).toString(true), this._environmentService.isBuilt && !isWeb
            ? FileAccess.asBrowserUri(`${regexpModuleLocationAsar}/dist/index.js`).toString(true)
            : FileAccess.asBrowserUri(`${regexpModuleLocation}/dist/index.js`).toString(true), languageConfigurationService);
        this.initEditorOpenedListeners(storageService);
    }
    async resolveWorkspaceLanguageIds() {
        if (this.hasResolvedWorkspaceLanguageIds) {
            return;
        }
        this.hasResolvedWorkspaceLanguageIds = true;
        const fileExtensions = await this._diagnosticsService.getWorkspaceFileExtensions(this._workspaceContextService.getWorkspace());
        let count = 0;
        for (const ext of fileExtensions.extensions) {
            const langId = this._languageDetectionWorkerClient.getLanguageId(ext);
            if (langId && count < TOP_LANG_COUNTS) {
                this.workspaceLanguageIds.add(langId);
                count++;
                if (count > TOP_LANG_COUNTS) {
                    break;
                }
            }
        }
        this.dirtyBiases = true;
    }
    isEnabledForLanguage(languageId) {
        return !!languageId && this._configurationService.getValue(LanguageDetectionService.enablementSettingKey, { overrideIdentifier: languageId });
    }
    getLanguageBiases() {
        if (!this.dirtyBiases) {
            return this.langBiases;
        }
        const biases = {};
        // Give different weight to the biases depending on relevance of source
        this.sessionOpenedLanguageIds.forEach(lang => biases[lang] = (biases[lang] ?? 0) + 7);
        this.workspaceLanguageIds.forEach(lang => biases[lang] = (biases[lang] ?? 0) + 5);
        [...this.historicalWorkspaceOpenedLanguageIds.keys()].forEach(lang => biases[lang] = (biases[lang] ?? 0) + 3);
        [...this.historicalGlobalOpenedLanguageIds.keys()].forEach(lang => biases[lang] = (biases[lang] ?? 0) + 1);
        this._logService.trace('Session Languages:', JSON.stringify([...this.sessionOpenedLanguageIds]));
        this._logService.trace('Workspace Languages:', JSON.stringify([...this.workspaceLanguageIds]));
        this._logService.trace('Historical Workspace Opened Languages:', JSON.stringify([...this.historicalWorkspaceOpenedLanguageIds.keys()]));
        this._logService.trace('Historical Globally Opened Languages:', JSON.stringify([...this.historicalGlobalOpenedLanguageIds.keys()]));
        this._logService.trace('Computed Language Detection Biases:', JSON.stringify(biases));
        this.dirtyBiases = false;
        this.langBiases = biases;
        return biases;
    }
    async detectLanguage(resource, supportedLangs) {
        const useHistory = this._configurationService.getValue(LanguageDetectionService.historyBasedEnablementConfig);
        const preferHistory = this._configurationService.getValue(LanguageDetectionService.preferHistoryConfig);
        if (useHistory) {
            await this.resolveWorkspaceLanguageIds();
        }
        const biases = useHistory ? this.getLanguageBiases() : undefined;
        return this._languageDetectionWorkerClient.detectLanguage(resource, biases, preferHistory, supportedLangs);
    }
    // TODO: explore using the history service or something similar to provide this list of opened editors
    // so this service can support delayed instantiation. This may be tricky since it seems the IHistoryService
    // only gives history for a workspace... where this takes advantage of history at a global level as well.
    initEditorOpenedListeners(storageService) {
        try {
            const globalLangHistroyData = JSON.parse(storageService.get(LanguageDetectionService.globalOpenedLanguagesStorageKey, 0 /* StorageScope.PROFILE */, '[]'));
            this.historicalGlobalOpenedLanguageIds.fromJSON(globalLangHistroyData);
        }
        catch (e) {
            console.error(e);
        }
        try {
            const workspaceLangHistroyData = JSON.parse(storageService.get(LanguageDetectionService.workspaceOpenedLanguagesStorageKey, 1 /* StorageScope.WORKSPACE */, '[]'));
            this.historicalWorkspaceOpenedLanguageIds.fromJSON(workspaceLangHistroyData);
        }
        catch (e) {
            console.error(e);
        }
        this._register(this._editorService.onDidActiveEditorChange(() => {
            const activeLanguage = this._editorService.activeTextEditorLanguageId;
            if (activeLanguage && this._editorService.activeEditor?.resource?.scheme !== Schemas.untitled) {
                this.sessionOpenedLanguageIds.add(activeLanguage);
                this.historicalGlobalOpenedLanguageIds.set(activeLanguage, true);
                this.historicalWorkspaceOpenedLanguageIds.set(activeLanguage, true);
                storageService.store(LanguageDetectionService.globalOpenedLanguagesStorageKey, JSON.stringify(this.historicalGlobalOpenedLanguageIds.toJSON()), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
                storageService.store(LanguageDetectionService.workspaceOpenedLanguagesStorageKey, JSON.stringify(this.historicalWorkspaceOpenedLanguageIds.toJSON()), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                this.dirtyBiases = true;
            }
        }));
    }
};
LanguageDetectionService = __decorate([
    __param(0, IWorkbenchEnvironmentService),
    __param(1, ILanguageService),
    __param(2, IConfigurationService),
    __param(3, IDiagnosticsService),
    __param(4, IWorkspaceContextService),
    __param(5, IModelService),
    __param(6, IEditorService),
    __param(7, ITelemetryService),
    __param(8, IStorageService),
    __param(9, ILogService),
    __param(10, ILanguageConfigurationService)
], LanguageDetectionService);
export { LanguageDetectionService };
export class LanguageDetectionWorkerHost {
    _indexJsUri;
    _modelJsonUri;
    _weightsUri;
    _telemetryService;
    constructor(_indexJsUri, _modelJsonUri, _weightsUri, _telemetryService) {
        this._indexJsUri = _indexJsUri;
        this._modelJsonUri = _modelJsonUri;
        this._weightsUri = _weightsUri;
        this._telemetryService = _telemetryService;
    }
    async getIndexJsUri() {
        return this._indexJsUri;
    }
    async getModelJsonUri() {
        return this._modelJsonUri;
    }
    async getWeightsUri() {
        return this._weightsUri;
    }
    async sendTelemetryEvent(languages, confidences, timeSpent) {
        this._telemetryService.publicLog2('automaticlanguagedetection.stats', {
            languages: languages.join(','),
            confidences: confidences.join(','),
            timeSpent
        });
    }
}
export class LanguageDetectionWorkerClient extends EditorWorkerClient {
    _languageService;
    _telemetryService;
    _indexJsUri;
    _modelJsonUri;
    _weightsUri;
    _regexpModelUri;
    workerPromise;
    constructor(modelService, _languageService, _telemetryService, _indexJsUri, _modelJsonUri, _weightsUri, _regexpModelUri, languageConfigurationService) {
        super(modelService, true, 'languageDetectionWorkerService', languageConfigurationService);
        this._languageService = _languageService;
        this._telemetryService = _telemetryService;
        this._indexJsUri = _indexJsUri;
        this._modelJsonUri = _modelJsonUri;
        this._weightsUri = _weightsUri;
        this._regexpModelUri = _regexpModelUri;
    }
    _getOrCreateLanguageDetectionWorker() {
        if (this.workerPromise) {
            return this.workerPromise;
        }
        this.workerPromise = new Promise((resolve, reject) => {
            resolve(this._register(new SimpleWorkerClient(this._workerFactory, 'vs/workbench/services/languageDetection/browser/languageDetectionSimpleWorker', new EditorWorkerHost(this))));
        });
        return this.workerPromise;
    }
    _guessLanguageIdByUri(uri) {
        const guess = this._languageService.guessLanguageIdByFilepathOrFirstLine(uri);
        if (guess && guess !== 'unknown') {
            return guess;
        }
        return undefined;
    }
    async _getProxy() {
        return (await this._getOrCreateLanguageDetectionWorker()).getProxyObject();
    }
    // foreign host request
    async fhr(method, args) {
        switch (method) {
            case 'getIndexJsUri':
                return this.getIndexJsUri();
            case 'getModelJsonUri':
                return this.getModelJsonUri();
            case 'getWeightsUri':
                return this.getWeightsUri();
            case 'getRegexpModelUri':
                return this.getRegexpModelUri();
            case 'getLanguageId':
                return this.getLanguageId(args[0]);
            case 'sendTelemetryEvent':
                return this.sendTelemetryEvent(args[0], args[1], args[2]);
            default:
                return super.fhr(method, args);
        }
    }
    async getIndexJsUri() {
        return this._indexJsUri;
    }
    getLanguageId(languageIdOrExt) {
        if (!languageIdOrExt) {
            return undefined;
        }
        if (this._languageService.isRegisteredLanguageId(languageIdOrExt)) {
            return languageIdOrExt;
        }
        const guessed = this._guessLanguageIdByUri(URI.file(`file.${languageIdOrExt}`));
        if (!guessed || guessed === 'unknown') {
            return undefined;
        }
        return guessed;
    }
    async getModelJsonUri() {
        return this._modelJsonUri;
    }
    async getWeightsUri() {
        return this._weightsUri;
    }
    async getRegexpModelUri() {
        return this._regexpModelUri;
    }
    async sendTelemetryEvent(languages, confidences, timeSpent) {
        this._telemetryService.publicLog2(LanguageDetectionStatsId, {
            languages: languages.join(','),
            confidences: confidences.join(','),
            timeSpent
        });
    }
    async detectLanguage(resource, langBiases, preferHistory, supportedLangs) {
        const startTime = Date.now();
        const quickGuess = this._guessLanguageIdByUri(resource);
        if (quickGuess) {
            return quickGuess;
        }
        await this._withSyncedResources([resource]);
        const modelId = await (await this._getProxy()).detectLanguage(resource.toString(), langBiases, preferHistory, supportedLangs);
        const langaugeId = this.getLanguageId(modelId);
        const LanguageDetectionStatsId = 'automaticlanguagedetection.perf';
        this._telemetryService.publicLog2(LanguageDetectionStatsId, {
            timeSpent: Date.now() - startTime,
            detection: langaugeId || 'unknown',
        });
        return langaugeId;
    }
}
// For now we use Eager until we handle keeping track of history better.
registerSingleton(ILanguageDetectionService, LanguageDetectionService, 0 /* InstantiationType.Eager */);
