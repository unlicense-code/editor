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
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { localize } from 'vs/nls';
import { registerAction2 } from 'vs/platform/actions/common/actions';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { Registry } from 'vs/platform/registry/common/platform';
import { EditorPaneDescriptor } from 'vs/workbench/browser/editor';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { EditorExtensions } from 'vs/workbench/common/editor';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { HideWebViewEditorFindCommand, ReloadWebviewAction, ShowWebViewEditorFindWidgetAction, WebViewEditorFindNextCommand, WebViewEditorFindPreviousCommand } from './webviewCommands';
import { WebviewEditor } from './webviewEditor';
import { WebviewInput } from './webviewEditorInput';
import { WebviewEditorInputSerializer } from './webviewEditorInputSerializer';
import { IWebviewWorkbenchService, WebviewEditorService } from './webviewWorkbenchService';
(Registry.as(EditorExtensions.EditorPane)).registerEditorPane(EditorPaneDescriptor.create(WebviewEditor, WebviewEditor.ID, localize('webview.editor.label', "webview editor")), [new SyncDescriptor(WebviewInput)]);
let WebviewPanelContribution = class WebviewPanelContribution extends Disposable {
    editorGroupService;
    constructor(editorGroupService) {
        super();
        this.editorGroupService = editorGroupService;
        // Add all the initial groups to be listened to
        this.editorGroupService.whenReady.then(() => this.editorGroupService.groups.forEach(group => {
            this.registerGroupListener(group);
        }));
        // Additional groups added should also be listened to
        this._register(this.editorGroupService.onDidAddGroup(group => this.registerGroupListener(group)));
    }
    registerGroupListener(group) {
        const listener = group.onWillOpenEditor(e => this.onEditorOpening(e.editor, group));
        Event.once(group.onWillDispose)(() => {
            listener.dispose();
        });
    }
    onEditorOpening(editor, group) {
        if (!(editor instanceof WebviewInput) || editor.typeId !== WebviewInput.typeId) {
            return undefined;
        }
        if (group.contains(editor)) {
            return undefined;
        }
        let previousGroup;
        const groups = this.editorGroupService.groups;
        for (const group of groups) {
            if (group.contains(editor)) {
                previousGroup = group;
                break;
            }
        }
        if (!previousGroup) {
            return undefined;
        }
        previousGroup.closeEditor(editor);
    }
};
WebviewPanelContribution = __decorate([
    __param(0, IEditorGroupsService)
], WebviewPanelContribution);
const workbenchContributionsRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(WebviewPanelContribution, 1 /* LifecyclePhase.Starting */);
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(WebviewEditorInputSerializer.ID, WebviewEditorInputSerializer);
registerSingleton(IWebviewWorkbenchService, WebviewEditorService, 1 /* InstantiationType.Delayed */);
registerAction2(ShowWebViewEditorFindWidgetAction);
registerAction2(HideWebViewEditorFindCommand);
registerAction2(WebViewEditorFindNextCommand);
registerAction2(WebViewEditorFindPreviousCommand);
registerAction2(ReloadWebviewAction);
