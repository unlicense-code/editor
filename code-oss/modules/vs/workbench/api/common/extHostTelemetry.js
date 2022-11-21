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
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Emitter } from 'vs/base/common/event';
import { ILoggerService } from 'vs/platform/log/common/log';
import { IExtHostInitDataService } from 'vs/workbench/api/common/extHostInitDataService';
import { UIKind } from 'vs/workbench/services/extensions/common/extensionHostProtocol';
import { getRemoteName } from 'vs/platform/remote/common/remoteHosts';
import { cleanData, cleanRemoteAuthority } from 'vs/platform/telemetry/common/telemetryUtils';
import { mixin } from 'vs/base/common/objects';
import { URI } from 'vs/base/common/uri';
let ExtHostTelemetry = class ExtHostTelemetry {
    initData;
    _onDidChangeTelemetryEnabled = new Emitter();
    onDidChangeTelemetryEnabled = this._onDidChangeTelemetryEnabled.event;
    _onDidChangeTelemetryConfiguration = new Emitter();
    onDidChangeTelemetryConfiguration = this._onDidChangeTelemetryConfiguration.event;
    _productConfig = { usage: true, error: true };
    _level = 0 /* TelemetryLevel.NONE */;
    _oldTelemetryEnablement;
    _inLoggingOnlyMode = false;
    _outputLogger;
    _telemetryLoggers = new Map();
    constructor(initData, loggerService) {
        this.initData = initData;
        this._outputLogger = loggerService.createLogger(URI.revive(this.initData.environment.extensionTelemetryLogResource));
        this._outputLogger.info('Below are logs for extension telemetry events sent to the telemetry output channel API once the log level is set to trace.');
        this._outputLogger.info('===========================================================');
    }
    getTelemetryConfiguration() {
        return this._level === 3 /* TelemetryLevel.USAGE */;
    }
    getTelemetryDetails() {
        return {
            isCrashEnabled: this._level >= 1 /* TelemetryLevel.CRASH */,
            isErrorsEnabled: this._productConfig.error ? this._level >= 2 /* TelemetryLevel.ERROR */ : false,
            isUsageEnabled: this._productConfig.usage ? this._level >= 3 /* TelemetryLevel.USAGE */ : false
        };
    }
    instantiateLogger(extension, appender) {
        const telemetryDetails = this.getTelemetryDetails();
        const logger = new ExtHostTelemetryLogger(appender, extension, this._outputLogger, this._inLoggingOnlyMode, this.getBuiltInCommonProperties(extension), { isUsageEnabled: telemetryDetails.isUsageEnabled, isErrorsEnabled: telemetryDetails.isErrorsEnabled });
        this._telemetryLoggers.set(extension.identifier.value, logger);
        return logger.apiTelemetryLogger;
    }
    $initializeTelemetryLevel(level, loggingOnlyMode, productConfig) {
        this._level = level;
        this._inLoggingOnlyMode = loggingOnlyMode;
        this._productConfig = productConfig ?? { usage: true, error: true };
    }
    getBuiltInCommonProperties(extension) {
        const commonProperties = {};
        // TODO @lramos15, does os info like node arch, platform version, etc exist here.
        // Or will first party extensions just mix this in
        commonProperties['common.extname'] = extension.name;
        commonProperties['common.extversion'] = extension.version;
        commonProperties['common.vscodemachineid'] = this.initData.telemetryInfo.machineId;
        commonProperties['common.vscodesessionid'] = this.initData.telemetryInfo.sessionId;
        commonProperties['common.vscodeversion'] = this.initData.version;
        commonProperties['common.isnewappinstall'] = isNewAppInstall(this.initData.telemetryInfo.firstSessionDate);
        commonProperties['common.product'] = this.initData.environment.appHost;
        switch (this.initData.uiKind) {
            case UIKind.Web:
                commonProperties['common.uikind'] = 'web';
                break;
            case UIKind.Desktop:
                commonProperties['common.uikind'] = 'desktop';
                break;
            default:
                commonProperties['common.uikind'] = 'unknown';
        }
        commonProperties['common.remotename'] = getRemoteName(cleanRemoteAuthority(this.initData.remote.authority));
        return commonProperties;
    }
    $onDidChangeTelemetryLevel(level) {
        this._oldTelemetryEnablement = this.getTelemetryConfiguration();
        this._level = level;
        const telemetryDetails = this.getTelemetryDetails();
        // Loop through all loggers and update their level
        this._telemetryLoggers.forEach(logger => {
            logger.updateTelemetryEnablements(telemetryDetails.isUsageEnabled, telemetryDetails.isErrorsEnabled);
        });
        if (this._oldTelemetryEnablement !== this.getTelemetryConfiguration()) {
            this._onDidChangeTelemetryEnabled.fire(this.getTelemetryConfiguration());
        }
        this._onDidChangeTelemetryConfiguration.fire(this.getTelemetryDetails());
    }
    onExtensionError(extension, error) {
        const logger = this._telemetryLoggers.get(extension.value);
        if (!logger) {
            return false;
        }
        logger.logError(error);
        return true;
    }
};
ExtHostTelemetry = __decorate([
    __param(0, IExtHostInitDataService),
    __param(1, ILoggerService)
], ExtHostTelemetry);
export { ExtHostTelemetry };
export class ExtHostTelemetryLogger {
    _extension;
    _logger;
    _inLoggingOnlyMode;
    _commonProperties;
    _appender;
    _onDidChangeEnableStates = new Emitter();
    _telemetryEnablements;
    _apiObject;
    constructor(appender, _extension, _logger, _inLoggingOnlyMode, _commonProperties, telemetryEnablements) {
        this._extension = _extension;
        this._logger = _logger;
        this._inLoggingOnlyMode = _inLoggingOnlyMode;
        this._commonProperties = _commonProperties;
        this._appender = appender;
        this._telemetryEnablements = { isUsageEnabled: telemetryEnablements.isUsageEnabled, isErrorsEnabled: telemetryEnablements.isErrorsEnabled };
    }
    updateTelemetryEnablements(isUsageEnabled, isErrorsEnabled) {
        if (this._apiObject) {
            this._telemetryEnablements = { isUsageEnabled, isErrorsEnabled };
            this._onDidChangeEnableStates.fire(this._apiObject);
        }
    }
    mixInCommonPropsAndCleanData(data) {
        // Some telemetry modules prefer to break properties and measurmements up
        // We mix common properties into the properties tab.
        // TODO @lramos15 should this be up to the implementer and not done here?
        let updatedData = data.properties ?? data;
        // We don't clean measurements since they are just numbers
        updatedData = cleanData(updatedData, []);
        if (this._appender.additionalCommonProperties) {
            updatedData = mixin(updatedData, this._appender.additionalCommonProperties);
        }
        if (!this._appender.ignoreBuiltInCommonProperties) {
            updatedData = mixin(updatedData, this._commonProperties);
        }
        if (data.properties) {
            data.properties = updatedData;
        }
        else {
            data = updatedData;
        }
        return data;
    }
    logEvent(eventName, data) {
        // If it's a built-in extension (vscode publisher) we don't prefix the publisher and only the ext name
        if (this._extension.publisher === 'vscode') {
            eventName = this._extension.name + '/' + eventName;
        }
        else {
            eventName = this._extension.identifier.value + '/' + eventName;
        }
        data = this.mixInCommonPropsAndCleanData(data || {});
        if (!this._inLoggingOnlyMode) {
            this._appender.logEvent(eventName, data);
        }
        this._logger.trace(eventName, data);
    }
    logUsage(eventName, data) {
        if (!this._telemetryEnablements.isUsageEnabled) {
            return;
        }
        this.logEvent(eventName, data);
    }
    logError(eventNameOrException, data) {
        if (!this._telemetryEnablements.isErrorsEnabled) {
            return;
        }
        if (typeof eventNameOrException === 'string') {
            this.logEvent(eventNameOrException, data);
        }
        else {
            // TODO @lramos15, implement cleaning for and logging for this case
            this._appender.logException(eventNameOrException, data);
        }
    }
    get apiTelemetryLogger() {
        if (!this._apiObject) {
            const that = this;
            const obj = {
                logUsage: that.logUsage.bind(that),
                get isUsageEnabled() {
                    return that._telemetryEnablements.isUsageEnabled;
                },
                get isErrorsEnabled() {
                    return that._telemetryEnablements.isErrorsEnabled;
                },
                logError: that.logError.bind(that),
                dispose: that.dispose.bind(that),
                onDidChangeEnableStates: that._onDidChangeEnableStates.event.bind(that)
            };
            this._apiObject = Object.freeze(obj);
        }
        return this._apiObject;
    }
    dispose() {
        if (this._appender?.flush) {
            this._appender.flush();
        }
    }
}
export function isNewAppInstall(firstSessionDate) {
    const installAge = Date.now() - new Date(firstSessionDate).getTime();
    return isNaN(installAge) ? false : installAge < 1000 * 60 * 60 * 24; // install age is less than a day
}
export const IExtHostTelemetry = createDecorator('IExtHostTelemetry');
