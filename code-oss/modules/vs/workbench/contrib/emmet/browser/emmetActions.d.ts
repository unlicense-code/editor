import { EditorAction, ServicesAccessor, IActionOptions } from 'vs/editor/browser/editorExtensions';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
export interface IGrammarContributions {
    getGrammar(mode: string): string;
}
interface IEmmetActionOptions extends IActionOptions {
    actionName: string;
}
export declare abstract class EmmetEditorAction extends EditorAction {
    protected emmetActionName: string;
    constructor(opts: IEmmetActionOptions);
    private static readonly emmetSupportedModes;
    private _lastGrammarContributions;
    private _lastExtensionService;
    private _withGrammarContributions;
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
    static getLanguage(editor: ICodeEditor, grammars: IGrammarContributions): {
        language: string;
        parentMode: string;
    } | null;
}
export {};
