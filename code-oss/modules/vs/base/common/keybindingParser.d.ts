import { Keybinding, SimpleKeybinding, ScanCodeBinding } from 'vs/base/common/keybindings';
import { OperatingSystem } from 'vs/base/common/platform';
export declare class KeybindingParser {
    private static _readModifiers;
    private static parseSimpleKeybinding;
    static parseKeybinding(input: string, OS: OperatingSystem): Keybinding | null;
    private static parseSimpleUserBinding;
    static parseUserBinding(input: string): (SimpleKeybinding | ScanCodeBinding)[];
}
