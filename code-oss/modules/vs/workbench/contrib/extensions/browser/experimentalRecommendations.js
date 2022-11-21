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
import { isNonEmptyArray } from 'vs/base/common/arrays';
import { ExtensionRecommendations } from 'vs/workbench/contrib/extensions/browser/extensionRecommendations';
import { IExperimentService, ExperimentActionType } from 'vs/workbench/contrib/experiments/common/experimentService';
import { isString } from 'vs/base/common/types';
import { EXTENSION_IDENTIFIER_REGEX } from 'vs/platform/extensionManagement/common/extensionManagement';
let ExperimentalRecommendations = class ExperimentalRecommendations extends ExtensionRecommendations {
    experimentService;
    _recommendations = [];
    get recommendations() { return this._recommendations; }
    constructor(experimentService) {
        super();
        this.experimentService = experimentService;
    }
    /**
     * Fetch extensions used by others on the same workspace as recommendations
     */
    async doActivate() {
        const experiments = await this.experimentService.getExperimentsByType(ExperimentActionType.AddToRecommendations);
        for (const { action, state } of experiments) {
            if (state === 2 /* ExperimentState.Run */ && isNonEmptyArray(action?.properties?.recommendations) && action?.properties?.recommendationReason) {
                for (const extensionId of action.properties.recommendations) {
                    try {
                        if (isString(extensionId) && EXTENSION_IDENTIFIER_REGEX.test(extensionId)) {
                            this._recommendations.push({
                                extensionId: extensionId.toLowerCase(),
                                reason: {
                                    reasonId: 5 /* ExtensionRecommendationReason.Experimental */,
                                    reasonText: action.properties.recommendationReason
                                }
                            });
                        }
                    }
                    catch (error) { /* ignore */ }
                }
            }
        }
    }
};
ExperimentalRecommendations = __decorate([
    __param(0, IExperimentService)
], ExperimentalRecommendations);
export { ExperimentalRecommendations };
