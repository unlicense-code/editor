import { CancellationToken } from 'vs/base/common/cancellation';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IActiveCodeEditor } from 'vs/editor/browser/editorBrowser';
import { ServicesAccessor } from 'vs/editor/browser/editorExtensions';
import { Position } from 'vs/editor/common/core/position';
import { Range } from 'vs/editor/common/core/range';
import { ITextModel } from 'vs/editor/common/model';
import { ISingleEditOperation } from 'vs/editor/common/core/editOperation';
import { DocumentFormattingEditProvider, DocumentRangeFormattingEditProvider, FormattingOptions, TextEdit } from 'vs/editor/common/languages';
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorker';
import { IProgress } from 'vs/platform/progress/common/progress';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { LanguageFeatureRegistry } from 'vs/editor/common/languageFeatureRegistry';
export declare function alertFormattingEdits(edits: ISingleEditOperation[]): void;
export declare function getRealAndSyntheticDocumentFormattersOrdered(documentFormattingEditProvider: LanguageFeatureRegistry<DocumentFormattingEditProvider>, documentRangeFormattingEditProvider: LanguageFeatureRegistry<DocumentRangeFormattingEditProvider>, model: ITextModel): DocumentFormattingEditProvider[];
export declare const enum FormattingMode {
    Explicit = 1,
    Silent = 2
}
export interface IFormattingEditProviderSelector {
    <T extends (DocumentFormattingEditProvider | DocumentRangeFormattingEditProvider)>(formatter: T[], document: ITextModel, mode: FormattingMode): Promise<T | undefined>;
}
export declare abstract class FormattingConflicts {
    private static readonly _selectors;
    static setFormatterSelector(selector: IFormattingEditProviderSelector): IDisposable;
    static select<T extends (DocumentFormattingEditProvider | DocumentRangeFormattingEditProvider)>(formatter: T[], document: ITextModel, mode: FormattingMode): Promise<T | undefined>;
}
export declare function formatDocumentRangesWithSelectedProvider(accessor: ServicesAccessor, editorOrModel: ITextModel | IActiveCodeEditor, rangeOrRanges: Range | Range[], mode: FormattingMode, progress: IProgress<DocumentRangeFormattingEditProvider>, token: CancellationToken): Promise<void>;
export declare function formatDocumentRangesWithProvider(accessor: ServicesAccessor, provider: DocumentRangeFormattingEditProvider, editorOrModel: ITextModel | IActiveCodeEditor, rangeOrRanges: Range | Range[], token: CancellationToken): Promise<boolean>;
export declare function formatDocumentWithSelectedProvider(accessor: ServicesAccessor, editorOrModel: ITextModel | IActiveCodeEditor, mode: FormattingMode, progress: IProgress<DocumentFormattingEditProvider>, token: CancellationToken): Promise<void>;
export declare function formatDocumentWithProvider(accessor: ServicesAccessor, provider: DocumentFormattingEditProvider, editorOrModel: ITextModel | IActiveCodeEditor, mode: FormattingMode, token: CancellationToken): Promise<boolean>;
export declare function getDocumentRangeFormattingEditsUntilResult(workerService: IEditorWorkerService, languageFeaturesService: ILanguageFeaturesService, model: ITextModel, range: Range, options: FormattingOptions, token: CancellationToken): Promise<TextEdit[] | undefined>;
export declare function getDocumentFormattingEditsUntilResult(workerService: IEditorWorkerService, languageFeaturesService: ILanguageFeaturesService, model: ITextModel, options: FormattingOptions, token: CancellationToken): Promise<TextEdit[] | undefined>;
export declare function getOnTypeFormattingEdits(workerService: IEditorWorkerService, languageFeaturesService: ILanguageFeaturesService, model: ITextModel, position: Position, ch: string, options: FormattingOptions, token: CancellationToken): Promise<TextEdit[] | null | undefined>;
