import { Selection } from 'vs/editor/common/core/selection';
import { EndOfLineSequence, ICursorStateComputer, ITextModel } from 'vs/editor/common/model';
import { TextModel } from 'vs/editor/common/model/textModel';
import { IUndoRedoService, IResourceUndoRedoElement, UndoRedoElementType, IWorkspaceUndoRedoElement } from 'vs/platform/undoRedo/common/undoRedo';
import { URI } from 'vs/base/common/uri';
import { TextChange } from 'vs/editor/common/core/textChange';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ISingleEditOperation } from 'vs/editor/common/core/editOperation';
export declare class SingleModelEditStackData {
    readonly beforeVersionId: number;
    afterVersionId: number;
    readonly beforeEOL: EndOfLineSequence;
    afterEOL: EndOfLineSequence;
    readonly beforeCursorState: Selection[] | null;
    afterCursorState: Selection[] | null;
    changes: TextChange[];
    static create(model: ITextModel, beforeCursorState: Selection[] | null): SingleModelEditStackData;
    constructor(beforeVersionId: number, afterVersionId: number, beforeEOL: EndOfLineSequence, afterEOL: EndOfLineSequence, beforeCursorState: Selection[] | null, afterCursorState: Selection[] | null, changes: TextChange[]);
    append(model: ITextModel, textChanges: TextChange[], afterEOL: EndOfLineSequence, afterVersionId: number, afterCursorState: Selection[] | null): void;
    private static _writeSelectionsSize;
    private static _writeSelections;
    private static _readSelections;
    serialize(): ArrayBuffer;
    static deserialize(source: ArrayBuffer): SingleModelEditStackData;
}
export interface IUndoRedoDelegate {
    prepareUndoRedo(element: MultiModelEditStackElement): Promise<IDisposable> | IDisposable | void;
}
export declare class SingleModelEditStackElement implements IResourceUndoRedoElement {
    readonly label: string;
    readonly code: string;
    model: ITextModel | URI;
    private _data;
    get type(): UndoRedoElementType.Resource;
    get resource(): URI;
    constructor(label: string, code: string, model: ITextModel, beforeCursorState: Selection[] | null);
    toString(): string;
    matchesResource(resource: URI): boolean;
    setModel(model: ITextModel | URI): void;
    canAppend(model: ITextModel): boolean;
    append(model: ITextModel, textChanges: TextChange[], afterEOL: EndOfLineSequence, afterVersionId: number, afterCursorState: Selection[] | null): void;
    close(): void;
    open(): void;
    undo(): void;
    redo(): void;
    heapSize(): number;
}
export declare class MultiModelEditStackElement implements IWorkspaceUndoRedoElement {
    readonly label: string;
    readonly code: string;
    readonly type = UndoRedoElementType.Workspace;
    private _isOpen;
    private readonly _editStackElementsArr;
    private readonly _editStackElementsMap;
    private _delegate;
    get resources(): readonly URI[];
    constructor(label: string, code: string, editStackElements: SingleModelEditStackElement[]);
    setDelegate(delegate: IUndoRedoDelegate): void;
    prepareUndoRedo(): Promise<IDisposable> | IDisposable | void;
    getMissingModels(): URI[];
    matchesResource(resource: URI): boolean;
    setModel(model: ITextModel | URI): void;
    canAppend(model: ITextModel): boolean;
    append(model: ITextModel, textChanges: TextChange[], afterEOL: EndOfLineSequence, afterVersionId: number, afterCursorState: Selection[] | null): void;
    close(): void;
    open(): void;
    undo(): void;
    redo(): void;
    heapSize(resource: URI): number;
    split(): IResourceUndoRedoElement[];
    toString(): string;
}
export declare type EditStackElement = SingleModelEditStackElement | MultiModelEditStackElement;
export declare function isEditStackElement(element: IResourceUndoRedoElement | IWorkspaceUndoRedoElement | null): element is EditStackElement;
export declare class EditStack {
    private readonly _model;
    private readonly _undoRedoService;
    constructor(model: TextModel, undoRedoService: IUndoRedoService);
    pushStackElement(): void;
    popStackElement(): void;
    clear(): void;
    private _getOrCreateEditStackElement;
    pushEOL(eol: EndOfLineSequence): void;
    pushEditOperation(beforeCursorState: Selection[] | null, editOperations: ISingleEditOperation[], cursorStateComputer: ICursorStateComputer | null): Selection[] | null;
    private static _computeCursorState;
}
