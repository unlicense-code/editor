import { IAction } from 'vs/base/common/actions';
import { IMenu } from 'vs/platform/actions/common/actions';
import { IExtensionTerminalProfile, ITerminalProfile } from 'vs/platform/terminal/common/terminal';
import { ITerminalLocationOptions, ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
export declare const enum TerminalMenuBarGroup {
    Create = "1_create",
    Run = "2_run",
    Manage = "3_manage",
    Configure = "4_configure"
}
export declare function setupTerminalMenus(): void;
export declare function getTerminalActionBarArgs(location: ITerminalLocationOptions, profiles: ITerminalProfile[], defaultProfileName: string, contributedProfiles: readonly IExtensionTerminalProfile[], terminalService: ITerminalService, dropdownMenu: IMenu): {
    dropdownAction: IAction;
    dropdownMenuActions: IAction[];
    className: string;
    dropdownIcon?: string;
};
