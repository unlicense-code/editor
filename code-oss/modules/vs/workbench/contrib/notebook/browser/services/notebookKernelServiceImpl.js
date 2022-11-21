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
import { Emitter } from 'vs/base/common/event';
import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import { LRUCache, ResourceMap } from 'vs/base/common/map';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { URI } from 'vs/base/common/uri';
import { INotebookService } from 'vs/workbench/contrib/notebook/common/notebookService';
import { runWhenIdle } from 'vs/base/common/async';
import { IMenuService, MenuId } from 'vs/platform/actions/common/actions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
class KernelInfo {
    static _logicClock = 0;
    kernel;
    score;
    time;
    notebookPriorities = new ResourceMap();
    constructor(kernel) {
        this.kernel = kernel;
        this.score = -1;
        this.time = KernelInfo._logicClock++;
    }
}
class NotebookTextModelLikeId {
    static str(k) {
        return `${k.viewType}/${k.uri.toString()}`;
    }
    static obj(s) {
        const idx = s.indexOf('/');
        return {
            viewType: s.substring(0, idx),
            uri: URI.parse(s.substring(idx + 1))
        };
    }
}
class SourceAction extends Disposable {
    action;
    model;
    isPrimary;
    execution;
    _onDidChangeState = this._register(new Emitter());
    onDidChangeState = this._onDidChangeState.event;
    constructor(action, model, isPrimary) {
        super();
        this.action = action;
        this.model = model;
        this.isPrimary = isPrimary;
    }
    async runAction() {
        if (this.execution) {
            return this.execution;
        }
        this.execution = this._runAction();
        this._onDidChangeState.fire();
        await this.execution;
        this.execution = undefined;
        this._onDidChangeState.fire();
    }
    async _runAction() {
        try {
            await this.action.run({
                uri: this.model.uri,
                $mid: 13 /* MarshalledId.NotebookActionContext */
            });
        }
        catch (error) {
            console.warn(`Kernel source command failed: ${error}`);
        }
    }
}
let NotebookKernelService = class NotebookKernelService extends Disposable {
    _notebookService;
    _storageService;
    _menuService;
    _contextKeyService;
    _kernels = new Map();
    _notebookBindings = new LRUCache(1000, 0.7);
    _onDidChangeNotebookKernelBinding = this._register(new Emitter());
    _onDidAddKernel = this._register(new Emitter());
    _onDidRemoveKernel = this._register(new Emitter());
    _onDidChangeNotebookAffinity = this._register(new Emitter());
    _onDidChangeSourceActions = this._register(new Emitter());
    _kernelSources = new Map();
    _kernelDetectionTasks = new Map();
    _onDidChangeKernelDetectionTasks = this._register(new Emitter());
    _kernelSourceActionProviders = new Map();
    onDidChangeSelectedNotebooks = this._onDidChangeNotebookKernelBinding.event;
    onDidAddKernel = this._onDidAddKernel.event;
    onDidRemoveKernel = this._onDidRemoveKernel.event;
    onDidChangeNotebookAffinity = this._onDidChangeNotebookAffinity.event;
    onDidChangeSourceActions = this._onDidChangeSourceActions.event;
    onDidChangeKernelDetectionTasks = this._onDidChangeKernelDetectionTasks.event;
    static _storageNotebookBinding = 'notebook.controller2NotebookBindings';
    constructor(_notebookService, _storageService, _menuService, _contextKeyService) {
        super();
        this._notebookService = _notebookService;
        this._storageService = _storageService;
        this._menuService = _menuService;
        this._contextKeyService = _contextKeyService;
        // auto associate kernels to new notebook documents, also emit event when
        // a notebook has been closed (but don't update the memento)
        this._register(_notebookService.onDidAddNotebookDocument(this._tryAutoBindNotebook, this));
        this._register(_notebookService.onWillRemoveNotebookDocument(notebook => {
            const kernelId = this._notebookBindings.get(NotebookTextModelLikeId.str(notebook));
            if (kernelId) {
                this.selectKernelForNotebook(undefined, notebook);
            }
        }));
        // restore from storage
        try {
            const data = JSON.parse(this._storageService.get(NotebookKernelService._storageNotebookBinding, 1 /* StorageScope.WORKSPACE */, '[]'));
            this._notebookBindings.fromJSON(data);
        }
        catch {
            // ignore
        }
    }
    dispose() {
        this._kernels.clear();
        this._kernelSources.forEach(v => {
            v.menu.dispose();
            v.actions.forEach(a => a[1].dispose());
        });
        super.dispose();
    }
    _persistSoonHandle;
    _persistMementos() {
        this._persistSoonHandle?.dispose();
        this._persistSoonHandle = runWhenIdle(() => {
            this._storageService.store(NotebookKernelService._storageNotebookBinding, JSON.stringify(this._notebookBindings), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }, 100);
    }
    static _score(kernel, notebook) {
        if (kernel.viewType === '*') {
            return 5;
        }
        else if (kernel.viewType === notebook.viewType) {
            return 10;
        }
        else {
            return 0;
        }
    }
    _tryAutoBindNotebook(notebook, onlyThisKernel) {
        const id = this._notebookBindings.get(NotebookTextModelLikeId.str(notebook));
        if (!id) {
            // no kernel associated
            return;
        }
        const existingKernel = this._kernels.get(id);
        if (!existingKernel || !NotebookKernelService._score(existingKernel.kernel, notebook)) {
            // associated kernel not known, not matching
            return;
        }
        if (!onlyThisKernel || existingKernel.kernel === onlyThisKernel) {
            this._onDidChangeNotebookKernelBinding.fire({ notebook: notebook.uri, oldKernel: undefined, newKernel: existingKernel.kernel.id });
        }
    }
    registerKernel(kernel) {
        if (this._kernels.has(kernel.id)) {
            throw new Error(`NOTEBOOK CONTROLLER with id '${kernel.id}' already exists`);
        }
        this._kernels.set(kernel.id, new KernelInfo(kernel));
        this._onDidAddKernel.fire(kernel);
        // auto associate the new kernel to existing notebooks it was
        // associated to in the past.
        for (const notebook of this._notebookService.getNotebookTextModels()) {
            this._tryAutoBindNotebook(notebook, kernel);
        }
        return toDisposable(() => {
            if (this._kernels.delete(kernel.id)) {
                this._onDidRemoveKernel.fire(kernel);
            }
            for (const [key, candidate] of Array.from(this._notebookBindings)) {
                if (candidate === kernel.id) {
                    this._onDidChangeNotebookKernelBinding.fire({ notebook: NotebookTextModelLikeId.obj(key).uri, oldKernel: kernel.id, newKernel: undefined });
                }
            }
        });
    }
    getMatchingKernel(notebook) {
        // all applicable kernels
        const kernels = [];
        for (const info of this._kernels.values()) {
            const score = NotebookKernelService._score(info.kernel, notebook);
            if (score) {
                kernels.push({
                    score,
                    kernel: info.kernel,
                    instanceAffinity: info.notebookPriorities.get(notebook.uri) ?? 1 /* vscode.NotebookControllerPriority.Default */,
                });
            }
        }
        kernels
            .sort((a, b) => b.instanceAffinity - a.instanceAffinity || a.score - b.score || a.kernel.label.localeCompare(b.kernel.label));
        const all = kernels.map(obj => obj.kernel);
        // bound kernel
        const selectedId = this._notebookBindings.get(NotebookTextModelLikeId.str(notebook));
        const selected = selectedId ? this._kernels.get(selectedId)?.kernel : undefined;
        const suggestions = kernels.filter(item => item.instanceAffinity > 1).map(item => item.kernel);
        const hidden = kernels.filter(item => item.instanceAffinity < 0).map(item => item.kernel);
        return { all, selected, suggestions, hidden };
    }
    getSelectedOrSuggestedKernel(notebook) {
        const info = this.getMatchingKernel(notebook);
        if (info.selected) {
            return info.selected;
        }
        const preferred = info.all.filter(kernel => this._kernels.get(kernel.id)?.notebookPriorities.get(notebook.uri) === 2 /* vscode.NotebookControllerPriority.Preferred */);
        if (preferred.length === 1) {
            return preferred[0];
        }
        return info.all.length === 1 ? info.all[0] : undefined;
    }
    // a notebook has one kernel, a kernel has N notebooks
    // notebook <-1----N-> kernel
    selectKernelForNotebook(kernel, notebook) {
        const key = NotebookTextModelLikeId.str(notebook);
        const oldKernel = this._notebookBindings.get(key);
        if (oldKernel !== kernel?.id) {
            if (kernel) {
                this._notebookBindings.set(key, kernel.id);
            }
            else {
                this._notebookBindings.delete(key);
            }
            this._onDidChangeNotebookKernelBinding.fire({ notebook: notebook.uri, oldKernel, newKernel: kernel?.id });
            this._persistMementos();
        }
    }
    preselectKernelForNotebook(kernel, notebook) {
        const key = NotebookTextModelLikeId.str(notebook);
        const oldKernel = this._notebookBindings.get(key);
        if (oldKernel !== kernel?.id) {
            this._notebookBindings.set(key, kernel.id);
            this._persistMementos();
        }
    }
    updateKernelNotebookAffinity(kernel, notebook, preference) {
        const info = this._kernels.get(kernel.id);
        if (!info) {
            throw new Error(`UNKNOWN kernel '${kernel.id}'`);
        }
        if (preference === undefined) {
            info.notebookPriorities.delete(notebook);
        }
        else {
            info.notebookPriorities.set(notebook, preference);
        }
        this._onDidChangeNotebookAffinity.fire();
    }
    getRunningSourceActions(notebook) {
        const id = NotebookTextModelLikeId.str(notebook);
        const existingInfo = this._kernelSources.get(id);
        if (existingInfo) {
            return existingInfo.actions.filter(action => action[0].execution).map(action => action[0]);
        }
        return [];
    }
    getSourceActions(notebook, contextKeyService) {
        contextKeyService = contextKeyService ?? this._contextKeyService;
        const id = NotebookTextModelLikeId.str(notebook);
        const existingInfo = this._kernelSources.get(id);
        if (existingInfo) {
            return existingInfo.actions.map(a => a[0]);
        }
        const sourceMenu = this._register(this._menuService.createMenu(MenuId.NotebookKernelSource, contextKeyService));
        const info = { menu: sourceMenu, actions: [] };
        const loadActionsFromMenu = (menu) => {
            const groups = menu.getActions({ shouldForwardArgs: true });
            const sourceActions = [];
            groups.forEach(group => {
                const isPrimary = /^primary/.test(group[0]);
                group[1].forEach(action => {
                    const sourceAction = new SourceAction(action, notebook, isPrimary);
                    const stateChangeListener = sourceAction.onDidChangeState(() => {
                        this._onDidChangeSourceActions.fire({
                            notebook: notebook.uri
                        });
                    });
                    sourceActions.push([sourceAction, stateChangeListener]);
                });
            });
            info.actions = sourceActions;
            this._kernelSources.set(id, info);
            this._onDidChangeSourceActions.fire({ notebook: notebook.uri });
        };
        this._register(sourceMenu.onDidChange(() => {
            loadActionsFromMenu(sourceMenu);
        }));
        loadActionsFromMenu(sourceMenu);
        return info.actions.map(a => a[0]);
    }
    registerNotebookKernelDetectionTask(task) {
        const notebookType = task.notebookType;
        const all = this._kernelDetectionTasks.get(notebookType) ?? [];
        all.push(task);
        this._kernelDetectionTasks.set(notebookType, all);
        this._onDidChangeKernelDetectionTasks.fire(notebookType);
        return toDisposable(() => {
            const all = this._kernelDetectionTasks.get(notebookType) ?? [];
            const idx = all.indexOf(task);
            if (idx >= 0) {
                all.splice(idx, 1);
                this._kernelDetectionTasks.set(notebookType, all);
                this._onDidChangeKernelDetectionTasks.fire(notebookType);
            }
        });
    }
    getKernelDetectionTasks(notebook) {
        return this._kernelDetectionTasks.get(notebook.viewType) ?? [];
    }
    registerKernelSourceActionProvider(viewType, provider) {
        const providers = this._kernelSourceActionProviders.get(viewType) ?? [];
        providers.push(provider);
        this._kernelSourceActionProviders.set(viewType, providers);
        return toDisposable(() => {
            const providers = this._kernelSourceActionProviders.get(viewType) ?? [];
            const idx = providers.indexOf(provider);
            if (idx >= 0) {
                providers.splice(idx, 1);
                this._kernelSourceActionProviders.set(viewType, providers);
            }
        });
    }
    /**
     * Get kernel source actions from providers
     */
    getKernelSourceActions2(notebook) {
        const viewType = notebook.viewType;
        const providers = this._kernelSourceActionProviders.get(viewType) ?? [];
        const promises = providers.map(provider => provider.provideKernelSourceActions());
        return Promise.all(promises).then(actions => {
            return actions.reduce((a, b) => a.concat(b), []);
        });
    }
};
NotebookKernelService = __decorate([
    __param(0, INotebookService),
    __param(1, IStorageService),
    __param(2, IMenuService),
    __param(3, IContextKeyService)
], NotebookKernelService);
export { NotebookKernelService };
