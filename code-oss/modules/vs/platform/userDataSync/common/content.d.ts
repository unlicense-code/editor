import { JSONPath } from 'vs/base/common/json';
import { FormattingOptions } from 'vs/base/common/jsonFormatter';
export declare function edit(content: string, originalPath: JSONPath, value: any, formattingOptions: FormattingOptions): string;
export declare function getLineStartOffset(content: string, eol: string, atOffset: number): number;
export declare function getLineEndOffset(content: string, eol: string, atOffset: number): number;
