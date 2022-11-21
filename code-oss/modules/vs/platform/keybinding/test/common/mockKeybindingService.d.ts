import { Event } from 'vs/base/common/event';
import { Keybinding, ResolvedKeybinding } from 'vs/base/common/keybindings';
import { ContextKeyExpression, ContextKeyValue, IContextKey, IContextKeyChangeEvent, IContextKeyService, IContextKeyServiceTarget } from 'vs/platform/contextkey/common/contextkey';
import { IKeybindingService, IKeyboardEvent } from 'vs/platform/keybinding/common/keybinding';
import { IResolveResult } from 'vs/platform/keybinding/common/keybindingResolver';
import { ResolvedKeybindingItem } from 'vs/platform/keybinding/common/resolvedKeybindingItem';
export declare class MockContextKeyService implements IContextKeyService {
    _serviceBrand: undefined;
    private _keys;
    dispose(): void;
    createKey<T extends ContextKeyValue = ContextKeyValue>(key: string, defaultValue: T | undefined): IContextKey<T>;
    contextMatchesRules(rules: ContextKeyExpression): boolean;
    get onDidChangeContext(): Event<IContextKeyChangeEvent>;
    bufferChangeEvents(callback: () => void): void;
    getContextKeyValue(key: string): any;
    getContext(domNode: HTMLElement): any;
    createScoped(domNode: HTMLElement): IContextKeyService;
    createOverlay(): IContextKeyService;
    updateParent(_parentContextKeyService: IContextKeyService): void;
}
export declare class MockScopableContextKeyService extends MockContextKeyService {
    /**
     * Don't implement this for all tests since we rarely depend on this behavior and it isn't implemented fully
     */
    createScoped(domNote: HTMLElement): IContextKeyService;
}
export declare class MockKeybindingService implements IKeybindingService {
    _serviceBrand: undefined;
    readonly inChordMode: boolean;
    get onDidUpdateKeybindings(): Event<void>;
    getDefaultKeybindingsContent(): string;
    getDefaultKeybindings(): ResolvedKeybindingItem[];
    getKeybindings(): ResolvedKeybindingItem[];
    resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];
    resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): ResolvedKeybinding;
    resolveUserBinding(userBinding: string): ResolvedKeybinding[];
    lookupKeybindings(commandId: string): ResolvedKeybinding[];
    lookupKeybinding(commandId: string): ResolvedKeybinding | undefined;
    customKeybindingsCount(): number;
    softDispatch(keybinding: IKeyboardEvent, target: IContextKeyServiceTarget): IResolveResult | null;
    dispatchByUserSettingsLabel(userSettingsLabel: string, target: IContextKeyServiceTarget): void;
    dispatchEvent(e: IKeyboardEvent, target: IContextKeyServiceTarget): boolean;
    mightProducePrintableCharacter(e: IKeyboardEvent): boolean;
    toggleLogging(): boolean;
    _dumpDebugInfo(): string;
    _dumpDebugInfoJSON(): string;
    registerSchemaContribution(): void;
}
