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
import { IExtensionManagementService, IExtensionGalleryService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IExtensionIgnoredRecommendationsService } from 'vs/workbench/services/extensionRecommendations/common/extensionRecommendations';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { distinct, shuffle } from 'vs/base/common/arrays';
import { Emitter, Event } from 'vs/base/common/event';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { DynamicWorkspaceRecommendations } from 'vs/workbench/contrib/extensions/browser/dynamicWorkspaceRecommendations';
import { ExeBasedRecommendations } from 'vs/workbench/contrib/extensions/browser/exeBasedRecommendations';
import { ExperimentalRecommendations } from 'vs/workbench/contrib/extensions/browser/experimentalRecommendations';
import { WorkspaceRecommendations } from 'vs/workbench/contrib/extensions/browser/workspaceRecommendations';
import { FileBasedRecommendations } from 'vs/workbench/contrib/extensions/browser/fileBasedRecommendations';
import { KeymapRecommendations } from 'vs/workbench/contrib/extensions/browser/keymapRecommendations';
import { LanguageRecommendations } from 'vs/workbench/contrib/extensions/browser/languageRecommendations';
import { ConfigBasedRecommendations } from 'vs/workbench/contrib/extensions/browser/configBasedRecommendations';
import { IExtensionRecommendationNotificationService } from 'vs/platform/extensionRecommendations/common/extensionRecommendations';
import { timeout } from 'vs/base/common/async';
import { URI } from 'vs/base/common/uri';
import { WebRecommendations } from 'vs/workbench/contrib/extensions/browser/webRecommendations';
import { IExtensionsWorkbenchService } from 'vs/workbench/contrib/extensions/common/extensions';
import { areSameExtensions } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
let ExtensionRecommendationsService = class ExtensionRecommendationsService extends Disposable {
    lifecycleService;
    galleryService;
    telemetryService;
    environmentService;
    extensionManagementService;
    extensionRecommendationsManagementService;
    extensionRecommendationNotificationService;
    extensionsWorkbenchService;
    // Recommendations
    fileBasedRecommendations;
    workspaceRecommendations;
    experimentalRecommendations;
    configBasedRecommendations;
    exeBasedRecommendations;
    dynamicWorkspaceRecommendations;
    keymapRecommendations;
    webRecommendations;
    languageRecommendations;
    activationPromise;
    sessionSeed;
    _onDidChangeRecommendations = this._register(new Emitter());
    onDidChangeRecommendations = this._onDidChangeRecommendations.event;
    constructor(instantiationService, lifecycleService, galleryService, telemetryService, environmentService, extensionManagementService, extensionRecommendationsManagementService, extensionRecommendationNotificationService, extensionsWorkbenchService) {
        super();
        this.lifecycleService = lifecycleService;
        this.galleryService = galleryService;
        this.telemetryService = telemetryService;
        this.environmentService = environmentService;
        this.extensionManagementService = extensionManagementService;
        this.extensionRecommendationsManagementService = extensionRecommendationsManagementService;
        this.extensionRecommendationNotificationService = extensionRecommendationNotificationService;
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.workspaceRecommendations = instantiationService.createInstance(WorkspaceRecommendations);
        this.fileBasedRecommendations = instantiationService.createInstance(FileBasedRecommendations);
        this.experimentalRecommendations = instantiationService.createInstance(ExperimentalRecommendations);
        this.configBasedRecommendations = instantiationService.createInstance(ConfigBasedRecommendations);
        this.exeBasedRecommendations = instantiationService.createInstance(ExeBasedRecommendations);
        this.dynamicWorkspaceRecommendations = instantiationService.createInstance(DynamicWorkspaceRecommendations);
        this.keymapRecommendations = instantiationService.createInstance(KeymapRecommendations);
        this.webRecommendations = instantiationService.createInstance(WebRecommendations);
        this.languageRecommendations = instantiationService.createInstance(LanguageRecommendations);
        if (!this.isEnabled()) {
            this.sessionSeed = 0;
            this.activationPromise = Promise.resolve();
            return;
        }
        this.sessionSeed = +new Date();
        // Activation
        this.activationPromise = this.activate();
        this._register(this.extensionManagementService.onDidInstallExtensions(e => this.onDidInstallExtensions(e)));
    }
    async activate() {
        await this.lifecycleService.when(3 /* LifecyclePhase.Restored */);
        // activate all recommendations
        await Promise.all([
            this.workspaceRecommendations.activate(),
            this.configBasedRecommendations.activate(),
            this.fileBasedRecommendations.activate(),
            this.experimentalRecommendations.activate(),
            this.keymapRecommendations.activate(),
            this.languageRecommendations.activate(),
            this.webRecommendations.activate()
        ]);
        this._register(Event.any(this.workspaceRecommendations.onDidChangeRecommendations, this.configBasedRecommendations.onDidChangeRecommendations, this.extensionRecommendationsManagementService.onDidChangeIgnoredRecommendations)(() => this._onDidChangeRecommendations.fire()));
        this._register(this.extensionRecommendationsManagementService.onDidChangeGlobalIgnoredRecommendation(({ extensionId, isRecommended }) => {
            if (!isRecommended) {
                const reason = this.getAllRecommendationsWithReason()[extensionId];
                if (reason && reason.reasonId) {
                    this.telemetryService.publicLog2('extensionsRecommendations:ignoreRecommendation', { extensionId, recommendationReason: reason.reasonId });
                }
            }
        }));
        this.promptWorkspaceRecommendations();
    }
    isEnabled() {
        return this.galleryService.isEnabled() && !this.environmentService.isExtensionDevelopment;
    }
    async activateProactiveRecommendations() {
        await Promise.all([this.dynamicWorkspaceRecommendations.activate(), this.exeBasedRecommendations.activate(), this.configBasedRecommendations.activate()]);
    }
    getAllRecommendationsWithReason() {
        /* Activate proactive recommendations */
        this.activateProactiveRecommendations();
        const output = Object.create(null);
        const allRecommendations = [
            ...this.dynamicWorkspaceRecommendations.recommendations,
            ...this.configBasedRecommendations.recommendations,
            ...this.exeBasedRecommendations.recommendations,
            ...this.experimentalRecommendations.recommendations,
            ...this.fileBasedRecommendations.recommendations,
            ...this.workspaceRecommendations.recommendations,
            ...this.keymapRecommendations.recommendations,
            ...this.languageRecommendations.recommendations,
            ...this.webRecommendations.recommendations,
        ];
        for (const { extensionId, reason } of allRecommendations) {
            if (this.isExtensionAllowedToBeRecommended(extensionId)) {
                output[extensionId.toLowerCase()] = reason;
            }
        }
        return output;
    }
    async getConfigBasedRecommendations() {
        await this.configBasedRecommendations.activate();
        return {
            important: this.toExtensionRecommendations(this.configBasedRecommendations.importantRecommendations),
            others: this.toExtensionRecommendations(this.configBasedRecommendations.otherRecommendations)
        };
    }
    async getOtherRecommendations() {
        await this.activationPromise;
        await this.activateProactiveRecommendations();
        const recommendations = [
            ...this.configBasedRecommendations.otherRecommendations,
            ...this.exeBasedRecommendations.otherRecommendations,
            ...this.dynamicWorkspaceRecommendations.recommendations,
            ...this.experimentalRecommendations.recommendations,
            ...this.webRecommendations.recommendations
        ];
        const extensionIds = distinct(recommendations.map(e => e.extensionId))
            .filter(extensionId => this.isExtensionAllowedToBeRecommended(extensionId));
        shuffle(extensionIds, this.sessionSeed);
        return extensionIds;
    }
    async getImportantRecommendations() {
        await this.activateProactiveRecommendations();
        const recommendations = [
            ...this.fileBasedRecommendations.importantRecommendations,
            ...this.configBasedRecommendations.importantRecommendations,
            ...this.exeBasedRecommendations.importantRecommendations,
        ];
        const extensionIds = distinct(recommendations.map(e => e.extensionId))
            .filter(extensionId => this.isExtensionAllowedToBeRecommended(extensionId));
        shuffle(extensionIds, this.sessionSeed);
        return extensionIds;
    }
    getKeymapRecommendations() {
        return this.toExtensionRecommendations(this.keymapRecommendations.recommendations);
    }
    getLanguageRecommendations() {
        return this.toExtensionRecommendations(this.languageRecommendations.recommendations);
    }
    async getWorkspaceRecommendations() {
        if (!this.isEnabled()) {
            return [];
        }
        await this.workspaceRecommendations.activate();
        return this.toExtensionRecommendations(this.workspaceRecommendations.recommendations);
    }
    async getExeBasedRecommendations(exe) {
        await this.exeBasedRecommendations.activate();
        const { important, others } = exe ? this.exeBasedRecommendations.getRecommendations(exe)
            : { important: this.exeBasedRecommendations.importantRecommendations, others: this.exeBasedRecommendations.otherRecommendations };
        return { important: this.toExtensionRecommendations(important), others: this.toExtensionRecommendations(others) };
    }
    getFileBasedRecommendations() {
        return this.toExtensionRecommendations(this.fileBasedRecommendations.recommendations);
    }
    onDidInstallExtensions(results) {
        for (const e of results) {
            if (e.source && !URI.isUri(e.source) && e.operation === 2 /* InstallOperation.Install */) {
                const extRecommendations = this.getAllRecommendationsWithReason() || {};
                const recommendationReason = extRecommendations[e.source.identifier.id.toLowerCase()];
                if (recommendationReason) {
                    /* __GDPR__
                        "extensionGallery:install:recommendations" : {
                            "owner": "sandy081",
                            "recommendationReason": { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                            "${include}": [
                                "${GalleryExtensionTelemetryData}"
                            ]
                        }
                    */
                    this.telemetryService.publicLog('extensionGallery:install:recommendations', { ...e.source.telemetryData, recommendationReason: recommendationReason.reasonId });
                }
            }
        }
    }
    toExtensionRecommendations(recommendations) {
        const extensionIds = distinct(recommendations.map(e => e.extensionId))
            .filter(extensionId => this.isExtensionAllowedToBeRecommended(extensionId));
        return extensionIds;
    }
    isExtensionAllowedToBeRecommended(extensionId) {
        return !this.extensionRecommendationsManagementService.ignoredRecommendations.includes(extensionId.toLowerCase());
    }
    // for testing
    get workbenchRecommendationDelay() {
        // remote extensions might still being installed #124119
        return 5000;
    }
    async promptWorkspaceRecommendations() {
        const installed = await this.extensionsWorkbenchService.queryLocal();
        const allowedRecommendations = [
            ...this.workspaceRecommendations.recommendations,
            ...this.configBasedRecommendations.importantRecommendations.filter(recommendation => !recommendation.whenNotInstalled || recommendation.whenNotInstalled.every(id => installed.every(local => !areSameExtensions(local.identifier, { id }))))
        ]
            .map(({ extensionId }) => extensionId)
            .filter(extensionId => this.isExtensionAllowedToBeRecommended(extensionId));
        if (allowedRecommendations.length) {
            await timeout(this.workbenchRecommendationDelay);
            await this.extensionRecommendationNotificationService.promptWorkspaceRecommendations(allowedRecommendations);
        }
    }
};
ExtensionRecommendationsService = __decorate([
    __param(0, IInstantiationService),
    __param(1, ILifecycleService),
    __param(2, IExtensionGalleryService),
    __param(3, ITelemetryService),
    __param(4, IEnvironmentService),
    __param(5, IExtensionManagementService),
    __param(6, IExtensionIgnoredRecommendationsService),
    __param(7, IExtensionRecommendationNotificationService),
    __param(8, IExtensionsWorkbenchService)
], ExtensionRecommendationsService);
export { ExtensionRecommendationsService };
