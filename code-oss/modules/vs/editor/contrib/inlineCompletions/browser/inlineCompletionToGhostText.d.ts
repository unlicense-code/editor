import { Position } from 'vs/editor/common/core/position';
import { Range } from 'vs/editor/common/core/range';
import { ITextModel } from 'vs/editor/common/model';
import { Command } from 'vs/editor/common/languages';
import { GhostText } from 'vs/editor/contrib/inlineCompletions/browser/ghostText';
import { ISingleEditOperation } from 'vs/editor/common/core/editOperation';
/**
 * A normalized inline completion is an inline completion with a defined range.
*/
export interface NormalizedInlineCompletion {
    readonly filterText: string;
    readonly command?: Command;
    readonly range: Range;
    readonly insertText: string;
    readonly snippetInfo: {
        snippet: string;
        range: Range;
    } | undefined;
    readonly additionalTextEdits: readonly ISingleEditOperation[];
}
/**
 * Shrinks the range if the text has a suffix/prefix that agrees with the text buffer.
 * E.g. text buffer: `ab[cdef]ghi`, [...] is the replace range, `cxyzf` is the new text.
 * Then the minimized inline completion has range `abc[de]fghi` and text `xyz`.
 */
export declare function minimizeInlineCompletion(model: ITextModel, inlineCompletion: NormalizedInlineCompletion): NormalizedInlineCompletion;
export declare function minimizeInlineCompletion(model: ITextModel, inlineCompletion: NormalizedInlineCompletion | undefined): NormalizedInlineCompletion | undefined;
export declare function normalizedInlineCompletionsEquals(a: NormalizedInlineCompletion | undefined, b: NormalizedInlineCompletion | undefined): boolean;
/**
 * @param previewSuffixLength Sets where to split `inlineCompletion.text`.
 * 	If the text is `hello` and the suffix length is 2, the non-preview part is `hel` and the preview-part is `lo`.
*/
export declare function inlineCompletionToGhostText(inlineCompletion: NormalizedInlineCompletion, textModel: ITextModel, mode: 'prefix' | 'subword' | 'subwordSmart', cursorPosition?: Position, previewSuffixLength?: number): GhostText | undefined;
