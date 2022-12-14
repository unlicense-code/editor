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
import { IFileService } from 'vs/platform/files/common/files';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWorkingCopyFileService } from 'vs/workbench/services/workingCopy/common/workingCopyFileService';
import { IUndoRedoService } from 'vs/platform/undoRedo/common/undoRedo';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { decodeBase64 } from 'vs/base/common/buffer';
import { CancellationToken } from 'vs/base/common/cancellation';
import { tail } from 'vs/base/common/arrays';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
class Noop {
    uris = [];
    async perform() { return this; }
    toString() {
        return '(noop)';
    }
}
class RenameEdit {
    newUri;
    oldUri;
    options;
    type = 'rename';
    constructor(newUri, oldUri, options) {
        this.newUri = newUri;
        this.oldUri = oldUri;
        this.options = options;
    }
}
let RenameOperation = class RenameOperation {
    _edits;
    _undoRedoInfo;
    _workingCopyFileService;
    _fileService;
    constructor(_edits, _undoRedoInfo, _workingCopyFileService, _fileService) {
        this._edits = _edits;
        this._undoRedoInfo = _undoRedoInfo;
        this._workingCopyFileService = _workingCopyFileService;
        this._fileService = _fileService;
    }
    get uris() {
        return this._edits.map(edit => [edit.newUri, edit.oldUri]).flat();
    }
    async perform(token) {
        const moves = [];
        const undoes = [];
        for (const edit of this._edits) {
            // check: not overwriting, but ignoring, and the target file exists
            const skip = edit.options.overwrite === undefined && edit.options.ignoreIfExists && await this._fileService.exists(edit.newUri);
            if (!skip) {
                moves.push({
                    file: { source: edit.oldUri, target: edit.newUri },
                    overwrite: edit.options.overwrite
                });
                // reverse edit
                undoes.push(new RenameEdit(edit.oldUri, edit.newUri, edit.options));
            }
        }
        if (moves.length === 0) {
            return new Noop();
        }
        await this._workingCopyFileService.move(moves, token, this._undoRedoInfo);
        return new RenameOperation(undoes, { isUndoing: true }, this._workingCopyFileService, this._fileService);
    }
    toString() {
        return `(rename ${this._edits.map(edit => `${edit.oldUri} to ${edit.newUri}`).join(', ')})`;
    }
};
RenameOperation = __decorate([
    __param(2, IWorkingCopyFileService),
    __param(3, IFileService)
], RenameOperation);
class CopyEdit {
    newUri;
    oldUri;
    options;
    type = 'copy';
    constructor(newUri, oldUri, options) {
        this.newUri = newUri;
        this.oldUri = oldUri;
        this.options = options;
    }
}
let CopyOperation = class CopyOperation {
    _edits;
    _undoRedoInfo;
    _workingCopyFileService;
    _fileService;
    _instaService;
    constructor(_edits, _undoRedoInfo, _workingCopyFileService, _fileService, _instaService) {
        this._edits = _edits;
        this._undoRedoInfo = _undoRedoInfo;
        this._workingCopyFileService = _workingCopyFileService;
        this._fileService = _fileService;
        this._instaService = _instaService;
    }
    get uris() {
        return this._edits.map(edit => [edit.newUri, edit.oldUri]).flat();
    }
    async perform(token) {
        // (1) create copy operations, remove noops
        const copies = [];
        for (const edit of this._edits) {
            //check: not overwriting, but ignoring, and the target file exists
            const skip = edit.options.overwrite === undefined && edit.options.ignoreIfExists && await this._fileService.exists(edit.newUri);
            if (!skip) {
                copies.push({ file: { source: edit.oldUri, target: edit.newUri }, overwrite: edit.options.overwrite });
            }
        }
        if (copies.length === 0) {
            return new Noop();
        }
        // (2) perform the actual copy and use the return stats to build undo edits
        const stats = await this._workingCopyFileService.copy(copies, token, this._undoRedoInfo);
        const undoes = [];
        for (let i = 0; i < stats.length; i++) {
            const stat = stats[i];
            const edit = this._edits[i];
            undoes.push(new DeleteEdit(stat.resource, { recursive: true, folder: this._edits[i].options.folder || stat.isDirectory, ...edit.options }, false));
        }
        return this._instaService.createInstance(DeleteOperation, undoes, { isUndoing: true });
    }
    toString() {
        return `(copy ${this._edits.map(edit => `${edit.oldUri} to ${edit.newUri}`).join(', ')})`;
    }
};
CopyOperation = __decorate([
    __param(2, IWorkingCopyFileService),
    __param(3, IFileService),
    __param(4, IInstantiationService)
], CopyOperation);
class CreateEdit {
    newUri;
    options;
    contents;
    type = 'create';
    constructor(newUri, options, contents) {
        this.newUri = newUri;
        this.options = options;
        this.contents = contents;
    }
}
let CreateOperation = class CreateOperation {
    _edits;
    _undoRedoInfo;
    _fileService;
    _workingCopyFileService;
    _instaService;
    _textFileService;
    constructor(_edits, _undoRedoInfo, _fileService, _workingCopyFileService, _instaService, _textFileService) {
        this._edits = _edits;
        this._undoRedoInfo = _undoRedoInfo;
        this._fileService = _fileService;
        this._workingCopyFileService = _workingCopyFileService;
        this._instaService = _instaService;
        this._textFileService = _textFileService;
    }
    get uris() {
        return this._edits.map(edit => edit.newUri);
    }
    async perform(token) {
        const folderCreates = [];
        const fileCreates = [];
        const undoes = [];
        for (const edit of this._edits) {
            if (edit.options.overwrite === undefined && edit.options.ignoreIfExists && await this._fileService.exists(edit.newUri)) {
                continue; // not overwriting, but ignoring, and the target file exists
            }
            if (edit.options.folder) {
                folderCreates.push({ resource: edit.newUri });
            }
            else {
                // If the contents are part of the edit they include the encoding, thus use them. Otherwise get the encoding for a new empty file.
                const encodedReadable = typeof edit.contents !== 'undefined' ? edit.contents : await this._textFileService.getEncodedReadable(edit.newUri);
                fileCreates.push({ resource: edit.newUri, contents: encodedReadable, overwrite: edit.options.overwrite });
            }
            undoes.push(new DeleteEdit(edit.newUri, edit.options, !edit.options.folder && !edit.contents));
        }
        if (folderCreates.length === 0 && fileCreates.length === 0) {
            return new Noop();
        }
        await this._workingCopyFileService.createFolder(folderCreates, token, this._undoRedoInfo);
        await this._workingCopyFileService.create(fileCreates, token, this._undoRedoInfo);
        return this._instaService.createInstance(DeleteOperation, undoes, { isUndoing: true });
    }
    toString() {
        return `(create ${this._edits.map(edit => edit.options.folder ? `folder ${edit.newUri}` : `file ${edit.newUri} with ${edit.contents?.byteLength || 0} bytes`).join(', ')})`;
    }
};
CreateOperation = __decorate([
    __param(2, IFileService),
    __param(3, IWorkingCopyFileService),
    __param(4, IInstantiationService),
    __param(5, ITextFileService)
], CreateOperation);
class DeleteEdit {
    oldUri;
    options;
    undoesCreate;
    type = 'delete';
    constructor(oldUri, options, undoesCreate) {
        this.oldUri = oldUri;
        this.options = options;
        this.undoesCreate = undoesCreate;
    }
}
let DeleteOperation = class DeleteOperation {
    _edits;
    _undoRedoInfo;
    _workingCopyFileService;
    _fileService;
    _configurationService;
    _instaService;
    _logService;
    constructor(_edits, _undoRedoInfo, _workingCopyFileService, _fileService, _configurationService, _instaService, _logService) {
        this._edits = _edits;
        this._undoRedoInfo = _undoRedoInfo;
        this._workingCopyFileService = _workingCopyFileService;
        this._fileService = _fileService;
        this._configurationService = _configurationService;
        this._instaService = _instaService;
        this._logService = _logService;
    }
    get uris() {
        return this._edits.map(edit => edit.oldUri);
    }
    async perform(token) {
        // delete file
        const deletes = [];
        const undoes = [];
        for (const edit of this._edits) {
            let fileStat;
            try {
                fileStat = await this._fileService.resolve(edit.oldUri, { resolveMetadata: true });
            }
            catch (err) {
                if (!edit.options.ignoreIfNotExists) {
                    throw new Error(`${edit.oldUri} does not exist and can not be deleted`);
                }
                continue;
            }
            deletes.push({
                resource: edit.oldUri,
                recursive: edit.options.recursive,
                useTrash: !edit.options.skipTrashBin && this._fileService.hasCapability(edit.oldUri, 4096 /* FileSystemProviderCapabilities.Trash */) && this._configurationService.getValue('files.enableTrash')
            });
            // read file contents for undo operation. when a file is too large it won't be restored
            let fileContent;
            if (!edit.undoesCreate && !edit.options.folder && !(typeof edit.options.maxSize === 'number' && fileStat.size > edit.options.maxSize)) {
                try {
                    fileContent = await this._fileService.readFile(edit.oldUri);
                }
                catch (err) {
                    this._logService.error(err);
                }
            }
            if (fileContent !== undefined) {
                undoes.push(new CreateEdit(edit.oldUri, edit.options, fileContent.value));
            }
        }
        if (deletes.length === 0) {
            return new Noop();
        }
        await this._workingCopyFileService.delete(deletes, token, this._undoRedoInfo);
        if (undoes.length === 0) {
            return new Noop();
        }
        return this._instaService.createInstance(CreateOperation, undoes, { isUndoing: true });
    }
    toString() {
        return `(delete ${this._edits.map(edit => edit.oldUri).join(', ')})`;
    }
};
DeleteOperation = __decorate([
    __param(2, IWorkingCopyFileService),
    __param(3, IFileService),
    __param(4, IConfigurationService),
    __param(5, IInstantiationService),
    __param(6, ILogService)
], DeleteOperation);
class FileUndoRedoElement {
    label;
    code;
    operations;
    confirmBeforeUndo;
    type = 1 /* UndoRedoElementType.Workspace */;
    resources;
    constructor(label, code, operations, confirmBeforeUndo) {
        this.label = label;
        this.code = code;
        this.operations = operations;
        this.confirmBeforeUndo = confirmBeforeUndo;
        this.resources = operations.map(op => op.uris).flat();
    }
    async undo() {
        await this._reverse();
    }
    async redo() {
        await this._reverse();
    }
    async _reverse() {
        for (let i = 0; i < this.operations.length; i++) {
            const op = this.operations[i];
            const undo = await op.perform(CancellationToken.None);
            this.operations[i] = undo;
        }
    }
    toString() {
        return this.operations.map(op => String(op)).join(', ');
    }
}
let BulkFileEdits = class BulkFileEdits {
    _label;
    _code;
    _undoRedoGroup;
    _undoRedoSource;
    _confirmBeforeUndo;
    _progress;
    _token;
    _edits;
    _instaService;
    _undoRedoService;
    constructor(_label, _code, _undoRedoGroup, _undoRedoSource, _confirmBeforeUndo, _progress, _token, _edits, _instaService, _undoRedoService) {
        this._label = _label;
        this._code = _code;
        this._undoRedoGroup = _undoRedoGroup;
        this._undoRedoSource = _undoRedoSource;
        this._confirmBeforeUndo = _confirmBeforeUndo;
        this._progress = _progress;
        this._token = _token;
        this._edits = _edits;
        this._instaService = _instaService;
        this._undoRedoService = _undoRedoService;
    }
    async apply() {
        const undoOperations = [];
        const undoRedoInfo = { undoRedoGroupId: this._undoRedoGroup.id };
        const edits = [];
        for (const edit of this._edits) {
            if (edit.newResource && edit.oldResource && !edit.options?.copy) {
                edits.push(new RenameEdit(edit.newResource, edit.oldResource, edit.options ?? {}));
            }
            else if (edit.newResource && edit.oldResource && edit.options?.copy) {
                edits.push(new CopyEdit(edit.newResource, edit.oldResource, edit.options ?? {}));
            }
            else if (!edit.newResource && edit.oldResource) {
                edits.push(new DeleteEdit(edit.oldResource, edit.options ?? {}, false));
            }
            else if (edit.newResource && !edit.oldResource) {
                edits.push(new CreateEdit(edit.newResource, edit.options ?? {}, edit.options.contentsBase64 ? decodeBase64(edit.options.contentsBase64) : undefined));
            }
        }
        if (edits.length === 0) {
            return [];
        }
        const groups = [];
        groups[0] = [edits[0]];
        for (let i = 1; i < edits.length; i++) {
            const edit = edits[i];
            const lastGroup = tail(groups);
            if (lastGroup[0].type === edit.type) {
                lastGroup.push(edit);
            }
            else {
                groups.push([edit]);
            }
        }
        for (const group of groups) {
            if (this._token.isCancellationRequested) {
                break;
            }
            let op;
            switch (group[0].type) {
                case 'rename':
                    op = this._instaService.createInstance(RenameOperation, group, undoRedoInfo);
                    break;
                case 'copy':
                    op = this._instaService.createInstance(CopyOperation, group, undoRedoInfo);
                    break;
                case 'delete':
                    op = this._instaService.createInstance(DeleteOperation, group, undoRedoInfo);
                    break;
                case 'create':
                    op = this._instaService.createInstance(CreateOperation, group, undoRedoInfo);
                    break;
            }
            if (op) {
                const undoOp = await op.perform(this._token);
                undoOperations.push(undoOp);
            }
            this._progress.report(undefined);
        }
        const undoRedoElement = new FileUndoRedoElement(this._label, this._code, undoOperations, this._confirmBeforeUndo);
        this._undoRedoService.pushElement(undoRedoElement, this._undoRedoGroup, this._undoRedoSource);
        return undoRedoElement.resources;
    }
};
BulkFileEdits = __decorate([
    __param(8, IInstantiationService),
    __param(9, IUndoRedoService)
], BulkFileEdits);
export { BulkFileEdits };
