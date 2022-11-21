import { CancellationToken } from 'vs/base/common/cancellation';
import { Position } from 'vs/editor/common/core/position';
import { Range } from 'vs/editor/common/core/range';
import { ITextModel } from 'vs/editor/common/model';
import * as languages from 'vs/editor/common/languages';
import { LanguageFeatureRegistry } from 'vs/editor/common/languageFeatureRegistry';
export interface SelectionRangesOptions {
    selectLeadingAndTrailingWhitespace: boolean;
}
export declare function provideSelectionRanges(registry: LanguageFeatureRegistry<languages.SelectionRangeProvider>, model: ITextModel, positions: Position[], options: SelectionRangesOptions, token: CancellationToken): Promise<Range[][]>;
