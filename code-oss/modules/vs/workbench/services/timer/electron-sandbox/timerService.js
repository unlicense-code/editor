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
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IUpdateService } from 'vs/platform/update/common/update';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { AbstractTimerService, ITimerService } from 'vs/workbench/services/timer/browser/timerService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { process } from 'vs/base/parts/sandbox/electron-sandbox/globals';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { IProductService } from 'vs/platform/product/common/productService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
let TimerService = class TimerService extends AbstractTimerService {
    _nativeHostService;
    _environmentService;
    _productService;
    _storageService;
    constructor(_nativeHostService, _environmentService, lifecycleService, contextService, extensionService, updateService, paneCompositeService, editorService, accessibilityService, telemetryService, layoutService, _productService, _storageService) {
        super(lifecycleService, contextService, extensionService, updateService, paneCompositeService, editorService, accessibilityService, telemetryService, layoutService);
        this._nativeHostService = _nativeHostService;
        this._environmentService = _environmentService;
        this._productService = _productService;
        this._storageService = _storageService;
        this.setPerformanceMarks('main', _environmentService.window.perfMarks);
    }
    _isInitialStartup() {
        return Boolean(this._environmentService.window.isInitialStartup);
    }
    _didUseCachedData() {
        return didUseCachedData(this._productService, this._storageService, this._environmentService);
    }
    _getWindowCount() {
        return this._nativeHostService.getWindowCount();
    }
    async _extendStartupInfo(info) {
        try {
            const [osProperties, osStatistics, virtualMachineHint] = await Promise.all([
                this._nativeHostService.getOSProperties(),
                this._nativeHostService.getOSStatistics(),
                this._nativeHostService.getOSVirtualMachineHint()
            ]);
            info.totalmem = osStatistics.totalmem;
            info.freemem = osStatistics.freemem;
            info.platform = osProperties.platform;
            info.release = osProperties.release;
            info.arch = osProperties.arch;
            info.loadavg = osStatistics.loadavg;
            const processMemoryInfo = await process.getProcessMemoryInfo();
            info.meminfo = {
                workingSetSize: processMemoryInfo.residentSet,
                privateBytes: processMemoryInfo.private,
                sharedBytes: processMemoryInfo.shared
            };
            info.isVMLikelyhood = Math.round((virtualMachineHint * 100));
            const rawCpus = osProperties.cpus;
            if (rawCpus && rawCpus.length > 0) {
                info.cpus = { count: rawCpus.length, speed: rawCpus[0].speed, model: rawCpus[0].model };
            }
        }
        catch (error) {
            // ignore, be on the safe side with these hardware method calls
        }
    }
};
TimerService = __decorate([
    __param(0, INativeHostService),
    __param(1, INativeWorkbenchEnvironmentService),
    __param(2, ILifecycleService),
    __param(3, IWorkspaceContextService),
    __param(4, IExtensionService),
    __param(5, IUpdateService),
    __param(6, IPaneCompositePartService),
    __param(7, IEditorService),
    __param(8, IAccessibilityService),
    __param(9, ITelemetryService),
    __param(10, IWorkbenchLayoutService),
    __param(11, IProductService),
    __param(12, IStorageService)
], TimerService);
export { TimerService };
registerSingleton(ITimerService, TimerService, 1 /* InstantiationType.Delayed */);
//#region cached data logic
const lastRunningCommitStorageKey = 'perf/lastRunningCommit';
let _didUseCachedData = undefined;
export function didUseCachedData(productService, storageService, environmentService) {
    // browser code loading: only a guess based on
    // this being the first start with the commit
    // or subsequent
    if (typeof _didUseCachedData !== 'boolean') {
        if (!environmentService.window.isCodeCaching || !productService.commit) {
            _didUseCachedData = false; // we only produce cached data whith commit and code cache path
        }
        else if (storageService.get(lastRunningCommitStorageKey, -1 /* StorageScope.APPLICATION */) === productService.commit) {
            _didUseCachedData = true; // subsequent start on same commit, assume cached data is there
        }
        else {
            storageService.store(lastRunningCommitStorageKey, productService.commit, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            _didUseCachedData = false; // first time start on commit, assume cached data is not yet there
        }
    }
    return _didUseCachedData;
}
//#endregion
