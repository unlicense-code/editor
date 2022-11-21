import { Disposable } from 'vs/base/common/lifecycle';
import { ICellViewModel, INotebookEditorDelegate } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { CellViewModelStateChangeEvent } from 'vs/workbench/contrib/notebook/browser/notebookViewEvents';
import { CellContentPart } from 'vs/workbench/contrib/notebook/browser/view/cellPart';
import { BaseCellRenderTemplate, INotebookCellList } from 'vs/workbench/contrib/notebook/browser/view/notebookRenderingCommon';
declare type DragImageProvider = () => HTMLElement;
export declare class CellDragAndDropPart extends CellContentPart {
    private readonly container;
    constructor(container: HTMLElement);
    protected didRenderCell(element: ICellViewModel): void;
    updateState(element: ICellViewModel, e: CellViewModelStateChangeEvent): void;
    private update;
}
export declare class CellDragAndDropController extends Disposable {
    private notebookEditor;
    private readonly notebookListContainer;
    private currentDraggedCell;
    private draggedCells;
    private listInsertionIndicator;
    private list;
    private isScrolling;
    private readonly scrollingDelayer;
    private readonly listOnWillScrollListener;
    constructor(notebookEditor: INotebookEditorDelegate, notebookListContainer: HTMLElement);
    setList(value: INotebookCellList): void;
    private setInsertIndicatorVisibility;
    private toCellDragEvent;
    clearGlobalDragState(): void;
    private onGlobalDragStart;
    private onGlobalDragEnd;
    private onCellDragover;
    private updateInsertIndicator;
    private getDropInsertDirection;
    private onCellDrop;
    private getCellRangeAroundDragTarget;
    private _dropImpl;
    private onCellDragLeave;
    private dragCleanup;
    registerDragHandle(templateData: BaseCellRenderTemplate, cellRoot: HTMLElement, dragHandles: HTMLElement[], dragImageProvider: DragImageProvider): void;
    startExplicitDrag(cell: ICellViewModel, _dragOffsetY: number): void;
    explicitDrag(cell: ICellViewModel, dragOffsetY: number): void;
    endExplicitDrag(_cell: ICellViewModel): void;
    explicitDrop(cell: ICellViewModel, ctx: {
        dragOffsetY: number;
        ctrlKey: boolean;
        altKey: boolean;
    }): void;
    private getExplicitDragDropDirection;
    dispose(): void;
}
export declare function performCellDropEdits(editor: INotebookEditorDelegate, draggedCell: ICellViewModel, dropDirection: 'above' | 'below', draggedOverCell: ICellViewModel): void;
export {};
