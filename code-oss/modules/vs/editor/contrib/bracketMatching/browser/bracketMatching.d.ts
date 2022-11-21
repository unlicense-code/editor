import { Disposable } from 'vs/base/common/lifecycle';
import 'vs/css!./bracketMatching';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
export declare class BracketMatchingController extends Disposable implements IEditorContribution {
    static readonly ID = "editor.contrib.bracketMatchingController";
    static get(editor: ICodeEditor): BracketMatchingController | null;
    private readonly _editor;
    private _lastBracketsData;
    private _lastVersionId;
    private readonly _decorations;
    private readonly _updateBracketsSoon;
    private _matchBrackets;
    constructor(editor: ICodeEditor);
    jumpToBracket(): void;
    selectToBracket(selectBrackets: boolean): void;
    private static readonly _DECORATION_OPTIONS_WITH_OVERVIEW_RULER;
    private static readonly _DECORATION_OPTIONS_WITHOUT_OVERVIEW_RULER;
    private _updateBrackets;
    private _recomputeBrackets;
}
