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
import { EXTENSION_IDENTIFIER_PATTERN, IExtensionGalleryService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { distinct, flatten } from 'vs/base/common/arrays';
import { ExtensionRecommendations } from 'vs/workbench/contrib/extensions/browser/extensionRecommendations';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ILogService } from 'vs/platform/log/common/log';
import { CancellationToken } from 'vs/base/common/cancellation';
import { localize } from 'vs/nls';
import { Emitter } from 'vs/base/common/event';
import { IWorkspaceExtensionsConfigService } from 'vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig';
let WorkspaceRecommendations = class WorkspaceRecommendations extends ExtensionRecommendations {
    workspaceExtensionsConfigService;
    galleryService;
    logService;
    notificationService;
    _recommendations = [];
    get recommendations() { return this._recommendations; }
    _onDidChangeRecommendations = this._register(new Emitter());
    onDidChangeRecommendations = this._onDidChangeRecommendations.event;
    _ignoredRecommendations = [];
    get ignoredRecommendations() { return this._ignoredRecommendations; }
    constructor(workspaceExtensionsConfigService, galleryService, logService, notificationService) {
        super();
        this.workspaceExtensionsConfigService = workspaceExtensionsConfigService;
        this.galleryService = galleryService;
        this.logService = logService;
        this.notificationService = notificationService;
    }
    async doActivate() {
        await this.fetch();
        this._register(this.workspaceExtensionsConfigService.onDidChangeExtensionsConfigs(() => this.onDidChangeExtensionsConfigs()));
    }
    /**
     * Parse all extensions.json files, fetch workspace recommendations, filter out invalid and unwanted ones
     */
    async fetch() {
        const extensionsConfigs = await this.workspaceExtensionsConfigService.getExtensionsConfigs();
        const { invalidRecommendations, message } = await this.validateExtensions(extensionsConfigs);
        if (invalidRecommendations.length) {
            this.notificationService.warn(`The ${invalidRecommendations.length} extension(s) below, in workspace recommendations have issues:\n${message}`);
        }
        this._recommendations = [];
        this._ignoredRecommendations = [];
        for (const extensionsConfig of extensionsConfigs) {
            if (extensionsConfig.unwantedRecommendations) {
                for (const unwantedRecommendation of extensionsConfig.unwantedRecommendations) {
                    if (invalidRecommendations.indexOf(unwantedRecommendation) === -1) {
                        this._ignoredRecommendations.push(unwantedRecommendation);
                    }
                }
            }
            if (extensionsConfig.recommendations) {
                for (const extensionId of extensionsConfig.recommendations) {
                    if (invalidRecommendations.indexOf(extensionId) === -1) {
                        this._recommendations.push({
                            extensionId,
                            reason: {
                                reasonId: 0 /* ExtensionRecommendationReason.Workspace */,
                                reasonText: localize('workspaceRecommendation', "This extension is recommended by users of the current workspace.")
                            }
                        });
                    }
                }
            }
        }
    }
    async validateExtensions(contents) {
        const validExtensions = [];
        const invalidExtensions = [];
        const extensionsToQuery = [];
        let message = '';
        const allRecommendations = distinct(flatten(contents.map(({ recommendations }) => recommendations || [])));
        const regEx = new RegExp(EXTENSION_IDENTIFIER_PATTERN);
        for (const extensionId of allRecommendations) {
            if (regEx.test(extensionId)) {
                extensionsToQuery.push(extensionId);
            }
            else {
                invalidExtensions.push(extensionId);
                message += `${extensionId} (bad format) Expected: <provider>.<name>\n`;
            }
        }
        if (extensionsToQuery.length) {
            try {
                const galleryExtensions = await this.galleryService.getExtensions(extensionsToQuery.map(id => ({ id })), CancellationToken.None);
                const extensions = galleryExtensions.map(extension => extension.identifier.id.toLowerCase());
                for (const extensionId of extensionsToQuery) {
                    if (extensions.indexOf(extensionId) === -1) {
                        invalidExtensions.push(extensionId);
                        message += `${extensionId} (not found in marketplace)\n`;
                    }
                    else {
                        validExtensions.push(extensionId);
                    }
                }
            }
            catch (e) {
                this.logService.warn('Error querying extensions gallery', e);
            }
        }
        return { validRecommendations: validExtensions, invalidRecommendations: invalidExtensions, message };
    }
    async onDidChangeExtensionsConfigs() {
        await this.fetch();
        this._onDidChangeRecommendations.fire();
    }
};
WorkspaceRecommendations = __decorate([
    __param(0, IWorkspaceExtensionsConfigService),
    __param(1, IExtensionGalleryService),
    __param(2, ILogService),
    __param(3, INotificationService)
], WorkspaceRecommendations);
export { WorkspaceRecommendations };
