/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import * as nls from 'vs/nls';
import { Action2, MenuId } from 'vs/platform/actions/common/actions';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { IWebviewService, KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_ENABLED, KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED, KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE } from 'vs/workbench/contrib/webview/browser/webview';
import { WebviewEditor } from 'vs/workbench/contrib/webviewPanel/browser/webviewEditor';
import { WebviewInput } from 'vs/workbench/contrib/webviewPanel/browser/webviewEditorInput';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
const webviewActiveContextKeyExpr = ContextKeyExpr.and(ContextKeyExpr.equals('activeEditor', WebviewEditor.ID), EditorContextKeys.focus.toNegated() /* https://github.com/microsoft/vscode/issues/58668 */);
export class ShowWebViewEditorFindWidgetAction extends Action2 {
    static ID = 'editor.action.webvieweditor.showFind';
    static LABEL = nls.localize('editor.action.webvieweditor.showFind', "Show find");
    constructor() {
        super({
            id: ShowWebViewEditorFindWidgetAction.ID,
            title: ShowWebViewEditorFindWidgetAction.LABEL,
            keybinding: {
                when: ContextKeyExpr.and(webviewActiveContextKeyExpr, KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_ENABLED),
                primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
                weight: 100 /* KeybindingWeight.EditorContrib */
            }
        });
    }
    run(accessor) {
        getActiveWebviewEditor(accessor)?.showFind();
    }
}
export class HideWebViewEditorFindCommand extends Action2 {
    static ID = 'editor.action.webvieweditor.hideFind';
    static LABEL = nls.localize('editor.action.webvieweditor.hideFind', "Stop find");
    constructor() {
        super({
            id: HideWebViewEditorFindCommand.ID,
            title: HideWebViewEditorFindCommand.LABEL,
            keybinding: {
                when: ContextKeyExpr.and(webviewActiveContextKeyExpr, KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE),
                primary: 9 /* KeyCode.Escape */,
                weight: 100 /* KeybindingWeight.EditorContrib */
            }
        });
    }
    run(accessor) {
        getActiveWebviewEditor(accessor)?.hideFind();
    }
}
export class WebViewEditorFindNextCommand extends Action2 {
    static ID = 'editor.action.webvieweditor.findNext';
    static LABEL = nls.localize('editor.action.webvieweditor.findNext', 'Find next');
    constructor() {
        super({
            id: WebViewEditorFindNextCommand.ID,
            title: WebViewEditorFindNextCommand.LABEL,
            keybinding: {
                when: ContextKeyExpr.and(webviewActiveContextKeyExpr, KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED),
                primary: 3 /* KeyCode.Enter */,
                weight: 100 /* KeybindingWeight.EditorContrib */
            }
        });
    }
    run(accessor) {
        getActiveWebviewEditor(accessor)?.runFindAction(false);
    }
}
export class WebViewEditorFindPreviousCommand extends Action2 {
    static ID = 'editor.action.webvieweditor.findPrevious';
    static LABEL = nls.localize('editor.action.webvieweditor.findPrevious', 'Find previous');
    constructor() {
        super({
            id: WebViewEditorFindPreviousCommand.ID,
            title: WebViewEditorFindPreviousCommand.LABEL,
            keybinding: {
                when: ContextKeyExpr.and(webviewActiveContextKeyExpr, KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED),
                primary: 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
                weight: 100 /* KeybindingWeight.EditorContrib */
            }
        });
    }
    run(accessor) {
        getActiveWebviewEditor(accessor)?.runFindAction(true);
    }
}
export class ReloadWebviewAction extends Action2 {
    static ID = 'workbench.action.webview.reloadWebviewAction';
    static LABEL = nls.localize('refreshWebviewLabel', "Reload Webviews");
    constructor() {
        super({
            id: ReloadWebviewAction.ID,
            title: { value: ReloadWebviewAction.LABEL, original: 'Reload Webviews' },
            category: Categories.Developer,
            menu: [{
                    id: MenuId.CommandPalette
                }]
        });
    }
    async run(accessor) {
        const webviewService = accessor.get(IWebviewService);
        for (const webview of webviewService.webviews) {
            webview.reload();
        }
    }
}
function getActiveWebviewEditor(accessor) {
    const editorService = accessor.get(IEditorService);
    const activeEditor = editorService.activeEditor;
    return activeEditor instanceof WebviewInput ? activeEditor.webview : undefined;
}
