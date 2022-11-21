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
import * as nls from 'vs/nls';
import { Emitter } from 'vs/base/common/event';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { Disposable, toDisposable, MutableDisposable } from 'vs/base/common/lifecycle';
import { onUnexpectedError } from 'vs/base/common/errors';
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
import { ProfileSessionState } from 'vs/workbench/contrib/extensions/electron-sandbox/runtimeExtensionsEditor';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { randomPort } from 'vs/base/common/ports';
import { IProductService } from 'vs/platform/product/common/productService';
import { RuntimeExtensionsInput } from 'vs/workbench/contrib/extensions/common/runtimeExtensionsInput';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { ExtensionHostProfiler } from 'vs/workbench/services/extensions/electron-sandbox/extensionHostProfiler';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
let ExtensionHostProfileService = class ExtensionHostProfileService extends Disposable {
    _extensionService;
    _editorService;
    _instantiationService;
    _nativeHostService;
    _dialogService;
    _statusbarService;
    _productService;
    _onDidChangeState = this._register(new Emitter());
    onDidChangeState = this._onDidChangeState.event;
    _onDidChangeLastProfile = this._register(new Emitter());
    onDidChangeLastProfile = this._onDidChangeLastProfile.event;
    _unresponsiveProfiles = new Map();
    _profile;
    _profileSession;
    _state = ProfileSessionState.None;
    profilingStatusBarIndicator;
    profilingStatusBarIndicatorLabelUpdater = this._register(new MutableDisposable());
    get state() { return this._state; }
    get lastProfile() { return this._profile; }
    constructor(_extensionService, _editorService, _instantiationService, _nativeHostService, _dialogService, _statusbarService, _productService) {
        super();
        this._extensionService = _extensionService;
        this._editorService = _editorService;
        this._instantiationService = _instantiationService;
        this._nativeHostService = _nativeHostService;
        this._dialogService = _dialogService;
        this._statusbarService = _statusbarService;
        this._productService = _productService;
        this._profile = null;
        this._profileSession = null;
        this._setState(ProfileSessionState.None);
        CommandsRegistry.registerCommand('workbench.action.extensionHostProfiler.stop', () => {
            this.stopProfiling();
            this._editorService.openEditor(RuntimeExtensionsInput.instance, { pinned: true });
        });
    }
    _setState(state) {
        if (this._state === state) {
            return;
        }
        this._state = state;
        if (this._state === ProfileSessionState.Running) {
            this.updateProfilingStatusBarIndicator(true);
        }
        else if (this._state === ProfileSessionState.Stopping) {
            this.updateProfilingStatusBarIndicator(false);
        }
        this._onDidChangeState.fire(undefined);
    }
    updateProfilingStatusBarIndicator(visible) {
        this.profilingStatusBarIndicatorLabelUpdater.clear();
        if (visible) {
            const indicator = {
                name: nls.localize('status.profiler', "Extension Profiler"),
                text: nls.localize('profilingExtensionHost', "Profiling Extension Host"),
                showProgress: true,
                ariaLabel: nls.localize('profilingExtensionHost', "Profiling Extension Host"),
                tooltip: nls.localize('selectAndStartDebug', "Click to stop profiling."),
                command: 'workbench.action.extensionHostProfiler.stop'
            };
            const timeStarted = Date.now();
            const handle = setInterval(() => {
                this.profilingStatusBarIndicator?.update({ ...indicator, text: nls.localize('profilingExtensionHostTime', "Profiling Extension Host ({0} sec)", Math.round((new Date().getTime() - timeStarted) / 1000)), });
            }, 1000);
            this.profilingStatusBarIndicatorLabelUpdater.value = toDisposable(() => clearInterval(handle));
            if (!this.profilingStatusBarIndicator) {
                this.profilingStatusBarIndicator = this._statusbarService.addEntry(indicator, 'status.profiler', 1 /* StatusbarAlignment.RIGHT */);
            }
            else {
                this.profilingStatusBarIndicator.update(indicator);
            }
        }
        else {
            if (this.profilingStatusBarIndicator) {
                this.profilingStatusBarIndicator.dispose();
                this.profilingStatusBarIndicator = undefined;
            }
        }
    }
    async startProfiling() {
        if (this._state !== ProfileSessionState.None) {
            return null;
        }
        const inspectPorts = await this._extensionService.getInspectPorts(1 /* ExtensionHostKind.LocalProcess */, true);
        if (inspectPorts.length === 0) {
            return this._dialogService.confirm({
                type: 'info',
                message: nls.localize('restart1', "Profile Extensions"),
                detail: nls.localize('restart2', "In order to profile extensions a restart is required. Do you want to restart '{0}' now?", this._productService.nameLong),
                primaryButton: nls.localize('restart3', "&&Restart"),
                secondaryButton: nls.localize('cancel', "&&Cancel")
            }).then(res => {
                if (res.confirmed) {
                    this._nativeHostService.relaunch({ addArgs: [`--inspect-extensions=${randomPort()}`] });
                }
            });
        }
        if (inspectPorts.length > 1) {
            // TODO
            console.warn(`There are multiple extension hosts available for profiling. Picking the first one...`);
        }
        this._setState(ProfileSessionState.Starting);
        return this._instantiationService.createInstance(ExtensionHostProfiler, inspectPorts[0]).start().then((value) => {
            this._profileSession = value;
            this._setState(ProfileSessionState.Running);
        }, (err) => {
            onUnexpectedError(err);
            this._setState(ProfileSessionState.None);
        });
    }
    stopProfiling() {
        if (this._state !== ProfileSessionState.Running || !this._profileSession) {
            return;
        }
        this._setState(ProfileSessionState.Stopping);
        this._profileSession.stop().then((result) => {
            this._setLastProfile(result);
            this._setState(ProfileSessionState.None);
        }, (err) => {
            onUnexpectedError(err);
            this._setState(ProfileSessionState.None);
        });
        this._profileSession = null;
    }
    _setLastProfile(profile) {
        this._profile = profile;
        this._onDidChangeLastProfile.fire(undefined);
    }
    getUnresponsiveProfile(extensionId) {
        return this._unresponsiveProfiles.get(ExtensionIdentifier.toKey(extensionId));
    }
    setUnresponsiveProfile(extensionId, profile) {
        this._unresponsiveProfiles.set(ExtensionIdentifier.toKey(extensionId), profile);
        this._setLastProfile(profile);
    }
};
ExtensionHostProfileService = __decorate([
    __param(0, IExtensionService),
    __param(1, IEditorService),
    __param(2, IInstantiationService),
    __param(3, INativeHostService),
    __param(4, IDialogService),
    __param(5, IStatusbarService),
    __param(6, IProductService)
], ExtensionHostProfileService);
export { ExtensionHostProfileService };
