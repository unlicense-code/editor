import { Disposable } from 'vs/base/common/lifecycle';
import { Range } from 'vs/editor/common/core/range';
import { IModelDecoration } from 'vs/editor/common/model';
import { DecorationProvider } from 'vs/editor/common/model/decorationProvider';
import { TextModel } from 'vs/editor/common/model/textModel';
import { IModelOptionsChangedEvent } from 'vs/editor/common/textModelEvents';
export declare class ColorizedBracketPairsDecorationProvider extends Disposable implements DecorationProvider {
    private readonly textModel;
    private colorizationOptions;
    private readonly colorProvider;
    private readonly onDidChangeEmitter;
    readonly onDidChange: import("vs/base/common/event").Event<void>;
    constructor(textModel: TextModel);
    handleDidChangeOptions(e: IModelOptionsChangedEvent): void;
    getDecorationsInRange(range: Range, ownerId?: number, filterOutValidation?: boolean, onlyMinimapDecorations?: boolean): IModelDecoration[];
    getAllDecorations(ownerId?: number, filterOutValidation?: boolean): IModelDecoration[];
}
