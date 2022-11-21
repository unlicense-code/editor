import { IDisposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { SuggestModel } from 'vs/editor/contrib/suggest/browser/suggestModel';
export declare class OvertypingCapturer implements IDisposable {
    private static readonly _maxSelectionLength;
    private readonly _disposables;
    private _lastOvertyped;
    private _locked;
    constructor(editor: ICodeEditor, suggestModel: SuggestModel);
    getLastOvertypedInfo(idx: number): {
        value: string;
        multiline: boolean;
    } | undefined;
    dispose(): void;
}
