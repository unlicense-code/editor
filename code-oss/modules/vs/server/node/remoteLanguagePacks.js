/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as fs from 'fs';
import { FileAccess } from 'vs/base/common/network';
import * as path from 'vs/base/common/path';
import * as lp from 'vs/base/node/languagePacks';
import product from 'vs/platform/product/common/product';
const metaData = path.join(FileAccess.asFileUri('').fsPath, 'nls.metadata.json');
const _cache = new Map();
function exists(file) {
    return new Promise(c => fs.exists(file, c));
}
export function getNLSConfiguration(language, userDataPath) {
    return exists(metaData).then((fileExists) => {
        if (!fileExists || !product.commit) {
            // console.log(`==> MetaData or commit unknown. Using default language.`);
            return Promise.resolve({ locale: 'en', availableLanguages: {} });
        }
        const key = `${language}||${userDataPath}`;
        let result = _cache.get(key);
        if (!result) {
            result = lp.getNLSConfiguration(product.commit, userDataPath, metaData, language).then(value => {
                if (InternalNLSConfiguration.is(value)) {
                    value._languagePackSupport = true;
                }
                return value;
            });
            _cache.set(key, result);
        }
        return result;
    });
}
export var InternalNLSConfiguration;
(function (InternalNLSConfiguration) {
    function is(value) {
        const candidate = value;
        return candidate && typeof candidate._languagePackId === 'string';
    }
    InternalNLSConfiguration.is = is;
})(InternalNLSConfiguration || (InternalNLSConfiguration = {}));
