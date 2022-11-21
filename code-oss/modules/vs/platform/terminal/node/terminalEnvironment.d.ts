import { IProcessEnvironment } from 'vs/base/common/platform';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { IShellLaunchConfig, ITerminalEnvironment, ITerminalProcessOptions } from 'vs/platform/terminal/common/terminal';
export declare function getWindowsBuildNumber(): number;
export declare function findExecutable(command: string, cwd?: string, paths?: string[], env?: IProcessEnvironment, exists?: (path: string) => Promise<boolean>): Promise<string | undefined>;
export interface IShellIntegrationConfigInjection {
    /**
     * A new set of arguments to use.
     */
    newArgs: string[] | undefined;
    /**
     * An optional environment to mixing to the real environment.
     */
    envMixin?: IProcessEnvironment;
    /**
     * An optional array of files to copy from `source` to `dest`.
     */
    filesToCopy?: {
        source: string;
        dest: string;
    }[];
}
/**
 * For a given shell launch config, returns arguments to replace and an optional environment to
 * mixin to the SLC's environment to enable shell integration. This must be run within the context
 * that creates the process to ensure accuracy. Returns undefined if shell integration cannot be
 * enabled.
 */
export declare function getShellIntegrationInjection(shellLaunchConfig: IShellLaunchConfig, options: Pick<ITerminalProcessOptions, 'shellIntegration' | 'windowsEnableConpty'>, env: ITerminalEnvironment | undefined, logService: ILogService, productService: IProductService): IShellIntegrationConfigInjection | undefined;
export declare enum ShellIntegrationExecutable {
    WindowsPwsh = "windows-pwsh",
    WindowsPwshLogin = "windows-pwsh-login",
    Pwsh = "pwsh",
    PwshLogin = "pwsh-login",
    Zsh = "zsh",
    ZshLogin = "zsh-login",
    Bash = "bash"
}
export declare const shellIntegrationArgs: Map<ShellIntegrationExecutable, string[]>;
