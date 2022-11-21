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
import { Widget } from 'vs/base/browser/ui/widget';
import { isCodeEditor, isCompositeEditor } from 'vs/editor/browser/editorBrowser';
import { Emitter } from 'vs/base/common/event';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { $, append, clearNode } from 'vs/base/browser/dom';
import { attachStylerCallback } from 'vs/platform/theme/common/styler';
import { buttonBackground, buttonForeground, editorBackground, editorForeground, contrastBorder } from 'vs/platform/theme/common/colorRegistry';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { isEqual } from 'vs/base/common/resources';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ModelDecorationOptions } from 'vs/editor/common/model/textModel';
import { IMenuService, MenuId } from 'vs/platform/actions/common/actions';
import { createAndFillInActionBarActions } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { EmbeddedCodeEditorWidget } from 'vs/editor/browser/widget/embeddedCodeEditorWidget';
let RangeHighlightDecorations = class RangeHighlightDecorations extends Disposable {
    editorService;
    _onHighlightRemoved = this._register(new Emitter());
    onHighlightRemoved = this._onHighlightRemoved.event;
    rangeHighlightDecorationId = null;
    editor = null;
    editorDisposables = this._register(new DisposableStore());
    constructor(editorService) {
        super();
        this.editorService = editorService;
    }
    removeHighlightRange() {
        if (this.editor && this.rangeHighlightDecorationId) {
            const decorationId = this.rangeHighlightDecorationId;
            this.editor.changeDecorations((accessor) => {
                accessor.removeDecoration(decorationId);
            });
            this._onHighlightRemoved.fire();
        }
        this.rangeHighlightDecorationId = null;
    }
    highlightRange(range, editor) {
        editor = editor ?? this.getEditor(range);
        if (isCodeEditor(editor)) {
            this.doHighlightRange(editor, range);
        }
        else if (isCompositeEditor(editor) && isCodeEditor(editor.activeCodeEditor)) {
            this.doHighlightRange(editor.activeCodeEditor, range);
        }
    }
    doHighlightRange(editor, selectionRange) {
        this.removeHighlightRange();
        editor.changeDecorations((changeAccessor) => {
            this.rangeHighlightDecorationId = changeAccessor.addDecoration(selectionRange.range, this.createRangeHighlightDecoration(selectionRange.isWholeLine));
        });
        this.setEditor(editor);
    }
    getEditor(resourceRange) {
        const resource = this.editorService.activeEditor?.resource;
        if (resource && isEqual(resource, resourceRange.resource) && isCodeEditor(this.editorService.activeTextEditorControl)) {
            return this.editorService.activeTextEditorControl;
        }
        return undefined;
    }
    setEditor(editor) {
        if (this.editor !== editor) {
            this.editorDisposables.clear();
            this.editor = editor;
            this.editorDisposables.add(this.editor.onDidChangeCursorPosition((e) => {
                if (e.reason === 0 /* CursorChangeReason.NotSet */
                    || e.reason === 3 /* CursorChangeReason.Explicit */
                    || e.reason === 5 /* CursorChangeReason.Undo */
                    || e.reason === 6 /* CursorChangeReason.Redo */) {
                    this.removeHighlightRange();
                }
            }));
            this.editorDisposables.add(this.editor.onDidChangeModel(() => { this.removeHighlightRange(); }));
            this.editorDisposables.add(this.editor.onDidDispose(() => {
                this.removeHighlightRange();
                this.editor = null;
            }));
        }
    }
    static _WHOLE_LINE_RANGE_HIGHLIGHT = ModelDecorationOptions.register({
        description: 'codeeditor-range-highlight-whole',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        className: 'rangeHighlight',
        isWholeLine: true
    });
    static _RANGE_HIGHLIGHT = ModelDecorationOptions.register({
        description: 'codeeditor-range-highlight',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        className: 'rangeHighlight'
    });
    createRangeHighlightDecoration(isWholeLine = true) {
        return (isWholeLine ? RangeHighlightDecorations._WHOLE_LINE_RANGE_HIGHLIGHT : RangeHighlightDecorations._RANGE_HIGHLIGHT);
    }
    dispose() {
        super.dispose();
        if (this.editor?.getModel()) {
            this.removeHighlightRange();
            this.editor = null;
        }
    }
};
RangeHighlightDecorations = __decorate([
    __param(0, IEditorService)
], RangeHighlightDecorations);
export { RangeHighlightDecorations };
let FloatingClickWidget = class FloatingClickWidget extends Widget {
    editor;
    label;
    themeService;
    _onClick = this._register(new Emitter());
    onClick = this._onClick.event;
    _domNode;
    constructor(editor, label, keyBindingAction, keybindingService, themeService) {
        super();
        this.editor = editor;
        this.label = label;
        this.themeService = themeService;
        this._domNode = $('.floating-click-widget');
        this._domNode.style.padding = '6px 11px';
        this._domNode.style.borderRadius = '2px';
        this._domNode.style.cursor = 'pointer';
        if (keyBindingAction) {
            const keybinding = keybindingService.lookupKeybinding(keyBindingAction);
            if (keybinding) {
                this.label += ` (${keybinding.getLabel()})`;
            }
        }
    }
    getId() {
        return 'editor.overlayWidget.floatingClickWidget';
    }
    getDomNode() {
        return this._domNode;
    }
    getPosition() {
        return {
            preference: 1 /* OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER */
        };
    }
    render() {
        clearNode(this._domNode);
        this._register(attachStylerCallback(this.themeService, { buttonBackground, buttonForeground, editorBackground, editorForeground, contrastBorder }, colors => {
            const backgroundColor = colors.buttonBackground ? colors.buttonBackground : colors.editorBackground;
            if (backgroundColor) {
                this._domNode.style.backgroundColor = backgroundColor.toString();
            }
            const foregroundColor = colors.buttonForeground ? colors.buttonForeground : colors.editorForeground;
            if (foregroundColor) {
                this._domNode.style.color = foregroundColor.toString();
            }
            const borderColor = colors.contrastBorder ? colors.contrastBorder.toString() : '';
            this._domNode.style.borderWidth = borderColor ? '1px' : '';
            this._domNode.style.borderStyle = borderColor ? 'solid' : '';
            this._domNode.style.borderColor = borderColor;
        }));
        append(this._domNode, $('')).textContent = this.label;
        this.onclick(this._domNode, e => this._onClick.fire());
        this.editor.addOverlayWidget(this);
    }
    dispose() {
        this.editor.removeOverlayWidget(this);
        super.dispose();
    }
};
FloatingClickWidget = __decorate([
    __param(3, IKeybindingService),
    __param(4, IThemeService)
], FloatingClickWidget);
export { FloatingClickWidget };
let FloatingClickMenu = class FloatingClickMenu extends Disposable {
    static ID = 'editor.contrib.floatingClickMenu';
    constructor(editor, instantiationService, menuService, contextKeyService) {
        super();
        // DISABLED for embedded editors. In the future we can use a different MenuId for embedded editors
        if (!(editor instanceof EmbeddedCodeEditorWidget)) {
            const menu = menuService.createMenu(MenuId.EditorContent, contextKeyService);
            const menuDisposables = new DisposableStore();
            const renderMenuAsFloatingClickBtn = () => {
                menuDisposables.clear();
                if (!editor.hasModel() || editor.getOption(55 /* EditorOption.inDiffEditor */)) {
                    return;
                }
                const actions = [];
                createAndFillInActionBarActions(menu, { renderShortTitle: true, shouldForwardArgs: true }, actions);
                if (actions.length === 0) {
                    return;
                }
                // todo@jrieken find a way to handle N actions, like showing a context menu
                const [first] = actions;
                const widget = instantiationService.createInstance(FloatingClickWidget, editor, first.label, first.id);
                menuDisposables.add(widget);
                menuDisposables.add(widget.onClick(() => first.run(editor.getModel().uri)));
                widget.render();
            };
            this._store.add(menu);
            this._store.add(menuDisposables);
            this._store.add(menu.onDidChange(renderMenuAsFloatingClickBtn));
            renderMenuAsFloatingClickBtn();
        }
    }
};
FloatingClickMenu = __decorate([
    __param(1, IInstantiationService),
    __param(2, IMenuService),
    __param(3, IContextKeyService)
], FloatingClickMenu);
export { FloatingClickMenu };
