/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { randomPath } from 'vs/base/common/extpath';
import { join } from 'vs/base/common/path';
import { URI } from 'vs/base/common/uri';
import * as testUtils from 'vs/base/test/common/testUtils';
export function getRandomTestPath(tmpdir, ...segments) {
    return randomPath(join(tmpdir, ...segments));
}
export function getPathFromAmdModule(requirefn, relativePath) {
    return URI.parse(requirefn.toUrl(relativePath)).fsPath;
}
export var flakySuite = testUtils.flakySuite;
