/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { Registry } from 'vs/platform/registry/common/platform';
import { runWhenIdle } from 'vs/base/common/async';
import { mark } from 'vs/base/common/performance';
import { ILogService } from 'vs/platform/log/common/log';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
export var Extensions;
(function (Extensions) {
    Extensions.Workbench = 'workbench.contributions.kind';
})(Extensions || (Extensions = {}));
class WorkbenchContributionsRegistry {
    instantiationService;
    lifecycleService;
    logService;
    environmentService;
    toBeInstantiated = new Map();
    registerWorkbenchContribution(ctor, phase = 1 /* LifecyclePhase.Starting */) {
        // Instantiate directly if we are already matching the provided phase
        if (this.instantiationService && this.lifecycleService && this.logService && this.environmentService && this.lifecycleService.phase >= phase) {
            this.safeCreateInstance(this.instantiationService, this.logService, this.environmentService, ctor, phase);
        }
        // Otherwise keep contributions by lifecycle phase
        else {
            let toBeInstantiated = this.toBeInstantiated.get(phase);
            if (!toBeInstantiated) {
                toBeInstantiated = [];
                this.toBeInstantiated.set(phase, toBeInstantiated);
            }
            toBeInstantiated.push(ctor);
        }
    }
    start(accessor) {
        const instantiationService = this.instantiationService = accessor.get(IInstantiationService);
        const lifecycleService = this.lifecycleService = accessor.get(ILifecycleService);
        const logService = this.logService = accessor.get(ILogService);
        const environmentService = this.environmentService = accessor.get(IEnvironmentService);
        for (const phase of [1 /* LifecyclePhase.Starting */, 2 /* LifecyclePhase.Ready */, 3 /* LifecyclePhase.Restored */, 4 /* LifecyclePhase.Eventually */]) {
            this.instantiateByPhase(instantiationService, lifecycleService, logService, environmentService, phase);
        }
    }
    instantiateByPhase(instantiationService, lifecycleService, logService, environmentService, phase) {
        // Instantiate contributions directly when phase is already reached
        if (lifecycleService.phase >= phase) {
            this.doInstantiateByPhase(instantiationService, logService, environmentService, phase);
        }
        // Otherwise wait for phase to be reached
        else {
            lifecycleService.when(phase).then(() => this.doInstantiateByPhase(instantiationService, logService, environmentService, phase));
        }
    }
    doInstantiateByPhase(instantiationService, logService, environmentService, phase) {
        const toBeInstantiated = this.toBeInstantiated.get(phase);
        if (toBeInstantiated) {
            this.toBeInstantiated.delete(phase);
            if (phase !== 4 /* LifecyclePhase.Eventually */) {
                // instantiate everything synchronously and blocking
                // measure the time it takes as perf marks for diagnosis
                mark(`code/willCreateWorkbenchContributions/${phase}`);
                for (const ctor of toBeInstantiated) {
                    this.safeCreateInstance(instantiationService, logService, environmentService, ctor, phase); // catch error so that other contributions are still considered
                }
                mark(`code/didCreateWorkbenchContributions/${phase}`);
            }
            else {
                // for the Eventually-phase we instantiate contributions
                // only when idle. this might take a few idle-busy-cycles
                // but will finish within the timeouts
                const forcedTimeout = 3000;
                let i = 0;
                const instantiateSome = (idle) => {
                    while (i < toBeInstantiated.length) {
                        const ctor = toBeInstantiated[i++];
                        this.safeCreateInstance(instantiationService, logService, environmentService, ctor, phase); // catch error so that other contributions are still considered
                        if (idle.timeRemaining() < 1) {
                            // time is up -> reschedule
                            runWhenIdle(instantiateSome, forcedTimeout);
                            break;
                        }
                    }
                };
                runWhenIdle(instantiateSome, forcedTimeout);
            }
        }
    }
    safeCreateInstance(instantiationService, logService, environmentService, ctor, phase) {
        const now = phase < 3 /* LifecyclePhase.Restored */ ? Date.now() : undefined;
        try {
            instantiationService.createInstance(ctor);
        }
        catch (error) {
            logService.error(`Unable to instantiate workbench contribution ${ctor.name}.`, error);
        }
        if (typeof now === 'number' && !environmentService.isBuilt /* only log out of sources where we have good ctor names */) {
            const time = Date.now() - now;
            if (time > 20) {
                logService.warn(`Workbench contribution ${ctor.name} blocked restore phase by ${time}ms.`);
            }
        }
    }
}
Registry.add(Extensions.Workbench, new WorkbenchContributionsRegistry());
