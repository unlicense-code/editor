/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IReplaceService } from 'vs/workbench/contrib/search/common/replace';
import { ReplaceService, ReplacePreviewContentProvider } from 'vs/workbench/contrib/search/browser/replaceService';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
export function registerContributions() {
    registerSingleton(IReplaceService, ReplaceService, 1 /* InstantiationType.Delayed */);
    Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(ReplacePreviewContentProvider, 1 /* LifecyclePhase.Starting */);
}
