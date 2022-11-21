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
import { timeout } from 'vs/base/common/async';
import { VSBuffer } from 'vs/base/common/buffer';
import { joinPath } from 'vs/base/common/resources';
import { generateUuid } from 'vs/base/common/uuid';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IProfileAnalysisWorkerService } from 'vs/platform/profiling/electron-sandbox/profileAnalysisWorkerService';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { parseExtensionDevOptions } from 'vs/workbench/services/extensions/common/extensionDevOptions';
import { ITimerService } from 'vs/workbench/services/timer/browser/timerService';
let RendererProfiling = class RendererProfiling {
    _environmentService;
    _fileService;
    _logService;
    _observer;
    constructor(_environmentService, _fileService, _logService, nativeHostService, timerService, configService, profileAnalysisService) {
        this._environmentService = _environmentService;
        this._fileService = _fileService;
        this._logService = _logService;
        const devOpts = parseExtensionDevOptions(_environmentService);
        if (devOpts.isExtensionDevTestFromCli) {
            // disabled when running extension tests
            return;
        }
        timerService.perfBaseline.then(perfBaseline => {
            _logService.info(`[perf] Render performance baseline is ${perfBaseline}ms`);
            if (perfBaseline < 0) {
                // too slow
                return;
            }
            // SLOW threshold
            const slowThreshold = perfBaseline * 10; // ~10 frames at 64fps on MY machine
            const obs = new PerformanceObserver(async (list) => {
                obs.takeRecords();
                const maxDuration = list.getEntries()
                    .map(e => e.duration)
                    .reduce((p, c) => Math.max(p, c), 0);
                if (maxDuration < slowThreshold) {
                    return;
                }
                if (!configService.getValue('application.experimental.rendererProfiling')) {
                    _logService.debug(`[perf] SLOW task detected (${maxDuration}ms) but renderer profiling is disabled via 'application.experimental.rendererProfiling'`);
                    return;
                }
                const sessionId = generateUuid();
                _logService.warn(`[perf] Renderer reported VERY LONG TASK (${maxDuration}ms), starting profiling session '${sessionId}'`);
                // pause observation, we'll take a detailed look
                obs.disconnect();
                // profile renderer for 5secs, analyse, and take action depending on the result
                for (let i = 0; i < 3; i++) {
                    try {
                        const profile = await nativeHostService.profileRenderer(sessionId, 5000);
                        const output = await profileAnalysisService.analyseBottomUp(profile, _url => '<<renderer>>', perfBaseline);
                        if (output === 2 /* ProfilingOutput.Interesting */) {
                            this._store(profile, sessionId);
                            break;
                        }
                        timeout(15000); // wait 15s
                    }
                    catch (err) {
                        _logService.error(err);
                        break;
                    }
                }
                // reconnect the observer
                obs.observe({ entryTypes: ['longtask'] });
            });
            obs.observe({ entryTypes: ['longtask'] });
            this._observer = obs;
        });
    }
    dispose() {
        this._observer?.disconnect();
    }
    async _store(profile, sessionId) {
        const path = joinPath(this._environmentService.tmpDir, `renderer-${Math.random().toString(16).slice(2, 8)}.cpuprofile`);
        await this._fileService.writeFile(path, VSBuffer.fromString(JSON.stringify(profile)));
        this._logService.info(`[perf] stored profile to DISK '${path}'`, sessionId);
    }
};
RendererProfiling = __decorate([
    __param(0, INativeWorkbenchEnvironmentService),
    __param(1, IFileService),
    __param(2, ILogService),
    __param(3, INativeHostService),
    __param(4, ITimerService),
    __param(5, IConfigurationService),
    __param(6, IProfileAnalysisWorkerService)
], RendererProfiling);
export { RendererProfiling };
