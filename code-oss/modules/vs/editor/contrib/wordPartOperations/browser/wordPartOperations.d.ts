import { DeleteWordContext, WordNavigationType } from 'vs/editor/common/cursor/cursorWordOperations';
import { WordCharacterClassifier } from 'vs/editor/common/core/wordCharacterClassifier';
import { Position } from 'vs/editor/common/core/position';
import { Range } from 'vs/editor/common/core/range';
import { ITextModel } from 'vs/editor/common/model';
import { DeleteWordCommand, MoveWordCommand } from 'vs/editor/contrib/wordOperations/browser/wordOperations';
export declare class DeleteWordPartLeft extends DeleteWordCommand {
    constructor();
    protected _delete(ctx: DeleteWordContext, wordNavigationType: WordNavigationType): Range;
}
export declare class DeleteWordPartRight extends DeleteWordCommand {
    constructor();
    protected _delete(ctx: DeleteWordContext, wordNavigationType: WordNavigationType): Range;
}
export declare class WordPartLeftCommand extends MoveWordCommand {
    protected _move(wordSeparators: WordCharacterClassifier, model: ITextModel, position: Position, wordNavigationType: WordNavigationType): Position;
}
export declare class CursorWordPartLeft extends WordPartLeftCommand {
    constructor();
}
export declare class CursorWordPartLeftSelect extends WordPartLeftCommand {
    constructor();
}
export declare class WordPartRightCommand extends MoveWordCommand {
    protected _move(wordSeparators: WordCharacterClassifier, model: ITextModel, position: Position, wordNavigationType: WordNavigationType): Position;
}
export declare class CursorWordPartRight extends WordPartRightCommand {
    constructor();
}
export declare class CursorWordPartRightSelect extends WordPartRightCommand {
    constructor();
}
