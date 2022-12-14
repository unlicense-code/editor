import { KeyCode, ScanCode } from 'vs/base/common/keyCodes';
import { OperatingSystem } from 'vs/base/common/platform';
export declare function createKeybinding(keybinding: number, OS: OperatingSystem): Keybinding | null;
export declare function createSimpleKeybinding(keybinding: number, OS: OperatingSystem): SimpleKeybinding;
export interface Modifiers {
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
}
export interface IBaseKeybinding extends Modifiers {
    isDuplicateModifierCase(): boolean;
}
export declare class SimpleKeybinding implements IBaseKeybinding {
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly keyCode: KeyCode;
    constructor(ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean, keyCode: KeyCode);
    equals(other: SimpleKeybinding): boolean;
    getHashCode(): string;
    isModifierKey(): boolean;
    toChord(): ChordKeybinding;
    /**
     * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
     */
    isDuplicateModifierCase(): boolean;
}
export declare class ChordKeybinding {
    readonly parts: SimpleKeybinding[];
    constructor(parts: SimpleKeybinding[]);
    getHashCode(): string;
    equals(other: ChordKeybinding | null): boolean;
}
export declare type Keybinding = ChordKeybinding;
export declare class ScanCodeBinding implements IBaseKeybinding {
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly scanCode: ScanCode;
    constructor(ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean, scanCode: ScanCode);
    equals(other: ScanCodeBinding): boolean;
    /**
     * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
     */
    isDuplicateModifierCase(): boolean;
}
export declare class ResolvedKeybindingPart {
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly keyLabel: string | null;
    readonly keyAriaLabel: string | null;
    constructor(ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean, kbLabel: string | null, kbAriaLabel: string | null);
}
export declare type KeybindingModifier = 'ctrl' | 'shift' | 'alt' | 'meta';
/**
 * A resolved keybinding. Can be a simple keybinding or a chord keybinding.
 */
export declare abstract class ResolvedKeybinding {
    /**
     * This prints the binding in a format suitable for displaying in the UI.
     */
    abstract getLabel(): string | null;
    /**
     * This prints the binding in a format suitable for ARIA.
     */
    abstract getAriaLabel(): string | null;
    /**
     * This prints the binding in a format suitable for electron's accelerators.
     * See https://github.com/electron/electron/blob/master/docs/api/accelerator.md
     */
    abstract getElectronAccelerator(): string | null;
    /**
     * This prints the binding in a format suitable for user settings.
     */
    abstract getUserSettingsLabel(): string | null;
    /**
     * Is the user settings label reflecting the label?
     */
    abstract isWYSIWYG(): boolean;
    /**
     * Is the binding a chord?
     */
    abstract isChord(): boolean;
    /**
     * Returns the parts that comprise of the keybinding.
     * Simple keybindings return one element.
     */
    abstract getParts(): ResolvedKeybindingPart[];
    /**
     * Returns the parts that should be used for dispatching.
     * Returns null for parts consisting of only modifier keys
     * @example keybinding "Shift" -> null
     * @example keybinding ("D" with shift == true) -> "shift+D"
     */
    abstract getDispatchParts(): (string | null)[];
    /**
     * Returns the parts that should be used for dispatching single modifier keys
     * Returns null for parts that contain more than one modifier or a regular key.
     * @example keybinding "Shift" -> "shift"
     * @example keybinding ("D" with shift == true") -> null
     */
    abstract getSingleModifierDispatchParts(): (KeybindingModifier | null)[];
}
