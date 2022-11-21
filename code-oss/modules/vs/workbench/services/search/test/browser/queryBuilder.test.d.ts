import { IExpression } from 'vs/base/common/glob';
import { URI as uri } from 'vs/base/common/uri';
import { ISearchPathsInfo } from 'vs/workbench/services/search/common/queryBuilder';
import { IFileQuery, ITextQuery } from 'vs/workbench/services/search/common/search';
export declare function assertEqualQueries(actual: ITextQuery | IFileQuery, expected: ITextQuery | IFileQuery): void;
export declare function assertEqualSearchPathResults(actual: ISearchPathsInfo, expected: ISearchPathsInfo, message?: string): void;
/**
 * Recursively delete all undefined property values from the search query, to make it easier to
 * assert.deepStrictEqual with some expected object.
 */
export declare function cleanUndefinedQueryValues(q: any): void;
export declare function globalGlob(pattern: string): string[];
export declare function patternsToIExpression(...patterns: string[]): IExpression | undefined;
export declare function getUri(...slashPathParts: string[]): uri;
export declare function fixPath(...slashPathParts: string[]): string;
export declare function normalizeExpression(expression: IExpression | undefined): IExpression | undefined;
