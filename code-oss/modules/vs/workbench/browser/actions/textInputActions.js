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
import { Action, Separator } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { Disposable } from 'vs/base/common/lifecycle';
import { EventHelper } from 'vs/base/browser/dom';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { Registry } from 'vs/platform/registry/common/platform';
import { isNative } from 'vs/base/common/platform';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
let TextInputActionsProvider = class TextInputActionsProvider extends Disposable {
    layoutService;
    contextMenuService;
    clipboardService;
    textInputActions = [];
    constructor(layoutService, contextMenuService, clipboardService) {
        super();
        this.layoutService = layoutService;
        this.contextMenuService = contextMenuService;
        this.clipboardService = clipboardService;
        this.createActions();
        this.registerListeners();
    }
    createActions() {
        this.textInputActions.push(
        // Undo/Redo
        new Action('undo', localize('undo', "Undo"), undefined, true, async () => document.execCommand('undo')), new Action('redo', localize('redo', "Redo"), undefined, true, async () => document.execCommand('redo')), new Separator(), 
        // Cut / Copy / Paste
        new Action('editor.action.clipboardCutAction', localize('cut', "Cut"), undefined, true, async () => document.execCommand('cut')), new Action('editor.action.clipboardCopyAction', localize('copy', "Copy"), undefined, true, async () => document.execCommand('copy')), new Action('editor.action.clipboardPasteAction', localize('paste', "Paste"), undefined, true, async (element) => {
            // Native: paste is supported
            if (isNative) {
                document.execCommand('paste');
            }
            // Web: paste is not supported due to security reasons
            else {
                const clipboardText = await this.clipboardService.readText();
                if (element instanceof HTMLTextAreaElement ||
                    element instanceof HTMLInputElement) {
                    const selectionStart = element.selectionStart || 0;
                    const selectionEnd = element.selectionEnd || 0;
                    element.value = `${element.value.substring(0, selectionStart)}${clipboardText}${element.value.substring(selectionEnd, element.value.length)}`;
                    element.selectionStart = selectionStart + clipboardText.length;
                    element.selectionEnd = element.selectionStart;
                }
            }
        }), new Separator(), 
        // Select All
        new Action('editor.action.selectAll', localize('selectAll', "Select All"), undefined, true, async () => document.execCommand('selectAll')));
    }
    registerListeners() {
        // Context menu support in input/textarea
        this.layoutService.container.addEventListener('contextmenu', e => this.onContextMenu(e));
    }
    onContextMenu(e) {
        if (e.defaultPrevented) {
            return; // make sure to not show these actions by accident if component indicated to prevent
        }
        const target = e.target;
        if (!(target instanceof HTMLElement) || (target.nodeName.toLowerCase() !== 'input' && target.nodeName.toLowerCase() !== 'textarea')) {
            return; // only for inputs or textareas
        }
        EventHelper.stop(e, true);
        this.contextMenuService.showContextMenu({
            getAnchor: () => e,
            getActions: () => this.textInputActions,
            getActionsContext: () => target,
            onHide: () => target.focus() // fixes https://github.com/microsoft/vscode/issues/52948
        });
    }
};
TextInputActionsProvider = __decorate([
    __param(0, IWorkbenchLayoutService),
    __param(1, IContextMenuService),
    __param(2, IClipboardService)
], TextInputActionsProvider);
export { TextInputActionsProvider };
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(TextInputActionsProvider, 2 /* LifecyclePhase.Ready */);
