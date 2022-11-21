import * as platform from 'vs/base/common/platform';
/**
 * Gets the detected default shell for the _system_, not to be confused with VS Code's _default_
 * shell that the terminal uses by default.
 * @param os The platform to detect the shell of.
 */
export declare function getSystemShell(os: platform.OperatingSystem, env: platform.IProcessEnvironment): Promise<string>;
export declare function getSystemShellSync(os: platform.OperatingSystem, env: platform.IProcessEnvironment): string;
