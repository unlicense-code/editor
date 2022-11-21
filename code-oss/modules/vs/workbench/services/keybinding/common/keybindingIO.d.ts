import { SimpleKeybinding, ScanCodeBinding } from 'vs/base/common/keybindings';
import { ContextKeyExpression } from 'vs/platform/contextkey/common/contextkey';
import { IUserFriendlyKeybinding } from 'vs/platform/keybinding/common/keybinding';
import { ResolvedKeybindingItem } from 'vs/platform/keybinding/common/resolvedKeybindingItem';
export interface IUserKeybindingItem {
    parts: (SimpleKeybinding | ScanCodeBinding)[];
    command: string | null;
    commandArgs?: any;
    when: ContextKeyExpression | undefined;
}
export declare class KeybindingIO {
    static writeKeybindingItem(out: OutputBuilder, item: ResolvedKeybindingItem): void;
    static readUserKeybindingItem(input: IUserFriendlyKeybinding): IUserKeybindingItem;
}
export declare class OutputBuilder {
    private _lines;
    private _currentLine;
    write(str: string): void;
    writeLine(str?: string): void;
    toString(): string;
}
