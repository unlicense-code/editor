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
import 'vs/css!./media/dirtydiffDecorator';
import { ThrottledDelayer, first } from 'vs/base/common/async';
import { dispose, toDisposable, Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { Event, Emitter } from 'vs/base/common/event';
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorker';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ISCMService } from 'vs/workbench/contrib/scm/common/scm';
import { ModelDecorationOptions } from 'vs/editor/common/model/textModel';
import { themeColorFromId, IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { editorErrorForeground, registerColor, transparent } from 'vs/platform/theme/common/colorRegistry';
import { registerEditorAction, registerEditorContribution, EditorAction } from 'vs/editor/browser/editorExtensions';
import { PeekViewWidget, getOuterEditor, peekViewBorder, peekViewTitleBackground, peekViewTitleForeground, peekViewTitleInfoForeground } from 'vs/editor/contrib/peekView/browser/peekView';
import { IContextKeyService, ContextKeyExpr, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import { Position } from 'vs/editor/common/core/position';
import { rot } from 'vs/base/common/numbers';
import { KeybindingsRegistry } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { EmbeddedDiffEditorWidget } from 'vs/editor/browser/widget/embeddedCodeEditorWidget';
import { Action, ActionRunner } from 'vs/base/common/actions';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { basename, isEqualOrParent } from 'vs/base/common/resources';
import { MenuId, IMenuService, MenuItemAction, MenuRegistry } from 'vs/platform/actions/common/actions';
import { createAndFillInActionBarActions } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { OverviewRulerLane, MinimapPosition } from 'vs/editor/common/model';
import { sortedDiff } from 'vs/base/common/arrays';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { createStyleSheet } from 'vs/base/browser/dom';
import { ITextFileService, isTextFileEditorModel } from 'vs/workbench/services/textfile/common/textfiles';
import { gotoNextLocation, gotoPreviousLocation } from 'vs/platform/theme/common/iconRegistry';
import { Codicon } from 'vs/base/common/codicons';
import { onUnexpectedError } from 'vs/base/common/errors';
import { TextCompareEditorActiveContext } from 'vs/workbench/common/contextkeys';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { Color } from 'vs/base/common/color';
import { Iterable } from 'vs/base/common/iterator';
class DiffActionRunner extends ActionRunner {
    runAction(action, context) {
        if (action instanceof MenuItemAction) {
            return action.run(...context);
        }
        return super.runAction(action, context);
    }
}
export const isDirtyDiffVisible = new RawContextKey('dirtyDiffVisible', false);
function getChangeHeight(change) {
    const modified = change.modifiedEndLineNumber - change.modifiedStartLineNumber + 1;
    const original = change.originalEndLineNumber - change.originalStartLineNumber + 1;
    if (change.originalEndLineNumber === 0) {
        return modified;
    }
    else if (change.modifiedEndLineNumber === 0) {
        return original;
    }
    else {
        return modified + original;
    }
}
function getModifiedEndLineNumber(change) {
    if (change.modifiedEndLineNumber === 0) {
        return change.modifiedStartLineNumber === 0 ? 1 : change.modifiedStartLineNumber;
    }
    else {
        return change.modifiedEndLineNumber;
    }
}
function lineIntersectsChange(lineNumber, change) {
    // deletion at the beginning of the file
    if (lineNumber === 1 && change.modifiedStartLineNumber === 0 && change.modifiedEndLineNumber === 0) {
        return true;
    }
    return lineNumber >= change.modifiedStartLineNumber && lineNumber <= (change.modifiedEndLineNumber || change.modifiedStartLineNumber);
}
let UIEditorAction = class UIEditorAction extends Action {
    editor;
    action;
    instantiationService;
    constructor(editor, action, cssClass, keybindingService, instantiationService) {
        const keybinding = keybindingService.lookupKeybinding(action.id);
        const label = action.label + (keybinding ? ` (${keybinding.getLabel()})` : '');
        super(action.id, label, cssClass);
        this.instantiationService = instantiationService;
        this.action = action;
        this.editor = editor;
    }
    run() {
        return Promise.resolve(this.instantiationService.invokeFunction(accessor => this.action.run(accessor, this.editor, null)));
    }
};
UIEditorAction = __decorate([
    __param(3, IKeybindingService),
    __param(4, IInstantiationService)
], UIEditorAction);
var ChangeType;
(function (ChangeType) {
    ChangeType[ChangeType["Modify"] = 0] = "Modify";
    ChangeType[ChangeType["Add"] = 1] = "Add";
    ChangeType[ChangeType["Delete"] = 2] = "Delete";
})(ChangeType || (ChangeType = {}));
function getChangeType(change) {
    if (change.originalEndLineNumber === 0) {
        return ChangeType.Add;
    }
    else if (change.modifiedEndLineNumber === 0) {
        return ChangeType.Delete;
    }
    else {
        return ChangeType.Modify;
    }
}
function getChangeTypeColor(theme, changeType) {
    switch (changeType) {
        case ChangeType.Modify: return theme.getColor(editorGutterModifiedBackground);
        case ChangeType.Add: return theme.getColor(editorGutterAddedBackground);
        case ChangeType.Delete: return theme.getColor(editorGutterDeletedBackground);
    }
}
function getOuterEditorFromDiffEditor(accessor) {
    const diffEditors = accessor.get(ICodeEditorService).listDiffEditors();
    for (const diffEditor of diffEditors) {
        if (diffEditor.hasTextFocus() && diffEditor instanceof EmbeddedDiffEditorWidget) {
            return diffEditor.getParentEditor();
        }
    }
    return getOuterEditor(accessor);
}
let DirtyDiffWidget = class DirtyDiffWidget extends PeekViewWidget {
    model;
    themeService;
    diffEditor;
    title;
    menu;
    index = 0;
    change;
    height = undefined;
    constructor(editor, model, themeService, instantiationService, menuService, contextKeyService) {
        super(editor, { isResizeable: true, frameWidth: 1, keepEditorSelection: true }, instantiationService);
        this.model = model;
        this.themeService = themeService;
        this._disposables.add(themeService.onDidColorThemeChange(this._applyTheme, this));
        this._applyTheme(themeService.getColorTheme());
        if (this.model.original) {
            contextKeyService = contextKeyService.createOverlay([['originalResourceScheme', this.model.original.uri.scheme]]);
        }
        this.menu = menuService.createMenu(MenuId.SCMChangeContext, contextKeyService);
        this._disposables.add(this.menu);
        this.create();
        if (editor.hasModel()) {
            this.title = basename(editor.getModel().uri);
        }
        else {
            this.title = '';
        }
        this.setTitle(this.title);
        this._disposables.add(model.onDidChange(this.renderTitle, this));
    }
    showChange(index) {
        const change = this.model.changes[index];
        this.index = index;
        this.change = change;
        const originalModel = this.model.original;
        if (!originalModel) {
            return;
        }
        const onFirstDiffUpdate = Event.once(this.diffEditor.onDidUpdateDiff);
        // TODO@joao TODO@alex need this setTimeout probably because the
        // non-side-by-side diff still hasn't created the view zones
        onFirstDiffUpdate(() => setTimeout(() => this.revealChange(change), 0));
        this.diffEditor.setModel(this.model);
        const position = new Position(getModifiedEndLineNumber(change), 1);
        const lineHeight = this.editor.getOption(60 /* EditorOption.lineHeight */);
        const editorHeight = this.editor.getLayoutInfo().height;
        const editorHeightInLines = Math.floor(editorHeight / lineHeight);
        const height = Math.min(getChangeHeight(change) + /* padding */ 8, Math.floor(editorHeightInLines / 3));
        this.renderTitle();
        const changeType = getChangeType(change);
        const changeTypeColor = getChangeTypeColor(this.themeService.getColorTheme(), changeType);
        this.style({ frameColor: changeTypeColor, arrowColor: changeTypeColor });
        this._actionbarWidget.context = [this.model.modified.uri, this.model.changes, index];
        this.show(position, height);
        this.editor.focus();
    }
    renderTitle() {
        const detail = this.model.changes.length > 1
            ? nls.localize('changes', "{0} of {1} changes", this.index + 1, this.model.changes.length)
            : nls.localize('change', "{0} of {1} change", this.index + 1, this.model.changes.length);
        this.setTitle(this.title, detail);
    }
    _fillHead(container) {
        super._fillHead(container, true);
        const previous = this.instantiationService.createInstance(UIEditorAction, this.editor, new ShowPreviousChangeAction(), ThemeIcon.asClassName(gotoPreviousLocation));
        const next = this.instantiationService.createInstance(UIEditorAction, this.editor, new ShowNextChangeAction(), ThemeIcon.asClassName(gotoNextLocation));
        this._disposables.add(previous);
        this._disposables.add(next);
        const actions = [];
        createAndFillInActionBarActions(this.menu, { shouldForwardArgs: true }, actions);
        this._actionbarWidget.push(actions.reverse(), { label: false, icon: true });
        this._actionbarWidget.push([next, previous], { label: false, icon: true });
        this._actionbarWidget.push(new Action('peekview.close', nls.localize('label.close', "Close"), Codicon.close.classNames, true, () => this.dispose()), { label: false, icon: true });
    }
    _getActionBarOptions() {
        const actionRunner = new DiffActionRunner();
        // close widget on successful action
        actionRunner.onDidRun(e => {
            if (!(e.action instanceof UIEditorAction) && !e.error) {
                this.dispose();
            }
        });
        return {
            ...super._getActionBarOptions(),
            actionRunner
        };
    }
    _fillBody(container) {
        const options = {
            scrollBeyondLastLine: true,
            scrollbar: {
                verticalScrollbarSize: 14,
                horizontal: 'auto',
                useShadows: true,
                verticalHasArrows: false,
                horizontalHasArrows: false
            },
            overviewRulerLanes: 2,
            fixedOverflowWidgets: true,
            minimap: { enabled: false },
            renderSideBySide: false,
            readOnly: false,
            renderIndicators: false,
            diffAlgorithm: 'smart',
        };
        this.diffEditor = this.instantiationService.createInstance(EmbeddedDiffEditorWidget, container, options, this.editor);
        this._disposables.add(this.diffEditor);
    }
    _onWidth(width) {
        if (typeof this.height === 'undefined') {
            return;
        }
        this.diffEditor.layout({ height: this.height, width });
    }
    _doLayoutBody(height, width) {
        super._doLayoutBody(height, width);
        this.diffEditor.layout({ height, width });
        if (typeof this.height === 'undefined' && this.change) {
            this.revealChange(this.change);
        }
        this.height = height;
    }
    revealChange(change) {
        let start, end;
        if (change.modifiedEndLineNumber === 0) { // deletion
            start = change.modifiedStartLineNumber;
            end = change.modifiedStartLineNumber + 1;
        }
        else if (change.originalEndLineNumber > 0) { // modification
            start = change.modifiedStartLineNumber - 1;
            end = change.modifiedEndLineNumber + 1;
        }
        else { // insertion
            start = change.modifiedStartLineNumber;
            end = change.modifiedEndLineNumber;
        }
        this.diffEditor.revealLinesInCenter(start, end, 1 /* ScrollType.Immediate */);
    }
    _applyTheme(theme) {
        const borderColor = theme.getColor(peekViewBorder) || Color.transparent;
        this.style({
            arrowColor: borderColor,
            frameColor: borderColor,
            headerBackgroundColor: theme.getColor(peekViewTitleBackground) || Color.transparent,
            primaryHeadingColor: theme.getColor(peekViewTitleForeground),
            secondaryHeadingColor: theme.getColor(peekViewTitleInfoForeground)
        });
    }
    revealLine(lineNumber) {
        this.editor.revealLineInCenterIfOutsideViewport(lineNumber, 0 /* ScrollType.Smooth */);
    }
    hasFocus() {
        return this.diffEditor.hasTextFocus();
    }
};
DirtyDiffWidget = __decorate([
    __param(2, IThemeService),
    __param(3, IInstantiationService),
    __param(4, IMenuService),
    __param(5, IContextKeyService)
], DirtyDiffWidget);
export class ShowPreviousChangeAction extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.dirtydiff.previous',
            label: nls.localize('show previous change', "Show Previous Change"),
            alias: 'Show Previous Change',
            precondition: TextCompareEditorActiveContext.toNegated(),
            kbOpts: { kbExpr: EditorContextKeys.editorTextFocus, primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 61 /* KeyCode.F3 */, weight: 100 /* KeybindingWeight.EditorContrib */ }
        });
    }
    run(accessor, editor) {
        const outerEditor = getOuterEditorFromDiffEditor(accessor);
        if (!outerEditor) {
            return;
        }
        const controller = DirtyDiffController.get(outerEditor);
        if (!controller) {
            return;
        }
        if (!controller.canNavigate()) {
            return;
        }
        controller.previous();
    }
}
registerEditorAction(ShowPreviousChangeAction);
export class ShowNextChangeAction extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.dirtydiff.next',
            label: nls.localize('show next change', "Show Next Change"),
            alias: 'Show Next Change',
            precondition: TextCompareEditorActiveContext.toNegated(),
            kbOpts: { kbExpr: EditorContextKeys.editorTextFocus, primary: 512 /* KeyMod.Alt */ | 61 /* KeyCode.F3 */, weight: 100 /* KeybindingWeight.EditorContrib */ }
        });
    }
    run(accessor, editor) {
        const outerEditor = getOuterEditorFromDiffEditor(accessor);
        if (!outerEditor) {
            return;
        }
        const controller = DirtyDiffController.get(outerEditor);
        if (!controller) {
            return;
        }
        if (!controller.canNavigate()) {
            return;
        }
        controller.next();
    }
}
registerEditorAction(ShowNextChangeAction);
// Go to menu
MenuRegistry.appendMenuItem(MenuId.MenubarGoMenu, {
    group: '7_change_nav',
    command: {
        id: 'editor.action.dirtydiff.next',
        title: nls.localize({ key: 'miGotoNextChange', comment: ['&& denotes a mnemonic'] }, "Next &&Change")
    },
    order: 1
});
MenuRegistry.appendMenuItem(MenuId.MenubarGoMenu, {
    group: '7_change_nav',
    command: {
        id: 'editor.action.dirtydiff.previous',
        title: nls.localize({ key: 'miGotoPreviousChange', comment: ['&& denotes a mnemonic'] }, "Previous &&Change")
    },
    order: 2
});
export class GotoPreviousChangeAction extends EditorAction {
    constructor() {
        super({
            id: 'workbench.action.editor.previousChange',
            label: nls.localize('move to previous change', "Go to Previous Change"),
            alias: 'Go to Previous Change',
            precondition: TextCompareEditorActiveContext.toNegated(),
            kbOpts: { kbExpr: EditorContextKeys.editorTextFocus, primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 63 /* KeyCode.F5 */, weight: 100 /* KeybindingWeight.EditorContrib */ }
        });
    }
    run(accessor, editor) {
        const outerEditor = getOuterEditorFromDiffEditor(accessor);
        if (!outerEditor || !outerEditor.hasModel()) {
            return;
        }
        const controller = DirtyDiffController.get(outerEditor);
        if (!controller || !controller.modelRegistry) {
            return;
        }
        const lineNumber = outerEditor.getPosition().lineNumber;
        const model = controller.modelRegistry.getModel(outerEditor.getModel());
        if (!model || model.changes.length === 0) {
            return;
        }
        const index = model.findPreviousClosestChange(lineNumber, false);
        const change = model.changes[index];
        const position = new Position(change.modifiedStartLineNumber, 1);
        outerEditor.setPosition(position);
        outerEditor.revealPositionInCenter(position);
    }
}
registerEditorAction(GotoPreviousChangeAction);
export class GotoNextChangeAction extends EditorAction {
    constructor() {
        super({
            id: 'workbench.action.editor.nextChange',
            label: nls.localize('move to next change', "Go to Next Change"),
            alias: 'Go to Next Change',
            precondition: TextCompareEditorActiveContext.toNegated(),
            kbOpts: { kbExpr: EditorContextKeys.editorTextFocus, primary: 512 /* KeyMod.Alt */ | 63 /* KeyCode.F5 */, weight: 100 /* KeybindingWeight.EditorContrib */ }
        });
    }
    run(accessor, editor) {
        const outerEditor = getOuterEditorFromDiffEditor(accessor);
        if (!outerEditor || !outerEditor.hasModel()) {
            return;
        }
        const controller = DirtyDiffController.get(outerEditor);
        if (!controller || !controller.modelRegistry) {
            return;
        }
        const lineNumber = outerEditor.getPosition().lineNumber;
        const model = controller.modelRegistry.getModel(outerEditor.getModel());
        if (!model || model.changes.length === 0) {
            return;
        }
        const index = model.findNextClosestChange(lineNumber, false);
        const change = model.changes[index];
        const position = new Position(change.modifiedStartLineNumber, 1);
        outerEditor.setPosition(position);
        outerEditor.revealPositionInCenter(position);
    }
}
registerEditorAction(GotoNextChangeAction);
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'closeDirtyDiff',
    weight: 100 /* KeybindingWeight.EditorContrib */ + 50,
    primary: 9 /* KeyCode.Escape */,
    secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */],
    when: ContextKeyExpr.and(isDirtyDiffVisible),
    handler: (accessor) => {
        const outerEditor = getOuterEditorFromDiffEditor(accessor);
        if (!outerEditor) {
            return;
        }
        const controller = DirtyDiffController.get(outerEditor);
        if (!controller) {
            return;
        }
        controller.close();
    }
});
let DirtyDiffController = class DirtyDiffController extends Disposable {
    editor;
    configurationService;
    instantiationService;
    static ID = 'editor.contrib.dirtydiff';
    static get(editor) {
        return editor.getContribution(DirtyDiffController.ID);
    }
    modelRegistry = null;
    model = null;
    widget = null;
    currentIndex = -1;
    isDirtyDiffVisible;
    session = Disposable.None;
    mouseDownInfo = null;
    enabled = false;
    gutterActionDisposables = new DisposableStore();
    stylesheet;
    constructor(editor, contextKeyService, configurationService, instantiationService) {
        super();
        this.editor = editor;
        this.configurationService = configurationService;
        this.instantiationService = instantiationService;
        this.enabled = !contextKeyService.getContextKeyValue('isInDiffEditor');
        this.stylesheet = createStyleSheet();
        this._register(toDisposable(() => this.stylesheet.remove()));
        if (this.enabled) {
            this.isDirtyDiffVisible = isDirtyDiffVisible.bindTo(contextKeyService);
            this._register(editor.onDidChangeModel(() => this.close()));
            const onDidChangeGutterAction = Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorationsGutterAction'));
            this._register(onDidChangeGutterAction(this.onDidChangeGutterAction, this));
            this.onDidChangeGutterAction();
        }
    }
    onDidChangeGutterAction() {
        const gutterAction = this.configurationService.getValue('scm.diffDecorationsGutterAction');
        this.gutterActionDisposables.dispose();
        this.gutterActionDisposables = new DisposableStore();
        if (gutterAction === 'diff') {
            this.gutterActionDisposables.add(this.editor.onMouseDown(e => this.onEditorMouseDown(e)));
            this.gutterActionDisposables.add(this.editor.onMouseUp(e => this.onEditorMouseUp(e)));
            this.stylesheet.textContent = `
				.monaco-editor .dirty-diff-glyph {
					cursor: pointer;
				}

				.monaco-editor .margin-view-overlays .dirty-diff-glyph:hover::before {
					height: 100%;
					width: 6px;
					left: -6px;
				}

				.monaco-editor .margin-view-overlays .dirty-diff-deleted:hover::after {
					bottom: 0;
					border-top-width: 0;
					border-bottom-width: 0;
				}
			`;
        }
        else {
            this.stylesheet.textContent = ``;
        }
    }
    canNavigate() {
        return this.currentIndex === -1 || (!!this.model && this.model.changes.length > 1);
    }
    next(lineNumber) {
        if (!this.assertWidget()) {
            return;
        }
        if (!this.widget || !this.model) {
            return;
        }
        if (this.editor.hasModel() && (typeof lineNumber === 'number' || this.currentIndex === -1)) {
            this.currentIndex = this.model.findNextClosestChange(typeof lineNumber === 'number' ? lineNumber : this.editor.getPosition().lineNumber);
        }
        else {
            this.currentIndex = rot(this.currentIndex + 1, this.model.changes.length);
        }
        this.widget.showChange(this.currentIndex);
    }
    previous(lineNumber) {
        if (!this.assertWidget()) {
            return;
        }
        if (!this.widget || !this.model) {
            return;
        }
        if (this.editor.hasModel() && (typeof lineNumber === 'number' || this.currentIndex === -1)) {
            this.currentIndex = this.model.findPreviousClosestChange(typeof lineNumber === 'number' ? lineNumber : this.editor.getPosition().lineNumber);
        }
        else {
            this.currentIndex = rot(this.currentIndex - 1, this.model.changes.length);
        }
        this.widget.showChange(this.currentIndex);
    }
    close() {
        this.session.dispose();
        this.session = Disposable.None;
    }
    assertWidget() {
        if (!this.enabled) {
            return false;
        }
        if (this.widget) {
            if (!this.model || this.model.changes.length === 0) {
                this.close();
                return false;
            }
            return true;
        }
        if (!this.modelRegistry) {
            return false;
        }
        const editorModel = this.editor.getModel();
        if (!editorModel) {
            return false;
        }
        const model = this.modelRegistry.getModel(editorModel);
        if (!model) {
            return false;
        }
        if (model.changes.length === 0) {
            return false;
        }
        this.currentIndex = -1;
        this.model = model;
        this.widget = this.instantiationService.createInstance(DirtyDiffWidget, this.editor, model);
        this.isDirtyDiffVisible.set(true);
        const disposables = new DisposableStore();
        disposables.add(Event.once(this.widget.onDidClose)(this.close, this));
        Event.chain(model.onDidChange)
            .filter(e => e.diff.length > 0)
            .map(e => e.diff)
            .event(this.onDidModelChange, this, disposables);
        disposables.add(this.widget);
        disposables.add(toDisposable(() => {
            this.model = null;
            this.widget = null;
            this.currentIndex = -1;
            this.isDirtyDiffVisible.set(false);
            this.editor.focus();
        }));
        this.session = disposables;
        return true;
    }
    onDidModelChange(splices) {
        if (!this.model || !this.widget || this.widget.hasFocus()) {
            return;
        }
        for (const splice of splices) {
            if (splice.start <= this.currentIndex) {
                if (this.currentIndex < splice.start + splice.deleteCount) {
                    this.currentIndex = -1;
                    this.next();
                }
                else {
                    this.currentIndex = rot(this.currentIndex + splice.toInsert.length - splice.deleteCount - 1, this.model.changes.length);
                    this.next();
                }
            }
        }
    }
    onEditorMouseDown(e) {
        this.mouseDownInfo = null;
        const range = e.target.range;
        if (!range) {
            return;
        }
        if (!e.event.leftButton) {
            return;
        }
        if (e.target.type !== 4 /* MouseTargetType.GUTTER_LINE_DECORATIONS */) {
            return;
        }
        if (!e.target.element) {
            return;
        }
        if (e.target.element.className.indexOf('dirty-diff-glyph') < 0) {
            return;
        }
        const data = e.target.detail;
        const offsetLeftInGutter = e.target.element.offsetLeft;
        const gutterOffsetX = data.offsetX - offsetLeftInGutter;
        // TODO@joao TODO@alex TODO@martin this is such that we don't collide with folding
        if (gutterOffsetX < -3 || gutterOffsetX > 6) { // dirty diff decoration on hover is 9px wide
            return;
        }
        this.mouseDownInfo = { lineNumber: range.startLineNumber };
    }
    onEditorMouseUp(e) {
        if (!this.mouseDownInfo) {
            return;
        }
        const { lineNumber } = this.mouseDownInfo;
        this.mouseDownInfo = null;
        const range = e.target.range;
        if (!range || range.startLineNumber !== lineNumber) {
            return;
        }
        if (e.target.type !== 4 /* MouseTargetType.GUTTER_LINE_DECORATIONS */) {
            return;
        }
        if (!this.modelRegistry) {
            return;
        }
        const editorModel = this.editor.getModel();
        if (!editorModel) {
            return;
        }
        const model = this.modelRegistry.getModel(editorModel);
        if (!model) {
            return;
        }
        const index = model.changes.findIndex(change => lineIntersectsChange(lineNumber, change));
        if (index < 0) {
            return;
        }
        if (index === this.currentIndex) {
            this.close();
        }
        else {
            this.next(lineNumber);
        }
    }
    getChanges() {
        if (!this.modelRegistry) {
            return [];
        }
        if (!this.editor.hasModel()) {
            return [];
        }
        const model = this.modelRegistry.getModel(this.editor.getModel());
        if (!model) {
            return [];
        }
        return model.changes;
    }
    dispose() {
        this.gutterActionDisposables.dispose();
        super.dispose();
    }
};
DirtyDiffController = __decorate([
    __param(1, IContextKeyService),
    __param(2, IConfigurationService),
    __param(3, IInstantiationService)
], DirtyDiffController);
export { DirtyDiffController };
const editorGutterModifiedBackground = registerColor('editorGutter.modifiedBackground', {
    dark: '#1B81A8',
    light: '#2090D3',
    hcDark: '#1B81A8',
    hcLight: '#2090D3'
}, nls.localize('editorGutterModifiedBackground', "Editor gutter background color for lines that are modified."));
const editorGutterAddedBackground = registerColor('editorGutter.addedBackground', {
    dark: '#487E02',
    light: '#48985D',
    hcDark: '#487E02',
    hcLight: '#48985D'
}, nls.localize('editorGutterAddedBackground', "Editor gutter background color for lines that are added."));
const editorGutterDeletedBackground = registerColor('editorGutter.deletedBackground', {
    dark: editorErrorForeground,
    light: editorErrorForeground,
    hcDark: editorErrorForeground,
    hcLight: editorErrorForeground
}, nls.localize('editorGutterDeletedBackground', "Editor gutter background color for lines that are deleted."));
const minimapGutterModifiedBackground = registerColor('minimapGutter.modifiedBackground', {
    dark: editorGutterModifiedBackground,
    light: editorGutterModifiedBackground,
    hcDark: editorGutterModifiedBackground,
    hcLight: editorGutterModifiedBackground
}, nls.localize('minimapGutterModifiedBackground', "Minimap gutter background color for lines that are modified."));
const minimapGutterAddedBackground = registerColor('minimapGutter.addedBackground', {
    dark: editorGutterAddedBackground,
    light: editorGutterAddedBackground,
    hcDark: editorGutterAddedBackground,
    hcLight: editorGutterAddedBackground
}, nls.localize('minimapGutterAddedBackground', "Minimap gutter background color for lines that are added."));
const minimapGutterDeletedBackground = registerColor('minimapGutter.deletedBackground', {
    dark: editorGutterDeletedBackground,
    light: editorGutterDeletedBackground,
    hcDark: editorGutterDeletedBackground,
    hcLight: editorGutterDeletedBackground
}, nls.localize('minimapGutterDeletedBackground', "Minimap gutter background color for lines that are deleted."));
const overviewRulerModifiedForeground = registerColor('editorOverviewRuler.modifiedForeground', { dark: transparent(editorGutterModifiedBackground, 0.6), light: transparent(editorGutterModifiedBackground, 0.6), hcDark: transparent(editorGutterModifiedBackground, 0.6), hcLight: transparent(editorGutterModifiedBackground, 0.6) }, nls.localize('overviewRulerModifiedForeground', 'Overview ruler marker color for modified content.'));
const overviewRulerAddedForeground = registerColor('editorOverviewRuler.addedForeground', { dark: transparent(editorGutterAddedBackground, 0.6), light: transparent(editorGutterAddedBackground, 0.6), hcDark: transparent(editorGutterAddedBackground, 0.6), hcLight: transparent(editorGutterAddedBackground, 0.6) }, nls.localize('overviewRulerAddedForeground', 'Overview ruler marker color for added content.'));
const overviewRulerDeletedForeground = registerColor('editorOverviewRuler.deletedForeground', { dark: transparent(editorGutterDeletedBackground, 0.6), light: transparent(editorGutterDeletedBackground, 0.6), hcDark: transparent(editorGutterDeletedBackground, 0.6), hcLight: transparent(editorGutterDeletedBackground, 0.6) }, nls.localize('overviewRulerDeletedForeground', 'Overview ruler marker color for deleted content.'));
let DirtyDiffDecorator = class DirtyDiffDecorator extends Disposable {
    model;
    configurationService;
    static createDecoration(className, options) {
        const decorationOptions = {
            description: 'dirty-diff-decoration',
            isWholeLine: options.isWholeLine,
        };
        if (options.gutter) {
            decorationOptions.linesDecorationsClassName = `dirty-diff-glyph ${className}`;
        }
        if (options.overview.active) {
            decorationOptions.overviewRuler = {
                color: themeColorFromId(options.overview.color),
                position: OverviewRulerLane.Left
            };
        }
        if (options.minimap.active) {
            decorationOptions.minimap = {
                color: themeColorFromId(options.minimap.color),
                position: MinimapPosition.Gutter
            };
        }
        return ModelDecorationOptions.createDynamic(decorationOptions);
    }
    addedOptions;
    addedPatternOptions;
    modifiedOptions;
    modifiedPatternOptions;
    deletedOptions;
    decorations = [];
    editorModel;
    constructor(editorModel, model, configurationService) {
        super();
        this.model = model;
        this.configurationService = configurationService;
        this.editorModel = editorModel;
        const decorations = configurationService.getValue('scm.diffDecorations');
        const gutter = decorations === 'all' || decorations === 'gutter';
        const overview = decorations === 'all' || decorations === 'overview';
        const minimap = decorations === 'all' || decorations === 'minimap';
        this.addedOptions = DirtyDiffDecorator.createDecoration('dirty-diff-added', {
            gutter,
            overview: { active: overview, color: overviewRulerAddedForeground },
            minimap: { active: minimap, color: minimapGutterAddedBackground },
            isWholeLine: true
        });
        this.addedPatternOptions = DirtyDiffDecorator.createDecoration('dirty-diff-added-pattern', {
            gutter,
            overview: { active: overview, color: overviewRulerAddedForeground },
            minimap: { active: minimap, color: minimapGutterAddedBackground },
            isWholeLine: true
        });
        this.modifiedOptions = DirtyDiffDecorator.createDecoration('dirty-diff-modified', {
            gutter,
            overview: { active: overview, color: overviewRulerModifiedForeground },
            minimap: { active: minimap, color: minimapGutterModifiedBackground },
            isWholeLine: true
        });
        this.modifiedPatternOptions = DirtyDiffDecorator.createDecoration('dirty-diff-modified-pattern', {
            gutter,
            overview: { active: overview, color: overviewRulerModifiedForeground },
            minimap: { active: minimap, color: minimapGutterModifiedBackground },
            isWholeLine: true
        });
        this.deletedOptions = DirtyDiffDecorator.createDecoration('dirty-diff-deleted', {
            gutter,
            overview: { active: overview, color: overviewRulerDeletedForeground },
            minimap: { active: minimap, color: minimapGutterDeletedBackground },
            isWholeLine: false
        });
        this._register(configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('scm.diffDecorationsGutterPattern')) {
                this.onDidChange();
            }
        }));
        this._register(model.onDidChange(this.onDidChange, this));
    }
    onDidChange() {
        if (!this.editorModel) {
            return;
        }
        const pattern = this.configurationService.getValue('scm.diffDecorationsGutterPattern');
        const decorations = this.model.changes.map((change) => {
            const changeType = getChangeType(change);
            const startLineNumber = change.modifiedStartLineNumber;
            const endLineNumber = change.modifiedEndLineNumber || startLineNumber;
            switch (changeType) {
                case ChangeType.Add:
                    return {
                        range: {
                            startLineNumber: startLineNumber, startColumn: 1,
                            endLineNumber: endLineNumber, endColumn: 1
                        },
                        options: pattern.added ? this.addedPatternOptions : this.addedOptions
                    };
                case ChangeType.Delete:
                    return {
                        range: {
                            startLineNumber: startLineNumber, startColumn: Number.MAX_VALUE,
                            endLineNumber: startLineNumber, endColumn: Number.MAX_VALUE
                        },
                        options: this.deletedOptions
                    };
                case ChangeType.Modify:
                    return {
                        range: {
                            startLineNumber: startLineNumber, startColumn: 1,
                            endLineNumber: endLineNumber, endColumn: 1
                        },
                        options: pattern.modified ? this.modifiedPatternOptions : this.modifiedOptions
                    };
            }
        });
        this.decorations = this.editorModel.deltaDecorations(this.decorations, decorations);
    }
    dispose() {
        super.dispose();
        if (this.editorModel && !this.editorModel.isDisposed()) {
            this.editorModel.deltaDecorations(this.decorations, []);
        }
        this.editorModel = null;
        this.decorations = [];
    }
};
DirtyDiffDecorator = __decorate([
    __param(2, IConfigurationService)
], DirtyDiffDecorator);
function compareChanges(a, b) {
    let result = a.modifiedStartLineNumber - b.modifiedStartLineNumber;
    if (result !== 0) {
        return result;
    }
    result = a.modifiedEndLineNumber - b.modifiedEndLineNumber;
    if (result !== 0) {
        return result;
    }
    result = a.originalStartLineNumber - b.originalStartLineNumber;
    if (result !== 0) {
        return result;
    }
    return a.originalEndLineNumber - b.originalEndLineNumber;
}
export function createProviderComparer(uri) {
    return (a, b) => {
        const aIsParent = isEqualOrParent(uri, a.rootUri);
        const bIsParent = isEqualOrParent(uri, b.rootUri);
        if (aIsParent && bIsParent) {
            return a.rootUri.fsPath.length - b.rootUri.fsPath.length;
        }
        else if (aIsParent) {
            return -1;
        }
        else if (bIsParent) {
            return 1;
        }
        else {
            return 0;
        }
    };
}
export async function getOriginalResource(scmService, uri) {
    const providers = Iterable.map(scmService.repositories, r => r.provider);
    const rootedProviders = Array.from(Iterable.filter(providers, p => !!p.rootUri));
    rootedProviders.sort(createProviderComparer(uri));
    const result = await first(rootedProviders.map(p => () => p.getOriginalResource(uri)));
    if (result) {
        return result;
    }
    const nonRootedProviders = Iterable.filter(providers, p => !p.rootUri);
    return first(Array.from(nonRootedProviders, p => () => p.getOriginalResource(uri)));
}
let DirtyDiffModel = class DirtyDiffModel extends Disposable {
    scmService;
    editorWorkerService;
    configurationService;
    textModelResolverService;
    progressService;
    _originalResource = null;
    _originalModel = null;
    _model;
    get original() { return this._originalModel?.textEditorModel || null; }
    get modified() { return this._model.textEditorModel || null; }
    diffDelayer = new ThrottledDelayer(200);
    _originalURIPromise;
    repositoryDisposables = new Set();
    originalModelDisposables = this._register(new DisposableStore());
    _disposed = false;
    _onDidChange = new Emitter();
    onDidChange = this._onDidChange.event;
    _changes = [];
    get changes() { return this._changes; }
    constructor(textFileModel, scmService, editorWorkerService, configurationService, textModelResolverService, progressService) {
        super();
        this.scmService = scmService;
        this.editorWorkerService = editorWorkerService;
        this.configurationService = configurationService;
        this.textModelResolverService = textModelResolverService;
        this.progressService = progressService;
        this._model = textFileModel;
        this._register(textFileModel.textEditorModel.onDidChangeContent(() => this.triggerDiff()));
        this._register(Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorationsIgnoreTrimWhitespace') || e.affectsConfiguration('diffEditor.ignoreTrimWhitespace'))(this.triggerDiff, this));
        this._register(scmService.onDidAddRepository(this.onDidAddRepository, this));
        for (const r of scmService.repositories) {
            this.onDidAddRepository(r);
        }
        this._register(this._model.onDidChangeEncoding(() => {
            this.diffDelayer.cancel();
            this._originalResource = null;
            this._originalModel = null;
            this._originalURIPromise = undefined;
            this.setChanges([]);
            this.triggerDiff();
        }));
        this.triggerDiff();
    }
    onDidAddRepository(repository) {
        const disposables = new DisposableStore();
        this.repositoryDisposables.add(disposables);
        disposables.add(toDisposable(() => this.repositoryDisposables.delete(disposables)));
        const onDidChange = Event.any(repository.provider.onDidChange, repository.provider.onDidChangeResources);
        disposables.add(onDidChange(this.triggerDiff, this));
        const onDidRemoveThis = Event.filter(this.scmService.onDidRemoveRepository, r => r === repository);
        disposables.add(onDidRemoveThis(() => dispose(disposables), null));
        this.triggerDiff();
    }
    triggerDiff() {
        if (!this.diffDelayer) {
            return Promise.resolve(null);
        }
        return this.diffDelayer
            .trigger(() => this.diff())
            .then((changes) => {
            if (this._disposed || this._model.isDisposed() || !this._originalModel || this._originalModel.isDisposed()) {
                return; // disposed
            }
            if (this._originalModel.textEditorModel.getValueLength() === 0) {
                changes = [];
            }
            if (!changes) {
                changes = [];
            }
            this.setChanges(changes);
        }, (err) => onUnexpectedError(err));
    }
    setChanges(changes) {
        const diff = sortedDiff(this._changes, changes, compareChanges);
        this._changes = changes;
        this._onDidChange.fire({ changes, diff });
    }
    diff() {
        return this.progressService.withProgress({ location: 3 /* ProgressLocation.Scm */, delay: 250 }, async () => {
            return this.getOriginalURIPromise().then(originalURI => {
                if (this._disposed || this._model.isDisposed() || !originalURI) {
                    return Promise.resolve([]); // disposed
                }
                if (!this.editorWorkerService.canComputeDirtyDiff(originalURI, this._model.resource)) {
                    return Promise.resolve([]); // Files too large
                }
                const ignoreTrimWhitespaceSetting = this.configurationService.getValue('scm.diffDecorationsIgnoreTrimWhitespace');
                const ignoreTrimWhitespace = ignoreTrimWhitespaceSetting === 'inherit'
                    ? this.configurationService.getValue('diffEditor.ignoreTrimWhitespace')
                    : ignoreTrimWhitespaceSetting !== 'false';
                return this.editorWorkerService.computeDirtyDiff(originalURI, this._model.resource, ignoreTrimWhitespace);
            });
        });
    }
    getOriginalURIPromise() {
        if (this._originalURIPromise) {
            return this._originalURIPromise;
        }
        this._originalURIPromise = this.getOriginalResource().then(originalUri => {
            if (this._disposed) { // disposed
                return null;
            }
            if (!originalUri) {
                this._originalResource = null;
                this._originalModel = null;
                return null;
            }
            if (this._originalResource?.toString() === originalUri.toString()) {
                return originalUri;
            }
            return this.textModelResolverService.createModelReference(originalUri).then(ref => {
                if (this._disposed) { // disposed
                    ref.dispose();
                    return null;
                }
                this._originalResource = originalUri;
                this._originalModel = ref.object;
                if (isTextFileEditorModel(this._originalModel)) {
                    const encoding = this._model.getEncoding();
                    if (encoding) {
                        this._originalModel.setEncoding(encoding, 1 /* EncodingMode.Decode */);
                    }
                }
                this.originalModelDisposables.clear();
                this.originalModelDisposables.add(ref);
                this.originalModelDisposables.add(ref.object.textEditorModel.onDidChangeContent(() => this.triggerDiff()));
                return originalUri;
            }).catch(error => {
                return null; // possibly invalid reference
            });
        });
        return this._originalURIPromise.finally(() => {
            this._originalURIPromise = undefined;
        });
    }
    async getOriginalResource() {
        if (this._disposed) {
            return Promise.resolve(null);
        }
        const uri = this._model.resource;
        return getOriginalResource(this.scmService, uri);
    }
    findNextClosestChange(lineNumber, inclusive = true) {
        for (let i = 0; i < this.changes.length; i++) {
            const change = this.changes[i];
            if (inclusive) {
                if (getModifiedEndLineNumber(change) >= lineNumber) {
                    return i;
                }
            }
            else {
                if (change.modifiedStartLineNumber > lineNumber) {
                    return i;
                }
            }
        }
        return 0;
    }
    findPreviousClosestChange(lineNumber, inclusive = true) {
        for (let i = this.changes.length - 1; i >= 0; i--) {
            const change = this.changes[i];
            if (inclusive) {
                if (change.modifiedStartLineNumber <= lineNumber) {
                    return i;
                }
            }
            else {
                if (getModifiedEndLineNumber(change) < lineNumber) {
                    return i;
                }
            }
        }
        return this.changes.length - 1;
    }
    dispose() {
        super.dispose();
        this._disposed = true;
        this._originalResource = null;
        this._originalModel = null;
        this.diffDelayer.cancel();
        this.repositoryDisposables.forEach(d => dispose(d));
        this.repositoryDisposables.clear();
    }
};
DirtyDiffModel = __decorate([
    __param(1, ISCMService),
    __param(2, IEditorWorkerService),
    __param(3, IConfigurationService),
    __param(4, ITextModelService),
    __param(5, IProgressService)
], DirtyDiffModel);
export { DirtyDiffModel };
class DirtyDiffItem {
    model;
    decorator;
    constructor(model, decorator) {
        this.model = model;
        this.decorator = decorator;
    }
    dispose() {
        this.decorator.dispose();
        this.model.dispose();
    }
}
let DirtyDiffWorkbenchController = class DirtyDiffWorkbenchController extends Disposable {
    editorService;
    instantiationService;
    configurationService;
    textFileService;
    enabled = false;
    viewState = { width: 3, visibility: 'always' };
    items = new Map();
    transientDisposables = this._register(new DisposableStore());
    stylesheet;
    constructor(editorService, instantiationService, configurationService, textFileService) {
        super();
        this.editorService = editorService;
        this.instantiationService = instantiationService;
        this.configurationService = configurationService;
        this.textFileService = textFileService;
        this.stylesheet = createStyleSheet();
        this._register(toDisposable(() => this.stylesheet.parentElement.removeChild(this.stylesheet)));
        const onDidChangeConfiguration = Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorations'));
        this._register(onDidChangeConfiguration(this.onDidChangeConfiguration, this));
        this.onDidChangeConfiguration();
        const onDidChangeDiffWidthConfiguration = Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorationsGutterWidth'));
        onDidChangeDiffWidthConfiguration(this.onDidChangeDiffWidthConfiguration, this);
        this.onDidChangeDiffWidthConfiguration();
        const onDidChangeDiffVisibilityConfiguration = Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorationsGutterVisibility'));
        onDidChangeDiffVisibilityConfiguration(this.onDidChangeDiffVisibiltiyConfiguration, this);
        this.onDidChangeDiffVisibiltiyConfiguration();
    }
    onDidChangeConfiguration() {
        const enabled = this.configurationService.getValue('scm.diffDecorations') !== 'none';
        if (enabled) {
            this.enable();
        }
        else {
            this.disable();
        }
    }
    onDidChangeDiffWidthConfiguration() {
        let width = this.configurationService.getValue('scm.diffDecorationsGutterWidth');
        if (isNaN(width) || width <= 0 || width > 5) {
            width = 3;
        }
        this.setViewState({ ...this.viewState, width });
    }
    onDidChangeDiffVisibiltiyConfiguration() {
        const visibility = this.configurationService.getValue('scm.diffDecorationsGutterVisibility');
        this.setViewState({ ...this.viewState, visibility });
    }
    setViewState(state) {
        this.viewState = state;
        this.stylesheet.textContent = `
			.monaco-editor .dirty-diff-added,
			.monaco-editor .dirty-diff-modified {
				border-left-width:${state.width}px;
			}
			.monaco-editor .dirty-diff-added-pattern,
			.monaco-editor .dirty-diff-added-pattern:before,
			.monaco-editor .dirty-diff-modified-pattern,
			.monaco-editor .dirty-diff-modified-pattern:before {
				background-size: ${state.width}px ${state.width}px;
			}
			.monaco-editor .dirty-diff-added,
			.monaco-editor .dirty-diff-added-pattern,
			.monaco-editor .dirty-diff-modified,
			.monaco-editor .dirty-diff-modified-pattern,
			.monaco-editor .dirty-diff-deleted {
				opacity: ${state.visibility === 'always' ? 1 : 0};
			}
		`;
    }
    enable() {
        if (this.enabled) {
            this.disable();
        }
        this.transientDisposables.add(this.editorService.onDidVisibleEditorsChange(() => this.onEditorsChanged()));
        this.onEditorsChanged();
        this.enabled = true;
    }
    disable() {
        if (!this.enabled) {
            return;
        }
        this.transientDisposables.clear();
        for (const [, dirtyDiff] of this.items) {
            dirtyDiff.dispose();
        }
        this.items.clear();
        this.enabled = false;
    }
    // HACK: This is the best current way of figuring out whether to draw these decorations
    // or not. Needs context from the editor, to know whether it is a diff editor, in place editor
    // etc.
    onEditorsChanged() {
        const models = this.editorService.visibleTextEditorControls
            // only interested in code editor widgets
            .filter(c => c instanceof CodeEditorWidget)
            // set model registry and map to models
            .map(editor => {
            const codeEditor = editor;
            const controller = DirtyDiffController.get(codeEditor);
            if (controller) {
                controller.modelRegistry = this;
            }
            return codeEditor.getModel();
        })
            // remove nulls and duplicates
            .filter((m, i, a) => !!m && !!m.uri && a.indexOf(m, i + 1) === -1)
            // only want resolved text file service models
            .map(m => this.textFileService.files.get(m.uri))
            .filter(m => m?.isResolved());
        const set = new Set(models);
        const newModels = models.filter(o => !this.items.has(o));
        const oldModels = [...this.items.keys()].filter(m => !set.has(m));
        oldModels.forEach(m => this.onModelInvisible(m));
        newModels.forEach(m => this.onModelVisible(m));
    }
    onModelVisible(textFileModel) {
        const model = this.instantiationService.createInstance(DirtyDiffModel, textFileModel);
        const decorator = new DirtyDiffDecorator(textFileModel.textEditorModel, model, this.configurationService);
        this.items.set(textFileModel, new DirtyDiffItem(model, decorator));
    }
    onModelInvisible(textFileModel) {
        this.items.get(textFileModel).dispose();
        this.items.delete(textFileModel);
    }
    getModel(editorModel) {
        for (const [model, diff] of this.items) {
            if (model.textEditorModel.id === editorModel.id) {
                return diff.model;
            }
        }
        return null;
    }
    dispose() {
        this.disable();
        super.dispose();
    }
};
DirtyDiffWorkbenchController = __decorate([
    __param(0, IEditorService),
    __param(1, IInstantiationService),
    __param(2, IConfigurationService),
    __param(3, ITextFileService)
], DirtyDiffWorkbenchController);
export { DirtyDiffWorkbenchController };
registerEditorContribution(DirtyDiffController.ID, DirtyDiffController);
