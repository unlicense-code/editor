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
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { URI } from 'vs/base/common/uri';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IModelService } from 'vs/editor/common/services/model';
import { createTextBufferFactoryFromSnapshot } from 'vs/editor/common/model/textModel';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { coalesceInPlace } from 'vs/base/common/arrays';
import { Range } from 'vs/editor/common/core/range';
import { EditOperation } from 'vs/editor/common/core/editOperation';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IFileService } from 'vs/platform/files/common/files';
import { Emitter } from 'vs/base/common/event';
import { ConflictDetector } from 'vs/workbench/contrib/bulkEdit/browser/conflicts';
import { ResourceMap } from 'vs/base/common/map';
import { localize } from 'vs/nls';
import { extUri } from 'vs/base/common/resources';
import { ResourceFileEdit, ResourceTextEdit } from 'vs/editor/browser/services/bulkEditService';
import { Codicon } from 'vs/base/common/codicons';
import { generateUuid } from 'vs/base/common/uuid';
import { SnippetParser } from 'vs/editor/contrib/snippet/browser/snippetParser';
export class CheckedStates {
    _states = new WeakMap();
    _checkedCount = 0;
    _onDidChange = new Emitter();
    onDidChange = this._onDidChange.event;
    dispose() {
        this._onDidChange.dispose();
    }
    get checkedCount() {
        return this._checkedCount;
    }
    isChecked(obj) {
        return this._states.get(obj) ?? false;
    }
    updateChecked(obj, value) {
        const valueNow = this._states.get(obj);
        if (valueNow === value) {
            return;
        }
        if (valueNow === undefined) {
            if (value) {
                this._checkedCount += 1;
            }
        }
        else {
            if (value) {
                this._checkedCount += 1;
            }
            else {
                this._checkedCount -= 1;
            }
        }
        this._states.set(obj, value);
        this._onDidChange.fire(obj);
    }
}
export class BulkTextEdit {
    parent;
    textEdit;
    constructor(parent, textEdit) {
        this.parent = parent;
        this.textEdit = textEdit;
    }
}
export var BulkFileOperationType;
(function (BulkFileOperationType) {
    BulkFileOperationType[BulkFileOperationType["TextEdit"] = 1] = "TextEdit";
    BulkFileOperationType[BulkFileOperationType["Create"] = 2] = "Create";
    BulkFileOperationType[BulkFileOperationType["Delete"] = 4] = "Delete";
    BulkFileOperationType[BulkFileOperationType["Rename"] = 8] = "Rename";
})(BulkFileOperationType || (BulkFileOperationType = {}));
export class BulkFileOperation {
    uri;
    parent;
    type = 0;
    textEdits = [];
    originalEdits = new Map();
    newUri;
    constructor(uri, parent) {
        this.uri = uri;
        this.parent = parent;
    }
    addEdit(index, type, edit) {
        this.type |= type;
        this.originalEdits.set(index, edit);
        if (edit instanceof ResourceTextEdit) {
            this.textEdits.push(new BulkTextEdit(this, edit));
        }
        else if (type === 8 /* BulkFileOperationType.Rename */) {
            this.newUri = edit.newResource;
        }
    }
    needsConfirmation() {
        for (const [, edit] of this.originalEdits) {
            if (!this.parent.checked.isChecked(edit)) {
                return true;
            }
        }
        return false;
    }
}
export class BulkCategory {
    metadata;
    static _defaultMetadata = Object.freeze({
        label: localize('default', "Other"),
        icon: Codicon.symbolFile,
        needsConfirmation: false
    });
    static keyOf(metadata) {
        return metadata?.label || '<default>';
    }
    operationByResource = new Map();
    constructor(metadata = BulkCategory._defaultMetadata) {
        this.metadata = metadata;
    }
    get fileOperations() {
        return this.operationByResource.values();
    }
}
let BulkFileOperations = class BulkFileOperations {
    _bulkEdit;
    _fileService;
    static async create(accessor, bulkEdit) {
        const result = accessor.get(IInstantiationService).createInstance(BulkFileOperations, bulkEdit);
        return await result._init();
    }
    checked = new CheckedStates();
    fileOperations = [];
    categories = [];
    conflicts;
    constructor(_bulkEdit, _fileService, instaService) {
        this._bulkEdit = _bulkEdit;
        this._fileService = _fileService;
        this.conflicts = instaService.createInstance(ConflictDetector, _bulkEdit);
    }
    dispose() {
        this.checked.dispose();
        this.conflicts.dispose();
    }
    async _init() {
        const operationByResource = new Map();
        const operationByCategory = new Map();
        const newToOldUri = new ResourceMap();
        for (let idx = 0; idx < this._bulkEdit.length; idx++) {
            const edit = this._bulkEdit[idx];
            let uri;
            let type;
            // store inital checked state
            this.checked.updateChecked(edit, !edit.metadata?.needsConfirmation);
            if (edit instanceof ResourceTextEdit) {
                type = 1 /* BulkFileOperationType.TextEdit */;
                uri = edit.resource;
            }
            else if (edit instanceof ResourceFileEdit) {
                if (edit.newResource && edit.oldResource) {
                    type = 8 /* BulkFileOperationType.Rename */;
                    uri = edit.oldResource;
                    if (edit.options?.overwrite === undefined && edit.options?.ignoreIfExists && await this._fileService.exists(uri)) {
                        // noop -> "soft" rename to something that already exists
                        continue;
                    }
                    // map newResource onto oldResource so that text-edit appear for
                    // the same file element
                    newToOldUri.set(edit.newResource, uri);
                }
                else if (edit.oldResource) {
                    type = 4 /* BulkFileOperationType.Delete */;
                    uri = edit.oldResource;
                    if (edit.options?.ignoreIfNotExists && !await this._fileService.exists(uri)) {
                        // noop -> "soft" delete something that doesn't exist
                        continue;
                    }
                }
                else if (edit.newResource) {
                    type = 2 /* BulkFileOperationType.Create */;
                    uri = edit.newResource;
                    if (edit.options?.overwrite === undefined && edit.options?.ignoreIfExists && await this._fileService.exists(uri)) {
                        // noop -> "soft" create something that already exists
                        continue;
                    }
                }
                else {
                    // invalid edit -> skip
                    continue;
                }
            }
            else {
                // unsupported edit
                continue;
            }
            const insert = (uri, map) => {
                let key = extUri.getComparisonKey(uri, true);
                let operation = map.get(key);
                // rename
                if (!operation && newToOldUri.has(uri)) {
                    uri = newToOldUri.get(uri);
                    key = extUri.getComparisonKey(uri, true);
                    operation = map.get(key);
                }
                if (!operation) {
                    operation = new BulkFileOperation(uri, this);
                    map.set(key, operation);
                }
                operation.addEdit(idx, type, edit);
            };
            insert(uri, operationByResource);
            // insert into "this" category
            const key = BulkCategory.keyOf(edit.metadata);
            let category = operationByCategory.get(key);
            if (!category) {
                category = new BulkCategory(edit.metadata);
                operationByCategory.set(key, category);
            }
            insert(uri, category.operationByResource);
        }
        operationByResource.forEach(value => this.fileOperations.push(value));
        operationByCategory.forEach(value => this.categories.push(value));
        // "correct" invalid parent-check child states that is
        // unchecked file edits (rename, create, delete) uncheck
        // all edits for a file, e.g no text change without rename
        for (const file of this.fileOperations) {
            if (file.type !== 1 /* BulkFileOperationType.TextEdit */) {
                let checked = true;
                for (const edit of file.originalEdits.values()) {
                    if (edit instanceof ResourceFileEdit) {
                        checked = checked && this.checked.isChecked(edit);
                    }
                }
                if (!checked) {
                    for (const edit of file.originalEdits.values()) {
                        this.checked.updateChecked(edit, checked);
                    }
                }
            }
        }
        // sort (once) categories atop which have unconfirmed edits
        this.categories.sort((a, b) => {
            if (a.metadata.needsConfirmation === b.metadata.needsConfirmation) {
                return a.metadata.label.localeCompare(b.metadata.label);
            }
            else if (a.metadata.needsConfirmation) {
                return -1;
            }
            else {
                return 1;
            }
        });
        return this;
    }
    getWorkspaceEdit() {
        const result = [];
        let allAccepted = true;
        for (let i = 0; i < this._bulkEdit.length; i++) {
            const edit = this._bulkEdit[i];
            if (this.checked.isChecked(edit)) {
                result[i] = edit;
                continue;
            }
            allAccepted = false;
        }
        if (allAccepted) {
            return this._bulkEdit;
        }
        // not all edits have been accepted
        coalesceInPlace(result);
        return result;
    }
    getFileEdits(uri) {
        for (const file of this.fileOperations) {
            if (file.uri.toString() === uri.toString()) {
                const result = [];
                let ignoreAll = false;
                for (const edit of file.originalEdits.values()) {
                    if (edit instanceof ResourceTextEdit) {
                        if (this.checked.isChecked(edit)) {
                            result.push(EditOperation.replaceMove(Range.lift(edit.textEdit.range), !edit.textEdit.insertAsSnippet ? edit.textEdit.text : SnippetParser.asInsertText(edit.textEdit.text)));
                        }
                    }
                    else if (!this.checked.isChecked(edit)) {
                        // UNCHECKED WorkspaceFileEdit disables all text edits
                        ignoreAll = true;
                    }
                }
                if (ignoreAll) {
                    return [];
                }
                return result.sort((a, b) => Range.compareRangesUsingStarts(a.range, b.range));
            }
        }
        return [];
    }
    getUriOfEdit(edit) {
        for (const file of this.fileOperations) {
            for (const value of file.originalEdits.values()) {
                if (value === edit) {
                    return file.uri;
                }
            }
        }
        throw new Error('invalid edit');
    }
};
BulkFileOperations = __decorate([
    __param(1, IFileService),
    __param(2, IInstantiationService)
], BulkFileOperations);
export { BulkFileOperations };
let BulkEditPreviewProvider = class BulkEditPreviewProvider {
    _operations;
    _languageService;
    _modelService;
    _textModelResolverService;
    static Schema = 'vscode-bulkeditpreview';
    static emptyPreview = URI.from({ scheme: BulkEditPreviewProvider.Schema, fragment: 'empty' });
    static fromPreviewUri(uri) {
        return URI.parse(uri.query);
    }
    _disposables = new DisposableStore();
    _ready;
    _modelPreviewEdits = new Map();
    _instanceId = generateUuid();
    constructor(_operations, _languageService, _modelService, _textModelResolverService) {
        this._operations = _operations;
        this._languageService = _languageService;
        this._modelService = _modelService;
        this._textModelResolverService = _textModelResolverService;
        this._disposables.add(this._textModelResolverService.registerTextModelContentProvider(BulkEditPreviewProvider.Schema, this));
        this._ready = this._init();
    }
    dispose() {
        this._disposables.dispose();
    }
    asPreviewUri(uri) {
        return URI.from({ scheme: BulkEditPreviewProvider.Schema, authority: this._instanceId, path: uri.path, query: uri.toString() });
    }
    async _init() {
        for (const operation of this._operations.fileOperations) {
            await this._applyTextEditsToPreviewModel(operation.uri);
        }
        this._disposables.add(this._operations.checked.onDidChange(e => {
            const uri = this._operations.getUriOfEdit(e);
            this._applyTextEditsToPreviewModel(uri);
        }));
    }
    async _applyTextEditsToPreviewModel(uri) {
        const model = await this._getOrCreatePreviewModel(uri);
        // undo edits that have been done before
        const undoEdits = this._modelPreviewEdits.get(model.id);
        if (undoEdits) {
            model.applyEdits(undoEdits);
        }
        // apply new edits and keep (future) undo edits
        const newEdits = this._operations.getFileEdits(uri);
        const newUndoEdits = model.applyEdits(newEdits, true);
        this._modelPreviewEdits.set(model.id, newUndoEdits);
    }
    async _getOrCreatePreviewModel(uri) {
        const previewUri = this.asPreviewUri(uri);
        let model = this._modelService.getModel(previewUri);
        if (!model) {
            try {
                // try: copy existing
                const ref = await this._textModelResolverService.createModelReference(uri);
                const sourceModel = ref.object.textEditorModel;
                model = this._modelService.createModel(createTextBufferFactoryFromSnapshot(sourceModel.createSnapshot()), this._languageService.createById(sourceModel.getLanguageId()), previewUri);
                ref.dispose();
            }
            catch {
                // create NEW model
                model = this._modelService.createModel('', this._languageService.createByFilepathOrFirstLine(previewUri), previewUri);
            }
            // this is a little weird but otherwise editors and other cusomers
            // will dispose my models before they should be disposed...
            // And all of this is off the eventloop to prevent endless recursion
            queueMicrotask(async () => {
                this._disposables.add(await this._textModelResolverService.createModelReference(model.uri));
            });
        }
        return model;
    }
    async provideTextContent(previewUri) {
        if (previewUri.toString() === BulkEditPreviewProvider.emptyPreview.toString()) {
            return this._modelService.createModel('', null, previewUri);
        }
        await this._ready;
        return this._modelService.getModel(previewUri);
    }
};
BulkEditPreviewProvider = __decorate([
    __param(1, ILanguageService),
    __param(2, IModelService),
    __param(3, ITextModelService)
], BulkEditPreviewProvider);
export { BulkEditPreviewProvider };
