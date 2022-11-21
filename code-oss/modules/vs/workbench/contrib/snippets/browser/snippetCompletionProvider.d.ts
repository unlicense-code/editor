import { MarkdownString } from 'vs/base/common/htmlContent';
import { Position } from 'vs/editor/common/core/position';
import { IRange } from 'vs/editor/common/core/range';
import { ITextModel } from 'vs/editor/common/model';
import { CompletionItem, CompletionItemKind, CompletionItemProvider, CompletionList, CompletionItemInsertTextRule, CompletionContext, CompletionItemLabel, Command } from 'vs/editor/common/languages';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ISnippetsService } from 'vs/workbench/contrib/snippets/browser/snippets';
import { Snippet } from 'vs/workbench/contrib/snippets/browser/snippetsFile';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
export declare class SnippetCompletion implements CompletionItem {
    readonly snippet: Snippet;
    label: CompletionItemLabel;
    detail: string;
    insertText: string;
    documentation?: MarkdownString;
    range: IRange | {
        insert: IRange;
        replace: IRange;
    };
    sortText: string;
    kind: CompletionItemKind;
    insertTextRules: CompletionItemInsertTextRule;
    extensionId?: ExtensionIdentifier;
    command?: Command;
    constructor(snippet: Snippet, range: IRange | {
        insert: IRange;
        replace: IRange;
    });
    resolve(): this;
    static compareByLabel(a: SnippetCompletion, b: SnippetCompletion): number;
}
export declare class SnippetCompletionProvider implements CompletionItemProvider {
    private readonly _languageService;
    private readonly _snippets;
    private readonly _languageConfigurationService;
    readonly _debugDisplayName = "snippetCompletions";
    constructor(_languageService: ILanguageService, _snippets: ISnippetsService, _languageConfigurationService: ILanguageConfigurationService);
    provideCompletionItems(model: ITextModel, position: Position, context: CompletionContext): Promise<CompletionList>;
    resolveCompletionItem(item: CompletionItem): CompletionItem;
    private _getLanguageIdAtPosition;
}
