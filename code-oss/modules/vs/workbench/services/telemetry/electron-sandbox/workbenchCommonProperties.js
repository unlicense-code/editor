/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { resolveCommonProperties } from 'vs/platform/telemetry/common/commonProperties';
import { firstSessionDateStorageKey, lastSessionDateStorageKey } from 'vs/platform/telemetry/common/telemetry';
import { cleanRemoteAuthority } from 'vs/platform/telemetry/common/telemetryUtils';
import { process } from 'vs/base/parts/sandbox/electron-sandbox/globals';
export async function resolveWorkbenchCommonProperties(storageService, fileService, release, hostname, commit, version, machineId, isInternalTelemetry, installSourcePath, remoteAuthority) {
    const result = await resolveCommonProperties(fileService, release, hostname, process.arch, commit, version, machineId, isInternalTelemetry, installSourcePath);
    const firstSessionDate = storageService.get(firstSessionDateStorageKey, -1 /* StorageScope.APPLICATION */);
    const lastSessionDate = storageService.get(lastSessionDateStorageKey, -1 /* StorageScope.APPLICATION */);
    // __GDPR__COMMON__ "common.version.shell" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
    result['common.version.shell'] = process.versions['electron'];
    // __GDPR__COMMON__ "common.version.renderer" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
    result['common.version.renderer'] = process.versions['chrome'];
    // __GDPR__COMMON__ "common.firstSessionDate" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
    result['common.firstSessionDate'] = firstSessionDate;
    // __GDPR__COMMON__ "common.lastSessionDate" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
    result['common.lastSessionDate'] = lastSessionDate || '';
    // __GDPR__COMMON__ "common.isNewSession" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
    result['common.isNewSession'] = !lastSessionDate ? '1' : '0';
    // __GDPR__COMMON__ "common.remoteAuthority" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
    result['common.remoteAuthority'] = cleanRemoteAuthority(remoteAuthority);
    // __GDPR__COMMON__ "common.sandboxed" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
    result['common.sandboxed'] = process.sandboxed ? '1' : '0'; // TODO@bpasero remove this property when sandbox is on
    // __GDPR__COMMON__ "common.cli" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
    result['common.cli'] = !!process.env['VSCODE_CLI'];
    return result;
}