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
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions } from 'vs/workbench/common/contributions';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { posix } from 'vs/base/common/path';
import { hash } from 'vs/base/common/hash';
let ResourcePerformanceMarks = class ResourcePerformanceMarks {
    constructor(telemetryService) {
        for (const item of performance.getEntriesByType('resource')) {
            try {
                const url = new URL(item.name);
                const name = posix.basename(url.pathname);
                telemetryService.publicLog2('startup.resource.perf', {
                    hosthash: `H${hash(url.host).toString(16)}`,
                    name,
                    duration: item.duration
                });
            }
            catch {
                // ignore
            }
        }
    }
};
ResourcePerformanceMarks = __decorate([
    __param(0, ITelemetryService)
], ResourcePerformanceMarks);
Registry.as(Extensions.Workbench).registerWorkbenchContribution(ResourcePerformanceMarks, 4 /* LifecyclePhase.Eventually */);
