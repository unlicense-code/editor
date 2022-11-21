import { Keybinding, ResolvedKeybinding, SimpleKeybinding, KeybindingModifier, ScanCodeBinding } from 'vs/base/common/keybindings';
import { OperatingSystem } from 'vs/base/common/platform';
import { IKeyboardEvent } from 'vs/platform/keybinding/common/keybinding';
import { IKeyboardMapper } from 'vs/platform/keyboardLayout/common/keyboardMapper';
import { BaseResolvedKeybinding } from 'vs/platform/keybinding/common/baseResolvedKeybinding';
import { IMacLinuxKeyboardMapping } from 'vs/platform/keyboardLayout/common/keyboardLayout';
export declare class NativeResolvedKeybinding extends BaseResolvedKeybinding<ScanCodeBinding> {
    private readonly _mapper;
    constructor(mapper: MacLinuxKeyboardMapper, os: OperatingSystem, parts: ScanCodeBinding[]);
    protected _getLabel(keybinding: ScanCodeBinding): string | null;
    protected _getAriaLabel(keybinding: ScanCodeBinding): string | null;
    protected _getElectronAccelerator(keybinding: ScanCodeBinding): string | null;
    protected _getUserSettingsLabel(keybinding: ScanCodeBinding): string | null;
    protected _isWYSIWYG(binding: ScanCodeBinding | null): boolean;
    protected _getDispatchPart(keybinding: ScanCodeBinding): string | null;
    protected _getSingleModifierDispatchPart(keybinding: ScanCodeBinding): KeybindingModifier | null;
}
export declare class MacLinuxKeyboardMapper implements IKeyboardMapper {
    /**
     * Is this the standard US keyboard layout?
     */
    private readonly _isUSStandard;
    /**
     * OS (can be Linux or Macintosh)
     */
    private readonly _OS;
    /**
     * used only for debug purposes.
     */
    private readonly _codeInfo;
    /**
     * Maps ScanCode combos <-> KeyCode combos.
     */
    private readonly _scanCodeKeyCodeMapper;
    /**
     * UI label for a ScanCode.
     */
    private readonly _scanCodeToLabel;
    /**
     * Dispatching string for a ScanCode.
     */
    private readonly _scanCodeToDispatch;
    constructor(isUSStandard: boolean, rawMappings: IMacLinuxKeyboardMapping, OS: OperatingSystem);
    dumpDebugInfo(): string;
    private _leftPad;
    simpleKeybindingToScanCodeBinding(keybinding: SimpleKeybinding): ScanCodeBinding[];
    getUILabelForScanCodeBinding(binding: ScanCodeBinding | null): string | null;
    getAriaLabelForScanCodeBinding(binding: ScanCodeBinding | null): string | null;
    getDispatchStrForScanCodeBinding(keypress: ScanCodeBinding): string | null;
    getUserSettingsLabelForScanCodeBinding(binding: ScanCodeBinding | null): string | null;
    getElectronAcceleratorLabelForScanCodeBinding(binding: ScanCodeBinding | null): string | null;
    resolveKeybinding(keybinding: Keybinding): NativeResolvedKeybinding[];
    private _toResolvedKeybinding;
    private _generateResolvedKeybindings;
    resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): NativeResolvedKeybinding;
    private _resolveSimpleUserBinding;
    resolveUserBinding(input: (SimpleKeybinding | ScanCodeBinding)[]): ResolvedKeybinding[];
    private static _redirectCharCode;
    private static _charCodeToKb;
    /**
     * Attempt to map a combining character to a regular one that renders the same way.
     *
     * https://www.compart.com/en/unicode/bidiclass/NSM
     */
    static getCharCode(char: string): number;
}
