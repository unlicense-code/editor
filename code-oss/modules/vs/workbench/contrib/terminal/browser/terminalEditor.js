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
import * as dom from 'vs/base/browser/dom';
import { DropdownWithPrimaryActionViewItem } from 'vs/platform/actions/browser/dropdownWithPrimaryActionViewItem';
import { IMenuService, MenuId, MenuItemAction } from 'vs/platform/actions/common/actions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { EditorPane } from 'vs/workbench/browser/parts/editor/editorPane';
import { ITerminalEditorService, ITerminalService, terminalEditorId } from 'vs/workbench/contrib/terminal/browser/terminal';
import { getTerminalActionBarArgs } from 'vs/workbench/contrib/terminal/browser/terminalMenus';
import { ITerminalProfileResolverService, ITerminalProfileService } from 'vs/workbench/contrib/terminal/common/terminal';
import { isLinux, isMacintosh } from 'vs/base/common/platform';
import { BrowserFeatures } from 'vs/base/browser/canIUse';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { openContextMenu } from 'vs/workbench/contrib/terminal/browser/terminalContextMenu';
import { ACTIVE_GROUP } from 'vs/workbench/services/editor/common/editorService';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
let TerminalEditor = class TerminalEditor extends EditorPane {
    _terminalEditorService;
    _terminalProfileResolverService;
    _terminalService;
    _instantiationService;
    _contextMenuService;
    _notificationService;
    _terminalProfileService;
    _workbenchLayoutService;
    _editorInstanceElement;
    _overflowGuardElement;
    _editorInput = undefined;
    _lastDimension;
    _dropdownMenu;
    _instanceMenu;
    _cancelContextMenu = false;
    constructor(telemetryService, themeService, storageService, _terminalEditorService, _terminalProfileResolverService, _terminalService, contextKeyService, menuService, _instantiationService, _contextMenuService, _notificationService, _terminalProfileService, _workbenchLayoutService) {
        super(terminalEditorId, telemetryService, themeService, storageService);
        this._terminalEditorService = _terminalEditorService;
        this._terminalProfileResolverService = _terminalProfileResolverService;
        this._terminalService = _terminalService;
        this._instantiationService = _instantiationService;
        this._contextMenuService = _contextMenuService;
        this._notificationService = _notificationService;
        this._terminalProfileService = _terminalProfileService;
        this._workbenchLayoutService = _workbenchLayoutService;
        this._dropdownMenu = this._register(menuService.createMenu(MenuId.TerminalNewDropdownContext, contextKeyService));
        this._instanceMenu = this._register(menuService.createMenu(MenuId.TerminalEditorInstanceContext, contextKeyService));
    }
    async setInput(newInput, options, context, token) {
        this._editorInput?.terminalInstance?.detachFromElement();
        this._editorInput = newInput;
        await super.setInput(newInput, options, context, token);
        this._editorInput.terminalInstance?.attachToElement(this._overflowGuardElement);
        if (this._lastDimension) {
            this.layout(this._lastDimension);
        }
        this._editorInput.terminalInstance?.setVisible(this.isVisible() && this._workbenchLayoutService.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */));
        if (this._editorInput.terminalInstance) {
            // since the editor does not monitor focus changes, for ex. between the terminal
            // panel and the editors, this is needed so that the active instance gets set
            // when focus changes between them.
            this._register(this._editorInput.terminalInstance.onDidFocus(() => this._setActiveInstance()));
            this._register(this._editorInput.terminalInstance.onDidFocusFindWidget(() => this._setActiveInstance()));
            this._editorInput.setCopyLaunchConfig(this._editorInput.terminalInstance.shellLaunchConfig);
        }
    }
    clearInput() {
        super.clearInput();
        this._editorInput?.terminalInstance?.detachFromElement();
        this._editorInput = undefined;
    }
    _setActiveInstance() {
        if (!this._editorInput?.terminalInstance) {
            return;
        }
        this._terminalEditorService.setActiveInstance(this._editorInput.terminalInstance);
    }
    focus() {
        this._editorInput?.terminalInstance?.focus();
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    createEditor(parent) {
        this._editorInstanceElement = parent;
        this._overflowGuardElement = dom.$('.terminal-overflow-guard');
        this._editorInstanceElement.appendChild(this._overflowGuardElement);
        this._registerListeners();
    }
    _registerListeners() {
        if (!this._editorInstanceElement) {
            return;
        }
        this._register(dom.addDisposableListener(this._editorInstanceElement, 'mousedown', async (event) => {
            if (this._terminalEditorService.instances.length === 0) {
                return;
            }
            if (event.which === 2 && isLinux) {
                // Drop selection and focus terminal on Linux to enable middle button paste when click
                // occurs on the selection itself.
                const terminal = this._terminalEditorService.activeInstance;
                terminal?.focus();
            }
            else if (event.which === 3) {
                const rightClickBehavior = this._terminalService.configHelper.config.rightClickBehavior;
                if (rightClickBehavior === 'nothing') {
                    if (!event.shiftKey) {
                        this._cancelContextMenu = true;
                    }
                    return;
                }
                else if (rightClickBehavior === 'copyPaste' || rightClickBehavior === 'paste') {
                    const terminal = this._terminalEditorService.activeInstance;
                    if (!terminal) {
                        return;
                    }
                    // copyPaste: Shift+right click should open context menu
                    if (rightClickBehavior === 'copyPaste' && event.shiftKey) {
                        openContextMenu(event, this._editorInstanceElement, this._instanceMenu, this._contextMenuService);
                        return;
                    }
                    if (rightClickBehavior === 'copyPaste' && terminal.hasSelection()) {
                        await terminal.copySelection();
                        terminal.clearSelection();
                    }
                    else {
                        if (BrowserFeatures.clipboard.readText) {
                            terminal.paste();
                        }
                        else {
                            this._notificationService.info(`This browser doesn't support the clipboard.readText API needed to trigger a paste, try ${isMacintosh ? '⌘' : 'Ctrl'}+V instead.`);
                        }
                    }
                    // Clear selection after all click event bubbling is finished on Mac to prevent
                    // right-click selecting a word which is seemed cannot be disabled. There is a
                    // flicker when pasting but this appears to give the best experience if the
                    // setting is enabled.
                    if (isMacintosh) {
                        setTimeout(() => {
                            terminal.clearSelection();
                        }, 0);
                    }
                    this._cancelContextMenu = true;
                }
            }
        }));
        this._register(dom.addDisposableListener(this._editorInstanceElement, 'contextmenu', (event) => {
            const rightClickBehavior = this._terminalService.configHelper.config.rightClickBehavior;
            if (rightClickBehavior === 'nothing' && !event.shiftKey) {
                event.preventDefault();
                event.stopImmediatePropagation();
                this._cancelContextMenu = false;
                return;
            }
            else if (!this._cancelContextMenu && rightClickBehavior !== 'copyPaste' && rightClickBehavior !== 'paste') {
                if (!this._cancelContextMenu) {
                    openContextMenu(event, this._editorInstanceElement, this._instanceMenu, this._contextMenuService);
                }
                event.preventDefault();
                event.stopImmediatePropagation();
                this._cancelContextMenu = false;
            }
        }));
    }
    layout(dimension) {
        this._editorInput?.terminalInstance?.layout(dimension);
        this._lastDimension = dimension;
    }
    setVisible(visible, group) {
        super.setVisible(visible, group);
        this._editorInput?.terminalInstance?.setVisible(visible && this._workbenchLayoutService.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */));
    }
    getActionViewItem(action) {
        switch (action.id) {
            case "workbench.action.createTerminalEditor" /* TerminalCommandId.CreateTerminalEditor */: {
                if (action instanceof MenuItemAction) {
                    const location = { viewColumn: ACTIVE_GROUP };
                    const actions = getTerminalActionBarArgs(location, this._terminalProfileService.availableProfiles, this._getDefaultProfileName(), this._terminalProfileService.contributedProfiles, this._terminalService, this._dropdownMenu);
                    const button = this._instantiationService.createInstance(DropdownWithPrimaryActionViewItem, action, actions.dropdownAction, actions.dropdownMenuActions, actions.className, this._contextMenuService, {});
                    return button;
                }
            }
        }
        return super.getActionViewItem(action);
    }
    _getDefaultProfileName() {
        let defaultProfileName;
        try {
            defaultProfileName = this._terminalProfileService.getDefaultProfileName();
        }
        catch (e) {
            defaultProfileName = this._terminalProfileResolverService.defaultProfileName;
        }
        return defaultProfileName;
    }
};
TerminalEditor = __decorate([
    __param(0, ITelemetryService),
    __param(1, IThemeService),
    __param(2, IStorageService),
    __param(3, ITerminalEditorService),
    __param(4, ITerminalProfileResolverService),
    __param(5, ITerminalService),
    __param(6, IContextKeyService),
    __param(7, IMenuService),
    __param(8, IInstantiationService),
    __param(9, IContextMenuService),
    __param(10, INotificationService),
    __param(11, ITerminalProfileService),
    __param(12, IWorkbenchLayoutService)
], TerminalEditor);
export { TerminalEditor };
