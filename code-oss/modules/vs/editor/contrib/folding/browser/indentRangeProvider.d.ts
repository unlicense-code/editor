import { CancellationToken } from 'vs/base/common/cancellation';
import { ITextModel } from 'vs/editor/common/model';
import { FoldingMarkers } from 'vs/editor/common/languages/languageConfiguration';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { FoldingRegions } from 'vs/editor/contrib/folding/browser/foldingRanges';
import { FoldingLimitReporter, RangeProvider } from './folding';
export declare class IndentRangeProvider implements RangeProvider {
    private readonly editorModel;
    private readonly languageConfigurationService;
    private readonly foldingRangesLimit;
    readonly id = "indent";
    constructor(editorModel: ITextModel, languageConfigurationService: ILanguageConfigurationService, foldingRangesLimit: FoldingLimitReporter);
    dispose(): void;
    compute(cancelationToken: CancellationToken): Promise<FoldingRegions>;
}
export declare function computeRanges(model: ITextModel, offSide: boolean, markers?: FoldingMarkers, foldingRangesLimit?: FoldingLimitReporter): FoldingRegions;
