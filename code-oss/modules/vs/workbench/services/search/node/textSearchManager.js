/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { toCanonicalName } from 'vs/workbench/services/textfile/common/encoding';
import * as pfs from 'vs/base/node/pfs';
import { TextSearchManager } from 'vs/workbench/services/search/common/textSearchManager';
export class NativeTextSearchManager extends TextSearchManager {
    constructor(query, provider, _pfs = pfs, processType = 'searchProcess') {
        super(query, provider, {
            readdir: resource => _pfs.Promises.readdir(resource.fsPath),
            toCanonicalName: name => toCanonicalName(name)
        }, processType);
    }
}
