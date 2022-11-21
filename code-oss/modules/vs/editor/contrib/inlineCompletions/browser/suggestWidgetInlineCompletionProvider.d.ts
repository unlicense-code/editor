import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IActiveCodeEditor } from 'vs/editor/browser/editorBrowser';
import { Range } from 'vs/editor/common/core/range';
import { CompletionItemKind } from 'vs/editor/common/languages';
import { NormalizedInlineCompletion } from './inlineCompletionToGhostText';
export interface SuggestWidgetState {
    /**
     * Represents the currently selected item in the suggest widget as inline completion, if possible.
    */
    selectedItem: SuggestItemInfo | undefined;
}
export interface SuggestItemInfo {
    normalizedInlineCompletion: NormalizedInlineCompletion;
    isSnippetText: boolean;
    completionItemKind: CompletionItemKind;
}
export declare class SuggestWidgetInlineCompletionProvider extends Disposable {
    private readonly editor;
    private readonly suggestControllerPreselector;
    private isSuggestWidgetVisible;
    private isShiftKeyPressed;
    private _isActive;
    private _currentSuggestItemInfo;
    private readonly onDidChangeEmitter;
    readonly onDidChange: Event<void>;
    private readonly setInactiveDelayed;
    /**
     * Returns undefined if the suggest widget is not active.
    */
    get state(): SuggestWidgetState | undefined;
    constructor(editor: IActiveCodeEditor, suggestControllerPreselector: () => NormalizedInlineCompletion | undefined);
    private update;
    private getSuggestItemInfo;
    stopForceRenderingAbove(): void;
    forceRenderingAbove(): void;
}
export declare function rangeStartsWith(rangeToTest: Range, prefix: Range): boolean;
