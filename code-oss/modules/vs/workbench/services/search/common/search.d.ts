import { CancellationToken } from 'vs/base/common/cancellation';
import * as glob from 'vs/base/common/glob';
import { IDisposable } from 'vs/base/common/lifecycle';
import { URI, UriComponents } from 'vs/base/common/uri';
import { IFilesConfiguration } from 'vs/platform/files/common/files';
import { ITelemetryData } from 'vs/platform/telemetry/common/telemetry';
import { Event } from 'vs/base/common/event';
import { TextSearchCompleteMessageType } from 'vs/workbench/services/search/common/searchExtTypes';
export { TextSearchCompleteMessageType };
export declare const VIEWLET_ID = "workbench.view.search";
export declare const PANEL_ID = "workbench.panel.search";
export declare const VIEW_ID = "workbench.view.search";
export declare const SEARCH_EXCLUDE_CONFIG = "search.exclude";
export declare const ISearchService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ISearchService>;
/**
 * A service that enables to search for files or with in files.
 */
export interface ISearchService {
    readonly _serviceBrand: undefined;
    textSearch(query: ITextQuery, token?: CancellationToken, onProgress?: (result: ISearchProgressItem) => void): Promise<ISearchComplete>;
    fileSearch(query: IFileQuery, token?: CancellationToken): Promise<ISearchComplete>;
    clearCache(cacheKey: string): Promise<void>;
    registerSearchResultProvider(scheme: string, type: SearchProviderType, provider: ISearchResultProvider): IDisposable;
}
/**
 * TODO@roblou - split text from file search entirely, or share code in a more natural way.
 */
export declare const enum SearchProviderType {
    file = 0,
    text = 1
}
export interface ISearchResultProvider {
    textSearch(query: ITextQuery, onProgress?: (p: ISearchProgressItem) => void, token?: CancellationToken): Promise<ISearchComplete>;
    fileSearch(query: IFileQuery, token?: CancellationToken): Promise<ISearchComplete>;
    clearCache(cacheKey: string): Promise<void>;
}
export interface IFolderQuery<U extends UriComponents = URI> {
    folder: U;
    folderName?: string;
    excludePattern?: glob.IExpression;
    includePattern?: glob.IExpression;
    fileEncoding?: string;
    disregardIgnoreFiles?: boolean;
    disregardGlobalIgnoreFiles?: boolean;
    disregardParentIgnoreFiles?: boolean;
    ignoreSymlinks?: boolean;
}
export interface ICommonQueryProps<U extends UriComponents> {
    /** For telemetry - indicates what is triggering the source */
    _reason?: string;
    folderQueries: IFolderQuery<U>[];
    includePattern?: glob.IExpression;
    excludePattern?: glob.IExpression;
    extraFileResources?: U[];
    onlyOpenEditors?: boolean;
    maxResults?: number;
    usingSearchPaths?: boolean;
}
export interface IFileQueryProps<U extends UriComponents> extends ICommonQueryProps<U> {
    type: QueryType.File;
    filePattern?: string;
    /**
     * If true no results will be returned. Instead `limitHit` will indicate if at least one result exists or not.
     * Currently does not work with queries including a 'siblings clause'.
     */
    exists?: boolean;
    sortByScore?: boolean;
    cacheKey?: string;
}
export interface ITextQueryProps<U extends UriComponents> extends ICommonQueryProps<U> {
    type: QueryType.Text;
    contentPattern: IPatternInfo;
    previewOptions?: ITextSearchPreviewOptions;
    maxFileSize?: number;
    usePCRE2?: boolean;
    afterContext?: number;
    beforeContext?: number;
    userDisabledExcludesAndIgnoreFiles?: boolean;
}
export declare type IFileQuery = IFileQueryProps<URI>;
export declare type IRawFileQuery = IFileQueryProps<UriComponents>;
export declare type ITextQuery = ITextQueryProps<URI>;
export declare type IRawTextQuery = ITextQueryProps<UriComponents>;
export declare type IRawQuery = IRawTextQuery | IRawFileQuery;
export declare type ISearchQuery = ITextQuery | IFileQuery;
export declare const enum QueryType {
    File = 1,
    Text = 2
}
export interface IPatternInfo {
    pattern: string;
    isRegExp?: boolean;
    isWordMatch?: boolean;
    wordSeparators?: string;
    isMultiline?: boolean;
    isUnicode?: boolean;
    isCaseSensitive?: boolean;
}
export interface IExtendedExtensionSearchOptions {
    usePCRE2?: boolean;
}
export interface IFileMatch<U extends UriComponents = URI> {
    resource: U;
    results?: ITextSearchResult[];
}
export declare type IRawFileMatch2 = IFileMatch<UriComponents>;
export interface ITextSearchPreviewOptions {
    matchLines: number;
    charsPerLine: number;
}
export interface ISearchRange {
    readonly startLineNumber: number;
    readonly startColumn: number;
    readonly endLineNumber: number;
    readonly endColumn: number;
}
export interface ITextSearchResultPreview {
    text: string;
    matches: ISearchRange | ISearchRange[];
}
export interface ITextSearchMatch {
    uri?: URI;
    ranges: ISearchRange | ISearchRange[];
    preview: ITextSearchResultPreview;
}
export interface ITextSearchContext {
    uri?: URI;
    text: string;
    lineNumber: number;
}
export declare type ITextSearchResult = ITextSearchMatch | ITextSearchContext;
export declare function resultIsMatch(result: ITextSearchResult): result is ITextSearchMatch;
export interface IProgressMessage {
    message: string;
}
export declare type ISearchProgressItem = IFileMatch | IProgressMessage;
export declare function isFileMatch(p: ISearchProgressItem): p is IFileMatch;
export declare function isProgressMessage(p: ISearchProgressItem | ISerializedSearchProgressItem): p is IProgressMessage;
export interface ITextSearchCompleteMessage {
    text: string;
    type: TextSearchCompleteMessageType;
    trusted?: boolean;
}
export interface ISearchCompleteStats {
    limitHit?: boolean;
    messages: ITextSearchCompleteMessage[];
    stats?: IFileSearchStats | ITextSearchStats;
}
export interface ISearchComplete extends ISearchCompleteStats {
    results: IFileMatch[];
    exit?: SearchCompletionExitCode;
}
export declare const enum SearchCompletionExitCode {
    Normal = 0,
    NewSearchStarted = 1
}
export interface ITextSearchStats {
    type: 'textSearchProvider' | 'searchProcess';
}
export interface IFileSearchStats {
    fromCache: boolean;
    detailStats: ISearchEngineStats | ICachedSearchStats | IFileSearchProviderStats;
    resultCount: number;
    type: 'fileSearchProvider' | 'searchProcess';
    sortingTime?: number;
}
export interface ICachedSearchStats {
    cacheWasResolved: boolean;
    cacheLookupTime: number;
    cacheFilterTime: number;
    cacheEntryCount: number;
}
export interface ISearchEngineStats {
    fileWalkTime: number;
    directoriesWalked: number;
    filesWalked: number;
    cmdTime: number;
    cmdResultCount?: number;
}
export interface IFileSearchProviderStats {
    providerTime: number;
    postProcessTime: number;
}
export declare class FileMatch implements IFileMatch {
    resource: URI;
    results: ITextSearchResult[];
    constructor(resource: URI);
}
export declare class TextSearchMatch implements ITextSearchMatch {
    ranges: ISearchRange | ISearchRange[];
    preview: ITextSearchResultPreview;
    constructor(text: string, range: ISearchRange | ISearchRange[], previewOptions?: ITextSearchPreviewOptions);
}
export declare class SearchRange implements ISearchRange {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
    constructor(startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number);
}
export declare class OneLineRange extends SearchRange {
    constructor(lineNumber: number, startColumn: number, endColumn: number);
}
export declare const enum ViewMode {
    List = "list",
    Tree = "tree"
}
export declare const enum SearchSortOrder {
    Default = "default",
    FileNames = "fileNames",
    Type = "type",
    Modified = "modified",
    CountDescending = "countDescending",
    CountAscending = "countAscending"
}
export interface ISearchConfigurationProperties {
    exclude: glob.IExpression;
    useRipgrep: boolean;
    /**
     * Use ignore file for file search.
     */
    useIgnoreFiles: boolean;
    useGlobalIgnoreFiles: boolean;
    useParentIgnoreFiles: boolean;
    followSymlinks: boolean;
    smartCase: boolean;
    globalFindClipboard: boolean;
    location: 'sidebar' | 'panel';
    useReplacePreview: boolean;
    showLineNumbers: boolean;
    usePCRE2: boolean;
    actionsPosition: 'auto' | 'right';
    maintainFileSearchCache: boolean;
    maxResults: number | null;
    collapseResults: 'auto' | 'alwaysCollapse' | 'alwaysExpand';
    searchOnType: boolean;
    seedOnFocus: boolean;
    seedWithNearestWord: boolean;
    searchOnTypeDebouncePeriod: number;
    mode: 'view' | 'reuseEditor' | 'newEditor';
    searchEditor: {
        doubleClickBehaviour: 'selectWord' | 'goToLocation' | 'openLocationToSide';
        reusePriorSearchConfiguration: boolean;
        defaultNumberOfContextLines: number | null;
        experimental: {};
    };
    sortOrder: SearchSortOrder;
    decorations: {
        colors: boolean;
        badges: boolean;
    };
    defaultViewMode: ViewMode;
}
export interface ISearchConfiguration extends IFilesConfiguration {
    search: ISearchConfigurationProperties;
    editor: {
        wordSeparators: string;
    };
}
export declare function getExcludes(configuration: ISearchConfiguration, includeSearchExcludes?: boolean): glob.IExpression | undefined;
export declare function pathIncludedInQuery(queryProps: ICommonQueryProps<URI>, fsPath: string): boolean;
export declare enum SearchErrorCode {
    unknownEncoding = 1,
    regexParseError = 2,
    globParseError = 3,
    invalidLiteral = 4,
    rgProcessError = 5,
    other = 6,
    canceled = 7
}
export declare class SearchError extends Error {
    readonly code?: SearchErrorCode | undefined;
    constructor(message: string, code?: SearchErrorCode | undefined);
}
export declare function deserializeSearchError(error: Error): SearchError;
export declare function serializeSearchError(searchError: SearchError): Error;
export interface ITelemetryEvent {
    eventName: string;
    data: ITelemetryData;
}
export interface IRawSearchService {
    fileSearch(search: IRawFileQuery): Event<ISerializedSearchProgressItem | ISerializedSearchComplete>;
    textSearch(search: IRawTextQuery): Event<ISerializedSearchProgressItem | ISerializedSearchComplete>;
    clearCache(cacheKey: string): Promise<void>;
}
export interface IRawFileMatch {
    base?: string;
    /**
     * The path of the file relative to the containing `base` folder.
     * This path is exactly as it appears on the filesystem.
     */
    relativePath: string;
    /**
     * This path is transformed for search purposes. For example, this could be
     * the `relativePath` with the workspace folder name prepended. This way the
     * search algorithm would also match against the name of the containing folder.
     *
     * If not given, the search algorithm should use `relativePath`.
     */
    searchPath: string | undefined;
}
export interface ISearchEngine<T> {
    search: (onResult: (matches: T) => void, onProgress: (progress: IProgressMessage) => void, done: (error: Error | null, complete: ISearchEngineSuccess) => void) => void;
    cancel: () => void;
}
export interface ISerializedSearchSuccess {
    type: 'success';
    limitHit: boolean;
    messages: ITextSearchCompleteMessage[];
    stats?: IFileSearchStats | ITextSearchStats;
}
export interface ISearchEngineSuccess {
    limitHit: boolean;
    messages: ITextSearchCompleteMessage[];
    stats: ISearchEngineStats;
}
export interface ISerializedSearchError {
    type: 'error';
    error: {
        message: string;
        stack: string;
    };
}
export declare type ISerializedSearchComplete = ISerializedSearchSuccess | ISerializedSearchError;
export declare function isSerializedSearchComplete(arg: ISerializedSearchProgressItem | ISerializedSearchComplete): arg is ISerializedSearchComplete;
export declare function isSerializedSearchSuccess(arg: ISerializedSearchComplete): arg is ISerializedSearchSuccess;
export declare function isSerializedFileMatch(arg: ISerializedSearchProgressItem): arg is ISerializedFileMatch;
export declare function isFilePatternMatch(candidate: IRawFileMatch, normalizedFilePatternLowercase: string): boolean;
export interface ISerializedFileMatch {
    path: string;
    results?: ITextSearchResult[];
    numMatches?: number;
}
export declare type ISerializedSearchProgressItem = ISerializedFileMatch | ISerializedFileMatch[] | IProgressMessage;
export declare type IFileSearchProgressItem = IRawFileMatch | IRawFileMatch[] | IProgressMessage;
export declare class SerializableFileMatch implements ISerializedFileMatch {
    path: string;
    results: ITextSearchMatch[];
    constructor(path: string);
    addMatch(match: ITextSearchMatch): void;
    serialize(): ISerializedFileMatch;
}
/**
 *  Computes the patterns that the provider handles. Discards sibling clauses and 'false' patterns
 */
export declare function resolvePatternsForProvider(globalPattern: glob.IExpression | undefined, folderPattern: glob.IExpression | undefined): string[];
export declare class QueryGlobTester {
    private _excludeExpression;
    private _parsedExcludeExpression;
    private _parsedIncludeExpression;
    constructor(config: ISearchQuery, folderQuery: IFolderQuery);
    matchesExcludesSync(testPath: string, basename?: string, hasSibling?: (name: string) => boolean): boolean;
    /**
     * Guaranteed sync - siblingsFn should not return a promise.
     */
    includedInQuerySync(testPath: string, basename?: string, hasSibling?: (name: string) => boolean): boolean;
    /**
     * Evaluating the exclude expression is only async if it includes sibling clauses. As an optimization, avoid doing anything with Promises
     * unless the expression is async.
     */
    includedInQuery(testPath: string, basename?: string, hasSibling?: (name: string) => boolean | Promise<boolean>): Promise<boolean> | boolean;
    hasSiblingExcludeClauses(): boolean;
}
export declare function hasSiblingPromiseFn(siblingsFn?: () => Promise<string[]>): ((name: string) => Promise<boolean>) | undefined;
export declare function hasSiblingFn(siblingsFn?: () => string[]): ((name: string) => boolean) | undefined;
