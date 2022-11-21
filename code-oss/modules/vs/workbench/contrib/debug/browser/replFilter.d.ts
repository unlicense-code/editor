import { matchesFuzzy } from 'vs/base/common/filters';
import { ITreeFilter, TreeVisibility, TreeFilterResult } from 'vs/base/browser/ui/tree/tree';
import { IReplElement } from 'vs/workbench/contrib/debug/common/debug';
export declare class ReplFilter implements ITreeFilter<IReplElement> {
    static matchQuery: typeof matchesFuzzy;
    private _parsedQueries;
    set filterQuery(query: string);
    filter(element: IReplElement, parentVisibility: TreeVisibility): TreeFilterResult<void>;
}
