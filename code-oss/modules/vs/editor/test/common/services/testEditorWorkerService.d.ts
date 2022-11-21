import { URI } from 'vs/base/common/uri';
import { IRange } from 'vs/editor/common/core/range';
import { DiffAlgorithmName, IEditorWorkerService, IUnicodeHighlightsResult } from 'vs/editor/common/services/editorWorker';
import { TextEdit, IInplaceReplaceSupportResult } from 'vs/editor/common/languages';
import { IDocumentDiff, IDocumentDiffProviderOptions } from 'vs/editor/common/diff/documentDiffProvider';
import { IChange } from 'vs/editor/common/diff/smartLinesDiffComputer';
export declare class TestEditorWorkerService implements IEditorWorkerService {
    readonly _serviceBrand: undefined;
    canComputeUnicodeHighlights(uri: URI): boolean;
    computedUnicodeHighlights(uri: URI): Promise<IUnicodeHighlightsResult>;
    computeDiff(original: URI, modified: URI, options: IDocumentDiffProviderOptions, algorithm: DiffAlgorithmName): Promise<IDocumentDiff | null>;
    canComputeDirtyDiff(original: URI, modified: URI): boolean;
    computeDirtyDiff(original: URI, modified: URI, ignoreTrimWhitespace: boolean): Promise<IChange[] | null>;
    computeMoreMinimalEdits(resource: URI, edits: TextEdit[] | null | undefined): Promise<TextEdit[] | undefined>;
    canComputeWordRanges(resource: URI): boolean;
    computeWordRanges(resource: URI, range: IRange): Promise<{
        [word: string]: IRange[];
    } | null>;
    canNavigateValueSet(resource: URI): boolean;
    navigateValueSet(resource: URI, range: IRange, up: boolean): Promise<IInplaceReplaceSupportResult | null>;
}
