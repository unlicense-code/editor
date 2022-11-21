import { CancellationToken } from 'vs/base/common/cancellation';
import { OutputChannel } from 'vs/workbench/services/search/node/ripgrepSearchUtils';
import { TextSearchProvider, TextSearchComplete, TextSearchResult, TextSearchQuery, TextSearchOptions } from 'vs/workbench/services/search/common/searchExtTypes';
import { Progress } from 'vs/platform/progress/common/progress';
export declare class RipgrepSearchProvider implements TextSearchProvider {
    private outputChannel;
    private inProgress;
    constructor(outputChannel: OutputChannel);
    provideTextSearchResults(query: TextSearchQuery, options: TextSearchOptions, progress: Progress<TextSearchResult>, token: CancellationToken): Promise<TextSearchComplete>;
    private withToken;
    private dispose;
}
