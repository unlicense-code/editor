/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CancellationToken } from 'vs/base/common/cancellation';
import { onUnexpectedExternalError } from 'vs/base/common/errors';
import { assertType } from 'vs/base/common/types';
import { URI } from 'vs/base/common/uri';
import { Position } from 'vs/editor/common/core/position';
import * as languages from 'vs/editor/common/languages';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
export const Context = {
    Visible: new RawContextKey('parameterHintsVisible', false),
    MultipleSignatures: new RawContextKey('parameterHintsMultipleSignatures', false),
};
export async function provideSignatureHelp(registry, model, position, context, token) {
    const supports = registry.ordered(model);
    for (const support of supports) {
        try {
            const result = await support.provideSignatureHelp(model, position, token, context);
            if (result) {
                return result;
            }
        }
        catch (err) {
            onUnexpectedExternalError(err);
        }
    }
    return undefined;
}
CommandsRegistry.registerCommand('_executeSignatureHelpProvider', async (accessor, ...args) => {
    const [uri, position, triggerCharacter] = args;
    assertType(URI.isUri(uri));
    assertType(Position.isIPosition(position));
    assertType(typeof triggerCharacter === 'string' || !triggerCharacter);
    const languageFeaturesService = accessor.get(ILanguageFeaturesService);
    const ref = await accessor.get(ITextModelService).createModelReference(uri);
    try {
        const result = await provideSignatureHelp(languageFeaturesService.signatureHelpProvider, ref.object.textEditorModel, Position.lift(position), {
            triggerKind: languages.SignatureHelpTriggerKind.Invoke,
            isRetrigger: false,
            triggerCharacter,
        }, CancellationToken.None);
        if (!result) {
            return undefined;
        }
        setTimeout(() => result.dispose(), 0);
        return result.value;
    }
    finally {
        ref.dispose();
    }
});
