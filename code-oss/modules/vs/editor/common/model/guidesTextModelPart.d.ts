import { IPosition } from 'vs/editor/common/core/position';
import type { TextModel } from 'vs/editor/common/model/textModel';
import { TextModelPart } from 'vs/editor/common/model/textModelPart';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { BracketGuideOptions, IActiveIndentGuideInfo, IGuidesTextModelPart, IndentGuide } from 'vs/editor/common/textModelGuides';
export declare class GuidesTextModelPart extends TextModelPart implements IGuidesTextModelPart {
    private readonly textModel;
    private readonly languageConfigurationService;
    constructor(textModel: TextModel, languageConfigurationService: ILanguageConfigurationService);
    private getLanguageConfiguration;
    private _computeIndentLevel;
    getActiveIndentGuide(lineNumber: number, minLineNumber: number, maxLineNumber: number): IActiveIndentGuideInfo;
    getLinesBracketGuides(startLineNumber: number, endLineNumber: number, activePosition: IPosition | null, options: BracketGuideOptions): IndentGuide[][];
    private getVisibleColumnFromPosition;
    getLinesIndentGuides(startLineNumber: number, endLineNumber: number): number[];
    private _getIndentLevelForWhitespaceLine;
}
export declare class BracketPairGuidesClassNames {
    readonly activeClassName = "indent-active";
    getInlineClassName(nestingLevel: number, nestingLevelOfEqualBracketType: number, independentColorPoolPerBracketType: boolean): string;
    getInlineClassNameOfLevel(level: number): string;
}
