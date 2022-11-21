/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const ITelemetryService = createDecorator('telemetryService');
export const ICustomEndpointTelemetryService = createDecorator('customEndpointTelemetryService');
// Keys
export const currentSessionDateStorageKey = 'telemetry.currentSessionDate';
export const firstSessionDateStorageKey = 'telemetry.firstSessionDate';
export const lastSessionDateStorageKey = 'telemetry.lastSessionDate';
export const machineIdKey = 'telemetry.machineId';
// Configuration Keys
export const TELEMETRY_SECTION_ID = 'telemetry';
export const TELEMETRY_SETTING_ID = 'telemetry.telemetryLevel';
export const TELEMETRY_OLD_SETTING_ID = 'telemetry.enableTelemetry';
export var TelemetryLevel;
(function (TelemetryLevel) {
    TelemetryLevel[TelemetryLevel["NONE"] = 0] = "NONE";
    TelemetryLevel[TelemetryLevel["CRASH"] = 1] = "CRASH";
    TelemetryLevel[TelemetryLevel["ERROR"] = 2] = "ERROR";
    TelemetryLevel[TelemetryLevel["USAGE"] = 3] = "USAGE";
})(TelemetryLevel || (TelemetryLevel = {}));
export var TelemetryConfiguration;
(function (TelemetryConfiguration) {
    TelemetryConfiguration["OFF"] = "off";
    TelemetryConfiguration["CRASH"] = "crash";
    TelemetryConfiguration["ERROR"] = "error";
    TelemetryConfiguration["ON"] = "all";
})(TelemetryConfiguration || (TelemetryConfiguration = {}));
