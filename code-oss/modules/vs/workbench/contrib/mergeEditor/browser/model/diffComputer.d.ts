import { IReader } from 'vs/base/common/observable';
import { LineRange as DiffLineRange, RangeMapping as DiffRangeMapping } from 'vs/editor/common/diff/linesDiffComputer';
import { ITextModel } from 'vs/editor/common/model';
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorker';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { LineRange } from 'vs/workbench/contrib/mergeEditor/browser/model/lineRange';
import { DetailedLineRangeMapping, RangeMapping } from 'vs/workbench/contrib/mergeEditor/browser/model/mapping';
export interface IMergeDiffComputer {
    computeDiff(textModel1: ITextModel, textModel2: ITextModel, reader: IReader): Promise<IMergeDiffComputerResult>;
}
export interface IMergeDiffComputerResult {
    diffs: DetailedLineRangeMapping[] | null;
}
export declare class MergeDiffComputer implements IMergeDiffComputer {
    private readonly editorWorkerService;
    private readonly configurationService;
    private readonly mergeAlgorithm;
    constructor(editorWorkerService: IEditorWorkerService, configurationService: IConfigurationService);
    computeDiff(textModel1: ITextModel, textModel2: ITextModel, reader: IReader): Promise<IMergeDiffComputerResult>;
}
export declare function toLineRange(range: DiffLineRange): LineRange;
export declare function toRangeMapping(mapping: DiffRangeMapping): RangeMapping;
export declare function normalizeRangeMapping(rangeMapping: RangeMapping, inputTextModel: ITextModel, outputTextModel: ITextModel): RangeMapping | undefined;
