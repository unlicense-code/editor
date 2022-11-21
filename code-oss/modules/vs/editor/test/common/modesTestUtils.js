/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { LineTokens } from 'vs/editor/common/tokens/lineTokens';
import { createScopedLineTokens } from 'vs/editor/common/languages/supports';
import { LanguageIdCodec } from 'vs/editor/common/services/languagesRegistry';
export function createFakeScopedLineTokens(rawTokens) {
    const tokens = new Uint32Array(rawTokens.length << 1);
    let line = '';
    for (let i = 0, len = rawTokens.length; i < len; i++) {
        const rawToken = rawTokens[i];
        const startOffset = line.length;
        const metadata = ((rawToken.type << 8 /* MetadataConsts.TOKEN_TYPE_OFFSET */)) >>> 0;
        tokens[(i << 1)] = startOffset;
        tokens[(i << 1) + 1] = metadata;
        line += rawToken.text;
    }
    LineTokens.convertToEndOffset(tokens, line.length);
    return createScopedLineTokens(new LineTokens(tokens, line, new LanguageIdCodec()), 0);
}
