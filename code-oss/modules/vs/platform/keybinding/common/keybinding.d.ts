import { Event } from 'vs/base/common/event';
import { IJSONSchema } from 'vs/base/common/jsonSchema';
import { KeyCode } from 'vs/base/common/keyCodes';
import { Keybinding, ResolvedKeybinding } from 'vs/base/common/keybindings';
import { IContextKeyService, IContextKeyServiceTarget } from 'vs/platform/contextkey/common/contextkey';
import { IResolveResult } from 'vs/platform/keybinding/common/keybindingResolver';
import { ResolvedKeybindingItem } from 'vs/platform/keybinding/common/resolvedKeybindingItem';
export interface IUserFriendlyKeybinding {
    key: string;
    command: string;
    args?: any;
    when?: string;
}
export interface IKeyboardEvent {
    readonly _standardKeyboardEventBrand: true;
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly keyCode: KeyCode;
    readonly code: string;
}
export interface KeybindingsSchemaContribution {
    readonly onDidChange?: Event<void>;
    getSchemaAdditions(): IJSONSchema[];
}
export declare const IKeybindingService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IKeybindingService>;
export interface IKeybindingService {
    readonly _serviceBrand: undefined;
    readonly inChordMode: boolean;
    onDidUpdateKeybindings: Event<void>;
    /**
     * Returns none, one or many (depending on keyboard layout)!
     */
    resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];
    resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): ResolvedKeybinding;
    resolveUserBinding(userBinding: string): ResolvedKeybinding[];
    /**
     * Resolve and dispatch `keyboardEvent` and invoke the command.
     */
    dispatchEvent(e: IKeyboardEvent, target: IContextKeyServiceTarget): boolean;
    /**
     * Resolve and dispatch `keyboardEvent`, but do not invoke the command or change inner state.
     */
    softDispatch(keyboardEvent: IKeyboardEvent, target: IContextKeyServiceTarget): IResolveResult | null;
    dispatchByUserSettingsLabel(userSettingsLabel: string, target: IContextKeyServiceTarget): void;
    /**
     * Look up keybindings for a command.
     * Use `lookupKeybinding` if you are interested in the preferred keybinding.
     */
    lookupKeybindings(commandId: string): ResolvedKeybinding[];
    /**
     * Look up the preferred (last defined) keybinding for a command.
     * @returns The preferred keybinding or null if the command is not bound.
     */
    lookupKeybinding(commandId: string, context?: IContextKeyService): ResolvedKeybinding | undefined;
    getDefaultKeybindingsContent(): string;
    getDefaultKeybindings(): readonly ResolvedKeybindingItem[];
    getKeybindings(): readonly ResolvedKeybindingItem[];
    customKeybindingsCount(): number;
    /**
     * Will the given key event produce a character that's rendered on screen, e.g. in a
     * text box. *Note* that the results of this function can be incorrect.
     */
    mightProducePrintableCharacter(event: IKeyboardEvent): boolean;
    registerSchemaContribution(contribution: KeybindingsSchemaContribution): void;
    toggleLogging(): boolean;
    _dumpDebugInfo(): string;
    _dumpDebugInfoJSON(): string;
}