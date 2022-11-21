/// <reference types="node" />
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILogService } from 'vs/platform/log/common/log';
import { ITerminalExecutable, ITerminalProfile, ITerminalProfileSource } from 'vs/platform/terminal/common/terminal';
export declare function detectAvailableProfiles(profiles: unknown, defaultProfile: unknown, includeDetectedProfiles: boolean, configurationService: IConfigurationService, shellEnv?: typeof process.env, fsProvider?: IFsProvider, logService?: ILogService, variableResolver?: (text: string[]) => Promise<string[]>, testPwshSourcePaths?: string[]): Promise<ITerminalProfile[]>;
export interface IFsProvider {
    existsFile(path: string): Promise<boolean>;
    readFile(path: string): Promise<Buffer>;
}
export interface IProfileVariableResolver {
    resolve(text: string[]): Promise<string[]>;
}
export declare type IUnresolvedTerminalProfile = ITerminalExecutable | ITerminalProfileSource | null;
