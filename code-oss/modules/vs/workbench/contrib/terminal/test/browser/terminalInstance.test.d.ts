import { ITerminalInstance } from 'vs/workbench/contrib/terminal/browser/terminal';
export declare function createInstance(partial?: Partial<ITerminalInstance>): Pick<ITerminalInstance, 'shellLaunchConfig' | 'userHome' | 'cwd' | 'initialCwd' | 'processName' | 'sequence' | 'workspaceFolder' | 'staticTitle' | 'capabilities' | 'title' | 'description'>;
