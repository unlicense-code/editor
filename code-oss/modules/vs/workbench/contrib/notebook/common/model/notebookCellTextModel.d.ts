import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { Range } from 'vs/editor/common/core/range';
import * as model from 'vs/editor/common/model';
import { TextModel } from 'vs/editor/common/model/textModel';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { CellInternalMetadataChangedEvent, CellKind, ICell, ICellDto2, ICellOutput, IOutputDto, IOutputItemDto, NotebookCellCollapseState, NotebookCellInternalMetadata, NotebookCellMetadata, NotebookCellOutputsSplice, TransientOptions } from 'vs/workbench/contrib/notebook/common/notebookCommon';
export declare class NotebookCellTextModel extends Disposable implements ICell {
    readonly uri: URI;
    readonly handle: number;
    private readonly _source;
    private _language;
    private _mime;
    readonly cellKind: CellKind;
    readonly collapseState: NotebookCellCollapseState | undefined;
    readonly transientOptions: TransientOptions;
    private readonly _languageService;
    private readonly _onDidChangeOutputs;
    readonly onDidChangeOutputs: Event<NotebookCellOutputsSplice>;
    private readonly _onDidChangeOutputItems;
    readonly onDidChangeOutputItems: Event<void>;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<'content' | 'language' | 'mime'>;
    private readonly _onDidChangeMetadata;
    readonly onDidChangeMetadata: Event<void>;
    private readonly _onDidChangeInternalMetadata;
    readonly onDidChangeInternalMetadata: Event<CellInternalMetadataChangedEvent>;
    private readonly _onDidChangeLanguage;
    readonly onDidChangeLanguage: Event<string>;
    private _outputs;
    get outputs(): ICellOutput[];
    private _metadata;
    get metadata(): NotebookCellMetadata;
    set metadata(newMetadata: NotebookCellMetadata);
    private _internalMetadata;
    get internalMetadata(): NotebookCellInternalMetadata;
    set internalMetadata(newInternalMetadata: NotebookCellInternalMetadata);
    get language(): string;
    set language(newLanguage: string);
    get mime(): string | undefined;
    set mime(newMime: string | undefined);
    private _textBuffer;
    get textBuffer(): model.IReadonlyTextBuffer;
    private _textBufferHash;
    private _hash;
    private _versionId;
    private _alternativeId;
    get alternativeId(): number;
    private readonly _textModelDisposables;
    private _textModel;
    get textModel(): TextModel | undefined;
    set textModel(m: TextModel | undefined);
    constructor(uri: URI, handle: number, _source: string, _language: string, _mime: string | undefined, cellKind: CellKind, outputs: IOutputDto[], metadata: NotebookCellMetadata | undefined, internalMetadata: NotebookCellInternalMetadata | undefined, collapseState: NotebookCellCollapseState | undefined, transientOptions: TransientOptions, _languageService: ILanguageService);
    resetTextBuffer(textBuffer: model.ITextBuffer): void;
    getValue(): string;
    getTextBufferHash(): string;
    getHashValue(): number;
    private _getPersisentMetadata;
    getTextLength(): number;
    getFullModelRange(): Range;
    spliceNotebookCellOutputs(splice: NotebookCellOutputsSplice): void;
    changeOutputItems(outputId: string, append: boolean, items: IOutputItemDto[]): boolean;
    private _outputNotEqualFastCheck;
    equal(b: NotebookCellTextModel): boolean;
    /**
     * Only compares
     * - language
     * - mime
     * - cellKind
     * - internal metadata
     * - source
     */
    fastEqual(b: ICellDto2): boolean;
    dispose(): void;
}
export declare function cloneNotebookCellTextModel(cell: NotebookCellTextModel): {
    source: string;
    language: string;
    mime: string | undefined;
    cellKind: CellKind;
    outputs: {
        outputs: IOutputItemDto[];
        outputId: string;
    }[];
    metadata: {
        [x: string]: unknown;
    };
};
