import { FontInfo } from 'vs/editor/common/config/fontInfo';
import { NotebookCellTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookCellTextModel';
import { NotebookDocumentMetadata } from 'vs/workbench/contrib/notebook/common/notebookCommon';
export interface NotebookLayoutInfo {
    width: number;
    height: number;
    scrollHeight: number;
    fontInfo: FontInfo;
}
export interface CellViewModelStateChangeEvent {
    readonly metadataChanged?: boolean;
    readonly internalMetadataChanged?: boolean;
    readonly selectionChanged?: boolean;
    readonly focusModeChanged?: boolean;
    readonly editStateChanged?: boolean;
    readonly languageChanged?: boolean;
    readonly foldingStateChanged?: boolean;
    readonly contentChanged?: boolean;
    readonly outputIsHoveredChanged?: boolean;
    readonly outputIsFocusedChanged?: boolean;
    readonly cellIsHoveredChanged?: boolean;
    readonly cellLineNumberChanged?: boolean;
    readonly inputCollapsedChanged?: boolean;
    readonly outputCollapsedChanged?: boolean;
    readonly dragStateChanged?: boolean;
}
export interface NotebookLayoutChangeEvent {
    width?: boolean;
    height?: boolean;
    fontInfo?: boolean;
}
export declare enum NotebookViewEventType {
    LayoutChanged = 1,
    MetadataChanged = 2,
    CellStateChanged = 3
}
export declare class NotebookLayoutChangedEvent {
    readonly source: NotebookLayoutChangeEvent;
    readonly value: NotebookLayoutInfo;
    readonly type = NotebookViewEventType.LayoutChanged;
    constructor(source: NotebookLayoutChangeEvent, value: NotebookLayoutInfo);
}
export declare class NotebookMetadataChangedEvent {
    readonly source: NotebookDocumentMetadata;
    readonly type = NotebookViewEventType.MetadataChanged;
    constructor(source: NotebookDocumentMetadata);
}
export declare class NotebookCellStateChangedEvent {
    readonly source: CellViewModelStateChangeEvent;
    readonly cell: NotebookCellTextModel;
    readonly type = NotebookViewEventType.CellStateChanged;
    constructor(source: CellViewModelStateChangeEvent, cell: NotebookCellTextModel);
}
export declare type NotebookViewEvent = NotebookLayoutChangedEvent | NotebookMetadataChangedEvent | NotebookCellStateChangedEvent;
