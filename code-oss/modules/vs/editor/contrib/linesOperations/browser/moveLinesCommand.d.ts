import { EditorAutoIndentStrategy } from 'vs/editor/common/config/editorOptions';
import { Selection } from 'vs/editor/common/core/selection';
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from 'vs/editor/common/editorCommon';
import { ITextModel } from 'vs/editor/common/model';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
export declare class MoveLinesCommand implements ICommand {
    private readonly _languageConfigurationService;
    private readonly _selection;
    private readonly _isMovingDown;
    private readonly _autoIndent;
    private _selectionId;
    private _moveEndPositionDown?;
    private _moveEndLineSelectionShrink;
    constructor(selection: Selection, isMovingDown: boolean, autoIndent: EditorAutoIndentStrategy, _languageConfigurationService: ILanguageConfigurationService);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    private buildIndentConverter;
    private parseEnterResult;
    /**
     *
     * @param model
     * @param indentConverter
     * @param tabSize
     * @param line the line moving down
     * @param futureAboveLineNumber the line which will be at the `line` position
     * @param futureAboveLineText
     */
    private matchEnterRuleMovingDown;
    private matchEnterRule;
    private trimLeft;
    private shouldAutoIndent;
    private getIndentEditsOfMovingBlock;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
