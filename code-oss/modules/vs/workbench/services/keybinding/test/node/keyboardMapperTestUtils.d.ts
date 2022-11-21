import { Keybinding, KeybindingModifier, SimpleKeybinding, ScanCodeBinding } from 'vs/base/common/keybindings';
import { IKeyboardEvent } from 'vs/platform/keybinding/common/keybinding';
import { IKeyboardMapper } from 'vs/platform/keyboardLayout/common/keyboardMapper';
export interface IResolvedKeybinding {
    label: string | null;
    ariaLabel: string | null;
    electronAccelerator: string | null;
    userSettingsLabel: string | null;
    isWYSIWYG: boolean;
    isChord: boolean;
    dispatchParts: (string | null)[];
    singleModifierDispatchParts: (KeybindingModifier | null)[];
}
export declare function assertResolveKeybinding(mapper: IKeyboardMapper, keybinding: Keybinding | null, expected: IResolvedKeybinding[]): void;
export declare function assertResolveKeyboardEvent(mapper: IKeyboardMapper, keyboardEvent: IKeyboardEvent, expected: IResolvedKeybinding): void;
export declare function assertResolveUserBinding(mapper: IKeyboardMapper, parts: (SimpleKeybinding | ScanCodeBinding)[], expected: IResolvedKeybinding[]): void;
export declare function readRawMapping<T>(file: string): Promise<T>;
export declare function assertMapping(writeFileIfDifferent: boolean, mapper: IKeyboardMapper, file: string): Promise<void>;
