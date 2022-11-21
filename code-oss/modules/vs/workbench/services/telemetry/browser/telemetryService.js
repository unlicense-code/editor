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
import { Disposable } from 'vs/base/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ILoggerService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { OneDataSystemWebAppender } from 'vs/platform/telemetry/browser/1dsAppender';
import { ITelemetryService, TELEMETRY_SETTING_ID } from 'vs/platform/telemetry/common/telemetry';
import { TelemetryLogAppender } from 'vs/platform/telemetry/common/telemetryLogAppender';
import { TelemetryService as BaseTelemetryService } from 'vs/platform/telemetry/common/telemetryService';
import { getTelemetryLevel, isInternalTelemetry, NullTelemetryService, supportsTelemetry } from 'vs/platform/telemetry/common/telemetryUtils';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { resolveWorkbenchCommonProperties } from 'vs/workbench/services/telemetry/browser/workbenchCommonProperties';
let TelemetryService = class TelemetryService extends Disposable {
    impl = NullTelemetryService;
    sendErrorTelemetry = true;
    constructor(environmentService, loggerService, configurationService, storageService, productService, remoteAgentService) {
        super();
        this.impl = this.initializeService(environmentService, loggerService, configurationService, storageService, productService, remoteAgentService);
        // When the level changes it could change from off to on and we want to make sure telemetry is properly intialized
        this._register(configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(TELEMETRY_SETTING_ID)) {
                this.impl = this.initializeService(environmentService, loggerService, configurationService, storageService, productService, remoteAgentService);
            }
        }));
    }
    /**
     * Initializes the telemetry service to be a full fledged service.
     * This is only done once and only when telemetry is enabled as this will also ping the endpoint to
     * ensure its not adblocked and we can send telemetry
     */
    initializeService(environmentService, loggerService, configurationService, storageService, productService, remoteAgentService) {
        const telemetrySupported = supportsTelemetry(productService, environmentService) && productService.aiConfig?.ariaKey;
        if (telemetrySupported && getTelemetryLevel(configurationService) !== 0 /* TelemetryLevel.NONE */ && this.impl === NullTelemetryService) {
            // If remote server is present send telemetry through that, else use the client side appender
            const appenders = [];
            const isInternal = isInternalTelemetry(productService, configurationService);
            const telemetryProvider = remoteAgentService.getConnection() !== null ? { log: remoteAgentService.logTelemetry.bind(remoteAgentService), flush: remoteAgentService.flushTelemetry.bind(remoteAgentService) } : new OneDataSystemWebAppender(isInternal, 'monacoworkbench', null, productService.aiConfig?.ariaKey);
            appenders.push(telemetryProvider);
            appenders.push(new TelemetryLogAppender(loggerService, environmentService));
            const config = {
                appenders,
                commonProperties: resolveWorkbenchCommonProperties(storageService, productService.commit, productService.version, isInternal, environmentService.remoteAuthority, productService.embedderIdentifier, productService.removeTelemetryMachineId, environmentService.options && environmentService.options.resolveCommonTelemetryProperties),
                sendErrorTelemetry: this.sendErrorTelemetry,
            };
            return this._register(new BaseTelemetryService(config, configurationService, productService));
        }
        return this.impl;
    }
    setExperimentProperty(name, value) {
        return this.impl.setExperimentProperty(name, value);
    }
    get telemetryLevel() {
        return this.impl.telemetryLevel;
    }
    publicLog(eventName, data) {
        return this.impl.publicLog(eventName, data);
    }
    publicLog2(eventName, data) {
        return this.publicLog(eventName, data);
    }
    publicLogError(errorEventName, data) {
        return this.impl.publicLog(errorEventName, data);
    }
    publicLogError2(eventName, data) {
        return this.publicLogError(eventName, data);
    }
    getTelemetryInfo() {
        return this.impl.getTelemetryInfo();
    }
};
TelemetryService = __decorate([
    __param(0, IBrowserWorkbenchEnvironmentService),
    __param(1, ILoggerService),
    __param(2, IConfigurationService),
    __param(3, IStorageService),
    __param(4, IProductService),
    __param(5, IRemoteAgentService)
], TelemetryService);
export { TelemetryService };
registerSingleton(ITelemetryService, TelemetryService, 1 /* InstantiationType.Delayed */);
