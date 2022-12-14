import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { ISelectedSuggestion } from './suggestWidget';
export declare class SuggestAlternatives {
    private readonly _editor;
    static readonly OtherSuggestions: RawContextKey<boolean>;
    private readonly _ckOtherSuggestions;
    private _index;
    private _model;
    private _acceptNext;
    private _listener;
    private _ignore;
    constructor(_editor: ICodeEditor, contextKeyService: IContextKeyService);
    dispose(): void;
    reset(): void;
    set({ model, index }: ISelectedSuggestion, acceptNext: (selected: ISelectedSuggestion) => any): void;
    private static _moveIndex;
    next(): void;
    prev(): void;
    private _move;
}
