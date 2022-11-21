/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions } from 'vs/workbench/common/contributions';
import { ISplashStorageService } from 'vs/workbench/contrib/splash/browser/splash';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { PartsSplash } from 'vs/workbench/contrib/splash/browser/partsSplash';
registerSingleton(ISplashStorageService, class SplashStorageService {
    _serviceBrand;
    async saveWindowSplash(splash) {
        const raw = JSON.stringify(splash);
        localStorage.setItem('monaco-parts-splash', raw);
    }
}, 1 /* InstantiationType.Delayed */);
Registry.as(Extensions.Workbench).registerWorkbenchContribution(PartsSplash, 1 /* LifecyclePhase.Starting */);
