import { Snippet } from 'vs/workbench/contrib/snippets/browser/snippetsFile';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare function pickSnippet(accessor: ServicesAccessor, languageIdOrSnippets: string | Snippet[]): Promise<Snippet | undefined>;
