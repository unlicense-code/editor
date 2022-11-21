import { SnippetFile, Snippet } from 'vs/workbench/contrib/snippets/browser/snippetsFile';
export declare const ISnippetsService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ISnippetsService>;
export interface ISnippetGetOptions {
    includeDisabledSnippets?: boolean;
    includeNoPrefixSnippets?: boolean;
    noRecencySort?: boolean;
    fileTemplateSnippets?: boolean;
}
export interface ISnippetsService {
    readonly _serviceBrand: undefined;
    getSnippetFiles(): Promise<Iterable<SnippetFile>>;
    isEnabled(snippet: Snippet): boolean;
    updateEnablement(snippet: Snippet, enabled: boolean): void;
    updateUsageTimestamp(snippet: Snippet): void;
    getSnippets(languageId: string | undefined, opt?: ISnippetGetOptions): Promise<Snippet[]>;
    getSnippetsSync(languageId: string, opt?: ISnippetGetOptions): Snippet[];
}
