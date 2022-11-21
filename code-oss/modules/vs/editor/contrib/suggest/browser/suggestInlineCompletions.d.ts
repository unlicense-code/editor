import { CancellationToken } from 'vs/base/common/cancellation';
import { RefCountedDisposable } from 'vs/base/common/lifecycle';
import { EditorOption, FindComputedEditorOptionValueById } from 'vs/editor/common/config/editorOptions';
import { ISingleEditOperation } from 'vs/editor/common/core/editOperation';
import { Position } from 'vs/editor/common/core/position';
import { IRange } from 'vs/editor/common/core/range';
import { IWordAtPosition } from 'vs/editor/common/core/wordHelper';
import { Command, InlineCompletion, InlineCompletionContext, InlineCompletions, InlineCompletionsProvider } from 'vs/editor/common/languages';
import { ITextModel } from 'vs/editor/common/model';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { CompletionModel } from 'vs/editor/contrib/suggest/browser/completionModel';
import { CompletionItem, CompletionItemModel } from 'vs/editor/contrib/suggest/browser/suggest';
import { ISuggestMemoryService } from 'vs/editor/contrib/suggest/browser/suggestMemory';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
declare class SuggestInlineCompletion implements InlineCompletion {
    readonly range: IRange;
    readonly insertText: string | {
        snippet: string;
    };
    readonly filterText: string;
    readonly additionalTextEdits: ISingleEditOperation[] | undefined;
    readonly command: Command | undefined;
    readonly completion: CompletionItem;
    constructor(range: IRange, insertText: string | {
        snippet: string;
    }, filterText: string, additionalTextEdits: ISingleEditOperation[] | undefined, command: Command | undefined, completion: CompletionItem);
}
declare class InlineCompletionResults extends RefCountedDisposable implements InlineCompletions<SuggestInlineCompletion> {
    readonly model: ITextModel;
    readonly line: number;
    readonly word: IWordAtPosition;
    readonly completionModel: CompletionModel;
    private readonly _suggestMemoryService;
    constructor(model: ITextModel, line: number, word: IWordAtPosition, completionModel: CompletionModel, completions: CompletionItemModel, _suggestMemoryService: ISuggestMemoryService);
    canBeReused(model: ITextModel, line: number, word: IWordAtPosition): boolean;
    get items(): SuggestInlineCompletion[];
}
export declare class SuggestInlineCompletions implements InlineCompletionsProvider<InlineCompletionResults> {
    private readonly _getEditorOption;
    private readonly _languageFeatureService;
    private readonly _clipboardService;
    private readonly _suggestMemoryService;
    private _lastResult?;
    constructor(_getEditorOption: <T extends EditorOption>(id: T, model: ITextModel) => FindComputedEditorOptionValueById<T>, _languageFeatureService: ILanguageFeaturesService, _clipboardService: IClipboardService, _suggestMemoryService: ISuggestMemoryService);
    provideInlineCompletions(model: ITextModel, position: Position, context: InlineCompletionContext, token: CancellationToken): Promise<InlineCompletionResults | undefined>;
    handleItemDidShow(_completions: InlineCompletionResults, item: SuggestInlineCompletion): void;
    freeInlineCompletions(result: InlineCompletionResults): void;
    private _getTriggerCharacterInfo;
}
export {};
