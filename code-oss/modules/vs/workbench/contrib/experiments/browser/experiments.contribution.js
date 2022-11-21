/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from 'vs/nls';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IExperimentService, ExperimentService } from 'vs/workbench/contrib/experiments/common/experimentService';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { ExperimentalPrompts } from 'vs/workbench/contrib/experiments/browser/experimentalPrompt';
import { Extensions as ConfigurationExtensions } from 'vs/platform/configuration/common/configurationRegistry';
import { workbenchConfigurationNodeBase } from 'vs/workbench/common/configuration';
registerSingleton(IExperimentService, ExperimentService, 1 /* InstantiationType.Delayed */);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(ExperimentalPrompts, 4 /* LifecyclePhase.Eventually */);
const registry = Registry.as(ConfigurationExtensions.Configuration);
// Configuration
registry.registerConfiguration({
    ...workbenchConfigurationNodeBase,
    'properties': {
        'workbench.enableExperiments': {
            'type': 'boolean',
            'description': localize('workbench.enableExperiments', "Fetches experiments to run from a Microsoft online service."),
            'default': true,
            'scope': 1 /* ConfigurationScope.APPLICATION */,
            'restricted': true,
            'tags': ['usesOnlineServices']
        }
    }
});
