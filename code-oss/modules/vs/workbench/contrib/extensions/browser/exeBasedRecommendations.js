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
import { IExtensionTipsService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { ExtensionRecommendations } from 'vs/workbench/contrib/extensions/browser/extensionRecommendations';
import { localize } from 'vs/nls';
let ExeBasedRecommendations = class ExeBasedRecommendations extends ExtensionRecommendations {
    extensionTipsService;
    _otherTips = [];
    _importantTips = [];
    get otherRecommendations() { return this._otherTips.map(tip => this.toExtensionRecommendation(tip)); }
    get importantRecommendations() { return this._importantTips.map(tip => this.toExtensionRecommendation(tip)); }
    get recommendations() { return [...this.importantRecommendations, ...this.otherRecommendations]; }
    constructor(extensionTipsService) {
        super();
        this.extensionTipsService = extensionTipsService;
    }
    getRecommendations(exe) {
        const important = this._importantTips
            .filter(tip => tip.exeName.toLowerCase() === exe.toLowerCase())
            .map(tip => this.toExtensionRecommendation(tip));
        const others = this._otherTips
            .filter(tip => tip.exeName.toLowerCase() === exe.toLowerCase())
            .map(tip => this.toExtensionRecommendation(tip));
        return { important, others };
    }
    async doActivate() {
        this._otherTips = await this.extensionTipsService.getOtherExecutableBasedTips();
        await this.fetchImportantExeBasedRecommendations();
    }
    _importantExeBasedRecommendations;
    async fetchImportantExeBasedRecommendations() {
        if (!this._importantExeBasedRecommendations) {
            this._importantExeBasedRecommendations = this.doFetchImportantExeBasedRecommendations();
        }
        return this._importantExeBasedRecommendations;
    }
    async doFetchImportantExeBasedRecommendations() {
        const importantExeBasedRecommendations = new Map();
        this._importantTips = await this.extensionTipsService.getImportantExecutableBasedTips();
        this._importantTips.forEach(tip => importantExeBasedRecommendations.set(tip.extensionId.toLowerCase(), tip));
        return importantExeBasedRecommendations;
    }
    toExtensionRecommendation(tip) {
        return {
            extensionId: tip.extensionId.toLowerCase(),
            reason: {
                reasonId: 2 /* ExtensionRecommendationReason.Executable */,
                reasonText: localize('exeBasedRecommendation', "This extension is recommended because you have {0} installed.", tip.exeFriendlyName)
            }
        };
    }
};
ExeBasedRecommendations = __decorate([
    __param(0, IExtensionTipsService)
], ExeBasedRecommendations);
export { ExeBasedRecommendations };
