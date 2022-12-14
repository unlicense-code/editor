import { KeyCode } from 'vs/base/common/keyCodes';
import { SimpleKeybinding } from 'vs/base/common/keybindings';
export interface IKeyboardEvent {
    readonly _standardKeyboardEventBrand: true;
    readonly browserEvent: KeyboardEvent;
    readonly target: HTMLElement;
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly keyCode: KeyCode;
    readonly code: string;
    /**
     * @internal
     */
    toKeybinding(): SimpleKeybinding;
    equals(keybinding: number): boolean;
    preventDefault(): void;
    stopPropagation(): void;
}
export declare function printKeyboardEvent(e: KeyboardEvent): string;
export declare function printStandardKeyboardEvent(e: StandardKeyboardEvent): string;
export declare class StandardKeyboardEvent implements IKeyboardEvent {
    readonly _standardKeyboardEventBrand = true;
    readonly browserEvent: KeyboardEvent;
    readonly target: HTMLElement;
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly keyCode: KeyCode;
    readonly code: string;
    private _asKeybinding;
    private _asRuntimeKeybinding;
    constructor(source: KeyboardEvent);
    preventDefault(): void;
    stopPropagation(): void;
    toKeybinding(): SimpleKeybinding;
    equals(other: number): boolean;
    private _computeKeybinding;
    private _computeRuntimeKeybinding;
}
