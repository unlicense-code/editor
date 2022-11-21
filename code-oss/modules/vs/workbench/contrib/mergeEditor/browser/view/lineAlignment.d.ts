import { ModifiedBaseRange } from 'vs/workbench/contrib/mergeEditor/browser/model/modifiedBaseRange';
export declare type LineAlignment = [input1LineNumber: number | undefined, baseLineNumber: number, input2LineNumber: number | undefined];
export declare function getAlignments(m: ModifiedBaseRange): LineAlignment[];
