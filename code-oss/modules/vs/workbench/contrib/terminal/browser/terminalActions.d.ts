import { Action } from 'vs/base/common/actions';
import { URI } from 'vs/base/common/uri';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { Severity } from 'vs/platform/notification/common/notification';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { ITerminalProfile } from 'vs/platform/terminal/common/terminal';
import { IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
import { ITerminalInstance } from 'vs/workbench/contrib/terminal/browser/terminal';
import { ITerminalConfigHelper } from 'vs/workbench/contrib/terminal/common/terminal';
export declare const switchTerminalActionViewItemSeparator = "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500";
export declare const switchTerminalShowTabsTitle: string;
export interface WorkspaceFolderCwdPair {
    folder: IWorkspaceFolder;
    cwd: URI;
    isAbsolute: boolean;
    isOverridden: boolean;
}
export declare function getCwdForSplit(configHelper: ITerminalConfigHelper, instance: ITerminalInstance, folders?: IWorkspaceFolder[], commandService?: ICommandService): Promise<string | URI | undefined>;
export declare const terminalSendSequenceCommand: (accessor: ServicesAccessor, args: {
    text?: string;
} | undefined) => void;
export declare class TerminalLaunchHelpAction extends Action {
    private readonly _openerService;
    constructor(_openerService: IOpenerService);
    run(): Promise<void>;
}
export declare function registerTerminalActions(): void;
export declare function validateTerminalName(name: string): {
    content: string;
    severity: Severity;
} | null;
export declare function refreshTerminalActions(detectedProfiles: ITerminalProfile[]): void;
/**
 * Drops repeated CWDs, if any, by keeping the one which best matches the workspace folder. It also preserves the original order.
 */
export declare function shrinkWorkspaceFolderCwdPairs(pairs: WorkspaceFolderCwdPair[]): WorkspaceFolderCwdPair[];
