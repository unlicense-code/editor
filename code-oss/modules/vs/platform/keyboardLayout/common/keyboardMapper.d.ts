import { Keybinding, ResolvedKeybinding, SimpleKeybinding, ScanCodeBinding } from 'vs/base/common/keybindings';
import { IKeyboardEvent } from 'vs/platform/keybinding/common/keybinding';
export interface IKeyboardMapper {
    dumpDebugInfo(): string;
    resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];
    resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): ResolvedKeybinding;
    resolveUserBinding(parts: (SimpleKeybinding | ScanCodeBinding)[]): ResolvedKeybinding[];
}
export declare class CachedKeyboardMapper implements IKeyboardMapper {
    private _actual;
    private _cache;
    constructor(actual: IKeyboardMapper);
    dumpDebugInfo(): string;
    resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];
    resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): ResolvedKeybinding;
    resolveUserBinding(parts: (SimpleKeybinding | ScanCodeBinding)[]): ResolvedKeybinding[];
}
