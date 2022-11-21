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
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { refineServiceDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IProductService } from 'vs/platform/product/common/productService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { TelemetryService } from 'vs/platform/telemetry/common/telemetryService';
import { NullTelemetryServiceShape } from 'vs/platform/telemetry/common/telemetryUtils';
let ServerTelemetryService = class ServerTelemetryService extends TelemetryService {
    // Because we cannot read the workspace config on the remote site
    // the ServerTelemetryService is responsible for knowing its telemetry level
    // this is done through IPC calls and initial value injections
    _injectedTelemetryLevel;
    constructor(config, injectedTelemetryLevel, _configurationService, _productService) {
        super(config, _configurationService, _productService);
        this._injectedTelemetryLevel = injectedTelemetryLevel;
    }
    publicLog(eventName, data) {
        if (this._injectedTelemetryLevel < 3 /* TelemetryLevel.USAGE */) {
            return Promise.resolve(undefined);
        }
        return super.publicLog(eventName, data);
    }
    publicLog2(eventName, data) {
        return this.publicLog(eventName, data);
    }
    publicLogError(errorEventName, data) {
        if (this._injectedTelemetryLevel < 2 /* TelemetryLevel.ERROR */) {
            return Promise.resolve(undefined);
        }
        return super.publicLogError(errorEventName, data);
    }
    publicLogError2(eventName, data) {
        return this.publicLogError(eventName, data);
    }
    async updateInjectedTelemetryLevel(telemetryLevel) {
        if (telemetryLevel === undefined) {
            this._injectedTelemetryLevel = 0 /* TelemetryLevel.NONE */;
            throw new Error('Telemetry level cannot be undefined. This will cause infinite looping!');
        }
        // We always take the most restrictive level because we don't want multiple clients to connect and send data when one client does not consent
        this._injectedTelemetryLevel = this._injectedTelemetryLevel ? Math.min(this._injectedTelemetryLevel, telemetryLevel) : telemetryLevel;
        if (this._injectedTelemetryLevel === 0 /* TelemetryLevel.NONE */) {
            this.dispose();
        }
    }
};
ServerTelemetryService = __decorate([
    __param(2, IConfigurationService),
    __param(3, IProductService)
], ServerTelemetryService);
export { ServerTelemetryService };
export const ServerNullTelemetryService = new class extends NullTelemetryServiceShape {
    async updateInjectedTelemetryLevel() { return; } // No-op, telemetry is already disabled
};
export const IServerTelemetryService = refineServiceDecorator(ITelemetryService);
