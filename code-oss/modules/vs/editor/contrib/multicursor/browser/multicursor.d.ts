import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { EditorAction, ServicesAccessor } from 'vs/editor/browser/editorExtensions';
import { Range } from 'vs/editor/common/core/range';
import { Selection } from 'vs/editor/common/core/selection';
import { IEditorContribution, ScrollType } from 'vs/editor/common/editorCommon';
import { FindMatch } from 'vs/editor/common/model';
import { CommonFindController } from 'vs/editor/contrib/find/browser/findController';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
export declare class InsertCursorAbove extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void;
}
export declare class InsertCursorBelow extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void;
}
export declare class MultiCursorSessionResult {
    readonly selections: Selection[];
    readonly revealRange: Range;
    readonly revealScrollType: ScrollType;
    constructor(selections: Selection[], revealRange: Range, revealScrollType: ScrollType);
}
export declare class MultiCursorSession {
    private readonly _editor;
    readonly findController: CommonFindController;
    readonly isDisconnectedFromFindController: boolean;
    readonly searchText: string;
    readonly wholeWord: boolean;
    readonly matchCase: boolean;
    currentMatch: Selection | null;
    static create(editor: ICodeEditor, findController: CommonFindController): MultiCursorSession | null;
    constructor(_editor: ICodeEditor, findController: CommonFindController, isDisconnectedFromFindController: boolean, searchText: string, wholeWord: boolean, matchCase: boolean, currentMatch: Selection | null);
    addSelectionToNextFindMatch(): MultiCursorSessionResult | null;
    moveSelectionToNextFindMatch(): MultiCursorSessionResult | null;
    private _getNextMatch;
    addSelectionToPreviousFindMatch(): MultiCursorSessionResult | null;
    moveSelectionToPreviousFindMatch(): MultiCursorSessionResult | null;
    private _getPreviousMatch;
    selectAll(searchScope: Range[] | null): FindMatch[];
}
export declare class MultiCursorSelectionController extends Disposable implements IEditorContribution {
    static readonly ID = "editor.contrib.multiCursorController";
    private readonly _editor;
    private _ignoreSelectionChange;
    private _session;
    private readonly _sessionDispose;
    static get(editor: ICodeEditor): MultiCursorSelectionController | null;
    constructor(editor: ICodeEditor);
    dispose(): void;
    private _beginSessionIfNeeded;
    private _endSession;
    private _setSelections;
    private _expandEmptyToWord;
    private _applySessionResult;
    getSession(findController: CommonFindController): MultiCursorSession | null;
    addSelectionToNextFindMatch(findController: CommonFindController): void;
    addSelectionToPreviousFindMatch(findController: CommonFindController): void;
    moveSelectionToNextFindMatch(findController: CommonFindController): void;
    moveSelectionToPreviousFindMatch(findController: CommonFindController): void;
    selectAll(findController: CommonFindController): void;
    selectAllUsingSelections(selections: Selection[]): void;
}
export declare abstract class MultiCursorSelectionControllerAction extends EditorAction {
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
    protected abstract _run(multiCursorController: MultiCursorSelectionController, findController: CommonFindController): void;
}
export declare class AddSelectionToNextFindMatchAction extends MultiCursorSelectionControllerAction {
    constructor();
    protected _run(multiCursorController: MultiCursorSelectionController, findController: CommonFindController): void;
}
export declare class AddSelectionToPreviousFindMatchAction extends MultiCursorSelectionControllerAction {
    constructor();
    protected _run(multiCursorController: MultiCursorSelectionController, findController: CommonFindController): void;
}
export declare class MoveSelectionToNextFindMatchAction extends MultiCursorSelectionControllerAction {
    constructor();
    protected _run(multiCursorController: MultiCursorSelectionController, findController: CommonFindController): void;
}
export declare class MoveSelectionToPreviousFindMatchAction extends MultiCursorSelectionControllerAction {
    constructor();
    protected _run(multiCursorController: MultiCursorSelectionController, findController: CommonFindController): void;
}
export declare class SelectHighlightsAction extends MultiCursorSelectionControllerAction {
    constructor();
    protected _run(multiCursorController: MultiCursorSelectionController, findController: CommonFindController): void;
}
export declare class CompatChangeAll extends MultiCursorSelectionControllerAction {
    constructor();
    protected _run(multiCursorController: MultiCursorSelectionController, findController: CommonFindController): void;
}
export declare class SelectionHighlighter extends Disposable implements IEditorContribution {
    private readonly _languageFeaturesService;
    static readonly ID = "editor.contrib.selectionHighlighter";
    private readonly editor;
    private _isEnabled;
    private readonly _decorations;
    private readonly updateSoon;
    private state;
    constructor(editor: ICodeEditor, _languageFeaturesService: ILanguageFeaturesService);
    private _update;
    private static _createState;
    private _setState;
    private static readonly _SELECTION_HIGHLIGHT_OVERVIEW;
    private static readonly _SELECTION_HIGHLIGHT;
    dispose(): void;
}
export declare class FocusNextCursor extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void;
}
export declare class FocusPreviousCursor extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void;
}
