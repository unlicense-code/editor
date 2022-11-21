/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions } from 'vs/workbench/common/contributions';
import { StartupProfiler } from './startupProfiler';
import { StartupTimings } from './startupTimings';
import { RendererProfiling } from 'vs/workbench/contrib/performance/electron-sandbox/rendererAutoProfiler';
import { Extensions as ConfigExt } from 'vs/platform/configuration/common/configurationRegistry';
import { localize } from 'vs/nls';
Registry.as(Extensions.Workbench).registerWorkbenchContribution(RendererProfiling, 4 /* LifecyclePhase.Eventually */);
// -- startup profiler
Registry.as(Extensions.Workbench).registerWorkbenchContribution(StartupProfiler, 3 /* LifecyclePhase.Restored */);
// -- startup timings
Registry.as(Extensions.Workbench).registerWorkbenchContribution(StartupTimings, 4 /* LifecyclePhase.Eventually */);
Registry.as(ConfigExt.Configuration).registerConfiguration({
    id: 'application',
    order: 100,
    type: 'object',
    'properties': {
        'application.experimental.rendererProfiling': {
            type: 'boolean',
            default: false,
            markdownDescription: localize('experimental.rendererProfiling', "When enabled slow renderers are automatically profiled")
        }
    }
});
