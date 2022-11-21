/// <reference types="node" />
import * as cp from 'child_process';
import * as glob from 'vs/base/common/glob';
import { IFileQuery, IFolderQuery } from 'vs/workbench/services/search/common/search';
export declare function spawnRipgrepCmd(config: IFileQuery, folderQuery: IFolderQuery, includePattern?: glob.IExpression, excludePattern?: glob.IExpression): {
    cmd: cp.ChildProcessWithoutNullStreams;
    rgDiskPath: string;
    siblingClauses: glob.IExpression;
    rgArgs: {
        args: string[];
        siblingClauses: glob.IExpression;
    };
    cwd: string;
};
export interface IRgGlobResult {
    globArgs: string[];
    siblingClauses: glob.IExpression;
}
export declare function foldersToRgExcludeGlobs(folderQueries: IFolderQuery[], globalExclude?: glob.IExpression, excludesToSkip?: Set<string>, absoluteGlobs?: boolean): IRgGlobResult;
export declare function foldersToIncludeGlobs(folderQueries: IFolderQuery[], globalInclude?: glob.IExpression, absoluteGlobs?: boolean): string[];
/**
 * Resolves a glob like "node_modules/**" in "/foo/bar" to "/foo/bar/node_modules/**".
 * Special cases C:/foo paths to write the glob like /foo instead - see https://github.com/BurntSushi/ripgrep/issues/530.
 *
 * Exported for testing
 */
export declare function getAbsoluteGlob(folder: string, key: string): string;
export declare function fixDriveC(path: string): string;
