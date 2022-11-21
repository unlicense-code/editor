import { URI } from 'vs/base/common/uri';
import 'vs/css!./media/searchEditor';
import { ServicesAccessor } from 'vs/editor/browser/editorExtensions';
import { Range } from 'vs/editor/common/core/range';
import type { ITextModel } from 'vs/editor/common/model';
import { SearchResult } from 'vs/workbench/contrib/search/common/searchModel';
import type { SearchConfiguration } from 'vs/workbench/contrib/searchEditor/browser/searchEditorInput';
import { SearchSortOrder } from 'vs/workbench/services/search/common/search';
export declare const serializeSearchConfiguration: (config: Partial<SearchConfiguration>) => string;
export declare const extractSearchQueryFromModel: (model: ITextModel) => SearchConfiguration;
export declare const defaultSearchConfig: () => SearchConfiguration;
export declare const extractSearchQueryFromLines: (lines: string[]) => SearchConfiguration;
export declare const serializeSearchResultForEditor: (searchResult: SearchResult, rawIncludePattern: string, rawExcludePattern: string, contextLines: number, labelFormatter: (x: URI) => string, sortOrder: SearchSortOrder, limitHit?: boolean) => {
    matchRanges: Range[];
    text: string;
    config: Partial<SearchConfiguration>;
};
export declare const parseSavedSearchEditor: (accessor: ServicesAccessor, resource: URI) => Promise<{
    config: SearchConfiguration;
    text: string;
}>;
export declare const parseSerializedSearchEditor: (text: string) => {
    config: SearchConfiguration;
    text: string;
};
