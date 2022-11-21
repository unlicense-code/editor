import { KeyCode, ScanCode } from 'vs/base/common/keyCodes';
import { Keybinding, ResolvedKeybinding, SimpleKeybinding, KeybindingModifier, ScanCodeBinding } from 'vs/base/common/keybindings';
import { IKeyboardEvent } from 'vs/platform/keybinding/common/keybinding';
import { IKeyboardMapper } from 'vs/platform/keyboardLayout/common/keyboardMapper';
import { BaseResolvedKeybinding } from 'vs/platform/keybinding/common/baseResolvedKeybinding';
import { IWindowsKeyboardMapping } from 'vs/platform/keyboardLayout/common/keyboardLayout';
export interface IScanCodeMapping {
    scanCode: ScanCode;
    keyCode: KeyCode;
    value: string;
    withShift: string;
    withAltGr: string;
    withShiftAltGr: string;
}
export declare class WindowsNativeResolvedKeybinding extends BaseResolvedKeybinding<SimpleKeybinding> {
    private readonly _mapper;
    constructor(mapper: WindowsKeyboardMapper, parts: SimpleKeybinding[]);
    protected _getLabel(keybinding: SimpleKeybinding): string | null;
    private _getUSLabelForKeybinding;
    getUSLabel(): string | null;
    protected _getAriaLabel(keybinding: SimpleKeybinding): string | null;
    protected _getElectronAccelerator(keybinding: SimpleKeybinding): string | null;
    protected _getUserSettingsLabel(keybinding: SimpleKeybinding): string | null;
    protected _isWYSIWYG(keybinding: SimpleKeybinding): boolean;
    private __isWYSIWYG;
    protected _getDispatchPart(keybinding: SimpleKeybinding): string | null;
    protected _getSingleModifierDispatchPart(keybinding: SimpleKeybinding): KeybindingModifier | null;
    private static getProducedCharCode;
    static getProducedChar(kb: ScanCodeBinding, mapping: IScanCodeMapping): string;
}
export declare class WindowsKeyboardMapper implements IKeyboardMapper {
    readonly isUSStandard: boolean;
    private readonly _codeInfo;
    private readonly _scanCodeToKeyCode;
    private readonly _keyCodeToLabel;
    private readonly _keyCodeExists;
    constructor(isUSStandard: boolean, rawMappings: IWindowsKeyboardMapping);
    dumpDebugInfo(): string;
    private _leftPad;
    getUILabelForKeyCode(keyCode: KeyCode): string;
    getAriaLabelForKeyCode(keyCode: KeyCode): string;
    getUserSettingsLabelForKeyCode(keyCode: KeyCode): string;
    getElectronAcceleratorForKeyBinding(keybinding: SimpleKeybinding): string | null;
    private _getLabelForKeyCode;
    resolveKeybinding(keybinding: Keybinding): WindowsNativeResolvedKeybinding[];
    resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): WindowsNativeResolvedKeybinding;
    private _resolveSimpleUserBinding;
    resolveUserBinding(input: (SimpleKeybinding | ScanCodeBinding)[]): ResolvedKeybinding[];
}
