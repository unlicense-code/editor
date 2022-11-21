import { URI } from 'vs/base/common/uri';
import { ILogService } from 'vs/platform/log/common/log';
import * as searchExtTypes from 'vs/workbench/services/search/common/searchExtTypes';
export declare type Maybe<T> = T | null | undefined;
export declare function anchorGlob(glob: string): string;
/**
 * Create a vscode.TextSearchMatch by using our internal TextSearchMatch type for its previewOptions logic.
 */
export declare function createTextSearchResult(uri: URI, text: string, range: searchExtTypes.Range | searchExtTypes.Range[], previewOptions?: searchExtTypes.TextSearchPreviewOptions): searchExtTypes.TextSearchMatch;
export interface IOutputChannel {
    appendLine(msg: string): void;
}
export declare class OutputChannel implements IOutputChannel {
    private prefix;
    private readonly logService;
    constructor(prefix: string, logService: ILogService);
    appendLine(msg: string): void;
}
