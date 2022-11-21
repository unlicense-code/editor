import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { EditorAction, IActionOptions, ServicesAccessor } from 'vs/editor/browser/editorExtensions';
import { ISingleEditOperation } from 'vs/editor/common/core/editOperation';
import { Selection } from 'vs/editor/common/core/selection';
import { ICommand, ICursorStateComputerData, IEditOperationBuilder, IEditorContribution } from 'vs/editor/common/editorCommon';
import { ITextModel } from 'vs/editor/common/model';
import { TextEdit } from 'vs/editor/common/languages';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
export declare function getReindentEditOperations(model: ITextModel, languageConfigurationService: ILanguageConfigurationService, startLineNumber: number, endLineNumber: number, inheritedIndent?: string): ISingleEditOperation[];
export declare class IndentationToSpacesAction extends EditorAction {
    static readonly ID = "editor.action.indentationToSpaces";
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class IndentationToTabsAction extends EditorAction {
    static readonly ID = "editor.action.indentationToTabs";
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class ChangeIndentationSizeAction extends EditorAction {
    private readonly insertSpaces;
    private readonly displaySizeOnly;
    constructor(insertSpaces: boolean, displaySizeOnly: boolean, opts: IActionOptions);
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class IndentUsingTabs extends ChangeIndentationSizeAction {
    static readonly ID = "editor.action.indentUsingTabs";
    constructor();
}
export declare class IndentUsingSpaces extends ChangeIndentationSizeAction {
    static readonly ID = "editor.action.indentUsingSpaces";
    constructor();
}
export declare class ChangeTabDisplaySize extends ChangeIndentationSizeAction {
    static readonly ID = "editor.action.changeTabDisplaySize";
    constructor();
}
export declare class DetectIndentation extends EditorAction {
    static readonly ID = "editor.action.detectIndentation";
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class ReindentLinesAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class ReindentSelectedLinesAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class AutoIndentOnPasteCommand implements ICommand {
    private readonly _edits;
    private readonly _initialSelection;
    private _selectionId;
    constructor(edits: TextEdit[], initialSelection: Selection);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
export declare class AutoIndentOnPaste implements IEditorContribution {
    private readonly editor;
    private readonly _languageConfigurationService;
    static readonly ID = "editor.contrib.autoIndentOnPaste";
    private readonly callOnDispose;
    private readonly callOnModel;
    constructor(editor: ICodeEditor, _languageConfigurationService: ILanguageConfigurationService);
    private update;
    private trigger;
    private shouldIgnoreLine;
    dispose(): void;
}
export declare class IndentationToSpacesCommand implements ICommand {
    private readonly selection;
    private tabSize;
    private selectionId;
    constructor(selection: Selection, tabSize: number);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
export declare class IndentationToTabsCommand implements ICommand {
    private readonly selection;
    private tabSize;
    private selectionId;
    constructor(selection: Selection, tabSize: number);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
