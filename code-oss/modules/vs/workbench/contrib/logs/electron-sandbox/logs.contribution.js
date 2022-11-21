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
import * as nls from 'vs/nls';
import { Registry } from 'vs/platform/registry/common/platform';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { Action2, registerAction2 } from 'vs/platform/actions/common/actions';
import { OpenLogsFolderAction, OpenExtensionLogsFolderAction } from 'vs/workbench/contrib/logs/electron-sandbox/logsActions';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import * as Constants from 'vs/workbench/contrib/logs/common/logConstants';
import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { URI } from 'vs/base/common/uri';
import { join } from 'vs/base/common/path';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { registerLogChannel } from 'vs/workbench/services/output/common/output';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ILogLevelService } from 'vs/workbench/contrib/logs/common/logLevelService';
import { LogLevelService } from 'vs/workbench/contrib/logs/electron-sandbox/logLevelService';
registerSingleton(ILogLevelService, LogLevelService, 1 /* InstantiationType.Delayed */);
let NativeLogOutputChannels = class NativeLogOutputChannels extends Disposable {
    environmentService;
    logService;
    fileService;
    constructor(environmentService, logService, fileService) {
        super();
        this.environmentService = environmentService;
        this.logService = logService;
        this.fileService = fileService;
        this.registerNativeContributions();
    }
    registerNativeContributions() {
        this.registerLogChannel(Constants.mainLogChannelId, nls.localize('mainLog', "Main"), URI.file(join(this.environmentService.logsPath, `main.log`)));
        this.registerLogChannel(Constants.sharedLogChannelId, nls.localize('sharedLog', "Shared"), URI.file(join(this.environmentService.logsPath, `sharedprocess.log`)));
    }
    registerLogChannel(id, label, file) {
        const promise = registerLogChannel(id, label, file, this.fileService, this.logService);
        this._register(toDisposable(() => promise.cancel()));
    }
};
NativeLogOutputChannels = __decorate([
    __param(0, IWorkbenchEnvironmentService),
    __param(1, ILogService),
    __param(2, IFileService)
], NativeLogOutputChannels);
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: OpenLogsFolderAction.ID,
            title: OpenLogsFolderAction.TITLE,
            category: Categories.Developer,
            f1: true
        });
    }
    run(servicesAccessor) {
        return servicesAccessor.get(IInstantiationService).createInstance(OpenLogsFolderAction, OpenLogsFolderAction.ID, OpenLogsFolderAction.TITLE.value).run();
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: OpenExtensionLogsFolderAction.ID,
            title: OpenExtensionLogsFolderAction.TITLE,
            category: Categories.Developer,
            f1: true
        });
    }
    run(servicesAccessor) {
        return servicesAccessor.get(IInstantiationService).createInstance(OpenExtensionLogsFolderAction, OpenExtensionLogsFolderAction.ID, OpenExtensionLogsFolderAction.TITLE.value).run();
    }
});
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(NativeLogOutputChannels, 3 /* LifecyclePhase.Restored */);
