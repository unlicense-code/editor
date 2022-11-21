import { ITextSearchResult } from 'vs/workbench/services/search/common/search';
import { TextSearchPreviewOptions } from 'vs/workbench/services/search/common/searchExtTypes';
export declare const getFileResults: (bytes: Uint8Array, pattern: RegExp, options: {
    beforeContext: number;
    afterContext: number;
    previewOptions: TextSearchPreviewOptions | undefined;
    remainingResultQuota: number;
}) => ITextSearchResult[];
