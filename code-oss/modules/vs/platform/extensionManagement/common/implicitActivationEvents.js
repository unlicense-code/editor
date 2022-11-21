/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { onUnexpectedError } from 'vs/base/common/errors';
export class ImplicitActivationEventsImpl {
    _generators = new Map();
    register(extensionPointName, generator) {
        this._generators.set(extensionPointName, generator);
    }
    updateManifest(manifest) {
        if (!Array.isArray(manifest.activationEvents) || !manifest.contributes) {
            return;
        }
        if (typeof manifest.main === 'undefined' && typeof manifest.browser === 'undefined') {
            return;
        }
        for (const extPointName in manifest.contributes) {
            const generator = this._generators.get(extPointName);
            if (!generator) {
                // There's no generator for this extension point
                continue;
            }
            const contrib = manifest.contributes[extPointName];
            const contribArr = Array.isArray(contrib) ? contrib : [contrib];
            try {
                generator(contribArr, manifest.activationEvents);
            }
            catch (err) {
                onUnexpectedError(err);
            }
        }
    }
}
export const ImplicitActivationEvents = new ImplicitActivationEventsImpl();
