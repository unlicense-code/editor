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
import 'vs/css!./accessibilityHelp';
import * as dom from 'vs/base/browser/dom';
import { createFastDomNode } from 'vs/base/browser/fastDomNode';
import { renderFormattedText } from 'vs/base/browser/formattedTextRenderer';
import { alert } from 'vs/base/browser/ui/aria/aria';
import { Widget } from 'vs/base/browser/ui/widget';
import { Disposable } from 'vs/base/common/lifecycle';
import * as platform from 'vs/base/common/platform';
import * as strings from 'vs/base/common/strings';
import { URI } from 'vs/base/common/uri';
import { EditorAction, EditorCommand, registerEditorAction, registerEditorCommand, registerEditorContribution } from 'vs/editor/browser/editorExtensions';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import { ToggleTabFocusModeAction } from 'vs/editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { AccessibilityHelpNLS } from 'vs/editor/common/standaloneStrings';
const CONTEXT_ACCESSIBILITY_WIDGET_VISIBLE = new RawContextKey('accessibilityHelpWidgetVisible', false);
let AccessibilityHelpController = class AccessibilityHelpController extends Disposable {
    static ID = 'editor.contrib.accessibilityHelpController';
    static get(editor) {
        return editor.getContribution(AccessibilityHelpController.ID);
    }
    _editor;
    _widget;
    constructor(editor, instantiationService) {
        super();
        this._editor = editor;
        this._widget = this._register(instantiationService.createInstance(AccessibilityHelpWidget, this._editor));
    }
    show() {
        this._widget.show();
    }
    hide() {
        this._widget.hide();
    }
};
AccessibilityHelpController = __decorate([
    __param(1, IInstantiationService)
], AccessibilityHelpController);
function getSelectionLabel(selections, charactersSelected) {
    if (!selections || selections.length === 0) {
        return AccessibilityHelpNLS.noSelection;
    }
    if (selections.length === 1) {
        if (charactersSelected) {
            return strings.format(AccessibilityHelpNLS.singleSelectionRange, selections[0].positionLineNumber, selections[0].positionColumn, charactersSelected);
        }
        return strings.format(AccessibilityHelpNLS.singleSelection, selections[0].positionLineNumber, selections[0].positionColumn);
    }
    if (charactersSelected) {
        return strings.format(AccessibilityHelpNLS.multiSelectionRange, selections.length, charactersSelected);
    }
    if (selections.length > 0) {
        return strings.format(AccessibilityHelpNLS.multiSelection, selections.length);
    }
    return '';
}
let AccessibilityHelpWidget = class AccessibilityHelpWidget extends Widget {
    _contextKeyService;
    _keybindingService;
    _openerService;
    static ID = 'editor.contrib.accessibilityHelpWidget';
    static WIDTH = 500;
    static HEIGHT = 300;
    _editor;
    _domNode;
    _contentDomNode;
    _isVisible;
    _isVisibleKey;
    constructor(editor, _contextKeyService, _keybindingService, _openerService) {
        super();
        this._contextKeyService = _contextKeyService;
        this._keybindingService = _keybindingService;
        this._openerService = _openerService;
        this._editor = editor;
        this._isVisibleKey = CONTEXT_ACCESSIBILITY_WIDGET_VISIBLE.bindTo(this._contextKeyService);
        this._domNode = createFastDomNode(document.createElement('div'));
        this._domNode.setClassName('accessibilityHelpWidget');
        this._domNode.setDisplay('none');
        this._domNode.setAttribute('role', 'dialog');
        this._domNode.setAttribute('aria-hidden', 'true');
        this._contentDomNode = createFastDomNode(document.createElement('div'));
        this._contentDomNode.setAttribute('role', 'document');
        this._domNode.appendChild(this._contentDomNode);
        this._isVisible = false;
        this._register(this._editor.onDidLayoutChange(() => {
            if (this._isVisible) {
                this._layout();
            }
        }));
        // Intentionally not configurable!
        this._register(dom.addStandardDisposableListener(this._contentDomNode.domNode, 'keydown', (e) => {
            if (!this._isVisible) {
                return;
            }
            if (e.equals(2048 /* KeyMod.CtrlCmd */ | 35 /* KeyCode.KeyE */)) {
                alert(AccessibilityHelpNLS.emergencyConfOn);
                this._editor.updateOptions({
                    accessibilitySupport: 'on'
                });
                dom.clearNode(this._contentDomNode.domNode);
                this._buildContent();
                this._contentDomNode.domNode.focus();
                e.preventDefault();
                e.stopPropagation();
            }
            if (e.equals(2048 /* KeyMod.CtrlCmd */ | 38 /* KeyCode.KeyH */)) {
                alert(AccessibilityHelpNLS.openingDocs);
                let url = this._editor.getRawOptions().accessibilityHelpUrl;
                if (typeof url === 'undefined') {
                    url = 'https://go.microsoft.com/fwlink/?linkid=852450';
                }
                this._openerService.open(URI.parse(url));
                e.preventDefault();
                e.stopPropagation();
            }
        }));
        this.onblur(this._contentDomNode.domNode, () => {
            this.hide();
        });
        this._editor.addOverlayWidget(this);
    }
    dispose() {
        this._editor.removeOverlayWidget(this);
        super.dispose();
    }
    getId() {
        return AccessibilityHelpWidget.ID;
    }
    getDomNode() {
        return this._domNode.domNode;
    }
    getPosition() {
        return {
            preference: null
        };
    }
    show() {
        if (this._isVisible) {
            return;
        }
        this._isVisible = true;
        this._isVisibleKey.set(true);
        this._layout();
        this._domNode.setDisplay('block');
        this._domNode.setAttribute('aria-hidden', 'false');
        this._contentDomNode.domNode.tabIndex = 0;
        this._buildContent();
        this._contentDomNode.domNode.focus();
    }
    _descriptionForCommand(commandId, msg, noKbMsg) {
        const kb = this._keybindingService.lookupKeybinding(commandId);
        if (kb) {
            return strings.format(msg, kb.getAriaLabel());
        }
        return strings.format(noKbMsg, commandId);
    }
    _buildContent() {
        const options = this._editor.getOptions();
        const selections = this._editor.getSelections();
        let charactersSelected = 0;
        if (selections) {
            const model = this._editor.getModel();
            if (model) {
                selections.forEach((selection) => {
                    charactersSelected += model.getValueLengthInRange(selection);
                });
            }
        }
        let text = getSelectionLabel(selections, charactersSelected);
        if (options.get(55 /* EditorOption.inDiffEditor */)) {
            if (options.get(82 /* EditorOption.readOnly */)) {
                text += AccessibilityHelpNLS.readonlyDiffEditor;
            }
            else {
                text += AccessibilityHelpNLS.editableDiffEditor;
            }
        }
        else {
            if (options.get(82 /* EditorOption.readOnly */)) {
                text += AccessibilityHelpNLS.readonlyEditor;
            }
            else {
                text += AccessibilityHelpNLS.editableEditor;
            }
        }
        const turnOnMessage = (platform.isMacintosh
            ? AccessibilityHelpNLS.changeConfigToOnMac
            : AccessibilityHelpNLS.changeConfigToOnWinLinux);
        switch (options.get(2 /* EditorOption.accessibilitySupport */)) {
            case 0 /* AccessibilitySupport.Unknown */:
                text += '\n\n - ' + turnOnMessage;
                break;
            case 2 /* AccessibilitySupport.Enabled */:
                text += '\n\n - ' + AccessibilityHelpNLS.auto_on;
                break;
            case 1 /* AccessibilitySupport.Disabled */:
                text += '\n\n - ' + AccessibilityHelpNLS.auto_off;
                text += ' ' + turnOnMessage;
                break;
        }
        if (options.get(132 /* EditorOption.tabFocusMode */)) {
            text += '\n\n - ' + this._descriptionForCommand(ToggleTabFocusModeAction.ID, AccessibilityHelpNLS.tabFocusModeOnMsg, AccessibilityHelpNLS.tabFocusModeOnMsgNoKb);
        }
        else {
            text += '\n\n - ' + this._descriptionForCommand(ToggleTabFocusModeAction.ID, AccessibilityHelpNLS.tabFocusModeOffMsg, AccessibilityHelpNLS.tabFocusModeOffMsgNoKb);
        }
        const openDocMessage = (platform.isMacintosh
            ? AccessibilityHelpNLS.openDocMac
            : AccessibilityHelpNLS.openDocWinLinux);
        text += '\n\n - ' + openDocMessage;
        text += '\n\n' + AccessibilityHelpNLS.outroMsg;
        this._contentDomNode.domNode.appendChild(renderFormattedText(text));
        // Per https://www.w3.org/TR/wai-aria/roles#document, Authors SHOULD provide a title or label for documents
        this._contentDomNode.domNode.setAttribute('aria-label', text);
    }
    hide() {
        if (!this._isVisible) {
            return;
        }
        this._isVisible = false;
        this._isVisibleKey.reset();
        this._domNode.setDisplay('none');
        this._domNode.setAttribute('aria-hidden', 'true');
        this._contentDomNode.domNode.tabIndex = -1;
        dom.clearNode(this._contentDomNode.domNode);
        this._editor.focus();
    }
    _layout() {
        const editorLayout = this._editor.getLayoutInfo();
        const w = Math.max(5, Math.min(AccessibilityHelpWidget.WIDTH, editorLayout.width - 40));
        const h = Math.max(5, Math.min(AccessibilityHelpWidget.HEIGHT, editorLayout.height - 40));
        this._domNode.setWidth(w);
        this._domNode.setHeight(h);
        const top = Math.round((editorLayout.height - h) / 2);
        this._domNode.setTop(top);
        const left = Math.round((editorLayout.width - w) / 2);
        this._domNode.setLeft(left);
    }
};
AccessibilityHelpWidget = __decorate([
    __param(1, IContextKeyService),
    __param(2, IKeybindingService),
    __param(3, IOpenerService)
], AccessibilityHelpWidget);
class ShowAccessibilityHelpAction extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.showAccessibilityHelp',
            label: AccessibilityHelpNLS.showAccessibilityHelpAction,
            alias: 'Show Accessibility Help',
            precondition: undefined,
            kbOpts: {
                primary: 512 /* KeyMod.Alt */ | 59 /* KeyCode.F1 */,
                weight: 100 /* KeybindingWeight.EditorContrib */,
                linux: {
                    primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 59 /* KeyCode.F1 */,
                    secondary: [512 /* KeyMod.Alt */ | 59 /* KeyCode.F1 */]
                }
            }
        });
    }
    run(accessor, editor) {
        const controller = AccessibilityHelpController.get(editor);
        controller?.show();
    }
}
registerEditorContribution(AccessibilityHelpController.ID, AccessibilityHelpController);
registerEditorAction(ShowAccessibilityHelpAction);
const AccessibilityHelpCommand = EditorCommand.bindToContribution(AccessibilityHelpController.get);
registerEditorCommand(new AccessibilityHelpCommand({
    id: 'closeAccessibilityHelp',
    precondition: CONTEXT_ACCESSIBILITY_WIDGET_VISIBLE,
    handler: x => x.hide(),
    kbOpts: {
        weight: 100 /* KeybindingWeight.EditorContrib */ + 100,
        kbExpr: EditorContextKeys.focus,
        primary: 9 /* KeyCode.Escape */,
        secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */]
    }
}));
