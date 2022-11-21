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
import { DisposableStore } from 'vs/base/common/lifecycle';
import { mixin } from 'vs/base/common/objects';
import { MutableObservableValue } from 'vs/base/common/observableValue';
import { isWeb } from 'vs/base/common/platform';
import { escapeRegExpCharacters } from 'vs/base/common/strings';
import { localize } from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Extensions } from 'vs/platform/configuration/common/configurationRegistry';
import product from 'vs/platform/product/common/product';
import { IProductService } from 'vs/platform/product/common/productService';
import { Registry } from 'vs/platform/registry/common/platform';
import { TELEMETRY_OLD_SETTING_ID, TELEMETRY_SECTION_ID, TELEMETRY_SETTING_ID } from 'vs/platform/telemetry/common/telemetry';
import { cleanData, getTelemetryLevel } from 'vs/platform/telemetry/common/telemetryUtils';
let TelemetryService = class TelemetryService {
    _configurationService;
    _productService;
    static IDLE_START_EVENT_NAME = 'UserIdleStart';
    static IDLE_STOP_EVENT_NAME = 'UserIdleStop';
    _appenders;
    _commonProperties;
    _experimentProperties = {};
    _piiPaths;
    _sendErrorTelemetry;
    telemetryLevel = new MutableObservableValue(3 /* TelemetryLevel.USAGE */);
    _disposables = new DisposableStore();
    _cleanupPatterns = [];
    constructor(config, _configurationService, _productService) {
        this._configurationService = _configurationService;
        this._productService = _productService;
        this._appenders = config.appenders;
        this._commonProperties = config.commonProperties || Promise.resolve({});
        this._piiPaths = config.piiPaths || [];
        this._sendErrorTelemetry = !!config.sendErrorTelemetry;
        // static cleanup pattern for: `vscode-file:///DANGEROUS/PATH/resources/app/Useful/Information`
        this._cleanupPatterns = [/(vscode-)?file:\/\/\/.*?\/resources\/app\//gi];
        for (const piiPath of this._piiPaths) {
            this._cleanupPatterns.push(new RegExp(escapeRegExpCharacters(piiPath), 'gi'));
            if (piiPath.indexOf('\\') >= 0) {
                this._cleanupPatterns.push(new RegExp(escapeRegExpCharacters(piiPath.replace(/\\/g, '/')), 'gi'));
            }
        }
        this._updateTelemetryLevel();
        this._configurationService.onDidChangeConfiguration(this._updateTelemetryLevel, this, this._disposables);
    }
    setExperimentProperty(name, value) {
        this._experimentProperties[name] = value;
    }
    _updateTelemetryLevel() {
        let level = getTelemetryLevel(this._configurationService);
        const collectableTelemetry = this._productService.enabledTelemetryLevels;
        // Also ensure that error telemetry is respecting the product configuration for collectable telemetry
        if (collectableTelemetry) {
            this._sendErrorTelemetry = this.sendErrorTelemetry ? collectableTelemetry.error : false;
            // Make sure the telemetry level from the service is the minimum of the config and product
            const maxCollectableTelemetryLevel = collectableTelemetry.usage ? 3 /* TelemetryLevel.USAGE */ : collectableTelemetry.error ? 2 /* TelemetryLevel.ERROR */ : 0 /* TelemetryLevel.NONE */;
            level = Math.min(level, maxCollectableTelemetryLevel);
        }
        this.telemetryLevel.value = level;
    }
    get sendErrorTelemetry() {
        return this._sendErrorTelemetry;
    }
    async getTelemetryInfo() {
        const values = await this._commonProperties;
        // well known properties
        const sessionId = values['sessionID'];
        const machineId = values['common.machineId'];
        const firstSessionDate = values['common.firstSessionDate'];
        const msftInternal = values['common.msftInternal'];
        return { sessionId, machineId, firstSessionDate, msftInternal };
    }
    dispose() {
        this._disposables.dispose();
    }
    _log(eventName, eventLevel, data) {
        // don't send events when the user is optout
        if (this.telemetryLevel.value < eventLevel) {
            return Promise.resolve(undefined);
        }
        return this._commonProperties.then(values => {
            // add experiment properties
            data = mixin(data, this._experimentProperties);
            // remove all PII from data
            data = cleanData(data, this._cleanupPatterns);
            // add common properties
            data = mixin(data, values);
            // Log to the appenders of sufficient level
            this._appenders.forEach(a => a.log(eventName, data));
        }, err => {
            // unsure what to do now...
            console.error(err);
        });
    }
    publicLog(eventName, data) {
        return this._log(eventName, 3 /* TelemetryLevel.USAGE */, data);
    }
    publicLog2(eventName, data) {
        return this.publicLog(eventName, data);
    }
    publicLogError(errorEventName, data) {
        if (!this._sendErrorTelemetry) {
            return Promise.resolve(undefined);
        }
        // Send error event and anonymize paths
        return this._log(errorEventName, 2 /* TelemetryLevel.ERROR */, data);
    }
    publicLogError2(eventName, data) {
        return this.publicLogError(eventName, data);
    }
};
TelemetryService = __decorate([
    __param(1, IConfigurationService),
    __param(2, IProductService)
], TelemetryService);
export { TelemetryService };
function getTelemetryLevelSettingDescription() {
    const telemetryText = localize('telemetry.telemetryLevelMd', "Controls {0} telemetry, first-party extension telemetry, and participating third-party extension telemetry. Some third party extensions might not respect this setting. Consult the specific extension's documentation to be sure. Telemetry helps us better understand how {0} is performing, where improvements need to be made, and how features are being used.", product.nameLong);
    const externalLinksStatement = !product.privacyStatementUrl ?
        localize("telemetry.docsStatement", "Read more about the [data we collect]({0}).", 'https://aka.ms/vscode-telemetry') :
        localize("telemetry.docsAndPrivacyStatement", "Read more about the [data we collect]({0}) and our [privacy statement]({1}).", 'https://aka.ms/vscode-telemetry', product.privacyStatementUrl);
    const restartString = !isWeb ? localize('telemetry.restart', 'A full restart of the application is necessary for crash reporting changes to take effect.') : '';
    const crashReportsHeader = localize('telemetry.crashReports', "Crash Reports");
    const errorsHeader = localize('telemetry.errors', "Error Telemetry");
    const usageHeader = localize('telemetry.usage', "Usage Data");
    const telemetryTableDescription = localize('telemetry.telemetryLevel.tableDescription', "The following table outlines the data sent with each setting:");
    const telemetryTable = `
|       | ${crashReportsHeader} | ${errorsHeader} | ${usageHeader} |
|:------|:---------------------:|:---------------:|:--------------:|
| all   |            ✓          |        ✓        |        ✓       |
| error |            ✓          |        ✓        |        -       |
| crash |            ✓          |        -        |        -       |
| off   |            -          |        -        |        -       |
`;
    const deprecatedSettingNote = localize('telemetry.telemetryLevel.deprecated', "****Note:*** If this setting is 'off', no telemetry will be sent regardless of other telemetry settings. If this setting is set to anything except 'off' and telemetry is disabled with deprecated settings, no telemetry will be sent.*");
    const telemetryDescription = `
${telemetryText} ${externalLinksStatement} ${restartString}

&nbsp;

${telemetryTableDescription}
${telemetryTable}

&nbsp;

${deprecatedSettingNote}
`;
    return telemetryDescription;
}
Registry.as(Extensions.Configuration).registerConfiguration({
    'id': TELEMETRY_SECTION_ID,
    'order': 110,
    'type': 'object',
    'title': localize('telemetryConfigurationTitle', "Telemetry"),
    'properties': {
        [TELEMETRY_SETTING_ID]: {
            'type': 'string',
            'enum': ["all" /* TelemetryConfiguration.ON */, "error" /* TelemetryConfiguration.ERROR */, "crash" /* TelemetryConfiguration.CRASH */, "off" /* TelemetryConfiguration.OFF */],
            'enumDescriptions': [
                localize('telemetry.telemetryLevel.default', "Sends usage data, errors, and crash reports."),
                localize('telemetry.telemetryLevel.error', "Sends general error telemetry and crash reports."),
                localize('telemetry.telemetryLevel.crash', "Sends OS level crash reports."),
                localize('telemetry.telemetryLevel.off', "Disables all product telemetry.")
            ],
            'markdownDescription': getTelemetryLevelSettingDescription(),
            'default': "all" /* TelemetryConfiguration.ON */,
            'restricted': true,
            'scope': 1 /* ConfigurationScope.APPLICATION */,
            'tags': ['usesOnlineServices', 'telemetry']
        }
    }
});
// Deprecated telemetry setting
Registry.as(Extensions.Configuration).registerConfiguration({
    'id': TELEMETRY_SECTION_ID,
    'order': 110,
    'type': 'object',
    'title': localize('telemetryConfigurationTitle', "Telemetry"),
    'properties': {
        [TELEMETRY_OLD_SETTING_ID]: {
            'type': 'boolean',
            'markdownDescription': !product.privacyStatementUrl ?
                localize('telemetry.enableTelemetry', "Enable diagnostic data to be collected. This helps us to better understand how {0} is performing and where improvements need to be made.", product.nameLong) :
                localize('telemetry.enableTelemetryMd', "Enable diagnostic data to be collected. This helps us to better understand how {0} is performing and where improvements need to be made. [Read more]({1}) about what we collect and our privacy statement.", product.nameLong, product.privacyStatementUrl),
            'default': true,
            'restricted': true,
            'markdownDeprecationMessage': localize('enableTelemetryDeprecated', "If this setting is false, no telemetry will be sent regardless of the new setting's value. Deprecated in favor of the {0} setting.", `\`#${TELEMETRY_SETTING_ID}#\``),
            'scope': 1 /* ConfigurationScope.APPLICATION */,
            'tags': ['usesOnlineServices', 'telemetry']
        }
    }
});
