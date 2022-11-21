import { Keybinding, ResolvedKeybinding, SimpleKeybinding, ScanCodeBinding } from 'vs/base/common/keybindings';
import { OperatingSystem } from 'vs/base/common/platform';
import { IKeyboardEvent } from 'vs/platform/keybinding/common/keybinding';
import { IKeyboardMapper } from 'vs/platform/keyboardLayout/common/keyboardMapper';
/**
 * A keyboard mapper to be used when reading the keymap from the OS fails.
 */
export declare class MacLinuxFallbackKeyboardMapper implements IKeyboardMapper {
    /**
     * OS (can be Linux or Macintosh)
     */
    private readonly _OS;
    constructor(OS: OperatingSystem);
    dumpDebugInfo(): string;
    resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];
    resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): ResolvedKeybinding;
    resolveUserBinding(input: (SimpleKeybinding | ScanCodeBinding)[]): ResolvedKeybinding[];
}
