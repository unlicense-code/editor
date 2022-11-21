/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class MoveCellEdit {
    resource;
    fromIndex;
    length;
    toIndex;
    editingDelegate;
    beforedSelections;
    endSelections;
    type = 0 /* UndoRedoElementType.Resource */;
    label = 'Move Cell';
    code = 'undoredo.notebooks.moveCell';
    constructor(resource, fromIndex, length, toIndex, editingDelegate, beforedSelections, endSelections) {
        this.resource = resource;
        this.fromIndex = fromIndex;
        this.length = length;
        this.toIndex = toIndex;
        this.editingDelegate = editingDelegate;
        this.beforedSelections = beforedSelections;
        this.endSelections = endSelections;
    }
    undo() {
        if (!this.editingDelegate.moveCell) {
            throw new Error('Notebook Move Cell not implemented for Undo/Redo');
        }
        this.editingDelegate.moveCell(this.toIndex, this.length, this.fromIndex, this.endSelections, this.beforedSelections);
    }
    redo() {
        if (!this.editingDelegate.moveCell) {
            throw new Error('Notebook Move Cell not implemented for Undo/Redo');
        }
        this.editingDelegate.moveCell(this.fromIndex, this.length, this.toIndex, this.beforedSelections, this.endSelections);
    }
}
export class SpliceCellsEdit {
    resource;
    diffs;
    editingDelegate;
    beforeHandles;
    endHandles;
    type = 0 /* UndoRedoElementType.Resource */;
    label = 'Insert Cell';
    code = 'undoredo.notebooks.insertCell';
    constructor(resource, diffs, editingDelegate, beforeHandles, endHandles) {
        this.resource = resource;
        this.diffs = diffs;
        this.editingDelegate = editingDelegate;
        this.beforeHandles = beforeHandles;
        this.endHandles = endHandles;
    }
    undo() {
        if (!this.editingDelegate.replaceCell) {
            throw new Error('Notebook Replace Cell not implemented for Undo/Redo');
        }
        this.diffs.forEach(diff => {
            this.editingDelegate.replaceCell(diff[0], diff[2].length, diff[1], this.beforeHandles);
        });
    }
    redo() {
        if (!this.editingDelegate.replaceCell) {
            throw new Error('Notebook Replace Cell not implemented for Undo/Redo');
        }
        this.diffs.reverse().forEach(diff => {
            this.editingDelegate.replaceCell(diff[0], diff[1].length, diff[2], this.endHandles);
        });
    }
}
export class CellMetadataEdit {
    resource;
    index;
    oldMetadata;
    newMetadata;
    editingDelegate;
    type = 0 /* UndoRedoElementType.Resource */;
    label = 'Update Cell Metadata';
    code = 'undoredo.notebooks.updateCellMetadata';
    constructor(resource, index, oldMetadata, newMetadata, editingDelegate) {
        this.resource = resource;
        this.index = index;
        this.oldMetadata = oldMetadata;
        this.newMetadata = newMetadata;
        this.editingDelegate = editingDelegate;
    }
    undo() {
        if (!this.editingDelegate.updateCellMetadata) {
            return;
        }
        this.editingDelegate.updateCellMetadata(this.index, this.oldMetadata);
    }
    redo() {
        if (!this.editingDelegate.updateCellMetadata) {
            return;
        }
        this.editingDelegate.updateCellMetadata(this.index, this.newMetadata);
    }
}
