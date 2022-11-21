/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Emitter, PauseableEmitter } from 'vs/base/common/event';
import { Disposable, dispose } from 'vs/base/common/lifecycle';
import { NotebookCellTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookCellTextModel';
import { CellUri, diff, NotebookCellsChangeType, CellKind } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { IUndoRedoService } from 'vs/platform/undoRedo/common/undoRedo';
import { MoveCellEdit, SpliceCellsEdit, CellMetadataEdit } from 'vs/workbench/contrib/notebook/common/model/cellEdit';
import { LcsDiff } from 'vs/base/common/diff/diff';
import { hash } from 'vs/base/common/hash';
import { NotebookCellOutputTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookCellOutputTextModel';
import { IModelService } from 'vs/editor/common/services/model';
import { Schemas } from 'vs/base/common/network';
import { isEqual } from 'vs/base/common/resources';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { TextModel } from 'vs/editor/common/model/textModel';
import { isDefined } from 'vs/base/common/types';
class StackOperation {
    textModel;
    label;
    undoRedoGroup;
    _pauseableEmitter;
    _postUndoRedo;
    type;
    code = 'undoredo.notebooks.stackOperation';
    _operations = [];
    _beginSelectionState = undefined;
    _resultSelectionState = undefined;
    _beginAlternativeVersionId;
    _resultAlternativeVersionId;
    constructor(textModel, label, undoRedoGroup, _pauseableEmitter, _postUndoRedo, selectionState, beginAlternativeVersionId) {
        this.textModel = textModel;
        this.label = label;
        this.undoRedoGroup = undoRedoGroup;
        this._pauseableEmitter = _pauseableEmitter;
        this._postUndoRedo = _postUndoRedo;
        this.type = 1 /* UndoRedoElementType.Workspace */;
        this._beginSelectionState = selectionState;
        this._beginAlternativeVersionId = beginAlternativeVersionId;
        this._resultAlternativeVersionId = beginAlternativeVersionId;
    }
    get resources() {
        return [this.textModel.uri];
    }
    get isEmpty() {
        return this._operations.length === 0;
    }
    pushEndState(alternativeVersionId, selectionState) {
        this._resultAlternativeVersionId = alternativeVersionId;
        this._resultSelectionState = selectionState;
    }
    pushEditOperation(element, beginSelectionState, resultSelectionState) {
        if (this._operations.length === 0) {
            this._beginSelectionState = this._beginSelectionState ?? beginSelectionState;
        }
        this._operations.push(element);
        this._resultSelectionState = resultSelectionState;
    }
    async undo() {
        this._pauseableEmitter.pause();
        for (let i = this._operations.length - 1; i >= 0; i--) {
            await this._operations[i].undo();
        }
        this._postUndoRedo(this._beginAlternativeVersionId);
        this._pauseableEmitter.fire({
            rawEvents: [],
            synchronous: undefined,
            versionId: this.textModel.versionId,
            endSelectionState: this._beginSelectionState
        });
        this._pauseableEmitter.resume();
    }
    async redo() {
        this._pauseableEmitter.pause();
        for (let i = 0; i < this._operations.length; i++) {
            await this._operations[i].redo();
        }
        this._postUndoRedo(this._resultAlternativeVersionId);
        this._pauseableEmitter.fire({
            rawEvents: [],
            synchronous: undefined,
            versionId: this.textModel.versionId,
            endSelectionState: this._resultSelectionState
        });
        this._pauseableEmitter.resume();
    }
}
class NotebookOperationManager {
    _textModel;
    _undoService;
    _pauseableEmitter;
    _postUndoRedo;
    _pendingStackOperation = null;
    constructor(_textModel, _undoService, _pauseableEmitter, _postUndoRedo) {
        this._textModel = _textModel;
        this._undoService = _undoService;
        this._pauseableEmitter = _pauseableEmitter;
        this._postUndoRedo = _postUndoRedo;
    }
    isUndoStackEmpty() {
        return this._pendingStackOperation === null || this._pendingStackOperation.isEmpty;
    }
    pushStackElement(label, selectionState, undoRedoGroup, alternativeVersionId) {
        if (this._pendingStackOperation) {
            this._pendingStackOperation.pushEndState(alternativeVersionId, selectionState);
            if (!this._pendingStackOperation.isEmpty) {
                this._undoService.pushElement(this._pendingStackOperation, this._pendingStackOperation.undoRedoGroup);
            }
            this._pendingStackOperation = null;
            return;
        }
        this._pendingStackOperation = new StackOperation(this._textModel, label, undoRedoGroup, this._pauseableEmitter, this._postUndoRedo, selectionState, alternativeVersionId);
    }
    pushEditOperation(element, beginSelectionState, resultSelectionState) {
        if (this._pendingStackOperation) {
            this._pendingStackOperation.pushEditOperation(element, beginSelectionState, resultSelectionState);
            return;
        }
        this._undoService.pushElement(element);
    }
}
class NotebookEventEmitter extends PauseableEmitter {
    isDirtyEvent() {
        for (const e of this._eventQueue) {
            for (let i = 0; i < e.rawEvents.length; i++) {
                if (!e.rawEvents[i].transient) {
                    return true;
                }
            }
        }
        return false;
    }
}
let NotebookTextModel = class NotebookTextModel extends Disposable {
    viewType;
    uri;
    _undoService;
    _modelService;
    _languageService;
    _isDisposed = false;
    _onWillDispose = this._register(new Emitter());
    _onWillAddRemoveCells = this._register(new Emitter());
    _onDidChangeContent = this._register(new Emitter());
    onWillDispose = this._onWillDispose.event;
    onWillAddRemoveCells = this._onWillAddRemoveCells.event;
    onDidChangeContent = this._onDidChangeContent.event;
    _cellhandlePool = 0;
    _cellListeners = new Map();
    _cells = [];
    _defaultCollapseConfig;
    metadata = {};
    transientOptions = { transientCellMetadata: {}, transientDocumentMetadata: {}, transientOutputs: false, cellContentMetadata: {} };
    _versionId = 0;
    /**
     * This alternative id is only for non-cell-content changes.
     */
    _notebookSpecificAlternativeId = 0;
    /**
     * Unlike, versionId, this can go down (via undo) or go to previous values (via redo)
     */
    _alternativeVersionId = '1';
    _operationManager;
    _pauseableEmitter;
    get length() {
        return this._cells.length;
    }
    get cells() {
        return this._cells;
    }
    get versionId() {
        return this._versionId;
    }
    get alternativeVersionId() {
        return this._alternativeVersionId;
    }
    constructor(viewType, uri, cells, metadata, options, _undoService, _modelService, _languageService) {
        super();
        this.viewType = viewType;
        this.uri = uri;
        this._undoService = _undoService;
        this._modelService = _modelService;
        this._languageService = _languageService;
        this.transientOptions = options;
        this.metadata = metadata;
        this._initialize(cells);
        const maybeUpdateCellTextModel = (textModel) => {
            if (textModel.uri.scheme === Schemas.vscodeNotebookCell && textModel instanceof TextModel) {
                const cellUri = CellUri.parse(textModel.uri);
                if (cellUri && isEqual(cellUri.notebook, this.uri)) {
                    const cellIdx = this._getCellIndexByHandle(cellUri.handle);
                    if (cellIdx >= 0) {
                        const cell = this.cells[cellIdx];
                        if (cell) {
                            cell.textModel = textModel;
                        }
                    }
                }
            }
        };
        this._register(_modelService.onModelAdded(e => maybeUpdateCellTextModel(e)));
        this._pauseableEmitter = new NotebookEventEmitter({
            merge: (events) => {
                const first = events[0];
                const rawEvents = first.rawEvents;
                let versionId = first.versionId;
                let endSelectionState = first.endSelectionState;
                let synchronous = first.synchronous;
                for (let i = 1; i < events.length; i++) {
                    rawEvents.push(...events[i].rawEvents);
                    versionId = events[i].versionId;
                    endSelectionState = events[i].endSelectionState !== undefined ? events[i].endSelectionState : endSelectionState;
                    synchronous = events[i].synchronous !== undefined ? events[i].synchronous : synchronous;
                }
                return { rawEvents, versionId, endSelectionState, synchronous };
            }
        });
        this._register(this._pauseableEmitter.event(e => {
            if (e.rawEvents.length) {
                this._onDidChangeContent.fire(e);
            }
        }));
        this._operationManager = new NotebookOperationManager(this, this._undoService, this._pauseableEmitter, (alternativeVersionId) => {
            this._increaseVersionId(true);
            this._overwriteAlternativeVersionId(alternativeVersionId);
        });
    }
    setCellCollapseDefault(collapseConfig) {
        this._defaultCollapseConfig = collapseConfig;
    }
    _initialize(cells, triggerDirty) {
        this._cells = [];
        this._versionId = 0;
        this._notebookSpecificAlternativeId = 0;
        const mainCells = cells.map(cell => {
            const cellHandle = this._cellhandlePool++;
            const cellUri = CellUri.generate(this.uri, cellHandle);
            const collapseState = this._getDefaultCollapseState(cell);
            return new NotebookCellTextModel(cellUri, cellHandle, cell.source, cell.language, cell.mime, cell.cellKind, cell.outputs, cell.metadata, cell.internalMetadata, collapseState, this.transientOptions, this._languageService);
        });
        for (let i = 0; i < mainCells.length; i++) {
            const dirtyStateListener = mainCells[i].onDidChangeContent((e) => {
                this._bindCellContentHandler(mainCells[i], e);
            });
            this._cellListeners.set(mainCells[i].handle, dirtyStateListener);
        }
        this._cells.splice(0, 0, ...mainCells);
        this._alternativeVersionId = this._generateAlternativeId();
        if (triggerDirty) {
            this._pauseableEmitter.fire({
                rawEvents: [{ kind: NotebookCellsChangeType.Unknown, transient: false }],
                versionId: this.versionId,
                synchronous: true,
                endSelectionState: undefined
            });
        }
    }
    _bindCellContentHandler(cell, e) {
        this._increaseVersionId(e === 'content');
        switch (e) {
            case 'content':
                this._pauseableEmitter.fire({
                    rawEvents: [{ kind: NotebookCellsChangeType.ChangeCellContent, index: this._getCellIndexByHandle(cell.handle), transient: false }],
                    versionId: this.versionId,
                    synchronous: true,
                    endSelectionState: undefined
                });
                break;
            case 'language':
                this._pauseableEmitter.fire({
                    rawEvents: [{ kind: NotebookCellsChangeType.ChangeCellLanguage, index: this._getCellIndexByHandle(cell.handle), language: cell.language, transient: false }],
                    versionId: this.versionId,
                    synchronous: true,
                    endSelectionState: undefined
                });
                break;
            case 'mime':
                this._pauseableEmitter.fire({
                    rawEvents: [{ kind: NotebookCellsChangeType.ChangeCellMime, index: this._getCellIndexByHandle(cell.handle), mime: cell.mime, transient: false }],
                    versionId: this.versionId,
                    synchronous: true,
                    endSelectionState: undefined
                });
                break;
        }
    }
    _generateAlternativeId() {
        return `${this._notebookSpecificAlternativeId}_` + this.cells.map(cell => cell.handle + ',' + cell.alternativeId).join(';');
    }
    dispose() {
        if (this._isDisposed) {
            // NotebookEditorModel can be disposed twice, don't fire onWillDispose again
            return;
        }
        this._isDisposed = true;
        this._onWillDispose.fire();
        this._undoService.removeElements(this.uri);
        dispose(this._cellListeners.values());
        this._cellListeners.clear();
        dispose(this._cells);
        this._cells = [];
        super.dispose();
    }
    pushStackElement(label, selectionState, undoRedoGroup) {
        this._operationManager.pushStackElement(label, selectionState, undoRedoGroup, this.alternativeVersionId);
    }
    _getCellIndexByHandle(handle) {
        return this.cells.findIndex(c => c.handle === handle);
    }
    _getCellIndexWithOutputIdHandleFromEdits(outputId, rawEdits) {
        const edit = rawEdits.find(e => 'outputs' in e && e.outputs.some(o => o.outputId === outputId));
        if (edit) {
            if ('index' in edit) {
                return edit.index;
            }
            else if ('handle' in edit) {
                const cellIndex = this._getCellIndexByHandle(edit.handle);
                this._assertIndex(cellIndex);
                return cellIndex;
            }
        }
        return -1;
    }
    _getCellIndexWithOutputIdHandle(outputId) {
        return this.cells.findIndex(c => !!c.outputs.find(o => o.outputId === outputId));
    }
    reset(cells, metadata, transientOptions) {
        this.transientOptions = transientOptions;
        const edits = NotebookTextModel.computeEdits(this, cells);
        this.applyEdits([
            ...edits,
            { editType: 5 /* CellEditType.DocumentMetadata */, metadata }
        ], true, undefined, () => undefined, undefined, false);
    }
    static computeEdits(model, cells) {
        const edits = [];
        const commonPrefix = this._commonPrefix(model.cells, model.cells.length, 0, cells, cells.length, 0);
        if (commonPrefix > 0) {
            for (let i = 0; i < commonPrefix; i++) {
                edits.push({
                    editType: 3 /* CellEditType.Metadata */,
                    index: i,
                    metadata: cells[i].metadata ?? {}
                }, ...this._computeOutputEdit(i, model.cells[i].outputs, cells[i].outputs));
            }
        }
        if (model.cells.length === cells.length && commonPrefix === model.cells.length) {
            return edits;
        }
        const commonSuffix = this._commonSuffix(model.cells, model.cells.length - commonPrefix, commonPrefix, cells, cells.length - commonPrefix, commonPrefix);
        if (commonSuffix > 0) {
            edits.push({ editType: 1 /* CellEditType.Replace */, index: commonPrefix, count: model.cells.length - commonPrefix - commonSuffix, cells: cells.slice(commonPrefix, cells.length - commonSuffix) });
        }
        else if (commonPrefix > 0) {
            edits.push({ editType: 1 /* CellEditType.Replace */, index: commonPrefix, count: model.cells.length - commonPrefix, cells: cells.slice(commonPrefix) });
        }
        else {
            edits.push({ editType: 1 /* CellEditType.Replace */, index: 0, count: model.cells.length, cells });
        }
        if (commonSuffix > 0) {
            // has same suffix
            for (let i = commonSuffix; i > 0; i--) {
                edits.push({
                    editType: 3 /* CellEditType.Metadata */,
                    index: model.cells.length - i,
                    metadata: cells[cells.length - i].metadata ?? {}
                }, ...this._computeOutputEdit(model.cells.length - i, model.cells[model.cells.length - i].outputs, cells[cells.length - i].outputs));
            }
        }
        return edits;
    }
    static _computeOutputEdit(index, a, b) {
        if (a.length !== b.length) {
            return [
                {
                    editType: 2 /* CellEditType.Output */,
                    index: index,
                    outputs: b,
                    append: false
                }
            ];
        }
        if (a.length === 0) {
            // no output
            return [];
        }
        // same length
        return b.map((output, i) => {
            return {
                editType: 7 /* CellEditType.OutputItems */,
                outputId: a[i].outputId,
                items: output.outputs,
                append: false
            };
        });
    }
    static _commonPrefix(a, aLen, aDelta, b, bLen, bDelta) {
        const maxResult = Math.min(aLen, bLen);
        let result = 0;
        for (let i = 0; i < maxResult && a[aDelta + i].fastEqual(b[bDelta + i]); i++) {
            result++;
        }
        return result;
    }
    static _commonSuffix(a, aLen, aDelta, b, bLen, bDelta) {
        const maxResult = Math.min(aLen, bLen);
        let result = 0;
        for (let i = 0; i < maxResult && a[aDelta + aLen - i - 1].fastEqual(b[bDelta + bLen - i - 1]); i++) {
            result++;
        }
        return result;
    }
    applyEdits(rawEdits, synchronous, beginSelectionState, endSelectionsComputer, undoRedoGroup, computeUndoRedo) {
        this._pauseableEmitter.pause();
        this.pushStackElement('edit', beginSelectionState, undoRedoGroup);
        try {
            this._doApplyEdits(rawEdits, synchronous, computeUndoRedo);
            return true;
        }
        finally {
            // Update selection and versionId after applying edits.
            const endSelections = endSelectionsComputer();
            this._increaseVersionId(this._operationManager.isUndoStackEmpty() && !this._pauseableEmitter.isDirtyEvent());
            // Finalize undo element
            this.pushStackElement('edit', endSelections, undefined);
            // Broadcast changes
            this._pauseableEmitter.fire({ rawEvents: [], versionId: this.versionId, synchronous: synchronous, endSelectionState: endSelections });
            this._pauseableEmitter.resume();
        }
    }
    _doApplyEdits(rawEdits, synchronous, computeUndoRedo) {
        const editsWithDetails = rawEdits.map((edit, index) => {
            let cellIndex = -1;
            if ('index' in edit) {
                cellIndex = edit.index;
            }
            else if ('handle' in edit) {
                cellIndex = this._getCellIndexByHandle(edit.handle);
                this._assertIndex(cellIndex);
            }
            else if ('outputId' in edit) {
                cellIndex = this._getCellIndexWithOutputIdHandle(edit.outputId);
                if (this._indexIsInvalid(cellIndex)) {
                    // The referenced output may have been created in this batch of edits
                    cellIndex = this._getCellIndexWithOutputIdHandleFromEdits(edit.outputId, rawEdits.slice(0, index));
                }
                if (this._indexIsInvalid(cellIndex)) {
                    // It's possible for an edit to refer to an output which was just cleared, ignore it without throwing
                    return null;
                }
            }
            else if (edit.editType !== 5 /* CellEditType.DocumentMetadata */) {
                throw new Error('Invalid cell edit');
            }
            return {
                edit,
                cellIndex,
                end: (edit.editType === 5 /* CellEditType.DocumentMetadata */)
                    ? undefined
                    : (edit.editType === 1 /* CellEditType.Replace */ ? edit.index + edit.count : cellIndex),
                originalIndex: index
            };
        }).filter(isDefined);
        // compress all edits which have no side effects on cell index
        const edits = this._mergeCellEdits(editsWithDetails)
            .sort((a, b) => {
            if (a.end === undefined) {
                return -1;
            }
            if (b.end === undefined) {
                return -1;
            }
            return b.end - a.end || b.originalIndex - a.originalIndex;
        }).reduce((prev, curr) => {
            if (!prev.length) {
                // empty
                prev.push([curr]);
            }
            else {
                const last = prev[prev.length - 1];
                const index = last[0].cellIndex;
                if (curr.cellIndex === index) {
                    last.push(curr);
                }
                else {
                    prev.push([curr]);
                }
            }
            return prev;
        }, []).map(editsOnSameIndex => {
            const replaceEdits = [];
            const otherEdits = [];
            editsOnSameIndex.forEach(edit => {
                if (edit.edit.editType === 1 /* CellEditType.Replace */) {
                    replaceEdits.push(edit);
                }
                else {
                    otherEdits.push(edit);
                }
            });
            return [...otherEdits.reverse(), ...replaceEdits];
        });
        const flattenEdits = edits.flat();
        for (const { edit, cellIndex } of flattenEdits) {
            switch (edit.editType) {
                case 1 /* CellEditType.Replace */:
                    this._replaceCells(edit.index, edit.count, edit.cells, synchronous, computeUndoRedo);
                    break;
                case 2 /* CellEditType.Output */: {
                    this._assertIndex(cellIndex);
                    const cell = this._cells[cellIndex];
                    if (edit.append) {
                        this._spliceNotebookCellOutputs(cell, { start: cell.outputs.length, deleteCount: 0, newOutputs: edit.outputs.map(op => new NotebookCellOutputTextModel(op)) }, true, computeUndoRedo);
                    }
                    else {
                        this._spliceNotebookCellOutputs2(cell, edit.outputs.map(op => new NotebookCellOutputTextModel(op)), computeUndoRedo);
                    }
                    break;
                }
                case 7 /* CellEditType.OutputItems */:
                    {
                        this._assertIndex(cellIndex);
                        const cell = this._cells[cellIndex];
                        if (edit.append) {
                            this._appendNotebookCellOutputItems(cell, edit.outputId, edit.items);
                        }
                        else {
                            this._replaceNotebookCellOutputItems(cell, edit.outputId, edit.items);
                        }
                    }
                    break;
                case 3 /* CellEditType.Metadata */:
                    this._assertIndex(edit.index);
                    this._changeCellMetadata(this._cells[edit.index], edit.metadata, computeUndoRedo);
                    break;
                case 8 /* CellEditType.PartialMetadata */:
                    this._assertIndex(cellIndex);
                    this._changeCellMetadataPartial(this._cells[cellIndex], edit.metadata, computeUndoRedo);
                    break;
                case 9 /* CellEditType.PartialInternalMetadata */:
                    this._assertIndex(cellIndex);
                    this._changeCellInternalMetadataPartial(this._cells[cellIndex], edit.internalMetadata);
                    break;
                case 4 /* CellEditType.CellLanguage */:
                    this._assertIndex(edit.index);
                    this._changeCellLanguage(this._cells[edit.index], edit.language, computeUndoRedo);
                    break;
                case 5 /* CellEditType.DocumentMetadata */:
                    this._updateNotebookMetadata(edit.metadata, computeUndoRedo);
                    break;
                case 6 /* CellEditType.Move */:
                    this._moveCellToIdx(edit.index, edit.length, edit.newIdx, synchronous, computeUndoRedo, undefined, undefined);
                    break;
            }
        }
    }
    _mergeCellEdits(rawEdits) {
        const mergedEdits = [];
        rawEdits.forEach(edit => {
            if (mergedEdits.length) {
                const last = mergedEdits[mergedEdits.length - 1];
                if (last.edit.editType === 2 /* CellEditType.Output */
                    && last.edit.append
                    && edit.edit.editType === 2 /* CellEditType.Output */
                    && edit.edit.append
                    && last.cellIndex === edit.cellIndex) {
                    last.edit.outputs = [...last.edit.outputs, ...edit.edit.outputs];
                }
                else if (last.edit.editType === 2 /* CellEditType.Output */
                    && !last.edit.append // last cell is not append
                    && last.edit.outputs.length === 0 // last cell is clear outputs
                    && edit.edit.editType === 2 /* CellEditType.Output */
                    && edit.edit.append
                    && last.cellIndex === edit.cellIndex) {
                    last.edit.append = false;
                    last.edit.outputs = edit.edit.outputs;
                }
                else {
                    mergedEdits.push(edit);
                }
            }
            else {
                mergedEdits.push(edit);
            }
        });
        return mergedEdits;
    }
    _getDefaultCollapseState(cellDto) {
        const defaultConfig = cellDto.cellKind === CellKind.Code ? this._defaultCollapseConfig?.codeCell : this._defaultCollapseConfig?.markupCell;
        return cellDto.collapseState ?? (defaultConfig ?? undefined);
    }
    _replaceCells(index, count, cellDtos, synchronous, computeUndoRedo) {
        if (count === 0 && cellDtos.length === 0) {
            return;
        }
        const oldViewCells = this._cells.slice(0);
        const oldSet = new Set();
        oldViewCells.forEach(cell => {
            oldSet.add(cell.handle);
        });
        // prepare remove
        for (let i = index; i < Math.min(index + count, this._cells.length); i++) {
            const cell = this._cells[i];
            this._cellListeners.get(cell.handle)?.dispose();
            this._cellListeners.delete(cell.handle);
        }
        // prepare add
        const cells = cellDtos.map(cellDto => {
            const cellHandle = this._cellhandlePool++;
            const cellUri = CellUri.generate(this.uri, cellHandle);
            const collapseState = this._getDefaultCollapseState(cellDto);
            const cell = new NotebookCellTextModel(cellUri, cellHandle, cellDto.source, cellDto.language, cellDto.mime, cellDto.cellKind, cellDto.outputs || [], cellDto.metadata, cellDto.internalMetadata, collapseState, this.transientOptions, this._languageService);
            const textModel = this._modelService.getModel(cellUri);
            if (textModel && textModel instanceof TextModel) {
                cell.textModel = textModel;
                cell.language = cellDto.language;
                cell.textModel.setValue(cellDto.source);
                cell.resetTextBuffer(cell.textModel.getTextBuffer());
            }
            const dirtyStateListener = cell.onDidChangeContent((e) => {
                this._bindCellContentHandler(cell, e);
            });
            this._cellListeners.set(cell.handle, dirtyStateListener);
            return cell;
        });
        // compute change
        const cellsCopy = this._cells.slice(0);
        cellsCopy.splice(index, count, ...cells);
        const diffs = diff(this._cells, cellsCopy, cell => {
            return oldSet.has(cell.handle);
        }).map(diff => {
            return [diff.start, diff.deleteCount, diff.toInsert];
        });
        this._onWillAddRemoveCells.fire({ rawEvent: { kind: NotebookCellsChangeType.ModelChange, changes: diffs } });
        // make change
        this._cells = cellsCopy;
        const undoDiff = diffs.map(diff => {
            const deletedCells = oldViewCells.slice(diff[0], diff[0] + diff[1]);
            return [diff[0], deletedCells, diff[2]];
        });
        if (computeUndoRedo) {
            this._operationManager.pushEditOperation(new SpliceCellsEdit(this.uri, undoDiff, {
                insertCell: (index, cell, endSelections) => { this._insertNewCell(index, [cell], true, endSelections); },
                deleteCell: (index, endSelections) => { this._removeCell(index, 1, true, endSelections); },
                replaceCell: (index, count, cells, endSelections) => { this._replaceNewCells(index, count, cells, true, endSelections); },
            }, undefined, undefined), undefined, undefined);
        }
        // should be deferred
        this._pauseableEmitter.fire({
            rawEvents: [{ kind: NotebookCellsChangeType.ModelChange, changes: diffs, transient: false }],
            versionId: this.versionId,
            synchronous: synchronous,
            endSelectionState: undefined
        });
    }
    _increaseVersionId(transient) {
        this._versionId = this._versionId + 1;
        if (!transient) {
            this._notebookSpecificAlternativeId = this._versionId;
        }
        this._alternativeVersionId = this._generateAlternativeId();
    }
    _overwriteAlternativeVersionId(newAlternativeVersionId) {
        this._alternativeVersionId = newAlternativeVersionId;
        this._notebookSpecificAlternativeId = Number(newAlternativeVersionId.substring(0, newAlternativeVersionId.indexOf('_')));
    }
    _updateNotebookMetadata(metadata, computeUndoRedo) {
        const oldMetadata = this.metadata;
        const triggerDirtyChange = this._isDocumentMetadataChanged(this.metadata, metadata);
        if (triggerDirtyChange) {
            if (computeUndoRedo) {
                const that = this;
                this._operationManager.pushEditOperation(new class {
                    type = 0 /* UndoRedoElementType.Resource */;
                    get resource() {
                        return that.uri;
                    }
                    label = 'Update Notebook Metadata';
                    code = 'undoredo.notebooks.updateCellMetadata';
                    undo() {
                        that._updateNotebookMetadata(oldMetadata, false);
                    }
                    redo() {
                        that._updateNotebookMetadata(metadata, false);
                    }
                }(), undefined, undefined);
            }
        }
        this.metadata = metadata;
        this._pauseableEmitter.fire({
            rawEvents: [{ kind: NotebookCellsChangeType.ChangeDocumentMetadata, metadata: this.metadata, transient: !triggerDirtyChange }],
            versionId: this.versionId,
            synchronous: true,
            endSelectionState: undefined
        });
    }
    _insertNewCell(index, cells, synchronous, endSelections) {
        for (let i = 0; i < cells.length; i++) {
            const dirtyStateListener = cells[i].onDidChangeContent((e) => {
                this._bindCellContentHandler(cells[i], e);
            });
            this._cellListeners.set(cells[i].handle, dirtyStateListener);
        }
        const changes = [[index, 0, cells]];
        this._onWillAddRemoveCells.fire({ rawEvent: { kind: NotebookCellsChangeType.ModelChange, changes } });
        this._cells.splice(index, 0, ...cells);
        this._pauseableEmitter.fire({
            rawEvents: [{ kind: NotebookCellsChangeType.ModelChange, changes, transient: false }],
            versionId: this.versionId,
            synchronous: synchronous,
            endSelectionState: endSelections
        });
        return;
    }
    _removeCell(index, count, synchronous, endSelections) {
        for (let i = index; i < index + count; i++) {
            const cell = this._cells[i];
            this._cellListeners.get(cell.handle)?.dispose();
            this._cellListeners.delete(cell.handle);
        }
        const changes = [[index, count, []]];
        this._onWillAddRemoveCells.fire({ rawEvent: { kind: NotebookCellsChangeType.ModelChange, changes } });
        this._cells.splice(index, count);
        this._pauseableEmitter.fire({
            rawEvents: [{ kind: NotebookCellsChangeType.ModelChange, changes, transient: false }],
            versionId: this.versionId,
            synchronous: synchronous,
            endSelectionState: endSelections
        });
    }
    _replaceNewCells(index, count, cells, synchronous, endSelections) {
        for (let i = index; i < index + count; i++) {
            const cell = this._cells[i];
            this._cellListeners.get(cell.handle)?.dispose();
            this._cellListeners.delete(cell.handle);
        }
        for (let i = 0; i < cells.length; i++) {
            const dirtyStateListener = cells[i].onDidChangeContent((e) => {
                this._bindCellContentHandler(cells[i], e);
            });
            this._cellListeners.set(cells[i].handle, dirtyStateListener);
        }
        const changes = [[index, count, cells]];
        this._onWillAddRemoveCells.fire({ rawEvent: { kind: NotebookCellsChangeType.ModelChange, changes } });
        this._cells.splice(index, count, ...cells);
        this._pauseableEmitter.fire({
            rawEvents: [{ kind: NotebookCellsChangeType.ModelChange, changes, transient: false }],
            versionId: this.versionId,
            synchronous: synchronous,
            endSelectionState: endSelections
        });
    }
    _isDocumentMetadataChanged(a, b) {
        const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
        for (const key of keys) {
            if (key === 'custom') {
                if (!this._customMetadataEqual(a[key], b[key])
                    &&
                        !(this.transientOptions.transientDocumentMetadata[key])) {
                    return true;
                }
            }
            else if ((a[key] !== b[key])
                &&
                    !(this.transientOptions.transientDocumentMetadata[key])) {
                return true;
            }
        }
        return false;
    }
    _isCellMetadataChanged(a, b) {
        const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
        for (const key of keys) {
            if ((a[key] !== b[key])
                &&
                    !(this.transientOptions.transientCellMetadata[key])) {
                return true;
            }
        }
        return false;
    }
    _customMetadataEqual(a, b) {
        if (!a && !b) {
            // both of them are nullish or undefined
            return true;
        }
        if (!a || !b) {
            return false;
        }
        const aProps = Object.getOwnPropertyNames(a);
        const bProps = Object.getOwnPropertyNames(b);
        if (aProps.length !== bProps.length) {
            return false;
        }
        for (let i = 0; i < aProps.length; i++) {
            const propName = aProps[i];
            if (a[propName] !== b[propName]) {
                return false;
            }
        }
        return true;
    }
    _changeCellMetadataPartial(cell, metadata, computeUndoRedo) {
        const newMetadata = {
            ...cell.metadata
        };
        let k;
        for (k in metadata) {
            const value = metadata[k] ?? undefined;
            newMetadata[k] = value;
        }
        return this._changeCellMetadata(cell, newMetadata, computeUndoRedo);
    }
    _changeCellMetadata(cell, metadata, computeUndoRedo) {
        const triggerDirtyChange = this._isCellMetadataChanged(cell.metadata, metadata);
        if (triggerDirtyChange) {
            if (computeUndoRedo) {
                const index = this._cells.indexOf(cell);
                this._operationManager.pushEditOperation(new CellMetadataEdit(this.uri, index, Object.freeze(cell.metadata), Object.freeze(metadata), {
                    updateCellMetadata: (index, newMetadata) => {
                        const cell = this._cells[index];
                        if (!cell) {
                            return;
                        }
                        this._changeCellMetadata(cell, newMetadata, false);
                    }
                }), undefined, undefined);
            }
        }
        // should be deferred
        cell.metadata = metadata;
        this._pauseableEmitter.fire({
            rawEvents: [{ kind: NotebookCellsChangeType.ChangeCellMetadata, index: this._cells.indexOf(cell), metadata: cell.metadata, transient: !triggerDirtyChange }],
            versionId: this.versionId,
            synchronous: true,
            endSelectionState: undefined
        });
    }
    _changeCellInternalMetadataPartial(cell, internalMetadata) {
        const newInternalMetadata = {
            ...cell.internalMetadata
        };
        let k;
        for (k in internalMetadata) {
            const value = internalMetadata[k] ?? undefined;
            newInternalMetadata[k] = value;
        }
        cell.internalMetadata = newInternalMetadata;
        this._pauseableEmitter.fire({
            rawEvents: [{ kind: NotebookCellsChangeType.ChangeCellInternalMetadata, index: this._cells.indexOf(cell), internalMetadata: cell.internalMetadata, transient: true }],
            versionId: this.versionId,
            synchronous: true,
            endSelectionState: undefined
        });
    }
    _changeCellLanguage(cell, languageId, computeUndoRedo) {
        if (cell.language === languageId) {
            return;
        }
        const oldLanguage = cell.language;
        cell.language = languageId;
        if (computeUndoRedo) {
            const that = this;
            this._operationManager.pushEditOperation(new class {
                type = 0 /* UndoRedoElementType.Resource */;
                get resource() {
                    return that.uri;
                }
                label = 'Update Cell Language';
                code = 'undoredo.notebooks.updateCellLanguage';
                undo() {
                    that._changeCellLanguage(cell, oldLanguage, false);
                }
                redo() {
                    that._changeCellLanguage(cell, languageId, false);
                }
            }(), undefined, undefined);
        }
        this._pauseableEmitter.fire({
            rawEvents: [{ kind: NotebookCellsChangeType.ChangeCellLanguage, index: this._cells.indexOf(cell), language: languageId, transient: false }],
            versionId: this.versionId,
            synchronous: true,
            endSelectionState: undefined
        });
    }
    _spliceNotebookCellOutputs2(cell, outputs, computeUndoRedo) {
        if (outputs.length === 0 && cell.outputs.length === 0) {
            return;
        }
        if (outputs.length <= 1) {
            this._spliceNotebookCellOutputs(cell, { start: 0, deleteCount: cell.outputs.length, newOutputs: outputs }, false, computeUndoRedo);
            return;
        }
        const diff = new LcsDiff(new OutputSequence(cell.outputs), new OutputSequence(outputs));
        const diffResult = diff.ComputeDiff(false);
        const splices = diffResult.changes.map(change => ({ start: change.originalStart, deleteCount: change.originalLength, newOutputs: outputs.slice(change.modifiedStart, change.modifiedStart + change.modifiedLength) }));
        splices.reverse().forEach(splice => {
            this._spliceNotebookCellOutputs(cell, splice, false, computeUndoRedo);
        });
    }
    _spliceNotebookCellOutputs(cell, splice, append, computeUndoRedo) {
        cell.spliceNotebookCellOutputs(splice);
        this._pauseableEmitter.fire({
            rawEvents: [{
                    kind: NotebookCellsChangeType.Output,
                    index: this._cells.indexOf(cell),
                    outputs: cell.outputs ?? [],
                    append,
                    transient: this.transientOptions.transientOutputs,
                }],
            versionId: this.versionId,
            synchronous: true,
            endSelectionState: undefined
        });
    }
    _appendNotebookCellOutputItems(cell, outputId, items) {
        if (cell.changeOutputItems(outputId, true, items)) {
            this._pauseableEmitter.fire({
                rawEvents: [{
                        kind: NotebookCellsChangeType.OutputItem,
                        index: this._cells.indexOf(cell),
                        outputId: outputId,
                        outputItems: items,
                        append: true,
                        transient: this.transientOptions.transientOutputs
                    }],
                versionId: this.versionId,
                synchronous: true,
                endSelectionState: undefined
            });
        }
    }
    _replaceNotebookCellOutputItems(cell, outputId, items) {
        if (cell.changeOutputItems(outputId, false, items)) {
            this._pauseableEmitter.fire({
                rawEvents: [{
                        kind: NotebookCellsChangeType.OutputItem,
                        index: this._cells.indexOf(cell),
                        outputId: outputId,
                        outputItems: items,
                        append: false,
                        transient: this.transientOptions.transientOutputs
                    }],
                versionId: this.versionId,
                synchronous: true,
                endSelectionState: undefined
            });
        }
    }
    _moveCellToIdx(index, length, newIdx, synchronous, pushedToUndoStack, beforeSelections, endSelections) {
        if (pushedToUndoStack) {
            this._operationManager.pushEditOperation(new MoveCellEdit(this.uri, index, length, newIdx, {
                moveCell: (fromIndex, length, toIndex, beforeSelections, endSelections) => {
                    this._moveCellToIdx(fromIndex, length, toIndex, true, false, beforeSelections, endSelections);
                },
            }, beforeSelections, endSelections), beforeSelections, endSelections);
        }
        this._assertIndex(index);
        this._assertIndex(newIdx);
        const cells = this._cells.splice(index, length);
        this._cells.splice(newIdx, 0, ...cells);
        this._pauseableEmitter.fire({
            rawEvents: [{ kind: NotebookCellsChangeType.Move, index, length, newIdx, cells, transient: false }],
            versionId: this.versionId,
            synchronous: synchronous,
            endSelectionState: endSelections
        });
        return true;
    }
    _assertIndex(index) {
        if (this._indexIsInvalid(index)) {
            throw new Error(`model index out of range ${index}`);
        }
    }
    _indexIsInvalid(index) {
        return index < 0 || index >= this._cells.length;
    }
};
NotebookTextModel = __decorate([
    __param(5, IUndoRedoService),
    __param(6, IModelService),
    __param(7, ILanguageService)
], NotebookTextModel);
export { NotebookTextModel };
class OutputSequence {
    outputs;
    constructor(outputs) {
        this.outputs = outputs;
    }
    getElements() {
        return this.outputs.map(output => {
            return hash(output.outputs.map(output => ({
                mime: output.mime,
                data: output.data
            })));
        });
    }
}
