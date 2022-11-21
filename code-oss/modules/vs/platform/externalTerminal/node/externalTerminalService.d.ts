/// <reference types="node" />
import * as cp from 'child_process';
import { IExternalTerminalMainService, IExternalTerminalSettings, ITerminalForPlatform } from 'vs/platform/externalTerminal/common/externalTerminal';
import { ITerminalEnvironment } from 'vs/platform/terminal/common/terminal';
declare abstract class ExternalTerminalService {
    _serviceBrand: undefined;
    getDefaultTerminalForPlatforms(): Promise<ITerminalForPlatform>;
}
export declare class WindowsExternalTerminalService extends ExternalTerminalService implements IExternalTerminalMainService {
    private static readonly CMD;
    private static _DEFAULT_TERMINAL_WINDOWS;
    openTerminal(configuration: IExternalTerminalSettings, cwd?: string): Promise<void>;
    spawnTerminal(spawner: typeof cp, configuration: IExternalTerminalSettings, command: string, cwd?: string): Promise<void>;
    runInTerminal(title: string, dir: string, args: string[], envVars: ITerminalEnvironment, settings: IExternalTerminalSettings): Promise<number | undefined>;
    static getDefaultTerminalWindows(): string;
}
export declare class MacExternalTerminalService extends ExternalTerminalService implements IExternalTerminalMainService {
    private static readonly OSASCRIPT;
    openTerminal(configuration: IExternalTerminalSettings, cwd?: string): Promise<void>;
    runInTerminal(title: string, dir: string, args: string[], envVars: ITerminalEnvironment, settings: IExternalTerminalSettings): Promise<number | undefined>;
    spawnTerminal(spawner: typeof cp, configuration: IExternalTerminalSettings, cwd?: string): Promise<void>;
}
export declare class LinuxExternalTerminalService extends ExternalTerminalService implements IExternalTerminalMainService {
    private static readonly WAIT_MESSAGE;
    openTerminal(configuration: IExternalTerminalSettings, cwd?: string): Promise<void>;
    runInTerminal(title: string, dir: string, args: string[], envVars: ITerminalEnvironment, settings: IExternalTerminalSettings): Promise<number | undefined>;
    private static _DEFAULT_TERMINAL_LINUX_READY;
    static getDefaultTerminalLinuxReady(): Promise<string>;
    spawnTerminal(spawner: typeof cp, configuration: IExternalTerminalSettings, cwd?: string): Promise<void>;
}
export {};
