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
import { FileAccess } from 'vs/base/common/network';
import { Client as TelemetryClient } from 'vs/base/parts/ipc/node/ipc.cp';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { ILoggerService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { TelemetryAppenderClient } from 'vs/platform/telemetry/common/telemetryIpc';
import { TelemetryLogAppender } from 'vs/platform/telemetry/common/telemetryLogAppender';
import { TelemetryService } from 'vs/platform/telemetry/common/telemetryService';
let CustomEndpointTelemetryService = class CustomEndpointTelemetryService {
    configurationService;
    telemetryService;
    loggerService;
    environmentService;
    productService;
    customTelemetryServices = new Map();
    constructor(configurationService, telemetryService, loggerService, environmentService, productService) {
        this.configurationService = configurationService;
        this.telemetryService = telemetryService;
        this.loggerService = loggerService;
        this.environmentService = environmentService;
        this.productService = productService;
    }
    async getCustomTelemetryService(endpoint) {
        if (!this.customTelemetryServices.has(endpoint.id)) {
            const { machineId, sessionId } = await this.telemetryService.getTelemetryInfo();
            const telemetryInfo = Object.create(null);
            telemetryInfo['common.vscodemachineid'] = machineId;
            telemetryInfo['common.vscodesessionid'] = sessionId;
            const args = [endpoint.id, JSON.stringify(telemetryInfo), endpoint.aiKey];
            const client = new TelemetryClient(FileAccess.asFileUri('bootstrap-fork').fsPath, {
                serverName: 'Debug Telemetry',
                timeout: 1000 * 60 * 5,
                args,
                env: {
                    ELECTRON_RUN_AS_NODE: 1,
                    VSCODE_PIPE_LOGGING: 'true',
                    VSCODE_AMD_ENTRYPOINT: 'vs/workbench/contrib/debug/node/telemetryApp'
                }
            });
            const channel = client.getChannel('telemetryAppender');
            const appenders = [
                new TelemetryAppenderClient(channel),
                new TelemetryLogAppender(this.loggerService, this.environmentService, `[${endpoint.id}] `),
            ];
            this.customTelemetryServices.set(endpoint.id, new TelemetryService({
                appenders,
                sendErrorTelemetry: endpoint.sendErrorTelemetry
            }, this.configurationService, this.productService));
        }
        return this.customTelemetryServices.get(endpoint.id);
    }
    async publicLog(telemetryEndpoint, eventName, data) {
        const customTelemetryService = await this.getCustomTelemetryService(telemetryEndpoint);
        await customTelemetryService.publicLog(eventName, data);
    }
    async publicLogError(telemetryEndpoint, errorEventName, data) {
        const customTelemetryService = await this.getCustomTelemetryService(telemetryEndpoint);
        await customTelemetryService.publicLogError(errorEventName, data);
    }
};
CustomEndpointTelemetryService = __decorate([
    __param(0, IConfigurationService),
    __param(1, ITelemetryService),
    __param(2, ILoggerService),
    __param(3, IEnvironmentService),
    __param(4, IProductService)
], CustomEndpointTelemetryService);
export { CustomEndpointTelemetryService };
