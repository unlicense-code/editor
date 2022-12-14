import { IRelativePattern } from 'vs/base/common/glob';
import { URI } from 'vs/base/common/uri';
export interface LanguageFilter {
    readonly language?: string;
    readonly scheme?: string;
    readonly pattern?: string | IRelativePattern;
    readonly notebookType?: string;
    /**
     * This provider is implemented in the UI thread.
     */
    readonly hasAccessToAllModels?: boolean;
    readonly exclusive?: boolean;
}
export declare type LanguageSelector = string | LanguageFilter | ReadonlyArray<string | LanguageFilter>;
export declare function score(selector: LanguageSelector | undefined, candidateUri: URI, candidateLanguage: string, candidateIsSynchronized: boolean, candidateNotebookUri: URI | undefined, candidateNotebookType: string | undefined): number;
