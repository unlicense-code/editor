import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { Position } from 'vs/editor/common/core/position';
import { ITextModel } from 'vs/editor/common/model';
import { IModelService } from 'vs/editor/common/services/model';
export declare class TextModelProjection extends Disposable {
    readonly targetDocument: ITextModel;
    private readonly sourceDocument;
    private static counter;
    static create(sourceDocument: ITextModel, projectionConfiguration: ProjectionConfiguration, modelService: IModelService): TextModelProjection;
    static createForTargetDocument(sourceDocument: ITextModel, projectionConfiguration: ProjectionConfiguration, targetDocument: ITextModel): TextModelProjection;
    private static createModelReference;
    private currentBlocks;
    constructor(targetDocument: ITextModel, sourceDocument: ITextModel, disposable: IDisposable, projectionConfiguration: ProjectionConfiguration);
    /**
     * The created transformer can only be called with monotonically increasing positions.
     */
    createMonotonousReverseTransformer(): Transformer;
}
interface ProjectionConfiguration {
    blockToRemoveStartLinePrefix: string;
    blockToRemoveEndLinePrefix: string;
}
interface Transformer {
    transform(position: Position): Position;
}
export {};
