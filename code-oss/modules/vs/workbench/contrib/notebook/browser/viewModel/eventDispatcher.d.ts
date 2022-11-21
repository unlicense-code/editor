import { Disposable } from 'vs/base/common/lifecycle';
import { NotebookCellStateChangedEvent, NotebookLayoutChangedEvent, NotebookMetadataChangedEvent, NotebookViewEvent } from 'vs/workbench/contrib/notebook/browser/notebookViewEvents';
export declare class NotebookEventDispatcher extends Disposable {
    private readonly _onDidChangeLayout;
    readonly onDidChangeLayout: import("vs/base/common/event").Event<NotebookLayoutChangedEvent>;
    private readonly _onDidChangeMetadata;
    readonly onDidChangeMetadata: import("vs/base/common/event").Event<NotebookMetadataChangedEvent>;
    private readonly _onDidChangeCellState;
    readonly onDidChangeCellState: import("vs/base/common/event").Event<NotebookCellStateChangedEvent>;
    emit(events: NotebookViewEvent[]): void;
}
