import { Disposable } from 'vs/base/common/lifecycle';
import { IActiveCodeEditor } from 'vs/editor/browser/editorBrowser';
import { Range } from 'vs/editor/common/core/range';
import { InlineCompletionTriggerKind } from 'vs/editor/common/languages';
import { GhostText, GhostTextReplacement, GhostTextWidgetModel } from 'vs/editor/contrib/inlineCompletions/browser/ghostText';
import { InlineCompletionsModel, SynchronizedInlineCompletionsCache, TrackedInlineCompletions } from 'vs/editor/contrib/inlineCompletions/browser/inlineCompletionsModel';
import { SuggestWidgetPreviewModel } from 'vs/editor/contrib/inlineCompletions/browser/suggestWidgetPreviewModel';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
export declare abstract class DelegatingModel extends Disposable implements GhostTextWidgetModel {
    private readonly onDidChangeEmitter;
    readonly onDidChange: import("vs/base/common/event").Event<void>;
    private hasCachedGhostText;
    private cachedGhostText;
    private readonly currentModelRef;
    protected get targetModel(): GhostTextWidgetModel | undefined;
    protected setTargetModel(model: GhostTextWidgetModel | undefined): void;
    get ghostText(): GhostText | GhostTextReplacement | undefined;
    setExpanded(expanded: boolean): void;
    get expanded(): boolean;
    get minReservedLineCount(): number;
}
/**
 * A ghost text model that is both driven by inline completions and the suggest widget.
*/
export declare class GhostTextModel extends DelegatingModel implements GhostTextWidgetModel {
    private readonly editor;
    private readonly instantiationService;
    readonly sharedCache: SharedInlineCompletionCache;
    readonly suggestWidgetAdapterModel: SuggestWidgetPreviewModel;
    readonly inlineCompletionsModel: InlineCompletionsModel;
    get activeInlineCompletionsModel(): InlineCompletionsModel | undefined;
    constructor(editor: IActiveCodeEditor, instantiationService: IInstantiationService);
    private updateModel;
    shouldShowHoverAt(hoverRange: Range): boolean;
    triggerInlineCompletion(): void;
    commitInlineCompletion(): void;
    hideInlineCompletion(): void;
    showNextInlineCompletion(): void;
    showPreviousInlineCompletion(): void;
    hasMultipleInlineCompletions(): Promise<boolean>;
}
export declare class SharedInlineCompletionCache extends Disposable {
    private readonly onDidChangeEmitter;
    readonly onDidChange: import("vs/base/common/event").Event<void>;
    private readonly cache;
    get value(): SynchronizedInlineCompletionsCache | undefined;
    setValue(editor: IActiveCodeEditor, completionsSource: TrackedInlineCompletions, triggerKind: InlineCompletionTriggerKind): void;
    clearAndLeak(): SynchronizedInlineCompletionsCache | undefined;
    clear(): void;
}
