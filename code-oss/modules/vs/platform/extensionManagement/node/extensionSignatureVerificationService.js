/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const IExtensionSignatureVerificationService = createDecorator('IExtensionSignatureVerificationService');
export class ExtensionSignatureVerificationService {
    moduleLoadingPromise;
    vsceSign() {
        if (!this.moduleLoadingPromise) {
            this.moduleLoadingPromise = new Promise((resolve, reject) => require(['node-vsce-sign'], async (obj) => {
                const instance = obj;
                return resolve(instance);
            }, reject));
        }
        return this.moduleLoadingPromise;
    }
    async verify(vsixFilePath, signatureArchiveFilePath) {
        let module;
        try {
            module = await this.vsceSign();
        }
        catch (error) {
            return false;
        }
        return module.verify(vsixFilePath, signatureArchiveFilePath);
    }
}
