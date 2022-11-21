export declare function escapeNonWindowsPath(path: string): string;
/**
 * Collapses the user's home directory into `~` if it exists within the path, this gives a shorter
 * path that is more suitable within the context of a terminal.
 */
export declare function collapseTildePath(path: string | undefined, userHome: string | undefined, separator: string): string;
/**
 * Sanitizes a cwd string, removing any wrapping quotes and making the Windows drive letter
 * uppercase.
 * @param cwd The directory to sanitize.
 */
export declare function sanitizeCwd(cwd: string): string;
