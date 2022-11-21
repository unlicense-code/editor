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
import 'vs/css!./accessibility';
import * as nls from 'vs/nls';
import * as dom from 'vs/base/browser/dom';
import { createFastDomNode } from 'vs/base/browser/fastDomNode';
import { renderFormattedText } from 'vs/base/browser/formattedTextRenderer';
import { alert } from 'vs/base/browser/ui/aria/aria';
import { Widget } from 'vs/base/browser/ui/widget';
import { Disposable } from 'vs/base/common/lifecycle';
import * as platform from 'vs/base/common/platform';
import * as strings from 'vs/base/common/strings';
import { URI } from 'vs/base/common/uri';
import { EditorCommand, registerEditorContribution, registerEditorCommand } from 'vs/editor/browser/editorExtensions';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import { ToggleTabFocusModeAction } from 'vs/editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { Action2, registerAction2 } from 'vs/platform/actions/common/actions';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { NEW_UNTITLED_FILE_COMMAND_ID } from 'vs/workbench/contrib/files/browser/fileConstants';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
const CONTEXT_ACCESSIBILITY_WIDGET_VISIBLE = new RawContextKey('accessibilityHelpWidgetVisible', false);
let AccessibilityHelpController = class AccessibilityHelpController extends Disposable {
    instantiationService;
    static ID = 'editor.contrib.accessibilityHelpController';
    static get(editor) {
        return editor.getContribution(AccessibilityHelpController.ID);
    }
    _editor;
    _widget;
    constructor(editor, instantiationService) {
        super();
        this.instantiationService = instantiationService;
        this._editor = editor;
    }
    show() {
        if (!this._widget) {
            this._widget = this._register(this.instantiationService.createInstance(AccessibilityHelpWidget, this._editor));
        }
        this._widget.show();
    }
    hide() {
        this._widget?.hide();
    }
};
AccessibilityHelpController = __decorate([
    __param(1, IInstantiationService)
], AccessibilityHelpController);
export { AccessibilityHelpController };
let AccessibilityHelpWidget = class AccessibilityHelpWidget extends Widget {
    _contextKeyService;
    _keybindingService;
    _configurationService;
    _openerService;
    static ID = 'editor.contrib.accessibilityHelpWidget';
    static WIDTH = 500;
    static HEIGHT = 300;
    _editor;
    _domNode;
    _contentDomNode;
    _isVisible;
    _isVisibleKey;
    constructor(editor, _contextKeyService, _keybindingService, _configurationService, _openerService) {
        super();
        this._contextKeyService = _contextKeyService;
        this._keybindingService = _keybindingService;
        this._configurationService = _configurationService;
        this._openerService = _openerService;
        this._editor = editor;
        this._isVisibleKey = CONTEXT_ACCESSIBILITY_WIDGET_VISIBLE.bindTo(this._contextKeyService);
        this._domNode = createFastDomNode(document.createElement('div'));
        this._domNode.setClassName('accessibilityHelpWidget');
        this._domNode.setWidth(AccessibilityHelpWidget.WIDTH);
        this._domNode.setHeight(AccessibilityHelpWidget.HEIGHT);
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
                alert(nls.localize('emergencyConfOn', "Now changing the setting `editor.accessibilitySupport` to 'on'."));
                this._configurationService.updateValue('editor.accessibilitySupport', 'on');
                e.preventDefault();
                e.stopPropagation();
            }
            if (e.equals(2048 /* KeyMod.CtrlCmd */ | 38 /* KeyCode.KeyH */)) {
                alert(nls.localize('openingDocs', "Now opening the VS Code Accessibility documentation page."));
                this._openerService.open(URI.parse('https://go.microsoft.com/fwlink/?linkid=851010'));
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
        let text = nls.localize('introMsg', "Thank you for trying out VS Code's accessibility options.");
        text += '\n\n' + nls.localize('status', "Status:");
        const configuredValue = this._configurationService.getValue('editor').accessibilitySupport;
        const actualValue = options.get(2 /* EditorOption.accessibilitySupport */);
        const emergencyTurnOnMessage = (platform.isMacintosh
            ? nls.localize('changeConfigToOnMac', "To configure the editor to be permanently optimized for usage with a Screen Reader press Command+E now.")
            : nls.localize('changeConfigToOnWinLinux', "To configure the editor to be permanently optimized for usage with a Screen Reader press Control+E now."));
        switch (configuredValue) {
            case 'auto':
                switch (actualValue) {
                    case 0 /* AccessibilitySupport.Unknown */:
                        // Should never happen in VS Code
                        text += '\n\n - ' + nls.localize('auto_unknown', "The editor is configured to use platform APIs to detect when a Screen Reader is attached, but the current runtime does not support this.");
                        break;
                    case 2 /* AccessibilitySupport.Enabled */:
                        text += '\n\n - ' + nls.localize('auto_on', "The editor has automatically detected a Screen Reader is attached.");
                        break;
                    case 1 /* AccessibilitySupport.Disabled */:
                        text += '\n\n - ' + nls.localize('auto_off', "The editor is configured to automatically detect when a Screen Reader is attached, which is not the case at this time.");
                        text += ' ' + emergencyTurnOnMessage;
                        break;
                }
                break;
            case 'on':
                text += '\n\n - ' + nls.localize('configuredOn', "The editor is configured to be permanently optimized for usage with a Screen Reader - you can change this via the command `Toggle Screen Reader Accessibility Mode` or by editing the setting `editor.accessibilitySupport`");
                break;
            case 'off':
                text += '\n\n - ' + nls.localize('configuredOff', "The editor is configured to never be optimized for usage with a Screen Reader.");
                text += ' ' + emergencyTurnOnMessage;
                break;
        }
        const NLS_TAB_FOCUS_MODE_ON = nls.localize('tabFocusModeOnMsg', "Pressing Tab in the current editor will move focus to the next focusable element. Toggle this behavior by pressing {0}.");
        const NLS_TAB_FOCUS_MODE_ON_NO_KB = nls.localize('tabFocusModeOnMsgNoKb', "Pressing Tab in the current editor will move focus to the next focusable element. The command {0} is currently not triggerable by a keybinding.");
        const NLS_TAB_FOCUS_MODE_OFF = nls.localize('tabFocusModeOffMsg', "Pressing Tab in the current editor will insert the tab character. Toggle this behavior by pressing {0}.");
        const NLS_TAB_FOCUS_MODE_OFF_NO_KB = nls.localize('tabFocusModeOffMsgNoKb', "Pressing Tab in the current editor will insert the tab character. The command {0} is currently not triggerable by a keybinding.");
        if (options.get(132 /* EditorOption.tabFocusMode */)) {
            text += '\n\n - ' + this._descriptionForCommand(ToggleTabFocusModeAction.ID, NLS_TAB_FOCUS_MODE_ON, NLS_TAB_FOCUS_MODE_ON_NO_KB);
        }
        else {
            text += '\n\n - ' + this._descriptionForCommand(ToggleTabFocusModeAction.ID, NLS_TAB_FOCUS_MODE_OFF, NLS_TAB_FOCUS_MODE_OFF_NO_KB);
        }
        const openDocMessage = (platform.isMacintosh
            ? nls.localize('openDocMac', "Press Command+H now to open a browser window with more VS Code information related to Accessibility.")
            : nls.localize('openDocWinLinux', "Press Control+H now to open a browser window with more VS Code information related to Accessibility."));
        text += '\n\n' + openDocMessage;
        text += '\n\n' + nls.localize('outroMsg', "You can dismiss this tooltip and return to the editor by pressing Escape or Shift+Escape.");
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
        const width = Math.min(editorLayout.width - 40, AccessibilityHelpWidget.WIDTH);
        const height = Math.min(editorLayout.height - 40, AccessibilityHelpWidget.HEIGHT);
        this._domNode.setTop(Math.round((editorLayout.height - height) / 2));
        this._domNode.setLeft(Math.round((editorLayout.width - width) / 2));
        this._domNode.setWidth(width);
        this._domNode.setHeight(height);
    }
};
AccessibilityHelpWidget = __decorate([
    __param(1, IContextKeyService),
    __param(2, IKeybindingService),
    __param(3, IConfigurationService),
    __param(4, IOpenerService)
], AccessibilityHelpWidget);
// Show Accessibility Help is a workench command so it can also be shown when there is no editor open #108850
class ShowAccessibilityHelpAction extends Action2 {
    constructor() {
        super({
            id: 'editor.action.showAccessibilityHelp',
            title: { value: nls.localize('ShowAccessibilityHelpAction', "Show Accessibility Help"), original: 'Show Accessibility Help' },
            f1: true,
            keybinding: {
                primary: 512 /* KeyMod.Alt */ | 59 /* KeyCode.F1 */,
                weight: 100 /* KeybindingWeight.EditorContrib */,
                linux: {
                    primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 59 /* KeyCode.F1 */,
                    secondary: [512 /* KeyMod.Alt */ | 59 /* KeyCode.F1 */]
                }
            }
        });
    }
    async run(accessor) {
        const commandService = accessor.get(ICommandService);
        const editorService = accessor.get(ICodeEditorService);
        let activeEditor = editorService.getActiveCodeEditor();
        if (!activeEditor) {
            await commandService.executeCommand(NEW_UNTITLED_FILE_COMMAND_ID);
        }
        activeEditor = editorService.getActiveCodeEditor();
        if (activeEditor) {
            const controller = AccessibilityHelpController.get(activeEditor);
            controller?.show();
        }
    }
}
registerEditorContribution(AccessibilityHelpController.ID, AccessibilityHelpController);
registerAction2(ShowAccessibilityHelpAction);
const AccessibilityHelpCommand = EditorCommand.bindToContribution(AccessibilityHelpController.get);
registerEditorCommand(new AccessibilityHelpCommand({
    id: 'closeAccessibilityHelp',
    precondition: CONTEXT_ACCESSIBILITY_WIDGET_VISIBLE,
    handler: x => x.hide(),
    kbOpts: {
        weight: 100 /* KeybindingWeight.EditorContrib */ + 100,
        kbExpr: EditorContextKeys.focus,
        primary: 9 /* KeyCode.Escape */, secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */]
    }
}));
class ToggleScreenReaderMode extends Action2 {
    constructor() {
        super({
            id: 'editor.action.toggleScreenReaderAccessibilityMode',
            title: { value: nls.localize('toggleScreenReaderMode', "Toggle Screen Reader Accessibility Mode"), original: 'Toggle Screen Reader Accessibility Mode' },
            f1: true,
        });
    }
    async run(accessor) {
        const configurationService = accessor.get(IConfigurationService);
        const value = configurationService.getValue('editor.accessibilitySupport');
        configurationService.updateValue('editor.accessibilitySupport', value === 'on' ? 'off' : 'on');
    }
}
registerAction2(ToggleScreenReaderMode);
