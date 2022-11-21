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
import { Disposable, dispose, toDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { EditorActivation } from 'vs/platform/editor/common/editor';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { TerminalLocation } from 'vs/platform/terminal/common/terminal';
import { ITerminalInstanceService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { TerminalEditorInput } from 'vs/workbench/contrib/terminal/browser/terminalEditorInput';
import { getInstanceFromResource, parseTerminalUri } from 'vs/workbench/contrib/terminal/browser/terminalUri';
import { TerminalContextKeys } from 'vs/workbench/contrib/terminal/common/terminalContextKey';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditorService, ACTIVE_GROUP, SIDE_GROUP } from 'vs/workbench/services/editor/common/editorService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
let TerminalEditorService = class TerminalEditorService extends Disposable {
    _editorService;
    _editorGroupsService;
    _terminalInstanceService;
    _instantiationService;
    _environmentService;
    instances = [];
    _activeInstanceIndex = -1;
    _isShuttingDown = false;
    _activeOpenEditorRequest;
    _terminalEditorActive;
    _editorInputs = new Map();
    _instanceDisposables = new Map();
    _onDidDisposeInstance = new Emitter();
    onDidDisposeInstance = this._onDidDisposeInstance.event;
    _onDidFocusInstance = new Emitter();
    onDidFocusInstance = this._onDidFocusInstance.event;
    _onDidChangeInstanceCapability = new Emitter();
    onDidChangeInstanceCapability = this._onDidChangeInstanceCapability.event;
    _onDidChangeActiveInstance = new Emitter();
    onDidChangeActiveInstance = this._onDidChangeActiveInstance.event;
    _onDidChangeInstances = new Emitter();
    onDidChangeInstances = this._onDidChangeInstances.event;
    constructor(_editorService, _editorGroupsService, _terminalInstanceService, _instantiationService, lifecycleService, _environmentService, contextKeyService) {
        super();
        this._editorService = _editorService;
        this._editorGroupsService = _editorGroupsService;
        this._terminalInstanceService = _terminalInstanceService;
        this._instantiationService = _instantiationService;
        this._environmentService = _environmentService;
        this._terminalEditorActive = TerminalContextKeys.terminalEditorActive.bindTo(contextKeyService);
        this._register(toDisposable(() => {
            for (const d of this._instanceDisposables.values()) {
                dispose(d);
            }
        }));
        this._register(lifecycleService.onWillShutdown(() => this._isShuttingDown = true));
        this._register(this._editorService.onDidActiveEditorChange(() => {
            const activeEditor = this._editorService.activeEditor;
            const instance = activeEditor instanceof TerminalEditorInput ? activeEditor?.terminalInstance : undefined;
            const terminalEditorActive = !!instance && activeEditor instanceof TerminalEditorInput;
            this._terminalEditorActive.set(terminalEditorActive);
            if (terminalEditorActive) {
                activeEditor?.setGroup(this._editorService.activeEditorPane?.group);
                this._setActiveInstance(instance);
            }
        }));
        this._register(this._editorService.onDidVisibleEditorsChange(() => {
            // add any terminal editors created via the editor service split command
            const knownIds = this.instances.map(i => i.instanceId);
            const terminalEditors = this._getActiveTerminalEditors();
            const unknownEditor = terminalEditors.find(input => {
                const inputId = input instanceof TerminalEditorInput ? input.terminalInstance?.instanceId : undefined;
                if (inputId === undefined) {
                    return false;
                }
                return !knownIds.includes(inputId);
            });
            if (unknownEditor instanceof TerminalEditorInput && unknownEditor.terminalInstance) {
                this._editorInputs.set(unknownEditor.terminalInstance.resource.path, unknownEditor);
                this.instances.push(unknownEditor.terminalInstance);
            }
        }));
        this._register(this.onDidDisposeInstance(instance => this.detachInstance(instance)));
        // Remove the terminal from the managed instances when the editor closes. This fires when
        // dragging and dropping to another editor or closing the editor via cmd/ctrl+w.
        this._register(this._editorService.onDidCloseEditor(e => {
            const instance = e.editor instanceof TerminalEditorInput ? e.editor.terminalInstance : undefined;
            if (instance) {
                const instanceIndex = this.instances.findIndex(e => e === instance);
                if (instanceIndex !== -1) {
                    this.instances.splice(instanceIndex, 1);
                }
            }
        }));
        this._register(this._editorService.onDidActiveEditorChange(() => {
            const instance = this._editorService.activeEditor instanceof TerminalEditorInput ? this._editorService.activeEditor : undefined;
            if (!instance) {
                for (const instance of this.instances) {
                    instance.resetFocusContextKey();
                }
            }
        }));
    }
    _getActiveTerminalEditors() {
        return this._editorService.visibleEditors.filter(e => e instanceof TerminalEditorInput && e.terminalInstance?.instanceId);
    }
    get activeInstance() {
        if (this.instances.length === 0 || this._activeInstanceIndex === -1) {
            return undefined;
        }
        return this.instances[this._activeInstanceIndex];
    }
    setActiveInstance(instance) {
        this._setActiveInstance(instance);
    }
    async focusActiveInstance() {
        return this.activeInstance?.focusWhenReady(true);
    }
    _setActiveInstance(instance) {
        if (instance === undefined) {
            this._activeInstanceIndex = -1;
        }
        else {
            this._activeInstanceIndex = this.instances.findIndex(e => e === instance);
        }
        this._onDidChangeActiveInstance.fire(this.activeInstance);
    }
    async openEditor(instance, editorOptions) {
        const resource = this.resolveResource(instance);
        if (resource) {
            await this._activeOpenEditorRequest?.promise;
            this._activeOpenEditorRequest = {
                instanceId: instance.instanceId,
                promise: this._editorService.openEditor({
                    resource,
                    description: instance.description || instance.shellLaunchConfig.type,
                    options: {
                        pinned: true,
                        forceReload: true,
                        preserveFocus: editorOptions?.preserveFocus
                    }
                }, editorOptions?.viewColumn || ACTIVE_GROUP)
            };
            await this._activeOpenEditorRequest?.promise;
            this._activeOpenEditorRequest = undefined;
        }
    }
    resolveResource(instanceOrUri, isFutureSplit = false) {
        const resource = URI.isUri(instanceOrUri) ? instanceOrUri : instanceOrUri.resource;
        const inputKey = resource.path;
        const cachedEditor = this._editorInputs.get(inputKey);
        if (cachedEditor) {
            return cachedEditor.resource;
        }
        // Terminal from a different window
        if (URI.isUri(instanceOrUri)) {
            const terminalIdentifier = parseTerminalUri(instanceOrUri);
            if (terminalIdentifier.instanceId) {
                this._terminalInstanceService.getBackend(this._environmentService.remoteAuthority).then(primaryBackend => {
                    primaryBackend?.requestDetachInstance(terminalIdentifier.workspaceId, terminalIdentifier.instanceId).then(attachPersistentProcess => {
                        const instance = this._terminalInstanceService.createInstance({ attachPersistentProcess }, TerminalLocation.Editor, resource);
                        input = this._instantiationService.createInstance(TerminalEditorInput, resource, instance);
                        this._editorService.openEditor(input, {
                            pinned: true,
                            forceReload: true
                        }, input.group);
                        this._registerInstance(inputKey, input, instance);
                        return instanceOrUri;
                    });
                });
            }
        }
        let input;
        if ('instanceId' in instanceOrUri) {
            instanceOrUri.target = TerminalLocation.Editor;
            input = this._instantiationService.createInstance(TerminalEditorInput, resource, instanceOrUri);
            this._registerInstance(inputKey, input, instanceOrUri);
            return input.resource;
        }
        else {
            return instanceOrUri;
        }
    }
    getInputFromResource(resource) {
        const input = this._editorInputs.get(resource.path);
        if (!input) {
            throw new Error(`Could not get input from resource: ${resource.path}`);
        }
        return input;
    }
    _registerInstance(inputKey, input, instance) {
        this._editorInputs.set(inputKey, input);
        this._instanceDisposables.set(inputKey, [
            instance.onDidFocus(this._onDidFocusInstance.fire, this._onDidFocusInstance),
            instance.onDisposed(this._onDidDisposeInstance.fire, this._onDidDisposeInstance),
            instance.capabilities.onDidAddCapability(() => this._onDidChangeInstanceCapability.fire(instance)),
            instance.capabilities.onDidRemoveCapability(() => this._onDidChangeInstanceCapability.fire(instance)),
        ]);
        this.instances.push(instance);
        this._onDidChangeInstances.fire();
    }
    getInstanceFromResource(resource) {
        return getInstanceFromResource(this.instances, resource);
    }
    splitInstance(instanceToSplit, shellLaunchConfig = {}) {
        if (instanceToSplit.target === TerminalLocation.Editor) {
            // Make sure the instance to split's group is active
            const group = this._editorInputs.get(instanceToSplit.resource.path)?.group;
            if (group) {
                this._editorGroupsService.activateGroup(group);
            }
        }
        const instance = this._terminalInstanceService.createInstance(shellLaunchConfig, TerminalLocation.Editor);
        const resource = this.resolveResource(instance);
        if (resource) {
            this._editorService.openEditor({
                resource: URI.revive(resource),
                description: instance.description,
                options: {
                    pinned: true,
                    forceReload: true
                }
            }, SIDE_GROUP);
        }
        return instance;
    }
    reviveInput(deserializedInput) {
        const resource = URI.isUri(deserializedInput) ? deserializedInput : deserializedInput.resource;
        const inputKey = resource.path;
        if ('pid' in deserializedInput) {
            const newDeserializedInput = { ...deserializedInput, findRevivedId: true };
            const instance = this._terminalInstanceService.createInstance({ attachPersistentProcess: newDeserializedInput }, TerminalLocation.Editor);
            instance.target = TerminalLocation.Editor;
            const input = this._instantiationService.createInstance(TerminalEditorInput, resource, instance);
            this._registerInstance(inputKey, input, instance);
            return input;
        }
        else {
            throw new Error(`Could not revive terminal editor input, ${deserializedInput}`);
        }
    }
    detachActiveEditorInstance() {
        const activeEditor = this._editorService.activeEditor;
        if (!(activeEditor instanceof TerminalEditorInput)) {
            // should never happen now with the terminalEditorActive context key
            throw new Error('Active editor is not a terminal');
        }
        const instance = activeEditor.terminalInstance;
        if (!instance) {
            throw new Error('Terminal is already detached');
        }
        this.detachInstance(instance);
        return instance;
    }
    detachInstance(instance) {
        const inputKey = instance.resource.path;
        const editorInput = this._editorInputs.get(inputKey);
        editorInput?.detachInstance();
        this._editorInputs.delete(inputKey);
        const instanceIndex = this.instances.findIndex(e => e === instance);
        if (instanceIndex !== -1) {
            this.instances.splice(instanceIndex, 1);
        }
        // Don't dispose the input when shutting down to avoid layouts in the editor area
        if (!this._isShuttingDown) {
            editorInput?.dispose();
        }
        const disposables = this._instanceDisposables.get(inputKey);
        this._instanceDisposables.delete(inputKey);
        if (disposables) {
            dispose(disposables);
        }
        this._onDidChangeInstances.fire();
    }
    async revealActiveEditor(preserveFocus) {
        const instance = this.activeInstance;
        if (!instance) {
            return;
        }
        // If there is an active openEditor call for this instance it will be revealed by that
        if (this._activeOpenEditorRequest?.instanceId === instance.instanceId) {
            return;
        }
        const editorInput = this._editorInputs.get(instance.resource.path);
        this._editorService.openEditor(editorInput, {
            pinned: true,
            forceReload: true,
            preserveFocus,
            activation: EditorActivation.PRESERVE
        });
    }
};
TerminalEditorService = __decorate([
    __param(0, IEditorService),
    __param(1, IEditorGroupsService),
    __param(2, ITerminalInstanceService),
    __param(3, IInstantiationService),
    __param(4, ILifecycleService),
    __param(5, IWorkbenchEnvironmentService),
    __param(6, IContextKeyService)
], TerminalEditorService);
export { TerminalEditorService };
