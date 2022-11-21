import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IRequestHandler } from 'vs/base/common/worker/simpleWorker';
import * as model from 'vs/editor/common/model';
import { CellKind, IMainCellDto, INotebookDiffResult, IOutputDto, NotebookCellInternalMetadata, NotebookCellMetadata, NotebookCellsChangedEventDto, NotebookCellTextModelSplice, NotebookData, NotebookDocumentMetadata } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { Range } from 'vs/editor/common/core/range';
import { INotebookWorkerHost } from 'vs/workbench/contrib/notebook/common/services/notebookWorkerHost';
declare class MirrorCell {
    readonly handle: number;
    private _source;
    language: string;
    cellKind: CellKind;
    outputs: IOutputDto[];
    metadata?: NotebookCellMetadata | undefined;
    internalMetadata?: NotebookCellInternalMetadata | undefined;
    private _textBuffer;
    get textBuffer(): model.IReadonlyTextBuffer;
    private _primaryKey?;
    primaryKey(): number | null;
    private _hash;
    constructor(handle: number, _source: string | string[], language: string, cellKind: CellKind, outputs: IOutputDto[], metadata?: NotebookCellMetadata | undefined, internalMetadata?: NotebookCellInternalMetadata | undefined);
    getFullModelRange(): Range;
    getValue(): string;
    getComparisonValue(): number;
    getHashValue(): number;
}
declare class MirrorNotebookDocument {
    readonly uri: URI;
    cells: MirrorCell[];
    metadata: NotebookDocumentMetadata;
    constructor(uri: URI, cells: MirrorCell[], metadata: NotebookDocumentMetadata);
    acceptModelChanged(event: NotebookCellsChangedEventDto): void;
    _spliceNotebookCells(splices: NotebookCellTextModelSplice<IMainCellDto>[]): void;
}
export declare class NotebookEditorSimpleWorker implements IRequestHandler, IDisposable {
    _requestHandlerBrand: any;
    private _models;
    constructor();
    dispose(): void;
    acceptNewModel(uri: string, data: NotebookData): void;
    acceptModelChanged(strURL: string, event: NotebookCellsChangedEventDto): void;
    acceptRemovedModel(strURL: string): void;
    computeDiff(originalUrl: string, modifiedUrl: string): INotebookDiffResult;
    protected _getModel(uri: string): MirrorNotebookDocument;
}
/**
 * Called on the worker side
 * @internal
 */
export declare function create(host: INotebookWorkerHost): IRequestHandler;
export {};
