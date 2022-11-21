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
import { isNonEmptyArray } from 'vs/base/common/arrays';
import { CancellationToken } from 'vs/base/common/cancellation';
import { onUnexpectedError } from 'vs/base/common/errors';
import { Emitter } from 'vs/base/common/event';
import { combinedDisposable, DisposableMap, DisposableStore, toDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { NotebookDto } from 'vs/workbench/api/browser/mainThreadNotebookDto';
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { INotebookEditorService } from 'vs/workbench/contrib/notebook/browser/services/notebookEditorService';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
import { INotebookKernelService } from 'vs/workbench/contrib/notebook/common/notebookKernelService';
import { ExtHostContext, MainContext } from '../common/extHost.protocol';
import { INotebookService } from 'vs/workbench/contrib/notebook/common/notebookService';
class MainThreadKernel {
    _languageService;
    _onDidChange = new Emitter();
    preloads;
    onDidChange = this._onDidChange.event;
    id;
    viewType;
    extension;
    implementsInterrupt;
    label;
    description;
    detail;
    kind;
    supportedLanguages;
    implementsExecutionOrder;
    localResourceRoot;
    get preloadUris() {
        return this.preloads.map(p => p.uri);
    }
    get preloadProvides() {
        return this.preloads.map(p => p.provides).flat();
    }
    constructor(data, _languageService) {
        this._languageService = _languageService;
        this.id = data.id;
        this.viewType = data.notebookType;
        this.extension = data.extensionId;
        this.implementsInterrupt = data.supportsInterrupt ?? false;
        this.label = data.label;
        this.description = data.description;
        this.detail = data.detail;
        this.kind = data.kind;
        this.supportedLanguages = isNonEmptyArray(data.supportedLanguages) ? data.supportedLanguages : _languageService.getRegisteredLanguageIds();
        this.implementsExecutionOrder = data.supportsExecutionOrder ?? false;
        this.localResourceRoot = URI.revive(data.extensionLocation);
        this.preloads = data.preloads?.map(u => ({ uri: URI.revive(u.uri), provides: u.provides })) ?? [];
    }
    update(data) {
        const event = Object.create(null);
        if (data.label !== undefined) {
            this.label = data.label;
            event.label = true;
        }
        if (data.description !== undefined) {
            this.description = data.description;
            event.description = true;
        }
        if (data.detail !== undefined) {
            this.detail = data.detail;
            event.detail = true;
        }
        if (data.kind !== undefined) {
            this.kind = data.kind;
            event.kind = true;
        }
        if (data.supportedLanguages !== undefined) {
            this.supportedLanguages = isNonEmptyArray(data.supportedLanguages) ? data.supportedLanguages : this._languageService.getRegisteredLanguageIds();
            event.supportedLanguages = true;
        }
        if (data.supportsExecutionOrder !== undefined) {
            this.implementsExecutionOrder = data.supportsExecutionOrder;
            event.hasExecutionOrder = true;
        }
        if (data.supportsInterrupt !== undefined) {
            this.implementsInterrupt = data.supportsInterrupt;
            event.hasInterruptHandler = true;
        }
        this._onDidChange.fire(event);
    }
}
class MainThreadKernelDetectionTask {
    notebookType;
    constructor(notebookType) {
        this.notebookType = notebookType;
    }
}
let MainThreadNotebookKernels = class MainThreadNotebookKernels {
    _languageService;
    _notebookKernelService;
    _notebookExecutionStateService;
    _notebookService;
    _editors = new DisposableMap();
    _disposables = new DisposableStore();
    _kernels = new Map();
    _kernelDetectionTasks = new Map();
    _kernelSourceActionProviders = new Map();
    _proxy;
    _executions = new Map();
    constructor(extHostContext, _languageService, _notebookKernelService, _notebookExecutionStateService, _notebookService, notebookEditorService) {
        this._languageService = _languageService;
        this._notebookKernelService = _notebookKernelService;
        this._notebookExecutionStateService = _notebookExecutionStateService;
        this._notebookService = _notebookService;
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostNotebookKernels);
        notebookEditorService.listNotebookEditors().forEach(this._onEditorAdd, this);
        notebookEditorService.onDidAddNotebookEditor(this._onEditorAdd, this, this._disposables);
        notebookEditorService.onDidRemoveNotebookEditor(this._onEditorRemove, this, this._disposables);
        this._disposables.add(toDisposable(() => {
            // EH shut down, complete all executions started by this EH
            this._executions.forEach(e => {
                e.complete({});
            });
        }));
        this._disposables.add(this._notebookExecutionStateService.onDidChangeCellExecution(e => {
            this._proxy.$cellExecutionChanged(e.notebook, e.cellHandle, e.changed?.state);
        }));
    }
    dispose() {
        this._disposables.dispose();
        for (const [, registration] of this._kernels.values()) {
            registration.dispose();
        }
        for (const [, registration] of this._kernelDetectionTasks.values()) {
            registration.dispose();
        }
        this._editors.dispose();
    }
    // --- kernel ipc
    _onEditorAdd(editor) {
        const ipcListener = editor.onDidReceiveMessage(e => {
            if (!editor.hasModel()) {
                return;
            }
            const { selected } = this._notebookKernelService.getMatchingKernel(editor.textModel);
            if (!selected) {
                return;
            }
            for (const [handle, candidate] of this._kernels) {
                if (candidate[0] === selected) {
                    this._proxy.$acceptKernelMessageFromRenderer(handle, editor.getId(), e.message);
                    break;
                }
            }
        });
        this._editors.set(editor, ipcListener);
    }
    _onEditorRemove(editor) {
        this._editors.deleteAndDispose(editor);
    }
    async $postMessage(handle, editorId, message) {
        const tuple = this._kernels.get(handle);
        if (!tuple) {
            throw new Error('kernel already disposed');
        }
        const [kernel] = tuple;
        let didSend = false;
        for (const [editor] of this._editors) {
            if (!editor.hasModel()) {
                continue;
            }
            if (this._notebookKernelService.getMatchingKernel(editor.textModel).selected !== kernel) {
                // different kernel
                continue;
            }
            if (editorId === undefined) {
                // all editors
                editor.postMessage(message);
                didSend = true;
            }
            else if (editor.getId() === editorId) {
                // selected editors
                editor.postMessage(message);
                didSend = true;
                break;
            }
        }
        return didSend;
    }
    // --- kernel adding/updating/removal
    async $addKernel(handle, data) {
        const that = this;
        const kernel = new class extends MainThreadKernel {
            async executeNotebookCellsRequest(uri, handles) {
                await that._proxy.$executeCells(handle, uri, handles);
            }
            async cancelNotebookCellExecution(uri, handles) {
                await that._proxy.$cancelCells(handle, uri, handles);
            }
        }(data, this._languageService);
        const listener = this._notebookKernelService.onDidChangeSelectedNotebooks(e => {
            if (e.oldKernel === kernel.id) {
                this._proxy.$acceptNotebookAssociation(handle, e.notebook, false);
            }
            else if (e.newKernel === kernel.id) {
                this._proxy.$acceptNotebookAssociation(handle, e.notebook, true);
            }
        });
        const registration = this._notebookKernelService.registerKernel(kernel);
        this._kernels.set(handle, [kernel, combinedDisposable(listener, registration)]);
    }
    $updateKernel(handle, data) {
        const tuple = this._kernels.get(handle);
        if (tuple) {
            tuple[0].update(data);
        }
    }
    $removeKernel(handle) {
        const tuple = this._kernels.get(handle);
        if (tuple) {
            tuple[1].dispose();
            this._kernels.delete(handle);
        }
    }
    $updateNotebookPriority(handle, notebook, value) {
        const tuple = this._kernels.get(handle);
        if (tuple) {
            this._notebookKernelService.updateKernelNotebookAffinity(tuple[0], URI.revive(notebook), value);
        }
    }
    // --- execution
    $createExecution(handle, controllerId, rawUri, cellHandle) {
        const uri = URI.revive(rawUri);
        const notebook = this._notebookService.getNotebookTextModel(uri);
        if (!notebook) {
            throw new Error(`Notebook not found: ${uri.toString()}`);
        }
        const kernel = this._notebookKernelService.getMatchingKernel(notebook);
        if (!kernel.selected || kernel.selected.id !== controllerId) {
            throw new Error(`Kernel is not selected: ${kernel.selected?.id} !== ${controllerId}`);
        }
        const execution = this._notebookExecutionStateService.createCellExecution(uri, cellHandle);
        execution.confirm();
        this._executions.set(handle, execution);
    }
    $updateExecution(handle, data) {
        const updates = data.value;
        try {
            const execution = this._executions.get(handle);
            execution?.update(updates.map(NotebookDto.fromCellExecuteUpdateDto));
        }
        catch (e) {
            onUnexpectedError(e);
        }
    }
    $completeExecution(handle, data) {
        try {
            const execution = this._executions.get(handle);
            execution?.complete(NotebookDto.fromCellExecuteCompleteDto(data.value));
        }
        catch (e) {
            onUnexpectedError(e);
        }
        finally {
            this._executions.delete(handle);
        }
    }
    // --- notebook kernel detection task
    async $addKernelDetectionTask(handle, notebookType) {
        const kernelDetectionTask = new MainThreadKernelDetectionTask(notebookType);
        const registration = this._notebookKernelService.registerNotebookKernelDetectionTask(kernelDetectionTask);
        this._kernelDetectionTasks.set(handle, [kernelDetectionTask, registration]);
    }
    $removeKernelDetectionTask(handle) {
        const tuple = this._kernelDetectionTasks.get(handle);
        if (tuple) {
            tuple[1].dispose();
            this._kernelDetectionTasks.delete(handle);
        }
    }
    // --- notebook kernel source action provider
    async $addKernelSourceActionProvider(handle, notebookType) {
        const kernelSourceActionProvider = {
            viewType: notebookType,
            provideKernelSourceActions: async () => {
                return this._proxy.$provideKernelSourceActions(handle, CancellationToken.None);
            }
        };
        const registration = this._notebookKernelService.registerKernelSourceActionProvider(notebookType, kernelSourceActionProvider);
        this._kernelSourceActionProviders.set(handle, [kernelSourceActionProvider, registration]);
    }
    $removeKernelSourceActionProvider(handle) {
        const tuple = this._kernelSourceActionProviders.get(handle);
        if (tuple) {
            tuple[1].dispose();
            this._kernelSourceActionProviders.delete(handle);
        }
    }
};
MainThreadNotebookKernels = __decorate([
    extHostNamedCustomer(MainContext.MainThreadNotebookKernels),
    __param(1, ILanguageService),
    __param(2, INotebookKernelService),
    __param(3, INotebookExecutionStateService),
    __param(4, INotebookService),
    __param(5, INotebookEditorService)
], MainThreadNotebookKernels);
export { MainThreadNotebookKernels };
