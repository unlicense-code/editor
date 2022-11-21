import { RawContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { ISnippetsService } from './snippets';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
export declare class TabCompletionController implements IEditorContribution {
    private readonly _editor;
    private readonly _snippetService;
    private readonly _clipboardService;
    private readonly _languageFeaturesService;
    static readonly ID = "editor.tabCompletionController";
    static readonly ContextKey: RawContextKey<boolean>;
    static get(editor: ICodeEditor): TabCompletionController | null;
    private readonly _hasSnippets;
    private readonly _configListener;
    private _enabled?;
    private _selectionListener?;
    private _activeSnippets;
    private _completionProvider?;
    constructor(_editor: ICodeEditor, _snippetService: ISnippetsService, _clipboardService: IClipboardService, _languageFeaturesService: ILanguageFeaturesService, contextKeyService: IContextKeyService);
    dispose(): void;
    private _update;
    private _updateSnippets;
    performSnippetCompletions(): Promise<void>;
}
