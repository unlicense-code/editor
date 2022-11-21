/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { LanguageAgnosticBracketTokens } from 'vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/brackets';
import { lengthAdd, lengthGetColumnCountIfZeroLineCount, lengthZero } from 'vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length';
import { parseDocument } from 'vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/parser';
import { DenseKeyProvider } from 'vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/smallImmutableSet';
import { TextBufferTokenizer } from 'vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/tokenizer';
export function fixBracketsInLine(tokens, languageConfigurationService) {
    const denseKeyProvider = new DenseKeyProvider();
    const bracketTokens = new LanguageAgnosticBracketTokens(denseKeyProvider, (languageId) => languageConfigurationService.getLanguageConfiguration(languageId));
    const tokenizer = new TextBufferTokenizer(new StaticTokenizerSource([tokens]), bracketTokens);
    const node = parseDocument(tokenizer, [], undefined, true);
    let str = '';
    const line = tokens.getLineContent();
    function processNode(node, offset) {
        if (node.kind === 2 /* AstNodeKind.Pair */) {
            processNode(node.openingBracket, offset);
            offset = lengthAdd(offset, node.openingBracket.length);
            if (node.child) {
                processNode(node.child, offset);
                offset = lengthAdd(offset, node.child.length);
            }
            if (node.closingBracket) {
                processNode(node.closingBracket, offset);
                offset = lengthAdd(offset, node.closingBracket.length);
            }
            else {
                const singleLangBracketTokens = bracketTokens.getSingleLanguageBracketTokens(node.openingBracket.languageId);
                const closingTokenText = singleLangBracketTokens.findClosingTokenText(node.openingBracket.bracketIds);
                str += closingTokenText;
            }
        }
        else if (node.kind === 3 /* AstNodeKind.UnexpectedClosingBracket */) {
            // remove the bracket
        }
        else if (node.kind === 0 /* AstNodeKind.Text */ || node.kind === 1 /* AstNodeKind.Bracket */) {
            str += line.substring(lengthGetColumnCountIfZeroLineCount(offset), lengthGetColumnCountIfZeroLineCount(lengthAdd(offset, node.length)));
        }
        else if (node.kind === 4 /* AstNodeKind.List */) {
            for (const child of node.children) {
                processNode(child, offset);
                offset = lengthAdd(offset, child.length);
            }
        }
    }
    processNode(node, lengthZero);
    return str;
}
class StaticTokenizerSource {
    lines;
    constructor(lines) {
        this.lines = lines;
    }
    getValue() {
        return this.lines.map(l => l.getLineContent()).join('\n');
    }
    getLineCount() {
        return this.lines.length;
    }
    getLineLength(lineNumber) {
        return this.lines[lineNumber - 1].getLineContent().length;
    }
    tokenization = {
        getLineTokens: (lineNumber) => {
            return this.lines[lineNumber - 1];
        }
    };
}
