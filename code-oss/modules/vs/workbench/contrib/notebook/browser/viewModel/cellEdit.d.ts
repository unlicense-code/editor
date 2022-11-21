import { Range } from 'vs/editor/common/core/range';
import { Selection } from 'vs/editor/common/core/selection';
import { CellKind, IOutputDto, NotebookCellMetadata } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { IResourceUndoRedoElement, UndoRedoElementType } from 'vs/platform/undoRedo/common/undoRedo';
import { URI } from 'vs/base/common/uri';
import { BaseCellViewModel } from 'vs/workbench/contrib/notebook/browser/viewModel/baseCellViewModel';
import { NotebookCellTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookCellTextModel';
import { ITextCellEditingDelegate } from 'vs/workbench/contrib/notebook/common/model/cellEdit';
export interface IViewCellEditingDelegate extends ITextCellEditingDelegate {
    createCellViewModel?(cell: NotebookCellTextModel): BaseCellViewModel;
    createCell?(index: number, source: string, language: string, type: CellKind, metadata: NotebookCellMetadata | undefined, outputs: IOutputDto[]): BaseCellViewModel;
}
export declare class JoinCellEdit implements IResourceUndoRedoElement {
    resource: URI;
    private index;
    private direction;
    private cell;
    private selections;
    private inverseRange;
    private insertContent;
    private removedCell;
    private editingDelegate;
    type: UndoRedoElementType.Resource;
    label: string;
    code: string;
    private _deletedRawCell;
    constructor(resource: URI, index: number, direction: 'above' | 'below', cell: BaseCellViewModel, selections: Selection[], inverseRange: Range, insertContent: string, removedCell: BaseCellViewModel, editingDelegate: IViewCellEditingDelegate);
    undo(): Promise<void>;
    redo(): Promise<void>;
}
