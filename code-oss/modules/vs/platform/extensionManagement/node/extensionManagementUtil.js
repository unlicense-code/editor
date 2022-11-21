/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { buffer } from 'vs/base/node/zip';
import { localize } from 'vs/nls';
export function getManifest(vsix) {
    return buffer(vsix, 'extension/package.json')
        .then(buffer => {
        try {
            return JSON.parse(buffer.toString('utf8'));
        }
        catch (err) {
            throw new Error(localize('invalidManifest', "VSIX invalid: package.json is not a JSON file."));
        }
    });
}
