/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { URI } from 'vs/base/common/uri';
import { MainContext } from 'vs/workbench/api/common/extHost.protocol';
export class ExtHostDialogs {
    _proxy;
    constructor(mainContext) {
        this._proxy = mainContext.getProxy(MainContext.MainThreadDialogs);
    }
    showOpenDialog(options) {
        return this._proxy.$showOpenDialog(options).then(filepaths => {
            return filepaths ? filepaths.map(p => URI.revive(p)) : undefined;
        });
    }
    showSaveDialog(options) {
        return this._proxy.$showSaveDialog(options).then(filepath => {
            return filepath ? URI.revive(filepath) : undefined;
        });
    }
}
