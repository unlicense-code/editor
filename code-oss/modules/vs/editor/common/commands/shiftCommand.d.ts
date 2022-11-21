import { Selection } from 'vs/editor/common/core/selection';
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from 'vs/editor/common/editorCommon';
import { ITextModel } from 'vs/editor/common/model';
import { EditorAutoIndentStrategy } from 'vs/editor/common/config/editorOptions';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
export interface IShiftCommandOpts {
    isUnshift: boolean;
    tabSize: number;
    indentSize: number;
    insertSpaces: boolean;
    useTabStops: boolean;
    autoIndent: EditorAutoIndentStrategy;
}
export declare class ShiftCommand implements ICommand {
    private readonly _languageConfigurationService;
    static unshiftIndent(line: string, column: number, tabSize: number, indentSize: number, insertSpaces: boolean): string;
    static shiftIndent(line: string, column: number, tabSize: number, indentSize: number, insertSpaces: boolean): string;
    private readonly _opts;
    private readonly _selection;
    private _selectionId;
    private _useLastEditRangeForCursorEndPosition;
    private _selectionStartColumnStaysPut;
    constructor(range: Selection, opts: IShiftCommandOpts, _languageConfigurationService: ILanguageConfigurationService);
    private _addEditOperation;
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
