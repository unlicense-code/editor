import { ISingleEditOperation } from 'vs/editor/common/core/editOperation';
import { Range } from 'vs/editor/common/core/range';
import { Selection } from 'vs/editor/common/core/selection';
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from 'vs/editor/common/editorCommon';
import { ITextModel } from 'vs/editor/common/model';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
export declare class BlockCommentCommand implements ICommand {
    private readonly languageConfigurationService;
    private readonly _selection;
    private readonly _insertSpace;
    private _usedEndToken;
    constructor(selection: Selection, insertSpace: boolean, languageConfigurationService: ILanguageConfigurationService);
    static _haystackHasNeedleAtOffset(haystack: string, needle: string, offset: number): boolean;
    private _createOperationsForBlockComment;
    static _createRemoveBlockCommentOperations(r: Range, startToken: string, endToken: string): ISingleEditOperation[];
    static _createAddBlockCommentOperations(r: Range, startToken: string, endToken: string, insertSpace: boolean): ISingleEditOperation[];
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
