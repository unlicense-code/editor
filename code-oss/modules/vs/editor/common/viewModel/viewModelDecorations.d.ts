import { IDisposable } from 'vs/base/common/lifecycle';
import { Range } from 'vs/editor/common/core/range';
import { IEditorConfiguration } from 'vs/editor/common/config/editorConfiguration';
import { IModelDecoration, ITextModel } from 'vs/editor/common/model';
import { IViewModelLines } from 'vs/editor/common/viewModel/viewModelLines';
import { ICoordinatesConverter, InlineDecoration, ViewModelDecoration } from 'vs/editor/common/viewModel';
export interface IDecorationsViewportData {
    /**
     * decorations in the viewport.
     */
    readonly decorations: ViewModelDecoration[];
    /**
     * inline decorations grouped by each line in the viewport.
     */
    readonly inlineDecorations: InlineDecoration[][];
}
export declare class ViewModelDecorations implements IDisposable {
    private readonly editorId;
    private readonly model;
    private readonly configuration;
    private readonly _linesCollection;
    private readonly _coordinatesConverter;
    private _decorationsCache;
    private _cachedModelDecorationsResolver;
    private _cachedModelDecorationsResolverViewRange;
    private _cachedOnlyMinimapDecorations;
    constructor(editorId: number, model: ITextModel, configuration: IEditorConfiguration, linesCollection: IViewModelLines, coordinatesConverter: ICoordinatesConverter);
    private _clearCachedModelDecorationsResolver;
    dispose(): void;
    reset(): void;
    onModelDecorationsChanged(): void;
    onLineMappingChanged(): void;
    private _getOrCreateViewModelDecoration;
    getDecorationsViewportData(viewRange: Range, onlyMinimapDecorations?: boolean): IDecorationsViewportData;
    getInlineDecorationsOnLine(lineNumber: number, onlyMinimapDecorations?: boolean): InlineDecoration[];
    private _getDecorationsInRange;
}
export declare function isModelDecorationVisible(model: ITextModel, decoration: IModelDecoration): boolean;
export declare function isModelDecorationInComment(model: ITextModel, decoration: IModelDecoration): boolean;
export declare function isModelDecorationInString(model: ITextModel, decoration: IModelDecoration): boolean;
