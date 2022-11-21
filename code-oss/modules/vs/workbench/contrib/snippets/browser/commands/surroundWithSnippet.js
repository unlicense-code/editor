/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import { SnippetController2 } from 'vs/editor/contrib/snippet/browser/snippetController2';
import { localize } from 'vs/nls';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { SnippetEditorAction } from 'vs/workbench/contrib/snippets/browser/commands/abstractSnippetsActions';
import { pickSnippet } from 'vs/workbench/contrib/snippets/browser/snippetPicker';
import { ISnippetsService } from '../snippets';
export async function getSurroundableSnippets(snippetsService, model, position, includeDisabledSnippets) {
    const { lineNumber, column } = position;
    model.tokenization.tokenizeIfCheap(lineNumber);
    const languageId = model.getLanguageIdAtPosition(lineNumber, column);
    const allSnippets = await snippetsService.getSnippets(languageId, { includeNoPrefixSnippets: true, includeDisabledSnippets });
    return allSnippets.filter(snippet => snippet.usesSelection);
}
export class SurroundWithSnippetEditorAction extends SnippetEditorAction {
    static options = {
        id: 'editor.action.surroundWithSnippet',
        title: {
            value: localize('label', 'Surround With Snippet...'),
            original: 'Surround With Snippet...'
        }
    };
    constructor() {
        super({
            ...SurroundWithSnippetEditorAction.options,
            precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasNonEmptySelection),
            f1: true,
        });
    }
    async runEditorCommand(accessor, editor) {
        if (!editor.hasModel()) {
            return;
        }
        const instaService = accessor.get(IInstantiationService);
        const snippetsService = accessor.get(ISnippetsService);
        const clipboardService = accessor.get(IClipboardService);
        const snippets = await getSurroundableSnippets(snippetsService, editor.getModel(), editor.getPosition(), true);
        if (!snippets.length) {
            return;
        }
        const snippet = await instaService.invokeFunction(pickSnippet, snippets);
        if (!snippet) {
            return;
        }
        let clipboardText;
        if (snippet.needsClipboard) {
            clipboardText = await clipboardService.readText();
        }
        editor.focus();
        SnippetController2.get(editor)?.insert(snippet.codeSnippet, { clipboardText });
        snippetsService.updateUsageTimestamp(snippet);
    }
}
