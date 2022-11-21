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
import { KeyChord } from 'vs/base/common/keyCodes';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { EditorAction, registerEditorAction, registerEditorContribution } from 'vs/editor/browser/editorExtensions';
import { Range } from 'vs/editor/common/core/range';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { GotoDefinitionAtPositionEditorContribution } from 'vs/editor/contrib/gotoSymbol/browser/link/goToDefinitionAtPosition';
import { ContentHoverWidget, ContentHoverController } from 'vs/editor/contrib/hover/browser/contentHover';
import { MarginHoverWidget } from 'vs/editor/contrib/hover/browser/marginHover';
import * as nls from 'vs/nls';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { editorHoverBorder } from 'vs/platform/theme/common/colorRegistry';
import { registerThemingParticipant } from 'vs/platform/theme/common/themeService';
import { HoverParticipantRegistry } from 'vs/editor/contrib/hover/browser/hoverTypes';
import { MarkdownHoverParticipant } from 'vs/editor/contrib/hover/browser/markdownHoverParticipant';
import { MarkerHoverParticipant } from 'vs/editor/contrib/hover/browser/markerHoverParticipant';
import 'vs/css!./hover';
let ModesHoverController = class ModesHoverController {
    _editor;
    _instantiationService;
    _openerService;
    _languageService;
    static ID = 'editor.contrib.hover';
    _toUnhook = new DisposableStore();
    _didChangeConfigurationHandler;
    _contentWidget;
    _glyphWidget;
    _isMouseDown;
    _hoverClicked;
    _isHoverEnabled;
    _isHoverSticky;
    static get(editor) {
        return editor.getContribution(ModesHoverController.ID);
    }
    constructor(_editor, _instantiationService, _openerService, _languageService, _contextKeyService) {
        this._editor = _editor;
        this._instantiationService = _instantiationService;
        this._openerService = _openerService;
        this._languageService = _languageService;
        this._isMouseDown = false;
        this._hoverClicked = false;
        this._contentWidget = null;
        this._glyphWidget = null;
        this._hookEvents();
        this._didChangeConfigurationHandler = this._editor.onDidChangeConfiguration((e) => {
            if (e.hasChanged(54 /* EditorOption.hover */)) {
                this._unhookEvents();
                this._hookEvents();
            }
        });
    }
    _hookEvents() {
        const hideWidgetsEventHandler = () => this._hideWidgets();
        const hoverOpts = this._editor.getOption(54 /* EditorOption.hover */);
        this._isHoverEnabled = hoverOpts.enabled;
        this._isHoverSticky = hoverOpts.sticky;
        if (this._isHoverEnabled) {
            this._toUnhook.add(this._editor.onMouseDown((e) => this._onEditorMouseDown(e)));
            this._toUnhook.add(this._editor.onMouseUp((e) => this._onEditorMouseUp(e)));
            this._toUnhook.add(this._editor.onMouseMove((e) => this._onEditorMouseMove(e)));
            this._toUnhook.add(this._editor.onKeyDown((e) => this._onKeyDown(e)));
        }
        else {
            this._toUnhook.add(this._editor.onMouseMove((e) => this._onEditorMouseMove(e)));
            this._toUnhook.add(this._editor.onKeyDown((e) => this._onKeyDown(e)));
        }
        this._toUnhook.add(this._editor.onMouseLeave((e) => this._onEditorMouseLeave(e)));
        this._toUnhook.add(this._editor.onDidChangeModel(hideWidgetsEventHandler));
        this._toUnhook.add(this._editor.onDidScrollChange((e) => this._onEditorScrollChanged(e)));
    }
    _unhookEvents() {
        this._toUnhook.clear();
    }
    _onEditorScrollChanged(e) {
        if (e.scrollTopChanged || e.scrollLeftChanged) {
            this._hideWidgets();
        }
    }
    _onEditorMouseDown(mouseEvent) {
        this._isMouseDown = true;
        const target = mouseEvent.target;
        if (target.type === 9 /* MouseTargetType.CONTENT_WIDGET */ && target.detail === ContentHoverWidget.ID) {
            this._hoverClicked = true;
            // mouse down on top of content hover widget
            return;
        }
        if (target.type === 12 /* MouseTargetType.OVERLAY_WIDGET */ && target.detail === MarginHoverWidget.ID) {
            // mouse down on top of overlay hover widget
            return;
        }
        if (target.type !== 12 /* MouseTargetType.OVERLAY_WIDGET */) {
            this._hoverClicked = false;
        }
        this._hideWidgets();
    }
    _onEditorMouseUp(mouseEvent) {
        this._isMouseDown = false;
    }
    _onEditorMouseLeave(mouseEvent) {
        const targetEm = (mouseEvent.event.browserEvent.relatedTarget);
        if (this._contentWidget?.containsNode(targetEm)) {
            // when the mouse is inside hover widget
            return;
        }
        this._hideWidgets();
    }
    _onEditorMouseMove(mouseEvent) {
        const target = mouseEvent.target;
        if (this._isMouseDown && this._hoverClicked) {
            return;
        }
        if (this._isHoverSticky && target.type === 9 /* MouseTargetType.CONTENT_WIDGET */ && target.detail === ContentHoverWidget.ID) {
            // mouse moved on top of content hover widget
            return;
        }
        if (this._isHoverSticky && !mouseEvent.event.browserEvent.view?.getSelection()?.isCollapsed) {
            // selected text within content hover widget
            return;
        }
        if (!this._isHoverSticky && target.type === 9 /* MouseTargetType.CONTENT_WIDGET */ && target.detail === ContentHoverWidget.ID
            && this._contentWidget?.isColorPickerVisible()) {
            // though the hover is not sticky, the color picker needs to.
            return;
        }
        if (this._isHoverSticky && target.type === 12 /* MouseTargetType.OVERLAY_WIDGET */ && target.detail === MarginHoverWidget.ID) {
            // mouse moved on top of overlay hover widget
            return;
        }
        if (!this._isHoverEnabled) {
            this._hideWidgets();
            return;
        }
        const contentWidget = this._getOrCreateContentWidget();
        if (this._isHoverSticky && contentWidget.isVisibleFromKeyboard()) {
            // Sticky mode is on and the hover has been shown via keyboard
            // so moving the mouse has no effect
            return;
        }
        if (contentWidget.maybeShowAt(mouseEvent)) {
            this._glyphWidget?.hide();
            return;
        }
        if (target.type === 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */ && target.position) {
            this._contentWidget?.hide();
            if (!this._glyphWidget) {
                this._glyphWidget = new MarginHoverWidget(this._editor, this._languageService, this._openerService);
            }
            this._glyphWidget.startShowingAt(target.position.lineNumber);
            return;
        }
        this._hideWidgets();
    }
    _onKeyDown(e) {
        if (e.keyCode !== 5 /* KeyCode.Ctrl */ && e.keyCode !== 6 /* KeyCode.Alt */ && e.keyCode !== 57 /* KeyCode.Meta */ && e.keyCode !== 4 /* KeyCode.Shift */) {
            // Do not hide hover when a modifier key is pressed
            this._hideWidgets();
        }
    }
    _hideWidgets() {
        if ((this._isMouseDown && this._hoverClicked && this._contentWidget?.isColorPickerVisible())) {
            return;
        }
        this._hoverClicked = false;
        this._glyphWidget?.hide();
        this._contentWidget?.hide();
    }
    _getOrCreateContentWidget() {
        if (!this._contentWidget) {
            this._contentWidget = this._instantiationService.createInstance(ContentHoverController, this._editor);
        }
        return this._contentWidget;
    }
    isColorPickerVisible() {
        return this._contentWidget?.isColorPickerVisible() || false;
    }
    showContentHover(range, mode, source, focus) {
        this._getOrCreateContentWidget().startShowingAtRange(range, mode, source, focus);
    }
    dispose() {
        this._unhookEvents();
        this._toUnhook.dispose();
        this._didChangeConfigurationHandler.dispose();
        this._glyphWidget?.dispose();
        this._contentWidget?.dispose();
    }
};
ModesHoverController = __decorate([
    __param(1, IInstantiationService),
    __param(2, IOpenerService),
    __param(3, ILanguageService),
    __param(4, IContextKeyService)
], ModesHoverController);
export { ModesHoverController };
class ShowHoverAction extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.showHover',
            label: nls.localize({
                key: 'showHover',
                comment: [
                    'Label for action that will trigger the showing of a hover in the editor.',
                    'This allows for users to show the hover without using the mouse.'
                ]
            }, "Show Hover"),
            alias: 'Show Hover',
            precondition: undefined,
            kbOpts: {
                kbExpr: EditorContextKeys.editorTextFocus,
                primary: KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */),
                weight: 100 /* KeybindingWeight.EditorContrib */
            }
        });
    }
    run(accessor, editor) {
        if (!editor.hasModel()) {
            return;
        }
        const controller = ModesHoverController.get(editor);
        if (!controller) {
            return;
        }
        const position = editor.getPosition();
        const range = new Range(position.lineNumber, position.column, position.lineNumber, position.column);
        const focus = editor.getOption(2 /* EditorOption.accessibilitySupport */) === 2 /* AccessibilitySupport.Enabled */;
        controller.showContentHover(range, 1 /* HoverStartMode.Immediate */, 1 /* HoverStartSource.Keyboard */, focus);
    }
}
class ShowDefinitionPreviewHoverAction extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.showDefinitionPreviewHover',
            label: nls.localize({
                key: 'showDefinitionPreviewHover',
                comment: [
                    'Label for action that will trigger the showing of definition preview hover in the editor.',
                    'This allows for users to show the definition preview hover without using the mouse.'
                ]
            }, "Show Definition Preview Hover"),
            alias: 'Show Definition Preview Hover',
            precondition: undefined
        });
    }
    run(accessor, editor) {
        const controller = ModesHoverController.get(editor);
        if (!controller) {
            return;
        }
        const position = editor.getPosition();
        if (!position) {
            return;
        }
        const range = new Range(position.lineNumber, position.column, position.lineNumber, position.column);
        const goto = GotoDefinitionAtPositionEditorContribution.get(editor);
        if (!goto) {
            return;
        }
        const promise = goto.startFindDefinitionFromCursor(position);
        promise.then(() => {
            controller.showContentHover(range, 1 /* HoverStartMode.Immediate */, 1 /* HoverStartSource.Keyboard */, true);
        });
    }
}
registerEditorContribution(ModesHoverController.ID, ModesHoverController);
registerEditorAction(ShowHoverAction);
registerEditorAction(ShowDefinitionPreviewHoverAction);
HoverParticipantRegistry.register(MarkdownHoverParticipant);
HoverParticipantRegistry.register(MarkerHoverParticipant);
// theming
registerThemingParticipant((theme, collector) => {
    const hoverBorder = theme.getColor(editorHoverBorder);
    if (hoverBorder) {
        collector.addRule(`.monaco-editor .monaco-hover .hover-row:not(:first-child):not(:empty) { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
        collector.addRule(`.monaco-editor .monaco-hover hr { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
        collector.addRule(`.monaco-editor .monaco-hover hr { border-bottom: 0px solid ${hoverBorder.transparent(0.5)}; }`);
    }
});
