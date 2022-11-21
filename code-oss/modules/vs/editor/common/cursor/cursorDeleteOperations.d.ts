import { EditorAutoClosingEditStrategy, EditorAutoClosingStrategy } from 'vs/editor/common/config/editorOptions';
import { CursorConfiguration, EditOperationResult, EditOperationType, ICursorSimpleModel } from 'vs/editor/common/cursorCommon';
import { Range } from 'vs/editor/common/core/range';
import { Selection } from 'vs/editor/common/core/selection';
import { ICommand } from 'vs/editor/common/editorCommon';
import { StandardAutoClosingPairConditional } from 'vs/editor/common/languages/languageConfiguration';
export declare class DeleteOperations {
    static deleteRight(prevEditOperationType: EditOperationType, config: CursorConfiguration, model: ICursorSimpleModel, selections: Selection[]): [boolean, Array<ICommand | null>];
    static isAutoClosingPairDelete(autoClosingDelete: EditorAutoClosingEditStrategy, autoClosingBrackets: EditorAutoClosingStrategy, autoClosingQuotes: EditorAutoClosingStrategy, autoClosingPairsOpen: Map<string, StandardAutoClosingPairConditional[]>, model: ICursorSimpleModel, selections: Selection[], autoClosedCharacters: Range[]): boolean;
    private static _runAutoClosingPairDelete;
    static deleteLeft(prevEditOperationType: EditOperationType, config: CursorConfiguration, model: ICursorSimpleModel, selections: Selection[], autoClosedCharacters: Range[]): [boolean, Array<ICommand | null>];
    private static getDeleteRange;
    private static getPositionAfterDeleteLeft;
    static cut(config: CursorConfiguration, model: ICursorSimpleModel, selections: Selection[]): EditOperationResult;
}
