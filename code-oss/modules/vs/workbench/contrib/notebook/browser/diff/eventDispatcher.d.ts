import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IDiffElementLayoutInfo } from 'vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser';
import { NotebookLayoutChangeEvent, NotebookLayoutInfo } from 'vs/workbench/contrib/notebook/browser/notebookViewEvents';
export declare enum NotebookDiffViewEventType {
    LayoutChanged = 1,
    CellLayoutChanged = 2
}
export declare class NotebookDiffLayoutChangedEvent {
    readonly source: NotebookLayoutChangeEvent;
    readonly value: NotebookLayoutInfo;
    readonly type = NotebookDiffViewEventType.LayoutChanged;
    constructor(source: NotebookLayoutChangeEvent, value: NotebookLayoutInfo);
}
export declare class NotebookCellLayoutChangedEvent {
    readonly source: IDiffElementLayoutInfo;
    readonly type = NotebookDiffViewEventType.CellLayoutChanged;
    constructor(source: IDiffElementLayoutInfo);
}
export declare type NotebookDiffViewEvent = NotebookDiffLayoutChangedEvent | NotebookCellLayoutChangedEvent;
export declare class NotebookDiffEditorEventDispatcher extends Disposable {
    protected readonly _onDidChangeLayout: Emitter<NotebookDiffLayoutChangedEvent>;
    readonly onDidChangeLayout: import("vs/base/common/event").Event<NotebookDiffLayoutChangedEvent>;
    protected readonly _onDidChangeCellLayout: Emitter<NotebookCellLayoutChangedEvent>;
    readonly onDidChangeCellLayout: import("vs/base/common/event").Event<NotebookCellLayoutChangedEvent>;
    emit(events: NotebookDiffViewEvent[]): void;
}
