import { CancelablePromise } from 'vs/base/common/async';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Emitter } from 'vs/base/common/event';
import { Disposable, IDisposable, MutableDisposable } from 'vs/base/common/lifecycle';
import { IActiveCodeEditor } from 'vs/editor/browser/editorBrowser';
import { Position } from 'vs/editor/common/core/position';
import { Range } from 'vs/editor/common/core/range';
import { ITextModel } from 'vs/editor/common/model';
import { Command, InlineCompletion, InlineCompletionContext, InlineCompletions, InlineCompletionsProvider, InlineCompletionTriggerKind } from 'vs/editor/common/languages';
import { BaseGhostTextWidgetModel, GhostText, GhostTextReplacement, GhostTextWidgetModel } from 'vs/editor/contrib/inlineCompletions/browser/ghostText';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { SharedInlineCompletionCache } from 'vs/editor/contrib/inlineCompletions/browser/ghostTextModel';
import { NormalizedInlineCompletion } from 'vs/editor/contrib/inlineCompletions/browser/inlineCompletionToGhostText';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { LanguageFeatureRegistry } from 'vs/editor/common/languageFeatureRegistry';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { IFeatureDebounceInformation, ILanguageFeatureDebounceService } from 'vs/editor/common/services/languageFeatureDebounce';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export declare class InlineCompletionsModel extends Disposable implements GhostTextWidgetModel {
    private readonly editor;
    private readonly cache;
    private readonly commandService;
    private readonly languageConfigurationService;
    private readonly languageFeaturesService;
    private readonly debounceService;
    protected readonly onDidChangeEmitter: Emitter<void>;
    readonly onDidChange: import("vs/base/common/event").Event<void>;
    readonly completionSession: MutableDisposable<InlineCompletionsSession>;
    private active;
    private disposed;
    private readonly debounceValue;
    constructor(editor: IActiveCodeEditor, cache: SharedInlineCompletionCache, commandService: ICommandService, languageConfigurationService: ILanguageConfigurationService, languageFeaturesService: ILanguageFeaturesService, debounceService: ILanguageFeatureDebounceService, configurationService: IConfigurationService);
    private handleUserInput;
    private get session();
    get ghostText(): GhostText | GhostTextReplacement | undefined;
    get minReservedLineCount(): number;
    get expanded(): boolean;
    setExpanded(expanded: boolean): void;
    setActive(active: boolean): void;
    private startSessionIfTriggered;
    trigger(triggerKind: InlineCompletionTriggerKind): void;
    hide(): void;
    commitCurrentSuggestion(): void;
    showNext(): void;
    showPrevious(): void;
    hasMultipleInlineCompletions(): Promise<boolean>;
}
export declare class InlineCompletionsSession extends BaseGhostTextWidgetModel {
    private readonly triggerPosition;
    private readonly shouldUpdate;
    private readonly commandService;
    private readonly cache;
    private initialTriggerKind;
    private readonly languageConfigurationService;
    private readonly registry;
    private readonly debounce;
    readonly minReservedLineCount = 0;
    private readonly updateOperation;
    private readonly updateSoon;
    constructor(editor: IActiveCodeEditor, triggerPosition: Position, shouldUpdate: () => boolean, commandService: ICommandService, cache: SharedInlineCompletionCache, initialTriggerKind: InlineCompletionTriggerKind, languageConfigurationService: ILanguageConfigurationService, registry: LanguageFeatureRegistry<InlineCompletionsProvider>, debounce: IFeatureDebounceInformation);
    private filteredCompletions;
    private updateFilteredInlineCompletions;
    private currentlySelectedCompletionId;
    private fixAndGetIndexOfCurrentSelection;
    private get currentCachedCompletion();
    showNextInlineCompletion(): Promise<void>;
    showPreviousInlineCompletion(): Promise<void>;
    ensureUpdateWithExplicitContext(): Promise<void>;
    hasMultipleInlineCompletions(): Promise<boolean>;
    get ghostText(): GhostText | GhostTextReplacement | undefined;
    get currentCompletion(): TrackedInlineCompletion | undefined;
    get isValid(): boolean;
    scheduleAutomaticUpdate(): void;
    private update;
    takeOwnership(disposable: IDisposable): void;
    commitCurrentCompletion(): void;
    commit(completion: TrackedInlineCompletion): void;
    get commands(): Command[];
}
export declare class UpdateOperation implements IDisposable {
    readonly promise: CancelablePromise<void>;
    readonly triggerKind: InlineCompletionTriggerKind;
    constructor(promise: CancelablePromise<void>, triggerKind: InlineCompletionTriggerKind);
    dispose(): void;
}
/**
 * The cache keeps itself in sync with the editor.
 * It also owns the completions result and disposes it when the cache is diposed.
*/
export declare class SynchronizedInlineCompletionsCache extends Disposable {
    private readonly editor;
    private readonly onChange;
    readonly triggerKind: InlineCompletionTriggerKind;
    readonly completions: readonly CachedInlineCompletion[];
    private isDisposing;
    constructor(completionsSource: TrackedInlineCompletions, editor: IActiveCodeEditor, onChange: () => void, triggerKind: InlineCompletionTriggerKind);
    updateRanges(): void;
}
declare class CachedInlineCompletion {
    readonly inlineCompletion: TrackedInlineCompletion;
    readonly decorationId: string;
    readonly semanticId: string;
    /**
     * The range, synchronized with text model changes.
    */
    synchronizedRange: Range;
    constructor(inlineCompletion: TrackedInlineCompletion, decorationId: string);
    toLiveInlineCompletion(): TrackedInlineCompletion | undefined;
}
export declare function provideInlineCompletions(registry: LanguageFeatureRegistry<InlineCompletionsProvider>, position: Position, model: ITextModel, context: InlineCompletionContext, token?: CancellationToken, languageConfigurationService?: ILanguageConfigurationService): Promise<TrackedInlineCompletions>;
/**
 * Contains no duplicated items and can be disposed.
*/
export interface TrackedInlineCompletions {
    readonly items: readonly TrackedInlineCompletion[];
    dispose(): void;
}
/**
 * A normalized inline completion that tracks which inline completion it has been constructed from.
*/
export interface TrackedInlineCompletion extends NormalizedInlineCompletion {
    sourceProvider: InlineCompletionsProvider;
    /**
     * A reference to the original inline completion this inline completion has been constructed from.
     * Used for event data to ensure referential equality.
    */
    sourceInlineCompletion: InlineCompletion;
    /**
     * A reference to the original inline completion list this inline completion has been constructed from.
     * Used for event data to ensure referential equality.
    */
    sourceInlineCompletions: InlineCompletions;
}
export {};
