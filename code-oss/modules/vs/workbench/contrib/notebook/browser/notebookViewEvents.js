/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export var NotebookViewEventType;
(function (NotebookViewEventType) {
    NotebookViewEventType[NotebookViewEventType["LayoutChanged"] = 1] = "LayoutChanged";
    NotebookViewEventType[NotebookViewEventType["MetadataChanged"] = 2] = "MetadataChanged";
    NotebookViewEventType[NotebookViewEventType["CellStateChanged"] = 3] = "CellStateChanged";
})(NotebookViewEventType || (NotebookViewEventType = {}));
export class NotebookLayoutChangedEvent {
    source;
    value;
    type = NotebookViewEventType.LayoutChanged;
    constructor(source, value) {
        this.source = source;
        this.value = value;
    }
}
export class NotebookMetadataChangedEvent {
    source;
    type = NotebookViewEventType.MetadataChanged;
    constructor(source) {
        this.source = source;
    }
}
export class NotebookCellStateChangedEvent {
    source;
    cell;
    type = NotebookViewEventType.CellStateChanged;
    constructor(source, cell) {
        this.source = source;
        this.cell = cell;
    }
}
