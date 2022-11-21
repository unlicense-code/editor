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
import { SetLogLevelAction } from 'vs/workbench/contrib/logs/common/logsActions';
import * as Constants from 'vs/workbench/contrib/logs/common/logConstants';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IFileService } from 'vs/platform/files/common/files';
import { IOutputService, registerLogChannel } from 'vs/workbench/services/output/common/output';
import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import { ILogService, LogLevel } from 'vs/platform/log/common/log';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { isLoggingOnly, supportsTelemetry } from 'vs/platform/telemetry/common/telemetryUtils';
import { IProductService } from 'vs/platform/product/common/productService';
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: SetLogLevelAction.ID,
            title: SetLogLevelAction.TITLE,
            category: Categories.Developer,
            f1: true
        });
    }
    run(servicesAccessor) {
        return servicesAccessor.get(IInstantiationService).createInstance(SetLogLevelAction, SetLogLevelAction.ID, SetLogLevelAction.TITLE.value).run();
    }
});
let LogOutputChannels = class LogOutputChannels extends Disposable {
    environmentService;
    productService;
    logService;
    fileService;
    constructor(environmentService, productService, logService, fileService) {
        super();
        this.environmentService = environmentService;
        this.productService = productService;
        this.logService = logService;
        this.fileService = fileService;
        this.registerCommonContributions();
    }
    registerCommonContributions() {
        this.registerLogChannel(Constants.userDataSyncLogChannelId, nls.localize('userDataSyncLog', "Settings Sync"), this.environmentService.userDataSyncLogResource);
        this.registerLogChannel(Constants.editSessionsLogChannelId, nls.localize('editSessionsLog', "Edit Sessions"), this.environmentService.editSessionsLogResource);
        this.registerLogChannel(Constants.remoteTunnelLogChannelId, nls.localize('remoteTunnelLog', "Remote Tunnel"), this.environmentService.remoteTunnelLogResource);
        this.registerLogChannel(Constants.rendererLogChannelId, nls.localize('rendererLog', "Window"), this.environmentService.logFile);
        const registerTelemetryChannel = () => {
            if (supportsTelemetry(this.productService, this.environmentService) && this.logService.getLevel() === LogLevel.Trace) {
                // Not a perfect check, but a nice way to indicate if we only have logging enabled for debug purposes and nothing is actually being sent
                const justLoggingAndNotSending = isLoggingOnly(this.productService, this.environmentService);
                const logSuffix = justLoggingAndNotSending ? ' (Not Sent)' : '';
                this.registerLogChannel(Constants.telemetryLogChannelId, nls.localize('telemetryLog', "Telemetry{0}", logSuffix), this.environmentService.telemetryLogResource);
                this.registerLogChannel(Constants.extensionTelemetryLogChannelId, nls.localize('extensionTelemetryLog', "Extension Telemetry{0}", logSuffix), this.environmentService.extHostTelemetryLogFile);
                return true;
            }
            return false;
        };
        if (!registerTelemetryChannel()) {
            const disposable = this.logService.onDidChangeLogLevel(() => {
                if (registerTelemetryChannel()) {
                    disposable.dispose();
                }
            });
        }
        registerAction2(class ShowWindowLogAction extends Action2 {
            constructor() {
                super({
                    id: Constants.showWindowLogActionId,
                    title: { value: nls.localize('show window log', "Show Window Log"), original: 'Show Window Log' },
                    category: Categories.Developer,
                    f1: true
                });
            }
            async run(servicesAccessor) {
                const outputService = servicesAccessor.get(IOutputService);
                outputService.showChannel(Constants.rendererLogChannelId);
            }
        });
    }
    registerLogChannel(id, label, file) {
        const promise = registerLogChannel(id, label, file, this.fileService, this.logService);
        this._register(toDisposable(() => promise.cancel()));
    }
};
LogOutputChannels = __decorate([
    __param(0, IWorkbenchEnvironmentService),
    __param(1, IProductService),
    __param(2, ILogService),
    __param(3, IFileService)
], LogOutputChannels);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(LogOutputChannels, 3 /* LifecyclePhase.Restored */);
