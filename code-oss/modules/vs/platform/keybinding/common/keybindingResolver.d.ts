import { ContextKeyExpression, IContext, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { ResolvedKeybindingItem } from 'vs/platform/keybinding/common/resolvedKeybindingItem';
export interface IResolveResult {
    /** Whether the resolved keybinding is entering a chord */
    enterChord: boolean;
    /** Whether the resolved keybinding is leaving (and executing) a chord */
    leaveChord: boolean;
    commandId: string | null;
    commandArgs: any;
    bubble: boolean;
}
export declare class KeybindingResolver {
    private readonly _log;
    private readonly _defaultKeybindings;
    private readonly _keybindings;
    private readonly _defaultBoundCommands;
    private readonly _map;
    private readonly _lookupMap;
    constructor(defaultKeybindings: ResolvedKeybindingItem[], overrides: ResolvedKeybindingItem[], log: (str: string) => void);
    private static _isTargetedForRemoval;
    /**
     * Looks for rules containing "-commandId" and removes them.
     */
    static handleRemovals(rules: ResolvedKeybindingItem[]): ResolvedKeybindingItem[];
    private _addKeyPress;
    private _addToLookupMap;
    private _removeFromLookupMap;
    /**
     * Returns true if it is provable `a` implies `b`.
     */
    static whenIsEntirelyIncluded(a: ContextKeyExpression | null | undefined, b: ContextKeyExpression | null | undefined): boolean;
    getDefaultBoundCommands(): Map<string, boolean>;
    getDefaultKeybindings(): readonly ResolvedKeybindingItem[];
    getKeybindings(): readonly ResolvedKeybindingItem[];
    lookupKeybindings(commandId: string): ResolvedKeybindingItem[];
    lookupPrimaryKeybinding(commandId: string, context: IContextKeyService): ResolvedKeybindingItem | null;
    resolve(context: IContext, currentChord: string | null, keypress: string): IResolveResult | null;
    private _findCommand;
    private static _contextMatchesRules;
}
