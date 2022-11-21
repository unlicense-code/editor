/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { IIntegrityService } from 'vs/workbench/services/integrity/common/integrity';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
export class IntegrityService {
    async isPure() {
        return { isPure: true, proof: [] };
    }
}
registerSingleton(IIntegrityService, IntegrityService, 1 /* InstantiationType.Delayed */);
