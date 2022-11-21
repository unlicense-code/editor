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
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { Action2, registerAction2 } from 'vs/platform/actions/common/actions';
import { OpenWindowSessionLogFileAction } from 'vs/workbench/contrib/logs/common/logsActions';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { Disposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { LogsDataCleaner } from 'vs/workbench/contrib/logs/common/logsDataCleaner';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ILogLevelService, LogLevelService } from 'vs/workbench/contrib/logs/common/logLevelService';
registerSingleton(ILogLevelService, LogLevelService, 1 /* InstantiationType.Delayed */);
let WebLogOutputChannels = class WebLogOutputChannels extends Disposable {
    instantiationService;
    constructor(instantiationService) {
        super();
        this.instantiationService = instantiationService;
        this.registerWebContributions();
    }
    registerWebContributions() {
        this.instantiationService.createInstance(LogsDataCleaner);
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: OpenWindowSessionLogFileAction.ID,
                    title: OpenWindowSessionLogFileAction.TITLE,
                    category: Categories.Developer,
                    f1: true
                });
            }
            run(servicesAccessor) {
                return servicesAccessor.get(IInstantiationService).createInstance(OpenWindowSessionLogFileAction, OpenWindowSessionLogFileAction.ID, OpenWindowSessionLogFileAction.TITLE.value).run();
            }
        });
    }
};
WebLogOutputChannels = __decorate([
    __param(0, IInstantiationService)
], WebLogOutputChannels);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(WebLogOutputChannels, 3 /* LifecyclePhase.Restored */);
