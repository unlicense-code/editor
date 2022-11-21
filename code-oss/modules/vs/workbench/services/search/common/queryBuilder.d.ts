import * as glob from 'vs/base/common/glob';
import { URI, URI as uri } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILogService } from 'vs/platform/log/common/log';
import { IWorkspaceContextService, IWorkspaceFolderData } from 'vs/platform/workspace/common/workspace';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { IFileQuery, IPatternInfo, ITextQuery, ITextSearchPreviewOptions } from 'vs/workbench/services/search/common/search';
/**
 * One folder to search and a glob expression that should be applied.
 */
export interface IOneSearchPathPattern {
    searchPath: uri;
    pattern?: string;
}
/**
 * One folder to search and a set of glob expressions that should be applied.
 */
export interface ISearchPathPattern {
    searchPath: uri;
    pattern?: glob.IExpression;
}
/**
 * A set of search paths and a set of glob expressions that should be applied.
 */
export interface ISearchPathsInfo {
    searchPaths?: ISearchPathPattern[];
    pattern?: glob.IExpression;
}
export interface ICommonQueryBuilderOptions {
    _reason?: string;
    excludePattern?: string | string[];
    includePattern?: string | string[];
    extraFileResources?: uri[];
    /** Parse the special ./ syntax supported by the searchview, and expand foo to ** /foo */
    expandPatterns?: boolean;
    maxResults?: number;
    maxFileSize?: number;
    disregardIgnoreFiles?: boolean;
    disregardGlobalIgnoreFiles?: boolean;
    disregardParentIgnoreFiles?: boolean;
    disregardExcludeSettings?: boolean;
    disregardSearchExcludeSettings?: boolean;
    ignoreSymlinks?: boolean;
    onlyOpenEditors?: boolean;
}
export interface IFileQueryBuilderOptions extends ICommonQueryBuilderOptions {
    filePattern?: string;
    exists?: boolean;
    sortByScore?: boolean;
    cacheKey?: string;
}
export interface ITextQueryBuilderOptions extends ICommonQueryBuilderOptions {
    previewOptions?: ITextSearchPreviewOptions;
    fileEncoding?: string;
    beforeContext?: number;
    afterContext?: number;
    isSmartCase?: boolean;
}
export declare class QueryBuilder {
    private readonly configurationService;
    private readonly workspaceContextService;
    private readonly editorGroupsService;
    private readonly logService;
    private readonly pathService;
    constructor(configurationService: IConfigurationService, workspaceContextService: IWorkspaceContextService, editorGroupsService: IEditorGroupsService, logService: ILogService, pathService: IPathService);
    text(contentPattern: IPatternInfo, folderResources?: uri[], options?: ITextQueryBuilderOptions): ITextQuery;
    /**
     * Adjusts input pattern for config
     */
    private getContentPattern;
    file(folders: (IWorkspaceFolderData | URI)[], options?: IFileQueryBuilderOptions): IFileQuery;
    private handleIncludeExclude;
    private commonQuery;
    private commonQueryFromFileList;
    /**
     * Resolve isCaseSensitive flag based on the query and the isSmartCase flag, for search providers that don't support smart case natively.
     */
    private isCaseSensitive;
    private isMultiline;
    /**
     * Take the includePattern as seen in the search viewlet, and split into components that look like searchPaths, and
     * glob patterns. Glob patterns are expanded from 'foo/bar' to '{foo/bar/**, **\/foo/bar}.
     *
     * Public for test.
     */
    parseSearchPaths(pattern: string | string[]): ISearchPathsInfo;
    private getExcludesForFolder;
    /**
     * Split search paths (./ or ../ or absolute paths in the includePatterns) into absolute paths and globs applied to those paths
     */
    private expandSearchPathPatterns;
    /**
     * Takes a searchPath like `./a/foo` or `../a/foo` and expands it to absolute paths for all the workspaces it matches.
     */
    private expandOneSearchPath;
    private resolveOneSearchPathPattern;
    private getFolderQueryForSearchPath;
    private getFolderQueryForRoot;
}
/**
 * Construct an include pattern from a list of folders uris to search in.
 */
export declare function resolveResourcesForSearchIncludes(resources: URI[], contextService: IWorkspaceContextService): string[];
