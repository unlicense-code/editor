/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IElevatedFileService } from 'vs/workbench/services/files/common/elevatedFileService';
export class BrowserElevatedFileService {
    _serviceBrand;
    isSupported(resource) {
        // Saving elevated is currently not supported in web for as
        // long as we have no generic support from the file service
        // (https://github.com/microsoft/vscode/issues/48659)
        return false;
    }
    async writeFileElevated(resource, value, options) {
        throw new Error('Unsupported');
    }
}
registerSingleton(IElevatedFileService, BrowserElevatedFileService, 1 /* InstantiationType.Delayed */);
