import { URI as Uri } from 'vs/base/common/uri';
import { IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
import { IConfigurationResolverService } from 'vs/workbench/services/configurationResolver/common/configurationResolver';
import { ILogService } from 'vs/platform/log/common/log';
import { IShellLaunchConfig, ITerminalEnvironment, TerminalSettingId } from 'vs/platform/terminal/common/terminal';
import { IProcessEnvironment, Platform } from 'vs/base/common/platform';
export declare function mergeEnvironments(parent: IProcessEnvironment, other: ITerminalEnvironment | undefined): void;
export declare function addTerminalEnvironmentKeys(env: IProcessEnvironment, version: string | undefined, locale: string | undefined, detectLocale: 'auto' | 'off' | 'on'): void;
export declare function shouldSetLangEnvVariable(env: IProcessEnvironment, detectLocale: 'auto' | 'off' | 'on'): boolean;
export declare function getLangEnvVariable(locale?: string): string;
export declare function getCwd(shell: IShellLaunchConfig, userHome: string | undefined, variableResolver: VariableResolver | undefined, root: Uri | undefined, customCwd: string | undefined, logService?: ILogService): Promise<string>;
export declare type TerminalShellSetting = (TerminalSettingId.AutomationShellWindows | TerminalSettingId.AutomationShellMacOs | TerminalSettingId.AutomationShellLinux | TerminalSettingId.ShellWindows | TerminalSettingId.ShellMacOs | TerminalSettingId.ShellLinux);
export declare type TerminalShellArgsSetting = (TerminalSettingId.ShellArgsWindows | TerminalSettingId.ShellArgsMacOs | TerminalSettingId.ShellArgsLinux);
export declare type VariableResolver = (str: string) => Promise<string>;
export declare function createVariableResolver(lastActiveWorkspace: IWorkspaceFolder | undefined, env: IProcessEnvironment, configurationResolverService: IConfigurationResolverService | undefined): VariableResolver | undefined;
/**
 * @deprecated Use ITerminalProfileResolverService
 */
export declare function getDefaultShell(fetchSetting: (key: TerminalShellSetting) => string | undefined, defaultShell: string, isWoW64: boolean, windir: string | undefined, variableResolver: VariableResolver | undefined, logService: ILogService, useAutomationShell: boolean, platformOverride?: Platform): Promise<string>;
/**
 * @deprecated Use ITerminalProfileResolverService
 */
export declare function getDefaultShellArgs(fetchSetting: (key: TerminalShellSetting | TerminalShellArgsSetting) => string | string[] | undefined, useAutomationShell: boolean, variableResolver: VariableResolver | undefined, logService: ILogService, platformOverride?: Platform): Promise<string | string[]>;
export declare function createTerminalEnvironment(shellLaunchConfig: IShellLaunchConfig, envFromConfig: ITerminalEnvironment | undefined, variableResolver: VariableResolver | undefined, version: string | undefined, detectLocale: 'auto' | 'off' | 'on', baseEnv: IProcessEnvironment): Promise<IProcessEnvironment>;
