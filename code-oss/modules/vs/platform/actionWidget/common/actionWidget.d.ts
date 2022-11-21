import { ResolvedKeybinding } from 'vs/base/common/keybindings';
import { IDisposable } from 'vs/base/common/lifecycle';
export interface ActionSet<T> extends IDisposable {
    readonly validActions: readonly T[];
    readonly allActions: readonly T[];
    readonly hasAutoFix: boolean;
    readonly documentation: readonly {
        id: string;
        title: string;
        tooltip?: string;
        commandArguments?: any[];
    }[];
}
export interface IActionItem {
    action: any;
}
export interface IActionKeybindingResolver {
    getResolver(): (action: any) => ResolvedKeybinding | undefined;
}
