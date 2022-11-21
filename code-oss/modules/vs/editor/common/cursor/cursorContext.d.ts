import { ITextModel } from 'vs/editor/common/model';
import { ICoordinatesConverter } from 'vs/editor/common/viewModel';
import { CursorConfiguration, ICursorSimpleModel } from 'vs/editor/common/cursorCommon';
export declare class CursorContext {
    _cursorContextBrand: void;
    readonly model: ITextModel;
    readonly viewModel: ICursorSimpleModel;
    readonly coordinatesConverter: ICoordinatesConverter;
    readonly cursorConfig: CursorConfiguration;
    constructor(model: ITextModel, viewModel: ICursorSimpleModel, coordinatesConverter: ICoordinatesConverter, cursorConfig: CursorConfiguration);
}
