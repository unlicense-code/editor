import { IRange } from 'vs/editor/common/core/range';
import { IInplaceReplaceSupportResult } from 'vs/editor/common/languages';
export declare class BasicInplaceReplace {
    static readonly INSTANCE: BasicInplaceReplace;
    navigateValueSet(range1: IRange, text1: string, range2: IRange, text2: string | null, up: boolean): IInplaceReplaceSupportResult | null;
    private doNavigateValueSet;
    private numberReplace;
    private readonly _defaultValueSet;
    private textReplace;
    private valueSetsReplace;
    private valueSetReplace;
}
