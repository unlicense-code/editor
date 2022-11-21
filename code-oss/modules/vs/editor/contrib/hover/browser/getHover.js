/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { AsyncIterableObject } from 'vs/base/common/async';
import { CancellationToken } from 'vs/base/common/cancellation';
import { onUnexpectedExternalError } from 'vs/base/common/errors';
import { registerModelAndPositionCommand } from 'vs/editor/browser/editorExtensions';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
export class HoverProviderResult {
    provider;
    hover;
    ordinal;
    constructor(provider, hover, ordinal) {
        this.provider = provider;
        this.hover = hover;
        this.ordinal = ordinal;
    }
}
async function executeProvider(provider, ordinal, model, position, token) {
    try {
        const result = await Promise.resolve(provider.provideHover(model, position, token));
        if (result && isValid(result)) {
            return new HoverProviderResult(provider, result, ordinal);
        }
    }
    catch (err) {
        onUnexpectedExternalError(err);
    }
    return undefined;
}
export function getHover(registry, model, position, token) {
    const providers = registry.ordered(model);
    const promises = providers.map((provider, index) => executeProvider(provider, index, model, position, token));
    return AsyncIterableObject.fromPromises(promises).coalesce();
}
export function getHoverPromise(registry, model, position, token) {
    return getHover(registry, model, position, token).map(item => item.hover).toPromise();
}
registerModelAndPositionCommand('_executeHoverProvider', (accessor, model, position) => {
    const languageFeaturesService = accessor.get(ILanguageFeaturesService);
    return getHoverPromise(languageFeaturesService.hoverProvider, model, position, CancellationToken.None);
});
function isValid(result) {
    const hasRange = (typeof result.range !== 'undefined');
    const hasHtmlContent = typeof result.contents !== 'undefined' && result.contents && result.contents.length > 0;
    return hasRange && hasHtmlContent;
}
