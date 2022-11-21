import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { SuggestModel } from 'vs/editor/contrib/suggest/browser/suggestModel';
import { ISelectedSuggestion, SuggestWidget } from './suggestWidget';
export declare class CommitCharacterController {
    private readonly _disposables;
    private _active?;
    constructor(editor: ICodeEditor, widget: SuggestWidget, model: SuggestModel, accept: (selected: ISelectedSuggestion) => any);
    private _onItem;
    reset(): void;
    dispose(): void;
}
