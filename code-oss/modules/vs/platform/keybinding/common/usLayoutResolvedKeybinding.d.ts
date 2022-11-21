import { Keybinding, KeybindingModifier, SimpleKeybinding, ScanCodeBinding } from 'vs/base/common/keybindings';
import { OperatingSystem } from 'vs/base/common/platform';
import { BaseResolvedKeybinding } from 'vs/platform/keybinding/common/baseResolvedKeybinding';
/**
 * Do not instantiate. Use KeybindingService to get a ResolvedKeybinding seeded with information about the current kb layout.
 */
export declare class USLayoutResolvedKeybinding extends BaseResolvedKeybinding<SimpleKeybinding> {
    constructor(actual: Keybinding, os: OperatingSystem);
    private _keyCodeToUILabel;
    protected _getLabel(keybinding: SimpleKeybinding): string | null;
    protected _getAriaLabel(keybinding: SimpleKeybinding): string | null;
    protected _getElectronAccelerator(keybinding: SimpleKeybinding): string | null;
    protected _getUserSettingsLabel(keybinding: SimpleKeybinding): string | null;
    protected _isWYSIWYG(): boolean;
    protected _getDispatchPart(keybinding: SimpleKeybinding): string | null;
    static getDispatchStr(keybinding: SimpleKeybinding): string | null;
    protected _getSingleModifierDispatchPart(keybinding: SimpleKeybinding): KeybindingModifier | null;
    /**
     * *NOTE*: Check return value for `KeyCode.Unknown`.
     */
    private static _scanCodeToKeyCode;
    private static _resolveSimpleUserBinding;
    static resolveUserBinding(input: (SimpleKeybinding | ScanCodeBinding)[], os: OperatingSystem): USLayoutResolvedKeybinding[];
}
