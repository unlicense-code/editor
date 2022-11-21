import { IAction } from 'vs/base/common/actions';
import { IListMenuItem } from 'vs/platform/actionWidget/browser/actionList';
import { IActionItem } from 'vs/platform/actionWidget/common/actionWidget';
export declare const enum TerminalQuickFixType {
    Command = "command",
    Opener = "opener",
    Port = "port"
}
export declare class TerminalQuickFix implements IActionItem {
    action: IAction;
    type: string;
    disabled?: boolean;
    title?: string;
    constructor(action: IAction, type: string, title?: string, disabled?: boolean);
}
export declare function toMenuItems(inputQuickFixes: readonly TerminalQuickFix[], showHeaders: boolean): IListMenuItem<TerminalQuickFix>[];
