/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Range } from 'vs/editor/common/core/range';
import { CancellationToken } from 'vs/base/common/cancellation';
import { LanguageFeatureRegistry } from 'vs/editor/common/languageFeatureRegistry';
import { URI } from 'vs/base/common/uri';
import { Position } from 'vs/editor/common/core/position';
import { isNonEmptyArray } from 'vs/base/common/arrays';
import { onUnexpectedExternalError } from 'vs/base/common/errors';
import { RefCountedDisposable } from 'vs/base/common/lifecycle';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { assertType } from 'vs/base/common/types';
import { IModelService } from 'vs/editor/common/services/model';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
export var TypeHierarchyDirection;
(function (TypeHierarchyDirection) {
    TypeHierarchyDirection["Subtypes"] = "subtypes";
    TypeHierarchyDirection["Supertypes"] = "supertypes";
})(TypeHierarchyDirection || (TypeHierarchyDirection = {}));
export const TypeHierarchyProviderRegistry = new LanguageFeatureRegistry();
export class TypeHierarchyModel {
    id;
    provider;
    roots;
    ref;
    static async create(model, position, token) {
        const [provider] = TypeHierarchyProviderRegistry.ordered(model);
        if (!provider) {
            return undefined;
        }
        const session = await provider.prepareTypeHierarchy(model, position, token);
        if (!session) {
            return undefined;
        }
        return new TypeHierarchyModel(session.roots.reduce((p, c) => p + c._sessionId, ''), provider, session.roots, new RefCountedDisposable(session));
    }
    root;
    constructor(id, provider, roots, ref) {
        this.id = id;
        this.provider = provider;
        this.roots = roots;
        this.ref = ref;
        this.root = roots[0];
    }
    dispose() {
        this.ref.release();
    }
    fork(item) {
        const that = this;
        return new class extends TypeHierarchyModel {
            constructor() {
                super(that.id, that.provider, [item], that.ref.acquire());
            }
        };
    }
    async provideSupertypes(item, token) {
        try {
            const result = await this.provider.provideSupertypes(item, token);
            if (isNonEmptyArray(result)) {
                return result;
            }
        }
        catch (e) {
            onUnexpectedExternalError(e);
        }
        return [];
    }
    async provideSubtypes(item, token) {
        try {
            const result = await this.provider.provideSubtypes(item, token);
            if (isNonEmptyArray(result)) {
                return result;
            }
        }
        catch (e) {
            onUnexpectedExternalError(e);
        }
        return [];
    }
}
// --- API command support
const _models = new Map();
CommandsRegistry.registerCommand('_executePrepareTypeHierarchy', async (accessor, ...args) => {
    const [resource, position] = args;
    assertType(URI.isUri(resource));
    assertType(Position.isIPosition(position));
    const modelService = accessor.get(IModelService);
    let textModel = modelService.getModel(resource);
    let textModelReference;
    if (!textModel) {
        const textModelService = accessor.get(ITextModelService);
        const result = await textModelService.createModelReference(resource);
        textModel = result.object.textEditorModel;
        textModelReference = result;
    }
    try {
        const model = await TypeHierarchyModel.create(textModel, position, CancellationToken.None);
        if (!model) {
            return [];
        }
        _models.set(model.id, model);
        _models.forEach((value, key, map) => {
            if (map.size > 10) {
                value.dispose();
                _models.delete(key);
            }
        });
        return [model.root];
    }
    finally {
        textModelReference?.dispose();
    }
});
function isTypeHierarchyItemDto(obj) {
    const item = obj;
    return typeof obj === 'object'
        && typeof item.name === 'string'
        && typeof item.kind === 'number'
        && URI.isUri(item.uri)
        && Range.isIRange(item.range)
        && Range.isIRange(item.selectionRange);
}
CommandsRegistry.registerCommand('_executeProvideSupertypes', async (_accessor, ...args) => {
    const [item] = args;
    assertType(isTypeHierarchyItemDto(item));
    // find model
    const model = _models.get(item._sessionId);
    if (!model) {
        return undefined;
    }
    return model.provideSupertypes(item, CancellationToken.None);
});
CommandsRegistry.registerCommand('_executeProvideSubtypes', async (_accessor, ...args) => {
    const [item] = args;
    assertType(isTypeHierarchyItemDto(item));
    // find model
    const model = _models.get(item._sessionId);
    if (!model) {
        return undefined;
    }
    return model.provideSubtypes(item, CancellationToken.None);
});
