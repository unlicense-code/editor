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
import { localize } from 'vs/nls';
import Severity from 'vs/base/common/severity';
import { dispose, toDisposable } from 'vs/base/common/lifecycle';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { ITerminalInstanceService, terminalEditorId } from 'vs/workbench/contrib/terminal/browser/terminal';
import { getColorClass, getUriClasses } from 'vs/workbench/contrib/terminal/browser/terminalIcon';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { TerminalExitReason, TerminalLocation } from 'vs/platform/terminal/common/terminal';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { TerminalContextKeys } from 'vs/workbench/contrib/terminal/common/terminalContextKey';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { Emitter } from 'vs/base/common/event';
let TerminalEditorInput = class TerminalEditorInput extends EditorInput {
    resource;
    _terminalInstance;
    _themeService;
    _terminalInstanceService;
    _instantiationService;
    _configurationService;
    _lifecycleService;
    _dialogService;
    static ID = 'workbench.editors.terminal';
    closeHandler = this;
    _isDetached = false;
    _isShuttingDown = false;
    _isReverted = false;
    _copyLaunchConfig;
    _terminalEditorFocusContextKey;
    _group;
    _onDidRequestAttach = this._register(new Emitter());
    onDidRequestAttach = this._onDidRequestAttach.event;
    setGroup(group) {
        this._group = group;
    }
    get group() {
        return this._group;
    }
    get typeId() {
        return TerminalEditorInput.ID;
    }
    get editorId() {
        return terminalEditorId;
    }
    get capabilities() {
        return 2 /* EditorInputCapabilities.Readonly */ | 8 /* EditorInputCapabilities.Singleton */;
    }
    setTerminalInstance(instance) {
        if (this._terminalInstance) {
            throw new Error('cannot set instance that has already been set');
        }
        this._terminalInstance = instance;
        this._setupInstanceListeners();
    }
    copy() {
        const instance = this._terminalInstanceService.createInstance(this._copyLaunchConfig || {}, TerminalLocation.Editor);
        instance.focusWhenReady();
        this._copyLaunchConfig = undefined;
        return this._instantiationService.createInstance(TerminalEditorInput, instance.resource, instance);
    }
    /**
     * Sets the launch config to use for the next call to EditorInput.copy, which will be used when
     * the editor's split command is run.
     */
    setCopyLaunchConfig(launchConfig) {
        this._copyLaunchConfig = launchConfig;
    }
    /**
     * Returns the terminal instance for this input if it has not yet been detached from the input.
     */
    get terminalInstance() {
        return this._isDetached ? undefined : this._terminalInstance;
    }
    showConfirm() {
        if (this._isReverted) {
            return false;
        }
        const confirmOnKill = this._configurationService.getValue("terminal.integrated.confirmOnKill" /* TerminalSettingId.ConfirmOnKill */);
        if (confirmOnKill === 'editor' || confirmOnKill === 'always') {
            return this._terminalInstance?.hasChildProcesses || false;
        }
        return false;
    }
    async confirm(terminals) {
        const { choice } = await this._dialogService.show(Severity.Warning, localize('confirmDirtyTerminal.message', "Do you want to terminate running processes?"), [
            localize({ key: 'confirmDirtyTerminal.button', comment: ['&& denotes a mnemonic'] }, "&&Terminate"),
            localize('cancel', "Cancel")
        ], {
            cancelId: 1,
            detail: terminals.length > 1 ?
                terminals.map(terminal => terminal.editor.getName()).join('\n') + '\n\n' + localize('confirmDirtyTerminals.detail', "Closing will terminate the running processes in the terminals.") :
                localize('confirmDirtyTerminal.detail', "Closing will terminate the running processes in this terminal.")
        });
        switch (choice) {
            case 0: return 1 /* ConfirmResult.DONT_SAVE */;
            default: return 2 /* ConfirmResult.CANCEL */;
        }
    }
    async revert() {
        // On revert just treat the terminal as permanently non-dirty
        this._isReverted = true;
    }
    constructor(resource, _terminalInstance, _themeService, _terminalInstanceService, _instantiationService, _configurationService, _lifecycleService, _contextKeyService, _dialogService) {
        super();
        this.resource = resource;
        this._terminalInstance = _terminalInstance;
        this._themeService = _themeService;
        this._terminalInstanceService = _terminalInstanceService;
        this._instantiationService = _instantiationService;
        this._configurationService = _configurationService;
        this._lifecycleService = _lifecycleService;
        this._dialogService = _dialogService;
        this._terminalEditorFocusContextKey = TerminalContextKeys.editorFocus.bindTo(_contextKeyService);
        if (_terminalInstance) {
            this._setupInstanceListeners();
        }
    }
    _setupInstanceListeners() {
        const instance = this._terminalInstance;
        if (!instance) {
            return;
        }
        this._register(toDisposable(() => {
            if (!this._isDetached && !this._isShuttingDown) {
                // Will be ignored if triggered by onExit or onDisposed terminal events
                // as disposed was already called
                instance.dispose(TerminalExitReason.User);
            }
        }));
        const disposeListeners = [
            instance.onExit(() => this.dispose()),
            instance.onDisposed(() => this.dispose()),
            instance.onTitleChanged(() => this._onDidChangeLabel.fire()),
            instance.onIconChanged(() => this._onDidChangeLabel.fire()),
            instance.onDidFocus(() => this._terminalEditorFocusContextKey.set(true)),
            instance.onDidBlur(() => this._terminalEditorFocusContextKey.reset()),
            instance.statusList.onDidChangePrimaryStatus(() => this._onDidChangeLabel.fire())
        ];
        // Don't dispose editor when instance is torn down on shutdown to avoid extra work and so
        // the editor/tabs don't disappear
        this._lifecycleService.onWillShutdown(() => {
            this._isShuttingDown = true;
            dispose(disposeListeners);
        });
    }
    getName() {
        return this._terminalInstance?.title || this.resource.fragment;
    }
    getLabelExtraClasses() {
        if (!this._terminalInstance) {
            return [];
        }
        const extraClasses = ['terminal-tab'];
        const colorClass = getColorClass(this._terminalInstance);
        if (colorClass) {
            extraClasses.push(colorClass);
        }
        const uriClasses = getUriClasses(this._terminalInstance, this._themeService.getColorTheme().type);
        if (uriClasses) {
            extraClasses.push(...uriClasses);
        }
        if (ThemeIcon.isThemeIcon(this._terminalInstance.icon)) {
            extraClasses.push(`codicon-${this._terminalInstance.icon.id}`);
        }
        return extraClasses;
    }
    /**
     * Detach the instance from the input such that when the input is disposed it will not dispose
     * of the terminal instance/process.
     */
    detachInstance() {
        if (!this._isShuttingDown) {
            this._terminalInstance?.detachFromElement();
            this._isDetached = true;
        }
    }
    getDescription() {
        return this._terminalInstance?.description;
    }
    toUntyped() {
        return {
            resource: this.resource,
            options: {
                override: terminalEditorId,
                pinned: true,
                forceReload: true
            }
        };
    }
};
TerminalEditorInput = __decorate([
    __param(2, IThemeService),
    __param(3, ITerminalInstanceService),
    __param(4, IInstantiationService),
    __param(5, IConfigurationService),
    __param(6, ILifecycleService),
    __param(7, IContextKeyService),
    __param(8, IDialogService)
], TerminalEditorInput);
export { TerminalEditorInput };
