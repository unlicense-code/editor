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
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { ExtensionRecommendations } from 'vs/workbench/contrib/extensions/browser/extensionRecommendations';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { IExtensionManagementServerService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IExtensionIgnoredRecommendationsService } from 'vs/workbench/services/extensionRecommendations/common/extensionRecommendations';
import { IExtensionsWorkbenchService, VIEWLET_ID as EXTENSIONS_VIEWLET_ID } from 'vs/workbench/contrib/extensions/common/extensions';
import { CancellationToken } from 'vs/base/common/cancellation';
import { localize } from 'vs/nls';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IProductService } from 'vs/platform/product/common/productService';
import { Schemas } from 'vs/base/common/network';
import { basename, extname } from 'vs/base/common/resources';
import { match } from 'vs/base/common/glob';
import { Mimes } from 'vs/base/common/mime';
import { getMimeTypes } from 'vs/editor/common/services/languagesAssociations';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IExtensionRecommendationNotificationService } from 'vs/platform/extensionRecommendations/common/extensionRecommendations';
import { IWorkbenchAssignmentService } from 'vs/workbench/services/assignment/common/assignmentService';
import { distinct } from 'vs/base/common/arrays';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { CellUri } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { disposableTimeout } from 'vs/base/common/async';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { areSameExtensions } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
const promptedRecommendationsStorageKey = 'fileBasedRecommendations/promptedRecommendations';
const promptedFileExtensionsStorageKey = 'fileBasedRecommendations/promptedFileExtensions';
const recommendationsStorageKey = 'extensionsAssistant/recommendations';
const searchMarketplace = localize('searchMarketplace', "Search Marketplace");
const milliSecondsInADay = 1000 * 60 * 60 * 24;
let FileBasedRecommendations = class FileBasedRecommendations extends ExtensionRecommendations {
    extensionsWorkbenchService;
    extensionService;
    paneCompositeService;
    modelService;
    languageService;
    notificationService;
    telemetryService;
    storageService;
    extensionRecommendationNotificationService;
    extensionIgnoredRecommendationsService;
    tasExperimentService;
    workspaceContextService;
    extensionManagementServerService;
    extensionTips = new Map();
    importantExtensionTips = new Map();
    fileBasedRecommendationsByPattern = new Map();
    fileBasedRecommendationsByLanguage = new Map();
    fileBasedRecommendations = new Map();
    processedFileExtensions = [];
    processedLanguages = [];
    get recommendations() {
        const recommendations = [];
        [...this.fileBasedRecommendations.keys()]
            .sort((a, b) => {
            if (this.fileBasedRecommendations.get(a).recommendedTime === this.fileBasedRecommendations.get(b).recommendedTime) {
                if (this.importantExtensionTips.has(a)) {
                    return -1;
                }
                if (this.importantExtensionTips.has(b)) {
                    return 1;
                }
            }
            return this.fileBasedRecommendations.get(a).recommendedTime > this.fileBasedRecommendations.get(b).recommendedTime ? -1 : 1;
        })
            .forEach(extensionId => {
            recommendations.push({
                extensionId,
                reason: {
                    reasonId: 1 /* ExtensionRecommendationReason.File */,
                    reasonText: localize('fileBasedRecommendation', "This extension is recommended based on the files you recently opened.")
                }
            });
        });
        return recommendations;
    }
    get importantRecommendations() {
        return this.recommendations.filter(e => this.importantExtensionTips.has(e.extensionId));
    }
    get otherRecommendations() {
        return this.recommendations.filter(e => !this.importantExtensionTips.has(e.extensionId));
    }
    constructor(extensionsWorkbenchService, extensionService, paneCompositeService, modelService, languageService, productService, notificationService, telemetryService, storageService, extensionRecommendationNotificationService, extensionIgnoredRecommendationsService, tasExperimentService, workspaceContextService, extensionManagementServerService) {
        super();
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.extensionService = extensionService;
        this.paneCompositeService = paneCompositeService;
        this.modelService = modelService;
        this.languageService = languageService;
        this.notificationService = notificationService;
        this.telemetryService = telemetryService;
        this.storageService = storageService;
        this.extensionRecommendationNotificationService = extensionRecommendationNotificationService;
        this.extensionIgnoredRecommendationsService = extensionIgnoredRecommendationsService;
        this.tasExperimentService = tasExperimentService;
        this.workspaceContextService = workspaceContextService;
        this.extensionManagementServerService = extensionManagementServerService;
        this.tasExperimentService = tasExperimentService;
        if (productService.extensionTips) {
            Object.entries(productService.extensionTips).forEach(([key, value]) => this.extensionTips.set(key.toLowerCase(), value));
        }
        if (productService.extensionImportantTips) {
            Object.entries(productService.extensionImportantTips).forEach(([key, value]) => this.importantExtensionTips.set(key.toLowerCase(), value));
        }
    }
    async doActivate() {
        await this.extensionService.whenInstalledExtensionsRegistered();
        const allRecommendations = [];
        // group extension recommendations by pattern, like {**/*.md} -> [ext.foo1, ext.bar2]
        for (const [extensionId, pattern] of this.extensionTips) {
            const ids = this.fileBasedRecommendationsByPattern.get(pattern) || [];
            ids.push(extensionId);
            this.fileBasedRecommendationsByPattern.set(pattern, ids);
            allRecommendations.push(extensionId);
        }
        for (const [extensionId, value] of this.importantExtensionTips) {
            if (value.pattern) {
                const ids = this.fileBasedRecommendationsByPattern.get(value.pattern) || [];
                ids.push(extensionId);
                this.fileBasedRecommendationsByPattern.set(value.pattern, ids);
            }
            if (value.languages) {
                for (const language of value.languages) {
                    const ids = this.fileBasedRecommendationsByLanguage.get(language) || [];
                    ids.push(extensionId);
                    this.fileBasedRecommendationsByLanguage.set(language, ids);
                }
            }
            allRecommendations.push(extensionId);
        }
        const cachedRecommendations = this.getCachedRecommendations();
        const now = Date.now();
        // Retire existing recommendations if they are older than a week or are not part of this.productService.extensionTips anymore
        Object.entries(cachedRecommendations).forEach(([key, value]) => {
            const diff = (now - value) / milliSecondsInADay;
            if (diff <= 7 && allRecommendations.indexOf(key) > -1) {
                this.fileBasedRecommendations.set(key.toLowerCase(), { recommendedTime: value });
            }
        });
        this._register(this.modelService.onModelAdded(model => this.onModelAdded(model)));
        this.modelService.getModels().forEach(model => this.onModelAdded(model));
    }
    onModelAdded(model) {
        const uri = model.uri.scheme === Schemas.vscodeNotebookCell ? CellUri.parse(model.uri)?.notebook : model.uri;
        if (!uri) {
            return;
        }
        const supportedSchemes = distinct([Schemas.untitled, Schemas.file, Schemas.vscodeRemote, ...this.workspaceContextService.getWorkspace().folders.map(folder => folder.uri.scheme)]);
        if (!uri || !supportedSchemes.includes(uri.scheme)) {
            return;
        }
        this.promptRecommendationsForModel(model);
        const disposables = new DisposableStore();
        disposables.add(model.onDidChangeLanguage(() => this.promptRecommendationsForModel(model)));
        disposables.add(model.onWillDispose(() => disposables.dispose()));
    }
    /**
     * Prompt the user to either install the recommended extension for the file type in the current editor model
     * or prompt to search the marketplace if it has extensions that can support the file type
     */
    promptRecommendationsForModel(model) {
        const uri = model.uri;
        const language = model.getLanguageId();
        const fileExtension = extname(uri).toLowerCase();
        if (this.processedLanguages.includes(language) && this.processedFileExtensions.includes(fileExtension)) {
            return;
        }
        this.processedLanguages.push(language);
        this.processedFileExtensions.push(fileExtension);
        // re-schedule this bit of the operation to be off the critical path - in case glob-match is slow
        this._register(disposableTimeout(() => this.promptRecommendations(uri, language, fileExtension), 0));
    }
    async promptRecommendations(uri, language, fileExtension) {
        const installed = await this.extensionsWorkbenchService.queryLocal();
        const importantRecommendations = (this.fileBasedRecommendationsByLanguage.get(language) || [])
            .filter(extensionId => {
            const importantTip = this.importantExtensionTips.get(extensionId);
            if (importantTip) {
                return !importantTip.whenNotInstalled || importantTip.whenNotInstalled.every(id => installed.every(local => !areSameExtensions(local.identifier, { id })));
            }
            return false;
        });
        const languageName = importantRecommendations.length ? this.languageService.getLanguageName(language) : null;
        const fileBasedRecommendations = [...importantRecommendations];
        for (let [pattern, extensionIds] of this.fileBasedRecommendationsByPattern) {
            extensionIds = extensionIds.filter(extensionId => !importantRecommendations.includes(extensionId));
            if (!extensionIds.length) {
                continue;
            }
            if (!match(pattern, uri.with({ fragment: '' }).toString())) {
                continue;
            }
            for (const extensionId of extensionIds) {
                fileBasedRecommendations.push(extensionId);
                const importantExtensionTip = this.importantExtensionTips.get(extensionId);
                if (importantExtensionTip && importantExtensionTip.pattern === pattern) {
                    importantRecommendations.push(extensionId);
                }
            }
        }
        // Update file based recommendations
        for (const recommendation of fileBasedRecommendations) {
            const filedBasedRecommendation = this.fileBasedRecommendations.get(recommendation) || { recommendedTime: Date.now(), sources: [] };
            filedBasedRecommendation.recommendedTime = Date.now();
            this.fileBasedRecommendations.set(recommendation, filedBasedRecommendation);
        }
        this.storeCachedRecommendations();
        if (this.extensionRecommendationNotificationService.hasToIgnoreRecommendationNotifications()) {
            return;
        }
        if (importantRecommendations.length &&
            await this.promptRecommendedExtensionForFileType(languageName || basename(uri), language, importantRecommendations, installed)) {
            return;
        }
        this.promptRecommendedExtensionForFileExtension(uri, fileExtension, installed);
    }
    async promptRecommendedExtensionForFileType(name, language, recommendations, installed) {
        recommendations = this.filterIgnoredOrNotAllowed(recommendations);
        if (recommendations.length === 0) {
            return false;
        }
        recommendations = this.filterInstalled(recommendations, installed);
        if (recommendations.length === 0) {
            return false;
        }
        const extensionId = recommendations[0];
        const entry = this.importantExtensionTips.get(extensionId);
        if (!entry) {
            return false;
        }
        const promptedRecommendations = this.getPromptedRecommendations();
        if (promptedRecommendations[language] && promptedRecommendations[language].includes(extensionId)) {
            return false;
        }
        const treatmentMessage = await this.tasExperimentService.getTreatment('languageRecommendationMessage');
        const message = treatmentMessage ? treatmentMessage.replace('{0}', name) : localize('reallyRecommended', "Do you want to install the recommended extensions for {0}?", name);
        this.extensionRecommendationNotificationService.promptImportantExtensionsInstallNotification([extensionId], message, `@id:${extensionId}`, 1 /* RecommendationSource.FILE */)
            .then(result => {
            if (result === "reacted" /* RecommendationsNotificationResult.Accepted */) {
                this.addToPromptedRecommendations(language, [extensionId]);
            }
        });
        return true;
    }
    getPromptedRecommendations() {
        return JSON.parse(this.storageService.get(promptedRecommendationsStorageKey, 0 /* StorageScope.PROFILE */, '{}'));
    }
    addToPromptedRecommendations(exeName, extensions) {
        const promptedRecommendations = this.getPromptedRecommendations();
        promptedRecommendations[exeName] = extensions;
        this.storageService.store(promptedRecommendationsStorageKey, JSON.stringify(promptedRecommendations), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
    }
    getPromptedFileExtensions() {
        return JSON.parse(this.storageService.get(promptedFileExtensionsStorageKey, 0 /* StorageScope.PROFILE */, '[]'));
    }
    addToPromptedFileExtensions(fileExtension) {
        const promptedFileExtensions = this.getPromptedFileExtensions();
        promptedFileExtensions.push(fileExtension);
        this.storageService.store(promptedFileExtensionsStorageKey, JSON.stringify(distinct(promptedFileExtensions)), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
    }
    async promptRecommendedExtensionForFileExtension(uri, fileExtension, installed) {
        // Do not prompt when there is no local and remote extension management servers
        if (!this.extensionManagementServerService.localExtensionManagementServer && !this.extensionManagementServerService.remoteExtensionManagementServer) {
            return;
        }
        fileExtension = fileExtension.substring(1); // Strip the dot
        if (!fileExtension) {
            return;
        }
        const mimeTypes = getMimeTypes(uri);
        if (mimeTypes.length !== 1 || mimeTypes[0] !== Mimes.unknown) {
            return;
        }
        const fileExtensionSuggestionIgnoreList = JSON.parse(this.storageService.get('extensionsAssistant/fileExtensionsSuggestionIgnore', 0 /* StorageScope.PROFILE */, '[]'));
        if (fileExtensionSuggestionIgnoreList.indexOf(fileExtension) > -1) {
            return;
        }
        const promptedFileExtensions = this.getPromptedFileExtensions();
        if (promptedFileExtensions.includes(fileExtension)) {
            return;
        }
        const text = `ext:${fileExtension}`;
        const pager = await this.extensionsWorkbenchService.queryGallery({ text, pageSize: 100 }, CancellationToken.None);
        if (pager.firstPage.length === 0) {
            return;
        }
        const installedExtensionsIds = installed.reduce((result, i) => { result.add(i.identifier.id.toLowerCase()); return result; }, new Set());
        if (pager.firstPage.some(e => installedExtensionsIds.has(e.identifier.id.toLowerCase()))) {
            return;
        }
        this.notificationService.prompt(Severity.Info, localize('showLanguageExtensions', "The Marketplace has extensions that can help with '.{0}' files", fileExtension), [{
                label: searchMarketplace,
                run: () => {
                    this.addToPromptedFileExtensions(fileExtension);
                    this.telemetryService.publicLog2('fileExtensionSuggestion:popup', { userReaction: 'ok', fileExtension });
                    this.paneCompositeService.openPaneComposite(EXTENSIONS_VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true)
                        .then(viewlet => viewlet?.getViewPaneContainer())
                        .then(viewlet => {
                        viewlet.search(`ext:${fileExtension}`);
                        viewlet.focus();
                    });
                }
            }, {
                label: localize('dontShowAgainExtension', "Don't Show Again for '.{0}' files", fileExtension),
                run: () => {
                    fileExtensionSuggestionIgnoreList.push(fileExtension);
                    this.storageService.store('extensionsAssistant/fileExtensionsSuggestionIgnore', JSON.stringify(fileExtensionSuggestionIgnoreList), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                    this.telemetryService.publicLog2('fileExtensionSuggestion:popup', { userReaction: 'neverShowAgain', fileExtension });
                }
            }], {
            sticky: true,
            onCancel: () => {
                this.telemetryService.publicLog2('fileExtensionSuggestion:popup', { userReaction: 'cancelled', fileExtension });
            }
        });
    }
    filterIgnoredOrNotAllowed(recommendationsToSuggest) {
        const ignoredRecommendations = [...this.extensionIgnoredRecommendationsService.ignoredRecommendations, ...this.extensionRecommendationNotificationService.ignoredRecommendations];
        return recommendationsToSuggest.filter(id => !ignoredRecommendations.includes(id));
    }
    filterInstalled(recommendationsToSuggest, installed) {
        const installedExtensionsIds = installed.reduce((result, i) => {
            if (i.enablementState !== 1 /* EnablementState.DisabledByExtensionKind */) {
                result.add(i.identifier.id.toLowerCase());
            }
            return result;
        }, new Set());
        return recommendationsToSuggest.filter(id => !installedExtensionsIds.has(id.toLowerCase()));
    }
    getCachedRecommendations() {
        let storedRecommendations = JSON.parse(this.storageService.get(recommendationsStorageKey, 0 /* StorageScope.PROFILE */, '[]'));
        if (Array.isArray(storedRecommendations)) {
            storedRecommendations = storedRecommendations.reduce((result, id) => { result[id] = Date.now(); return result; }, {});
        }
        const result = {};
        Object.entries(storedRecommendations).forEach(([key, value]) => {
            if (typeof value === 'number') {
                result[key.toLowerCase()] = value;
            }
        });
        return result;
    }
    storeCachedRecommendations() {
        const storedRecommendations = {};
        this.fileBasedRecommendations.forEach((value, key) => storedRecommendations[key] = value.recommendedTime);
        this.storageService.store(recommendationsStorageKey, JSON.stringify(storedRecommendations), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
    }
};
FileBasedRecommendations = __decorate([
    __param(0, IExtensionsWorkbenchService),
    __param(1, IExtensionService),
    __param(2, IPaneCompositePartService),
    __param(3, IModelService),
    __param(4, ILanguageService),
    __param(5, IProductService),
    __param(6, INotificationService),
    __param(7, ITelemetryService),
    __param(8, IStorageService),
    __param(9, IExtensionRecommendationNotificationService),
    __param(10, IExtensionIgnoredRecommendationsService),
    __param(11, IWorkbenchAssignmentService),
    __param(12, IWorkspaceContextService),
    __param(13, IExtensionManagementServerService)
], FileBasedRecommendations);
export { FileBasedRecommendations };
