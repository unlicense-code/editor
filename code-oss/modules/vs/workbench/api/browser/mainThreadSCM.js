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
import { URI } from 'vs/base/common/uri';
import { Event, Emitter } from 'vs/base/common/event';
import { DisposableStore, combinedDisposable, dispose } from 'vs/base/common/lifecycle';
import { ISCMService, ISCMViewService } from 'vs/workbench/contrib/scm/common/scm';
import { ExtHostContext, MainContext } from '../common/extHost.protocol';
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { Sequence } from 'vs/base/common/sequence';
import { CancellationToken } from 'vs/base/common/cancellation';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
class MainThreadSCMResourceGroup {
    sourceControlHandle;
    handle;
    provider;
    features;
    label;
    id;
    elements = [];
    _onDidSplice = new Emitter();
    onDidSplice = this._onDidSplice.event;
    get hideWhenEmpty() { return !!this.features.hideWhenEmpty; }
    _onDidChange = new Emitter();
    onDidChange = this._onDidChange.event;
    constructor(sourceControlHandle, handle, provider, features, label, id) {
        this.sourceControlHandle = sourceControlHandle;
        this.handle = handle;
        this.provider = provider;
        this.features = features;
        this.label = label;
        this.id = id;
    }
    toJSON() {
        return {
            $mid: 4 /* MarshalledId.ScmResourceGroup */,
            sourceControlHandle: this.sourceControlHandle,
            groupHandle: this.handle
        };
    }
    splice(start, deleteCount, toInsert) {
        this.elements.splice(start, deleteCount, ...toInsert);
        this._onDidSplice.fire({ start, deleteCount, toInsert });
    }
    $updateGroup(features) {
        this.features = { ...this.features, ...features };
        this._onDidChange.fire();
    }
    $updateGroupLabel(label) {
        this.label = label;
        this._onDidChange.fire();
    }
}
class MainThreadSCMResource {
    proxy;
    sourceControlHandle;
    groupHandle;
    handle;
    sourceUri;
    resourceGroup;
    decorations;
    contextValue;
    command;
    constructor(proxy, sourceControlHandle, groupHandle, handle, sourceUri, resourceGroup, decorations, contextValue, command) {
        this.proxy = proxy;
        this.sourceControlHandle = sourceControlHandle;
        this.groupHandle = groupHandle;
        this.handle = handle;
        this.sourceUri = sourceUri;
        this.resourceGroup = resourceGroup;
        this.decorations = decorations;
        this.contextValue = contextValue;
        this.command = command;
    }
    open(preserveFocus) {
        return this.proxy.$executeResourceCommand(this.sourceControlHandle, this.groupHandle, this.handle, preserveFocus);
    }
    toJSON() {
        return {
            $mid: 3 /* MarshalledId.ScmResource */,
            sourceControlHandle: this.sourceControlHandle,
            groupHandle: this.groupHandle,
            handle: this.handle
        };
    }
}
class MainThreadSCMProvider {
    proxy;
    _handle;
    _contextValue;
    _label;
    _rootUri;
    static ID_HANDLE = 0;
    _id = `scm${MainThreadSCMProvider.ID_HANDLE++}`;
    get id() { return this._id; }
    groups = new Sequence();
    _groupsByHandle = Object.create(null);
    // get groups(): ISequence<ISCMResourceGroup> {
    // 	return {
    // 		elements: this._groups,
    // 		onDidSplice: this._onDidSplice.event
    // 	};
    // 	// return this._groups
    // 	// 	.filter(g => g.resources.elements.length > 0 || !g.features.hideWhenEmpty);
    // }
    _onDidChangeResources = new Emitter();
    onDidChangeResources = this._onDidChangeResources.event;
    features = {};
    get handle() { return this._handle; }
    get label() { return this._label; }
    get rootUri() { return this._rootUri; }
    get contextValue() { return this._contextValue; }
    get commitTemplate() { return this.features.commitTemplate || ''; }
    get acceptInputCommand() { return this.features.acceptInputCommand; }
    get actionButton() { return this.features.actionButton ?? undefined; }
    get statusBarCommands() { return this.features.statusBarCommands; }
    get count() { return this.features.count; }
    _onDidChangeCommitTemplate = new Emitter();
    onDidChangeCommitTemplate = this._onDidChangeCommitTemplate.event;
    _onDidChangeStatusBarCommands = new Emitter();
    get onDidChangeStatusBarCommands() { return this._onDidChangeStatusBarCommands.event; }
    _onDidChange = new Emitter();
    onDidChange = this._onDidChange.event;
    constructor(proxy, _handle, _contextValue, _label, _rootUri) {
        this.proxy = proxy;
        this._handle = _handle;
        this._contextValue = _contextValue;
        this._label = _label;
        this._rootUri = _rootUri;
    }
    $updateSourceControl(features) {
        this.features = { ...this.features, ...features };
        this._onDidChange.fire();
        if (typeof features.commitTemplate !== 'undefined') {
            this._onDidChangeCommitTemplate.fire(this.commitTemplate);
        }
        if (typeof features.statusBarCommands !== 'undefined') {
            this._onDidChangeStatusBarCommands.fire(this.statusBarCommands);
        }
    }
    $registerGroups(_groups) {
        const groups = _groups.map(([handle, id, label, features]) => {
            const group = new MainThreadSCMResourceGroup(this.handle, handle, this, features, label, id);
            this._groupsByHandle[handle] = group;
            return group;
        });
        this.groups.splice(this.groups.elements.length, 0, groups);
    }
    $updateGroup(handle, features) {
        const group = this._groupsByHandle[handle];
        if (!group) {
            return;
        }
        group.$updateGroup(features);
    }
    $updateGroupLabel(handle, label) {
        const group = this._groupsByHandle[handle];
        if (!group) {
            return;
        }
        group.$updateGroupLabel(label);
    }
    $spliceGroupResourceStates(splices) {
        for (const [groupHandle, groupSlices] of splices) {
            const group = this._groupsByHandle[groupHandle];
            if (!group) {
                console.warn(`SCM group ${groupHandle} not found in provider ${this.label}`);
                continue;
            }
            // reverse the splices sequence in order to apply them correctly
            groupSlices.reverse();
            for (const [start, deleteCount, rawResources] of groupSlices) {
                const resources = rawResources.map(rawResource => {
                    const [handle, sourceUri, icons, tooltip, strikeThrough, faded, contextValue, command] = rawResource;
                    const [light, dark] = icons;
                    const icon = ThemeIcon.isThemeIcon(light) ? light : URI.revive(light);
                    const iconDark = (ThemeIcon.isThemeIcon(dark) ? dark : URI.revive(dark)) || icon;
                    const decorations = {
                        icon: icon,
                        iconDark: iconDark,
                        tooltip,
                        strikeThrough,
                        faded
                    };
                    return new MainThreadSCMResource(this.proxy, this.handle, groupHandle, handle, URI.revive(sourceUri), group, decorations, contextValue || undefined, command);
                });
                group.splice(start, deleteCount, resources);
            }
        }
        this._onDidChangeResources.fire();
    }
    $unregisterGroup(handle) {
        const group = this._groupsByHandle[handle];
        if (!group) {
            return;
        }
        delete this._groupsByHandle[handle];
        this.groups.splice(this.groups.elements.indexOf(group), 1);
        this._onDidChangeResources.fire();
    }
    async getOriginalResource(uri) {
        if (!this.features.hasQuickDiffProvider) {
            return null;
        }
        const result = await this.proxy.$provideOriginalResource(this.handle, uri, CancellationToken.None);
        return result && URI.revive(result);
    }
    toJSON() {
        return {
            $mid: 5 /* MarshalledId.ScmProvider */,
            handle: this.handle
        };
    }
    dispose() {
    }
}
let MainThreadSCM = class MainThreadSCM {
    scmService;
    scmViewService;
    _proxy;
    _repositories = new Map();
    _repositoryDisposables = new Map();
    _disposables = new DisposableStore();
    constructor(extHostContext, scmService, scmViewService) {
        this.scmService = scmService;
        this.scmViewService = scmViewService;
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostSCM);
    }
    dispose() {
        dispose(this._repositories.values());
        this._repositories.clear();
        dispose(this._repositoryDisposables.values());
        this._repositoryDisposables.clear();
        this._disposables.dispose();
    }
    $registerSourceControl(handle, id, label, rootUri) {
        const provider = new MainThreadSCMProvider(this._proxy, handle, id, label, rootUri ? URI.revive(rootUri) : undefined);
        const repository = this.scmService.registerSCMProvider(provider);
        this._repositories.set(handle, repository);
        const disposable = combinedDisposable(Event.filter(this.scmViewService.onDidFocusRepository, r => r === repository)(_ => this._proxy.$setSelectedSourceControl(handle)), repository.input.onDidChange(({ value }) => this._proxy.$onInputBoxValueChange(handle, value)));
        if (this.scmViewService.focusedRepository === repository) {
            setTimeout(() => this._proxy.$setSelectedSourceControl(handle), 0);
        }
        if (repository.input.value) {
            setTimeout(() => this._proxy.$onInputBoxValueChange(handle, repository.input.value), 0);
        }
        this._repositoryDisposables.set(handle, disposable);
    }
    $updateSourceControl(handle, features) {
        const repository = this._repositories.get(handle);
        if (!repository) {
            return;
        }
        const provider = repository.provider;
        provider.$updateSourceControl(features);
    }
    $unregisterSourceControl(handle) {
        const repository = this._repositories.get(handle);
        if (!repository) {
            return;
        }
        this._repositoryDisposables.get(handle).dispose();
        this._repositoryDisposables.delete(handle);
        repository.dispose();
        this._repositories.delete(handle);
    }
    $registerGroups(sourceControlHandle, groups, splices) {
        const repository = this._repositories.get(sourceControlHandle);
        if (!repository) {
            return;
        }
        const provider = repository.provider;
        provider.$registerGroups(groups);
        provider.$spliceGroupResourceStates(splices);
    }
    $updateGroup(sourceControlHandle, groupHandle, features) {
        const repository = this._repositories.get(sourceControlHandle);
        if (!repository) {
            return;
        }
        const provider = repository.provider;
        provider.$updateGroup(groupHandle, features);
    }
    $updateGroupLabel(sourceControlHandle, groupHandle, label) {
        const repository = this._repositories.get(sourceControlHandle);
        if (!repository) {
            return;
        }
        const provider = repository.provider;
        provider.$updateGroupLabel(groupHandle, label);
    }
    $spliceResourceStates(sourceControlHandle, splices) {
        const repository = this._repositories.get(sourceControlHandle);
        if (!repository) {
            return;
        }
        const provider = repository.provider;
        provider.$spliceGroupResourceStates(splices);
    }
    $unregisterGroup(sourceControlHandle, handle) {
        const repository = this._repositories.get(sourceControlHandle);
        if (!repository) {
            return;
        }
        const provider = repository.provider;
        provider.$unregisterGroup(handle);
    }
    $setInputBoxValue(sourceControlHandle, value) {
        const repository = this._repositories.get(sourceControlHandle);
        if (!repository) {
            return;
        }
        repository.input.setValue(value, false);
    }
    $setInputBoxPlaceholder(sourceControlHandle, placeholder) {
        const repository = this._repositories.get(sourceControlHandle);
        if (!repository) {
            return;
        }
        repository.input.placeholder = placeholder;
    }
    $setInputBoxEnablement(sourceControlHandle, enabled) {
        const repository = this._repositories.get(sourceControlHandle);
        if (!repository) {
            return;
        }
        repository.input.enabled = enabled;
    }
    $setInputBoxVisibility(sourceControlHandle, visible) {
        const repository = this._repositories.get(sourceControlHandle);
        if (!repository) {
            return;
        }
        repository.input.visible = visible;
    }
    $showValidationMessage(sourceControlHandle, message, type) {
        const repository = this._repositories.get(sourceControlHandle);
        if (!repository) {
            return;
        }
        repository.input.showValidationMessage(message, type);
    }
    $setValidationProviderIsEnabled(sourceControlHandle, enabled) {
        const repository = this._repositories.get(sourceControlHandle);
        if (!repository) {
            return;
        }
        if (enabled) {
            repository.input.validateInput = async (value, pos) => {
                const result = await this._proxy.$validateInput(sourceControlHandle, value, pos);
                return result && { message: result[0], type: result[1] };
            };
        }
        else {
            repository.input.validateInput = async () => undefined;
        }
    }
};
MainThreadSCM = __decorate([
    extHostNamedCustomer(MainContext.MainThreadSCM),
    __param(1, ISCMService),
    __param(2, ISCMViewService)
], MainThreadSCM);
export { MainThreadSCM };
