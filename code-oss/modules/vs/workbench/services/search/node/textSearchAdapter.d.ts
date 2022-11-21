import { CancellationToken } from 'vs/base/common/cancellation';
import { IProgressMessage, ITextQuery, ISerializedFileMatch, ISerializedSearchSuccess } from 'vs/workbench/services/search/common/search';
export declare class TextSearchEngineAdapter {
    private query;
    constructor(query: ITextQuery);
    search(token: CancellationToken, onResult: (matches: ISerializedFileMatch[]) => void, onMessage: (message: IProgressMessage) => void): Promise<ISerializedSearchSuccess>;
}
