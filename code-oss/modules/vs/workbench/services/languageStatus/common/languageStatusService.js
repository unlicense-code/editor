/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { compare } from 'vs/base/common/strings';
import { LanguageFeatureRegistry } from 'vs/editor/common/languageFeatureRegistry';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const ILanguageStatusService = createDecorator('ILanguageStatusService');
class LanguageStatusServiceImpl {
    _provider = new LanguageFeatureRegistry();
    onDidChange = this._provider.onDidChange;
    addStatus(status) {
        return this._provider.register(status.selector, status);
    }
    getLanguageStatus(model) {
        return this._provider.ordered(model).sort((a, b) => {
            let res = b.severity - a.severity;
            if (res === 0) {
                res = compare(a.source, b.source);
            }
            if (res === 0) {
                res = compare(a.id, b.id);
            }
            return res;
        });
    }
}
registerSingleton(ILanguageStatusService, LanguageStatusServiceImpl, 1 /* InstantiationType.Delayed */);
