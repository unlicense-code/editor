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
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import * as resources from 'vs/base/common/resources';
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorker';
import { Emitter } from 'vs/base/common/event';
import { Promises, ThrottledDelayer } from 'vs/base/common/async';
import { IFileService } from 'vs/platform/files/common/files';
import { IModelService } from 'vs/editor/common/services/model';
import { Disposable, toDisposable, dispose, MutableDisposable } from 'vs/base/common/lifecycle';
import { isNumber } from 'vs/base/common/types';
import { EditOperation } from 'vs/editor/common/core/editOperation';
import { Position } from 'vs/editor/common/core/position';
import { Range } from 'vs/editor/common/core/range';
import { VSBuffer } from 'vs/base/common/buffer';
import { ILoggerService, ILogService } from 'vs/platform/log/common/log';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { OutputChannelUpdateMode } from 'vs/workbench/services/output/common/output';
class OutputFileListener extends Disposable {
    file;
    fileService;
    logService;
    _onDidContentChange = new Emitter();
    onDidContentChange = this._onDidContentChange.event;
    watching = false;
    syncDelayer;
    etag;
    constructor(file, fileService, logService) {
        super();
        this.file = file;
        this.fileService = fileService;
        this.logService = logService;
        this.syncDelayer = new ThrottledDelayer(500);
    }
    watch(eTag) {
        if (!this.watching) {
            this.etag = eTag;
            this.poll();
            this.logService.trace('Started polling', this.file.toString());
            this.watching = true;
        }
    }
    poll() {
        const loop = () => this.doWatch().then(() => this.poll());
        this.syncDelayer.trigger(loop);
    }
    async doWatch() {
        const stat = await this.fileService.stat(this.file);
        if (stat.etag !== this.etag) {
            this.etag = stat.etag;
            this._onDidContentChange.fire(stat.size);
        }
    }
    unwatch() {
        if (this.watching) {
            this.syncDelayer.cancel();
            this.watching = false;
            this.logService.trace('Stopped polling', this.file.toString());
        }
    }
    dispose() {
        this.unwatch();
        super.dispose();
    }
}
let FileOutputChannelModel = class FileOutputChannelModel extends Disposable {
    modelUri;
    language;
    file;
    fileService;
    modelService;
    editorWorkerService;
    _onDispose = this._register(new Emitter());
    onDispose = this._onDispose.event;
    fileHandler;
    etag = '';
    loadModelPromise = null;
    model = null;
    modelUpdateInProgress = false;
    modelUpdateCancellationSource = this._register(new MutableDisposable());
    appendThrottler = this._register(new ThrottledDelayer(300));
    replacePromise;
    startOffset = 0;
    endOffset = 0;
    constructor(modelUri, language, file, fileService, modelService, logService, editorWorkerService) {
        super();
        this.modelUri = modelUri;
        this.language = language;
        this.file = file;
        this.fileService = fileService;
        this.modelService = modelService;
        this.editorWorkerService = editorWorkerService;
        this.fileHandler = this._register(new OutputFileListener(this.file, this.fileService, logService));
        this._register(this.fileHandler.onDidContentChange(size => this.onDidContentChange(size)));
        this._register(toDisposable(() => this.fileHandler.unwatch()));
    }
    append(message) {
        throw new Error('Not supported');
    }
    replace(message) {
        throw new Error('Not supported');
    }
    clear() {
        this.update(OutputChannelUpdateMode.Clear, this.endOffset, true);
    }
    update(mode, till, immediate) {
        const loadModelPromise = this.loadModelPromise ? this.loadModelPromise : Promise.resolve();
        loadModelPromise.then(() => this.doUpdate(mode, till, immediate));
    }
    loadModel() {
        this.loadModelPromise = Promises.withAsyncBody(async (c, e) => {
            try {
                let content = '';
                if (await this.fileService.exists(this.file)) {
                    const fileContent = await this.fileService.readFile(this.file, { position: this.startOffset });
                    this.endOffset = this.startOffset + fileContent.value.byteLength;
                    this.etag = fileContent.etag;
                    content = fileContent.value.toString();
                }
                else {
                    this.startOffset = 0;
                    this.endOffset = 0;
                }
                c(this.createModel(content));
            }
            catch (error) {
                e(error);
            }
        });
        return this.loadModelPromise;
    }
    createModel(content) {
        if (this.model) {
            this.model.setValue(content);
        }
        else {
            this.model = this.modelService.createModel(content, this.language, this.modelUri);
            this.fileHandler.watch(this.etag);
            const disposable = this.model.onWillDispose(() => {
                this.cancelModelUpdate();
                this.fileHandler.unwatch();
                this.model = null;
                dispose(disposable);
            });
        }
        return this.model;
    }
    doUpdate(mode, till, immediate) {
        if (mode === OutputChannelUpdateMode.Clear || mode === OutputChannelUpdateMode.Replace) {
            this.startOffset = this.endOffset = isNumber(till) ? till : this.endOffset;
            this.cancelModelUpdate();
        }
        if (!this.model) {
            return;
        }
        this.modelUpdateInProgress = true;
        if (!this.modelUpdateCancellationSource.value) {
            this.modelUpdateCancellationSource.value = new CancellationTokenSource();
        }
        const token = this.modelUpdateCancellationSource.value.token;
        if (mode === OutputChannelUpdateMode.Clear) {
            this.clearContent(this.model);
        }
        else if (mode === OutputChannelUpdateMode.Replace) {
            this.replacePromise = this.replaceContent(this.model, token).finally(() => this.replacePromise = undefined);
        }
        else {
            this.appendContent(this.model, immediate, token);
        }
    }
    clearContent(model) {
        this.doUpdateModel(model, [EditOperation.delete(model.getFullModelRange())], VSBuffer.fromString(''));
    }
    async appendContent(model, immediate, token) {
        this.appendThrottler.trigger(async () => {
            /* Abort if operation is cancelled */
            if (token.isCancellationRequested) {
                return;
            }
            /* Wait for replace to finish */
            if (this.replacePromise) {
                try {
                    await this.replacePromise;
                }
                catch (e) { /* Ignore */ }
                /* Abort if operation is cancelled */
                if (token.isCancellationRequested) {
                    return;
                }
            }
            /* Get content to append */
            const contentToAppend = await this.getContentToUpdate();
            /* Abort if operation is cancelled */
            if (token.isCancellationRequested) {
                return;
            }
            /* Appned Content */
            const lastLine = model.getLineCount();
            const lastLineMaxColumn = model.getLineMaxColumn(lastLine);
            const edits = [EditOperation.insert(new Position(lastLine, lastLineMaxColumn), contentToAppend.toString())];
            this.doUpdateModel(model, edits, contentToAppend);
        }, immediate ? 0 : undefined);
    }
    async replaceContent(model, token) {
        /* Get content to replace */
        const contentToReplace = await this.getContentToUpdate();
        /* Abort if operation is cancelled */
        if (token.isCancellationRequested) {
            return;
        }
        /* Compute Edits */
        const edits = await this.getReplaceEdits(model, contentToReplace.toString());
        /* Abort if operation is cancelled */
        if (token.isCancellationRequested) {
            return;
        }
        /* Apply Edits */
        this.doUpdateModel(model, edits, contentToReplace);
    }
    async getReplaceEdits(model, contentToReplace) {
        if (!contentToReplace) {
            return [EditOperation.delete(model.getFullModelRange())];
        }
        if (contentToReplace !== model.getValue()) {
            const edits = await this.editorWorkerService.computeMoreMinimalEdits(model.uri, [{ text: contentToReplace.toString(), range: model.getFullModelRange() }]);
            if (edits?.length) {
                return edits.map(edit => EditOperation.replace(Range.lift(edit.range), edit.text));
            }
        }
        return [];
    }
    doUpdateModel(model, edits, content) {
        if (edits.length) {
            model.applyEdits(edits);
        }
        this.endOffset = this.endOffset + content.byteLength;
        this.modelUpdateInProgress = false;
    }
    cancelModelUpdate() {
        this.modelUpdateCancellationSource.value?.cancel();
        this.modelUpdateCancellationSource.value = undefined;
        this.appendThrottler.cancel();
        this.replacePromise = undefined;
        this.modelUpdateInProgress = false;
    }
    async getContentToUpdate() {
        const content = await this.fileService.readFile(this.file, { position: this.endOffset });
        this.etag = content.etag;
        return content.value;
    }
    onDidContentChange(size) {
        if (this.model) {
            if (!this.modelUpdateInProgress) {
                if (isNumber(size) && this.endOffset > size) {
                    // Reset - Content is removed
                    this.update(OutputChannelUpdateMode.Clear, 0, true);
                }
            }
            this.update(OutputChannelUpdateMode.Append, undefined, false /* Not needed to update immediately. Wait to collect more changes and update. */);
        }
    }
    isVisible() {
        return !!this.model;
    }
    dispose() {
        this._onDispose.fire();
        super.dispose();
    }
};
FileOutputChannelModel = __decorate([
    __param(3, IFileService),
    __param(4, IModelService),
    __param(5, ILogService),
    __param(6, IEditorWorkerService)
], FileOutputChannelModel);
export { FileOutputChannelModel };
let OutputChannelBackedByFile = class OutputChannelBackedByFile extends FileOutputChannelModel {
    logger;
    _offset;
    constructor(id, modelUri, language, file, fileService, modelService, loggerService, logService, editorWorkerService) {
        super(modelUri, language, file, fileService, modelService, logService, editorWorkerService);
        // Donot rotate to check for the file reset
        this.logger = loggerService.createLogger(file, { always: true, donotRotate: true, donotUseFormatters: true });
        this._offset = 0;
    }
    append(message) {
        this.write(message);
        this.update(OutputChannelUpdateMode.Append, undefined, this.isVisible());
    }
    replace(message) {
        const till = this._offset;
        this.write(message);
        this.update(OutputChannelUpdateMode.Replace, till, true);
    }
    write(content) {
        this._offset += VSBuffer.fromString(content).byteLength;
        this.logger.info(content);
        if (this.isVisible()) {
            this.logger.flush();
        }
    }
};
OutputChannelBackedByFile = __decorate([
    __param(4, IFileService),
    __param(5, IModelService),
    __param(6, ILoggerService),
    __param(7, ILogService),
    __param(8, IEditorWorkerService)
], OutputChannelBackedByFile);
let DelegatedOutputChannelModel = class DelegatedOutputChannelModel extends Disposable {
    instantiationService;
    fileService;
    _onDispose = this._register(new Emitter());
    onDispose = this._onDispose.event;
    outputChannelModel;
    constructor(id, modelUri, language, outputDir, instantiationService, fileService) {
        super();
        this.instantiationService = instantiationService;
        this.fileService = fileService;
        this.outputChannelModel = this.createOutputChannelModel(id, modelUri, language, outputDir);
    }
    async createOutputChannelModel(id, modelUri, language, outputDirPromise) {
        const outputDir = await outputDirPromise;
        const file = resources.joinPath(outputDir, `${id.replace(/[\\/:\*\?"<>\|]/g, '')}.log`);
        await this.fileService.createFile(file);
        const outputChannelModel = this._register(this.instantiationService.createInstance(OutputChannelBackedByFile, id, modelUri, language, file));
        this._register(outputChannelModel.onDispose(() => this._onDispose.fire()));
        return outputChannelModel;
    }
    append(output) {
        this.outputChannelModel.then(outputChannelModel => outputChannelModel.append(output));
    }
    update(mode, till, immediate) {
        this.outputChannelModel.then(outputChannelModel => outputChannelModel.update(mode, till, immediate));
    }
    loadModel() {
        return this.outputChannelModel.then(outputChannelModel => outputChannelModel.loadModel());
    }
    clear() {
        this.outputChannelModel.then(outputChannelModel => outputChannelModel.clear());
    }
    replace(value) {
        this.outputChannelModel.then(outputChannelModel => outputChannelModel.replace(value));
    }
};
DelegatedOutputChannelModel = __decorate([
    __param(4, IInstantiationService),
    __param(5, IFileService)
], DelegatedOutputChannelModel);
export { DelegatedOutputChannelModel };
