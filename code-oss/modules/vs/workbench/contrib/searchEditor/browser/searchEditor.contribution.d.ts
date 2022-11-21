import { SearchConfiguration } from 'vs/workbench/contrib/searchEditor/browser/searchEditorInput';
export declare type LegacySearchEditorArgs = Partial<{
    query: string;
    includes: string;
    excludes: string;
    contextLines: number;
    wholeWord: boolean;
    caseSensitive: boolean;
    regexp: boolean;
    useIgnores: boolean;
    showIncludesExcludes: boolean;
    triggerSearch: boolean;
    focusResults: boolean;
    location: 'reuse' | 'new';
}>;
export declare type OpenSearchEditorArgs = Partial<SearchConfiguration & {
    triggerSearch: boolean;
    focusResults: boolean;
    location: 'reuse' | 'new';
}>;
