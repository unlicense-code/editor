import { IActiveCodeEditor } from 'vs/editor/browser/editorBrowser';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { SharedInlineCompletionCache } from 'vs/editor/contrib/inlineCompletions/browser/ghostTextModel';
import { BaseGhostTextWidgetModel, GhostText } from './ghostText';
export declare class SuggestWidgetPreviewModel extends BaseGhostTextWidgetModel {
    private readonly cache;
    private readonly languageFeaturesService;
    private readonly suggestionInlineCompletionSource;
    private readonly updateOperation;
    private readonly updateCacheSoon;
    minReservedLineCount: number;
    get isActive(): boolean;
    constructor(editor: IActiveCodeEditor, cache: SharedInlineCompletionCache, languageFeaturesService: ILanguageFeaturesService);
    private isSuggestionPreviewEnabled;
    private updateCache;
    get ghostText(): GhostText | undefined;
    private toGhostText;
}
