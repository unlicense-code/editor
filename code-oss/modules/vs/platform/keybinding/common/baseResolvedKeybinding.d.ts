import { IBaseKeybinding, KeybindingModifier, ResolvedKeybinding, ResolvedKeybindingPart } from 'vs/base/common/keybindings';
import { OperatingSystem } from 'vs/base/common/platform';
export declare abstract class BaseResolvedKeybinding<T extends IBaseKeybinding> extends ResolvedKeybinding {
    protected readonly _os: OperatingSystem;
    protected readonly _parts: readonly T[];
    constructor(os: OperatingSystem, parts: readonly T[]);
    getLabel(): string | null;
    getAriaLabel(): string | null;
    getElectronAccelerator(): string | null;
    getUserSettingsLabel(): string | null;
    isWYSIWYG(): boolean;
    isChord(): boolean;
    getParts(): ResolvedKeybindingPart[];
    private _getPart;
    getDispatchParts(): (string | null)[];
    getSingleModifierDispatchParts(): (KeybindingModifier | null)[];
    protected abstract _getLabel(keybinding: T): string | null;
    protected abstract _getAriaLabel(keybinding: T): string | null;
    protected abstract _getElectronAccelerator(keybinding: T): string | null;
    protected abstract _getUserSettingsLabel(keybinding: T): string | null;
    protected abstract _isWYSIWYG(keybinding: T): boolean;
    protected abstract _getDispatchPart(keybinding: T): string | null;
    protected abstract _getSingleModifierDispatchPart(keybinding: T): KeybindingModifier | null;
}
