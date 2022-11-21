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
import { RunOnceScheduler } from 'vs/base/common/async';
import { MarkdownString } from 'vs/base/common/htmlContent';
import { KeyChord } from 'vs/base/common/keyCodes';
import { SimpleKeybinding, ScanCodeBinding } from 'vs/base/common/keybindings';
import { Disposable } from 'vs/base/common/lifecycle';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { Range } from 'vs/editor/common/core/range';
import { registerEditorContribution, registerEditorCommand, EditorCommand } from 'vs/editor/browser/editorExtensions';
import { SnippetController2 } from 'vs/editor/contrib/snippet/browser/snippetController2';
import { SmartSnippetInserter } from 'vs/workbench/contrib/preferences/common/smartSnippetInserter';
import { DefineKeybindingOverlayWidget } from 'vs/workbench/contrib/preferences/browser/keybindingWidgets';
import { FloatingClickWidget } from 'vs/workbench/browser/codeeditor';
import { parseTree } from 'vs/base/common/json';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import { WindowsNativeResolvedKeybinding } from 'vs/workbench/services/keybinding/common/windowsKeyboardMapper';
import { themeColorFromId } from 'vs/platform/theme/common/themeService';
import { overviewRulerInfo, overviewRulerError } from 'vs/editor/common/core/editorColorRegistry';
import { OverviewRulerLane } from 'vs/editor/common/model';
import { KeybindingParser } from 'vs/base/common/keybindingParser';
import { equals } from 'vs/base/common/arrays';
import { assertIsDefined } from 'vs/base/common/types';
import { isEqual } from 'vs/base/common/resources';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
const NLS_LAUNCH_MESSAGE = nls.localize('defineKeybinding.start', "Define Keybinding");
const NLS_KB_LAYOUT_ERROR_MESSAGE = nls.localize('defineKeybinding.kbLayoutErrorMessage', "You won't be able to produce this key combination under your current keyboard layout.");
let DefineKeybindingController = class DefineKeybindingController extends Disposable {
    _editor;
    _instantiationService;
    _userDataProfileService;
    static ID = 'editor.contrib.defineKeybinding';
    static get(editor) {
        return editor.getContribution(DefineKeybindingController.ID);
    }
    _keybindingWidgetRenderer;
    _keybindingDecorationRenderer;
    constructor(_editor, _instantiationService, _userDataProfileService) {
        super();
        this._editor = _editor;
        this._instantiationService = _instantiationService;
        this._userDataProfileService = _userDataProfileService;
        this._register(this._editor.onDidChangeModel(e => this._update()));
        this._update();
    }
    get keybindingWidgetRenderer() {
        return this._keybindingWidgetRenderer;
    }
    dispose() {
        this._disposeKeybindingWidgetRenderer();
        this._disposeKeybindingDecorationRenderer();
        super.dispose();
    }
    _update() {
        if (!isInterestingEditorModel(this._editor, this._userDataProfileService)) {
            this._disposeKeybindingWidgetRenderer();
            this._disposeKeybindingDecorationRenderer();
            return;
        }
        // Decorations are shown for the default keybindings.json **and** for the user keybindings.json
        this._createKeybindingDecorationRenderer();
        // The button to define keybindings is shown only for the user keybindings.json
        if (!this._editor.getOption(82 /* EditorOption.readOnly */)) {
            this._createKeybindingWidgetRenderer();
        }
        else {
            this._disposeKeybindingWidgetRenderer();
        }
    }
    _createKeybindingWidgetRenderer() {
        if (!this._keybindingWidgetRenderer) {
            this._keybindingWidgetRenderer = this._instantiationService.createInstance(KeybindingWidgetRenderer, this._editor);
        }
    }
    _disposeKeybindingWidgetRenderer() {
        if (this._keybindingWidgetRenderer) {
            this._keybindingWidgetRenderer.dispose();
            this._keybindingWidgetRenderer = undefined;
        }
    }
    _createKeybindingDecorationRenderer() {
        if (!this._keybindingDecorationRenderer) {
            this._keybindingDecorationRenderer = this._instantiationService.createInstance(KeybindingEditorDecorationsRenderer, this._editor);
        }
    }
    _disposeKeybindingDecorationRenderer() {
        if (this._keybindingDecorationRenderer) {
            this._keybindingDecorationRenderer.dispose();
            this._keybindingDecorationRenderer = undefined;
        }
    }
};
DefineKeybindingController = __decorate([
    __param(1, IInstantiationService),
    __param(2, IUserDataProfileService)
], DefineKeybindingController);
export { DefineKeybindingController };
let KeybindingWidgetRenderer = class KeybindingWidgetRenderer extends Disposable {
    _editor;
    _instantiationService;
    _launchWidget;
    _defineWidget;
    constructor(_editor, _instantiationService) {
        super();
        this._editor = _editor;
        this._instantiationService = _instantiationService;
        this._launchWidget = this._register(this._instantiationService.createInstance(FloatingClickWidget, this._editor, NLS_LAUNCH_MESSAGE, DefineKeybindingCommand.ID));
        this._register(this._launchWidget.onClick(() => this.showDefineKeybindingWidget()));
        this._defineWidget = this._register(this._instantiationService.createInstance(DefineKeybindingOverlayWidget, this._editor));
        this._launchWidget.render();
    }
    showDefineKeybindingWidget() {
        this._defineWidget.start().then(keybinding => this._onAccepted(keybinding));
    }
    _onAccepted(keybinding) {
        this._editor.focus();
        if (keybinding && this._editor.hasModel()) {
            const regexp = new RegExp(/\\/g);
            const backslash = regexp.test(keybinding);
            if (backslash) {
                keybinding = keybinding.slice(0, -1) + '\\\\';
            }
            let snippetText = [
                '{',
                '\t"key": ' + JSON.stringify(keybinding) + ',',
                '\t"command": "${1:commandId}",',
                '\t"when": "${2:editorTextFocus}"',
                '}$0'
            ].join('\n');
            const smartInsertInfo = SmartSnippetInserter.insertSnippet(this._editor.getModel(), this._editor.getPosition());
            snippetText = smartInsertInfo.prepend + snippetText + smartInsertInfo.append;
            this._editor.setPosition(smartInsertInfo.position);
            SnippetController2.get(this._editor)?.insert(snippetText, { overwriteBefore: 0, overwriteAfter: 0 });
        }
    }
};
KeybindingWidgetRenderer = __decorate([
    __param(1, IInstantiationService)
], KeybindingWidgetRenderer);
export { KeybindingWidgetRenderer };
let KeybindingEditorDecorationsRenderer = class KeybindingEditorDecorationsRenderer extends Disposable {
    _editor;
    _keybindingService;
    _updateDecorations;
    _dec = this._editor.createDecorationsCollection();
    constructor(_editor, _keybindingService) {
        super();
        this._editor = _editor;
        this._keybindingService = _keybindingService;
        this._updateDecorations = this._register(new RunOnceScheduler(() => this._updateDecorationsNow(), 500));
        const model = assertIsDefined(this._editor.getModel());
        this._register(model.onDidChangeContent(() => this._updateDecorations.schedule()));
        this._register(this._keybindingService.onDidUpdateKeybindings(() => this._updateDecorations.schedule()));
        this._register({
            dispose: () => {
                this._dec.clear();
                this._updateDecorations.cancel();
            }
        });
        this._updateDecorations.schedule();
    }
    _updateDecorationsNow() {
        const model = assertIsDefined(this._editor.getModel());
        const newDecorations = [];
        const root = parseTree(model.getValue());
        if (root && Array.isArray(root.children)) {
            for (let i = 0, len = root.children.length; i < len; i++) {
                const entry = root.children[i];
                const dec = this._getDecorationForEntry(model, entry);
                if (dec !== null) {
                    newDecorations.push(dec);
                }
            }
        }
        this._dec.set(newDecorations);
    }
    _getDecorationForEntry(model, entry) {
        if (!Array.isArray(entry.children)) {
            return null;
        }
        for (let i = 0, len = entry.children.length; i < len; i++) {
            const prop = entry.children[i];
            if (prop.type !== 'property') {
                continue;
            }
            if (!Array.isArray(prop.children) || prop.children.length !== 2) {
                continue;
            }
            const key = prop.children[0];
            if (key.value !== 'key') {
                continue;
            }
            const value = prop.children[1];
            if (value.type !== 'string') {
                continue;
            }
            const resolvedKeybindings = this._keybindingService.resolveUserBinding(value.value);
            if (resolvedKeybindings.length === 0) {
                return this._createDecoration(true, null, null, model, value);
            }
            const resolvedKeybinding = resolvedKeybindings[0];
            let usLabel = null;
            if (resolvedKeybinding instanceof WindowsNativeResolvedKeybinding) {
                usLabel = resolvedKeybinding.getUSLabel();
            }
            if (!resolvedKeybinding.isWYSIWYG()) {
                const uiLabel = resolvedKeybinding.getLabel();
                if (typeof uiLabel === 'string' && value.value.toLowerCase() === uiLabel.toLowerCase()) {
                    // coincidentally, this is actually WYSIWYG
                    return null;
                }
                return this._createDecoration(false, resolvedKeybinding.getLabel(), usLabel, model, value);
            }
            if (/abnt_|oem_/.test(value.value)) {
                return this._createDecoration(false, resolvedKeybinding.getLabel(), usLabel, model, value);
            }
            const expectedUserSettingsLabel = resolvedKeybinding.getUserSettingsLabel();
            if (typeof expectedUserSettingsLabel === 'string' && !KeybindingEditorDecorationsRenderer._userSettingsFuzzyEquals(value.value, expectedUserSettingsLabel)) {
                return this._createDecoration(false, resolvedKeybinding.getLabel(), usLabel, model, value);
            }
            return null;
        }
        return null;
    }
    static _userSettingsFuzzyEquals(a, b) {
        a = a.trim().toLowerCase();
        b = b.trim().toLowerCase();
        if (a === b) {
            return true;
        }
        const aParts = KeybindingParser.parseUserBinding(a);
        const bParts = KeybindingParser.parseUserBinding(b);
        return equals(aParts, bParts, (a, b) => this._userBindingEquals(a, b));
    }
    static _userBindingEquals(a, b) {
        if (a === null && b === null) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        if (a instanceof SimpleKeybinding && b instanceof SimpleKeybinding) {
            return a.equals(b);
        }
        if (a instanceof ScanCodeBinding && b instanceof ScanCodeBinding) {
            return a.equals(b);
        }
        return false;
    }
    _createDecoration(isError, uiLabel, usLabel, model, keyNode) {
        let msg;
        let className;
        let overviewRulerColor;
        if (isError) {
            // this is the error case
            msg = new MarkdownString().appendText(NLS_KB_LAYOUT_ERROR_MESSAGE);
            className = 'keybindingError';
            overviewRulerColor = themeColorFromId(overviewRulerError);
        }
        else {
            // this is the info case
            if (usLabel && uiLabel !== usLabel) {
                msg = new MarkdownString(nls.localize({
                    key: 'defineKeybinding.kbLayoutLocalAndUSMessage',
                    comment: [
                        'Please translate maintaining the stars (*) around the placeholders such that they will be rendered in bold.',
                        'The placeholders will contain a keyboard combination e.g. Ctrl+Shift+/'
                    ]
                }, "**{0}** for your current keyboard layout (**{1}** for US standard).", uiLabel, usLabel));
            }
            else {
                msg = new MarkdownString(nls.localize({
                    key: 'defineKeybinding.kbLayoutLocalMessage',
                    comment: [
                        'Please translate maintaining the stars (*) around the placeholder such that it will be rendered in bold.',
                        'The placeholder will contain a keyboard combination e.g. Ctrl+Shift+/'
                    ]
                }, "**{0}** for your current keyboard layout.", uiLabel));
            }
            className = 'keybindingInfo';
            overviewRulerColor = themeColorFromId(overviewRulerInfo);
        }
        const startPosition = model.getPositionAt(keyNode.offset);
        const endPosition = model.getPositionAt(keyNode.offset + keyNode.length);
        const range = new Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
        // icon + highlight + message decoration
        return {
            range: range,
            options: {
                description: 'keybindings-widget',
                stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
                className: className,
                hoverMessage: msg,
                overviewRuler: {
                    color: overviewRulerColor,
                    position: OverviewRulerLane.Right
                }
            }
        };
    }
};
KeybindingEditorDecorationsRenderer = __decorate([
    __param(1, IKeybindingService)
], KeybindingEditorDecorationsRenderer);
export { KeybindingEditorDecorationsRenderer };
class DefineKeybindingCommand extends EditorCommand {
    static ID = 'editor.action.defineKeybinding';
    constructor() {
        super({
            id: DefineKeybindingCommand.ID,
            precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.languageId.isEqualTo('jsonc')),
            kbOpts: {
                kbExpr: EditorContextKeys.editorTextFocus,
                primary: KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */),
                weight: 100 /* KeybindingWeight.EditorContrib */
            }
        });
    }
    runEditorCommand(accessor, editor) {
        if (!isInterestingEditorModel(editor, accessor.get(IUserDataProfileService)) || editor.getOption(82 /* EditorOption.readOnly */)) {
            return;
        }
        const controller = DefineKeybindingController.get(editor);
        if (controller && controller.keybindingWidgetRenderer) {
            controller.keybindingWidgetRenderer.showDefineKeybindingWidget();
        }
    }
}
function isInterestingEditorModel(editor, userDataProfileService) {
    const model = editor.getModel();
    if (!model) {
        return false;
    }
    return isEqual(model.uri, userDataProfileService.currentProfile.keybindingsResource);
}
registerEditorContribution(DefineKeybindingController.ID, DefineKeybindingController);
registerEditorCommand(new DefineKeybindingCommand());
