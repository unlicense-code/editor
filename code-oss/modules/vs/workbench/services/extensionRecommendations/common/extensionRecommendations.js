/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export var ExtensionRecommendationReason;
(function (ExtensionRecommendationReason) {
    ExtensionRecommendationReason[ExtensionRecommendationReason["Workspace"] = 0] = "Workspace";
    ExtensionRecommendationReason[ExtensionRecommendationReason["File"] = 1] = "File";
    ExtensionRecommendationReason[ExtensionRecommendationReason["Executable"] = 2] = "Executable";
    ExtensionRecommendationReason[ExtensionRecommendationReason["WorkspaceConfig"] = 3] = "WorkspaceConfig";
    ExtensionRecommendationReason[ExtensionRecommendationReason["DynamicWorkspace"] = 4] = "DynamicWorkspace";
    ExtensionRecommendationReason[ExtensionRecommendationReason["Experimental"] = 5] = "Experimental";
    ExtensionRecommendationReason[ExtensionRecommendationReason["Application"] = 6] = "Application";
})(ExtensionRecommendationReason || (ExtensionRecommendationReason = {}));
export const IExtensionRecommendationsService = createDecorator('extensionRecommendationsService');
export const IExtensionIgnoredRecommendationsService = createDecorator('IExtensionIgnoredRecommendationsService');
