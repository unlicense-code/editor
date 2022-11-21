import { Position } from 'vs/editor/common/core/position';
import { ITextModel } from 'vs/editor/common/model';
export interface InsertSnippetResult {
    position: Position;
    prepend: string;
    append: string;
}
export declare class SmartSnippetInserter {
    private static hasOpenBrace;
    private static offsetToPosition;
    static insertSnippet(model: ITextModel, _position: Position): InsertSnippetResult;
}
