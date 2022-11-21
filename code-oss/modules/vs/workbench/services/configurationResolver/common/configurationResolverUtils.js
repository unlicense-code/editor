/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as nls from 'vs/nls';
export function applyDeprecatedVariableMessage(schema) {
    schema.pattern = schema.pattern || '^(?!.*\\$\\{(env|config|command)\\.)';
    schema.patternErrorMessage = schema.patternErrorMessage ||
        nls.localize('deprecatedVariables', "'env.', 'config.' and 'command.' are deprecated, use 'env:', 'config:' and 'command:' instead.");
}
