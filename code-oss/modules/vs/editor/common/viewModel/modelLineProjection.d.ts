import { LineTokens } from 'vs/editor/common/tokens/lineTokens';
import { Position } from 'vs/editor/common/core/position';
import { IRange } from 'vs/editor/common/core/range';
import { EndOfLinePreference, PositionAffinity } from 'vs/editor/common/model';
import { InjectedText, ModelLineProjectionData } from 'vs/editor/common/modelLineProjectionData';
import { ViewLineData } from 'vs/editor/common/viewModel';
export interface IModelLineProjection {
    isVisible(): boolean;
    /**
     * This invalidates the current instance (potentially reuses and returns it again).
    */
    setVisible(isVisible: boolean): IModelLineProjection;
    getProjectionData(): ModelLineProjectionData | null;
    getViewLineCount(): number;
    getViewLineContent(model: ISimpleModel, modelLineNumber: number, outputLineIndex: number): string;
    getViewLineLength(model: ISimpleModel, modelLineNumber: number, outputLineIndex: number): number;
    getViewLineMinColumn(model: ISimpleModel, modelLineNumber: number, outputLineIndex: number): number;
    getViewLineMaxColumn(model: ISimpleModel, modelLineNumber: number, outputLineIndex: number): number;
    getViewLineData(model: ISimpleModel, modelLineNumber: number, outputLineIndex: number): ViewLineData;
    getViewLinesData(model: ISimpleModel, modelLineNumber: number, outputLineIdx: number, lineCount: number, globalStartIndex: number, needed: boolean[], result: Array<ViewLineData | null>): void;
    getModelColumnOfViewPosition(outputLineIndex: number, outputColumn: number): number;
    getViewPositionOfModelPosition(deltaLineNumber: number, inputColumn: number, affinity?: PositionAffinity): Position;
    getViewLineNumberOfModelPosition(deltaLineNumber: number, inputColumn: number): number;
    normalizePosition(outputLineIndex: number, outputPosition: Position, affinity: PositionAffinity): Position;
    getInjectedTextAt(outputLineIndex: number, column: number): InjectedText | null;
}
export interface ISimpleModel {
    tokenization: {
        getLineTokens(lineNumber: number): LineTokens;
    };
    getLineContent(lineNumber: number): string;
    getLineLength(lineNumber: number): number;
    getLineMinColumn(lineNumber: number): number;
    getLineMaxColumn(lineNumber: number): number;
    getValueInRange(range: IRange, eol?: EndOfLinePreference): string;
}
export declare function createModelLineProjection(lineBreakData: ModelLineProjectionData | null, isVisible: boolean): IModelLineProjection;
