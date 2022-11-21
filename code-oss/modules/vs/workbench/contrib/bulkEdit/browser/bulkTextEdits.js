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
import { dispose } from 'vs/base/common/lifecycle';
import { EditOperation } from 'vs/editor/common/core/editOperation';
import { Range } from 'vs/editor/common/core/range';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorker';
import { IUndoRedoService } from 'vs/platform/undoRedo/common/undoRedo';
import { SingleModelEditStackElement, MultiModelEditStackElement } from 'vs/editor/common/model/editStack';
import { ResourceMap } from 'vs/base/common/map';
import { IModelService } from 'vs/editor/common/services/model';
import { ResourceTextEdit } from 'vs/editor/browser/services/bulkEditService';
import { SnippetController2 } from 'vs/editor/contrib/snippet/browser/snippetController2';
import { SnippetParser } from 'vs/editor/contrib/snippet/browser/snippetParser';
class ModelEditTask {
    _modelReference;
    model;
    _expectedModelVersionId;
    _edits;
    _newEol;
    constructor(_modelReference) {
        this._modelReference = _modelReference;
        this.model = this._modelReference.object.textEditorModel;
        this._edits = [];
    }
    dispose() {
        this._modelReference.dispose();
    }
    isNoOp() {
        if (this._edits.length > 0) {
            // contains textual edits
            return false;
        }
        if (this._newEol !== undefined && this._newEol !== this.model.getEndOfLineSequence()) {
            // contains an eol change that is a real change
            return false;
        }
        return true;
    }
    addEdit(resourceEdit) {
        this._expectedModelVersionId = resourceEdit.versionId;
        const { textEdit } = resourceEdit;
        if (typeof textEdit.eol === 'number') {
            // honor eol-change
            this._newEol = textEdit.eol;
        }
        if (!textEdit.range && !textEdit.text) {
            // lacks both a range and the text
            return;
        }
        if (Range.isEmpty(textEdit.range) && !textEdit.text) {
            // no-op edit (replace empty range with empty text)
            return;
        }
        // create edit operation
        let range;
        if (!textEdit.range) {
            range = this.model.getFullModelRange();
        }
        else {
            range = Range.lift(textEdit.range);
        }
        this._edits.push({ ...EditOperation.replaceMove(range, textEdit.text), insertAsSnippet: textEdit.insertAsSnippet });
    }
    validate() {
        if (typeof this._expectedModelVersionId === 'undefined' || this.model.getVersionId() === this._expectedModelVersionId) {
            return { canApply: true };
        }
        return { canApply: false, reason: this.model.uri };
    }
    getBeforeCursorState() {
        return null;
    }
    apply() {
        if (this._edits.length > 0) {
            this._edits = this._edits
                .map(this._transformSnippetStringToInsertText, this) // no editor -> no snippet mode
                .sort((a, b) => Range.compareRangesUsingStarts(a.range, b.range));
            this.model.pushEditOperations(null, this._edits, () => null);
        }
        if (this._newEol !== undefined) {
            this.model.pushEOL(this._newEol);
        }
    }
    _transformSnippetStringToInsertText(edit) {
        // transform a snippet edit (and only those) into a normal text edit
        // for that we need to parse the snippet and get its actual text, e.g without placeholder
        // or variable syntaxes
        if (!edit.insertAsSnippet) {
            return edit;
        }
        if (!edit.text) {
            return edit;
        }
        const text = SnippetParser.asInsertText(edit.text);
        return { ...edit, insertAsSnippet: false, text };
    }
}
class EditorEditTask extends ModelEditTask {
    _editor;
    constructor(modelReference, editor) {
        super(modelReference);
        this._editor = editor;
    }
    getBeforeCursorState() {
        return this._canUseEditor() ? this._editor.getSelections() : null;
    }
    apply() {
        // Check that the editor is still for the wanted model. It might have changed in the
        // meantime and that means we cannot use the editor anymore (instead we perform the edit through the model)
        if (!this._canUseEditor()) {
            super.apply();
            return;
        }
        if (this._edits.length > 0) {
            const snippetCtrl = SnippetController2.get(this._editor);
            if (snippetCtrl && this._edits.some(edit => edit.insertAsSnippet)) {
                // some edit is a snippet edit -> use snippet controller and ISnippetEdits
                const snippetEdits = [];
                for (const edit of this._edits) {
                    if (edit.range && edit.text !== null) {
                        snippetEdits.push({
                            range: Range.lift(edit.range),
                            template: edit.insertAsSnippet ? edit.text : SnippetParser.escape(edit.text)
                        });
                    }
                }
                snippetCtrl.apply(snippetEdits);
            }
            else {
                // normal edit
                this._edits = this._edits
                    .map(this._transformSnippetStringToInsertText, this) // mixed edits (snippet and normal) -> no snippet mode
                    .sort((a, b) => Range.compareRangesUsingStarts(a.range, b.range));
                this._editor.executeEdits('', this._edits);
            }
        }
        if (this._newEol !== undefined) {
            if (this._editor.hasModel()) {
                this._editor.getModel().pushEOL(this._newEol);
            }
        }
    }
    _canUseEditor() {
        return this._editor?.getModel()?.uri.toString() === this.model.uri.toString();
    }
}
let BulkTextEdits = class BulkTextEdits {
    _label;
    _code;
    _editor;
    _undoRedoGroup;
    _undoRedoSource;
    _progress;
    _token;
    _editorWorker;
    _modelService;
    _textModelResolverService;
    _undoRedoService;
    _edits = new ResourceMap();
    constructor(_label, _code, _editor, _undoRedoGroup, _undoRedoSource, _progress, _token, edits, _editorWorker, _modelService, _textModelResolverService, _undoRedoService) {
        this._label = _label;
        this._code = _code;
        this._editor = _editor;
        this._undoRedoGroup = _undoRedoGroup;
        this._undoRedoSource = _undoRedoSource;
        this._progress = _progress;
        this._token = _token;
        this._editorWorker = _editorWorker;
        this._modelService = _modelService;
        this._textModelResolverService = _textModelResolverService;
        this._undoRedoService = _undoRedoService;
        for (const edit of edits) {
            let array = this._edits.get(edit.resource);
            if (!array) {
                array = [];
                this._edits.set(edit.resource, array);
            }
            array.push(edit);
        }
    }
    _validateBeforePrepare() {
        // First check if loaded models were not changed in the meantime
        for (const array of this._edits.values()) {
            for (const edit of array) {
                if (typeof edit.versionId === 'number') {
                    const model = this._modelService.getModel(edit.resource);
                    if (model && model.getVersionId() !== edit.versionId) {
                        // model changed in the meantime
                        throw new Error(`${model.uri.toString()} has changed in the meantime`);
                    }
                }
            }
        }
    }
    async _createEditsTasks() {
        const tasks = [];
        const promises = [];
        for (const [key, value] of this._edits) {
            const promise = this._textModelResolverService.createModelReference(key).then(async (ref) => {
                let task;
                let makeMinimal = false;
                if (this._editor?.getModel()?.uri.toString() === ref.object.textEditorModel.uri.toString()) {
                    task = new EditorEditTask(ref, this._editor);
                    makeMinimal = true;
                }
                else {
                    task = new ModelEditTask(ref);
                }
                for (const edit of value) {
                    if (makeMinimal && !edit.textEdit.insertAsSnippet) {
                        const newEdits = await this._editorWorker.computeMoreMinimalEdits(edit.resource, [edit.textEdit]);
                        if (!newEdits) {
                            task.addEdit(edit);
                        }
                        else {
                            for (const moreMinialEdit of newEdits) {
                                task.addEdit(new ResourceTextEdit(edit.resource, moreMinialEdit, edit.versionId, edit.metadata));
                            }
                        }
                    }
                    else {
                        task.addEdit(edit);
                    }
                }
                tasks.push(task);
            });
            promises.push(promise);
        }
        await Promise.all(promises);
        return tasks;
    }
    _validateTasks(tasks) {
        for (const task of tasks) {
            const result = task.validate();
            if (!result.canApply) {
                return result;
            }
        }
        return { canApply: true };
    }
    async apply() {
        this._validateBeforePrepare();
        const tasks = await this._createEditsTasks();
        try {
            if (this._token.isCancellationRequested) {
                return [];
            }
            const resources = [];
            const validation = this._validateTasks(tasks);
            if (!validation.canApply) {
                throw new Error(`${validation.reason.toString()} has changed in the meantime`);
            }
            if (tasks.length === 1) {
                // This edit touches a single model => keep things simple
                const task = tasks[0];
                if (!task.isNoOp()) {
                    const singleModelEditStackElement = new SingleModelEditStackElement(this._label, this._code, task.model, task.getBeforeCursorState());
                    this._undoRedoService.pushElement(singleModelEditStackElement, this._undoRedoGroup, this._undoRedoSource);
                    task.apply();
                    singleModelEditStackElement.close();
                    resources.push(task.model.uri);
                }
                this._progress.report(undefined);
            }
            else {
                // prepare multi model undo element
                const multiModelEditStackElement = new MultiModelEditStackElement(this._label, this._code, tasks.map(t => new SingleModelEditStackElement(this._label, this._code, t.model, t.getBeforeCursorState())));
                this._undoRedoService.pushElement(multiModelEditStackElement, this._undoRedoGroup, this._undoRedoSource);
                for (const task of tasks) {
                    task.apply();
                    this._progress.report(undefined);
                    resources.push(task.model.uri);
                }
                multiModelEditStackElement.close();
            }
            return resources;
        }
        finally {
            dispose(tasks);
        }
    }
};
BulkTextEdits = __decorate([
    __param(8, IEditorWorkerService),
    __param(9, IModelService),
    __param(10, ITextModelService),
    __param(11, IUndoRedoService)
], BulkTextEdits);
export { BulkTextEdits };
