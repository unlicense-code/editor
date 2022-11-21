/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CancellationToken } from 'vs/base/common/cancellation';
import { illegalArgument } from 'vs/base/common/errors';
import { URI } from 'vs/base/common/uri';
import { Range } from 'vs/editor/common/core/range';
import { IModelService } from 'vs/editor/common/services/model';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
export function getColors(registry, model, token) {
    const colors = [];
    const providers = registry.ordered(model).reverse();
    const promises = providers.map(provider => Promise.resolve(provider.provideDocumentColors(model, token)).then(result => {
        if (Array.isArray(result)) {
            for (const colorInfo of result) {
                colors.push({ colorInfo, provider });
            }
        }
    }));
    return Promise.all(promises).then(() => colors);
}
export function getColorPresentations(model, colorInfo, provider, token) {
    return Promise.resolve(provider.provideColorPresentations(model, colorInfo, token));
}
CommandsRegistry.registerCommand('_executeDocumentColorProvider', function (accessor, ...args) {
    const [resource] = args;
    if (!(resource instanceof URI)) {
        throw illegalArgument();
    }
    const { colorProvider: colorProviderRegistry } = accessor.get(ILanguageFeaturesService);
    const model = accessor.get(IModelService).getModel(resource);
    if (!model) {
        throw illegalArgument();
    }
    const rawCIs = [];
    const providers = colorProviderRegistry.ordered(model).reverse();
    const promises = providers.map(provider => Promise.resolve(provider.provideDocumentColors(model, CancellationToken.None)).then(result => {
        if (Array.isArray(result)) {
            for (const ci of result) {
                rawCIs.push({ range: ci.range, color: [ci.color.red, ci.color.green, ci.color.blue, ci.color.alpha] });
            }
        }
    }));
    return Promise.all(promises).then(() => rawCIs);
});
CommandsRegistry.registerCommand('_executeColorPresentationProvider', function (accessor, ...args) {
    const [color, context] = args;
    const { uri, range } = context;
    if (!(uri instanceof URI) || !Array.isArray(color) || color.length !== 4 || !Range.isIRange(range)) {
        throw illegalArgument();
    }
    const [red, green, blue, alpha] = color;
    const { colorProvider: colorProviderRegistry } = accessor.get(ILanguageFeaturesService);
    const model = accessor.get(IModelService).getModel(uri);
    if (!model) {
        throw illegalArgument();
    }
    const colorInfo = {
        range,
        color: { red, green, blue, alpha }
    };
    const presentations = [];
    const providers = colorProviderRegistry.ordered(model).reverse();
    const promises = providers.map(provider => Promise.resolve(provider.provideColorPresentations(model, colorInfo, CancellationToken.None)).then(result => {
        if (Array.isArray(result)) {
            presentations.push(...result);
        }
    }));
    return Promise.all(promises).then(() => presentations);
});
