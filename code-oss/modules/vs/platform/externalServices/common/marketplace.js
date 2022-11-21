/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { getServiceMachineId } from 'vs/platform/externalServices/common/serviceMachineId';
import { getTelemetryLevel, supportsTelemetry } from 'vs/platform/telemetry/common/telemetryUtils';
export async function resolveMarketplaceHeaders(version, productService, environmentService, configurationService, fileService, storageService, telemetryService) {
    const headers = {
        'X-Market-Client-Id': `VSCode ${version}`,
        'User-Agent': `VSCode ${version} (${productService.nameShort})`
    };
    if (supportsTelemetry(productService, environmentService) && getTelemetryLevel(configurationService) === 3 /* TelemetryLevel.USAGE */) {
        const uuid = await getServiceMachineId(environmentService, fileService, storageService);
        const { machineId } = await telemetryService.getTelemetryInfo();
        headers['X-Market-User-Id'] = uuid;
        // Send machineId as VSCode-SessionId so we can correlate telemetry events across different services
        headers['VSCode-SessionId'] = machineId;
    }
    return headers;
}
