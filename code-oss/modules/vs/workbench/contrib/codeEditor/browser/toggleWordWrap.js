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
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { EditorAction, registerEditorAction, registerEditorContribution, registerDiffEditorContribution } from 'vs/editor/browser/editorExtensions';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { MenuId, MenuRegistry } from 'vs/platform/actions/common/actions';
import { ContextKeyExpr, IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import { Codicon } from 'vs/base/common/codicons';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions } from 'vs/workbench/common/contributions';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
const transientWordWrapState = 'transientWordWrapState';
const isWordWrapMinifiedKey = 'isWordWrapMinified';
const isDominatedByLongLinesKey = 'isDominatedByLongLines';
const CAN_TOGGLE_WORD_WRAP = new RawContextKey('canToggleWordWrap', false, true);
const EDITOR_WORD_WRAP = new RawContextKey('editorWordWrap', false, nls.localize('editorWordWrap', 'Whether the editor is currently using word wrapping.'));
/**
 * Store (in memory) the word wrap state for a particular model.
 */
export function writeTransientState(model, state, codeEditorService) {
    codeEditorService.setTransientModelProperty(model, transientWordWrapState, state);
}
/**
 * Read (in memory) the word wrap state for a particular model.
 */
export function readTransientState(model, codeEditorService) {
    return codeEditorService.getTransientModelProperty(model, transientWordWrapState);
}
const TOGGLE_WORD_WRAP_ID = 'editor.action.toggleWordWrap';
class ToggleWordWrapAction extends EditorAction {
    constructor() {
        super({
            id: TOGGLE_WORD_WRAP_ID,
            label: nls.localize('toggle.wordwrap', "View: Toggle Word Wrap"),
            alias: 'View: Toggle Word Wrap',
            precondition: undefined,
            kbOpts: {
                kbExpr: null,
                primary: 512 /* KeyMod.Alt */ | 56 /* KeyCode.KeyZ */,
                weight: 100 /* KeybindingWeight.EditorContrib */
            }
        });
    }
    run(accessor, editor) {
        const codeEditorService = accessor.get(ICodeEditorService);
        if (!canToggleWordWrap(codeEditorService, editor)) {
            return;
        }
        const model = editor.getModel();
        // Read the current state
        const transientState = readTransientState(model, codeEditorService);
        // Compute the new state
        let newState;
        if (transientState) {
            newState = null;
        }
        else {
            const actualWrappingInfo = editor.getOption(134 /* EditorOption.wrappingInfo */);
            const wordWrapOverride = (actualWrappingInfo.wrappingColumn === -1 ? 'on' : 'off');
            newState = { wordWrapOverride };
        }
        // Write the new state
        // (this will cause an event and the controller will apply the state)
        writeTransientState(model, newState, codeEditorService);
        // if we are in a diff editor, update the other editor (if possible)
        const diffEditor = findDiffEditorContainingCodeEditor(editor, codeEditorService);
        if (diffEditor) {
            const originalEditor = diffEditor.getOriginalEditor();
            const modifiedEditor = diffEditor.getModifiedEditor();
            const otherEditor = (originalEditor === editor ? modifiedEditor : originalEditor);
            if (canToggleWordWrap(codeEditorService, otherEditor)) {
                writeTransientState(otherEditor.getModel(), newState, codeEditorService);
                diffEditor.updateOptions({});
            }
        }
    }
}
/**
 * If `editor` is the original or modified editor of a diff editor, it returns it.
 * It returns null otherwise.
 */
function findDiffEditorContainingCodeEditor(editor, codeEditorService) {
    if (!editor.getOption(55 /* EditorOption.inDiffEditor */)) {
        return null;
    }
    for (const diffEditor of codeEditorService.listDiffEditors()) {
        const originalEditor = diffEditor.getOriginalEditor();
        const modifiedEditor = diffEditor.getModifiedEditor();
        if (originalEditor === editor || modifiedEditor === editor) {
            return diffEditor;
        }
    }
    return null;
}
let ToggleWordWrapController = class ToggleWordWrapController extends Disposable {
    _editor;
    _contextKeyService;
    _codeEditorService;
    static ID = 'editor.contrib.toggleWordWrapController';
    constructor(_editor, _contextKeyService, _codeEditorService) {
        super();
        this._editor = _editor;
        this._contextKeyService = _contextKeyService;
        this._codeEditorService = _codeEditorService;
        const options = this._editor.getOptions();
        const wrappingInfo = options.get(134 /* EditorOption.wrappingInfo */);
        const isWordWrapMinified = this._contextKeyService.createKey(isWordWrapMinifiedKey, wrappingInfo.isWordWrapMinified);
        const isDominatedByLongLines = this._contextKeyService.createKey(isDominatedByLongLinesKey, wrappingInfo.isDominatedByLongLines);
        let currentlyApplyingEditorConfig = false;
        this._register(_editor.onDidChangeConfiguration((e) => {
            if (!e.hasChanged(134 /* EditorOption.wrappingInfo */)) {
                return;
            }
            const options = this._editor.getOptions();
            const wrappingInfo = options.get(134 /* EditorOption.wrappingInfo */);
            isWordWrapMinified.set(wrappingInfo.isWordWrapMinified);
            isDominatedByLongLines.set(wrappingInfo.isDominatedByLongLines);
            if (!currentlyApplyingEditorConfig) {
                // I am not the cause of the word wrap getting changed
                ensureWordWrapSettings();
            }
        }));
        this._register(_editor.onDidChangeModel((e) => {
            ensureWordWrapSettings();
        }));
        this._register(_codeEditorService.onDidChangeTransientModelProperty(() => {
            ensureWordWrapSettings();
        }));
        const ensureWordWrapSettings = () => {
            if (!canToggleWordWrap(this._codeEditorService, this._editor)) {
                return;
            }
            const transientState = readTransientState(this._editor.getModel(), this._codeEditorService);
            // Apply the state
            try {
                currentlyApplyingEditorConfig = true;
                this._applyWordWrapState(transientState);
            }
            finally {
                currentlyApplyingEditorConfig = false;
            }
        };
    }
    _applyWordWrapState(state) {
        const wordWrapOverride2 = state ? state.wordWrapOverride : 'inherit';
        this._editor.updateOptions({
            wordWrapOverride2: wordWrapOverride2
        });
    }
};
ToggleWordWrapController = __decorate([
    __param(1, IContextKeyService),
    __param(2, ICodeEditorService)
], ToggleWordWrapController);
let DiffToggleWordWrapController = class DiffToggleWordWrapController extends Disposable {
    _diffEditor;
    _codeEditorService;
    static ID = 'diffeditor.contrib.toggleWordWrapController';
    constructor(_diffEditor, _codeEditorService) {
        super();
        this._diffEditor = _diffEditor;
        this._codeEditorService = _codeEditorService;
        this._register(this._diffEditor.onDidChangeModel(() => {
            this._ensureSyncedWordWrapToggle();
        }));
    }
    _ensureSyncedWordWrapToggle() {
        const originalEditor = this._diffEditor.getOriginalEditor();
        const modifiedEditor = this._diffEditor.getModifiedEditor();
        if (!originalEditor.hasModel() || !modifiedEditor.hasModel()) {
            return;
        }
        const originalTransientState = readTransientState(originalEditor.getModel(), this._codeEditorService);
        const modifiedTransientState = readTransientState(modifiedEditor.getModel(), this._codeEditorService);
        if (originalTransientState && !modifiedTransientState && canToggleWordWrap(this._codeEditorService, originalEditor)) {
            writeTransientState(modifiedEditor.getModel(), originalTransientState, this._codeEditorService);
            this._diffEditor.updateOptions({});
        }
        if (!originalTransientState && modifiedTransientState && canToggleWordWrap(this._codeEditorService, modifiedEditor)) {
            writeTransientState(originalEditor.getModel(), modifiedTransientState, this._codeEditorService);
            this._diffEditor.updateOptions({});
        }
    }
};
DiffToggleWordWrapController = __decorate([
    __param(1, ICodeEditorService)
], DiffToggleWordWrapController);
function canToggleWordWrap(codeEditorService, editor) {
    if (!editor) {
        return false;
    }
    if (editor.isSimpleWidget) {
        // in a simple widget...
        return false;
    }
    // Ensure correct word wrap settings
    const model = editor.getModel();
    if (!model) {
        return false;
    }
    if (model.uri.scheme === 'output') {
        // in output editor
        return false;
    }
    if (editor.getOption(55 /* EditorOption.inDiffEditor */)) {
        // this editor belongs to a diff editor
        for (const diffEditor of codeEditorService.listDiffEditors()) {
            if (diffEditor.getOriginalEditor() === editor && !diffEditor.renderSideBySide) {
                // this editor is the left side of an inline diff editor
                return false;
            }
        }
    }
    return true;
}
let EditorWordWrapContextKeyTracker = class EditorWordWrapContextKeyTracker {
    _editorService;
    _codeEditorService;
    _contextService;
    _canToggleWordWrap;
    _editorWordWrap;
    _activeEditor;
    _activeEditorListener;
    constructor(_editorService, _codeEditorService, _contextService) {
        this._editorService = _editorService;
        this._codeEditorService = _codeEditorService;
        this._contextService = _contextService;
        window.addEventListener('focus', () => this._update(), true);
        window.addEventListener('blur', () => this._update(), true);
        this._editorService.onDidActiveEditorChange(() => this._update());
        this._canToggleWordWrap = CAN_TOGGLE_WORD_WRAP.bindTo(this._contextService);
        this._editorWordWrap = EDITOR_WORD_WRAP.bindTo(this._contextService);
        this._activeEditor = null;
        this._activeEditorListener = new DisposableStore();
        this._update();
    }
    _update() {
        const activeEditor = this._codeEditorService.getFocusedCodeEditor() || this._codeEditorService.getActiveCodeEditor();
        if (this._activeEditor === activeEditor) {
            // no change
            return;
        }
        this._activeEditorListener.clear();
        this._activeEditor = activeEditor;
        if (activeEditor) {
            this._activeEditorListener.add(activeEditor.onDidChangeModel(() => this._updateFromCodeEditor()));
            this._activeEditorListener.add(activeEditor.onDidChangeConfiguration((e) => {
                if (e.hasChanged(134 /* EditorOption.wrappingInfo */)) {
                    this._updateFromCodeEditor();
                }
            }));
            this._updateFromCodeEditor();
        }
    }
    _updateFromCodeEditor() {
        if (!canToggleWordWrap(this._codeEditorService, this._activeEditor)) {
            return this._setValues(false, false);
        }
        else {
            const wrappingInfo = this._activeEditor.getOption(134 /* EditorOption.wrappingInfo */);
            this._setValues(true, wrappingInfo.wrappingColumn !== -1);
        }
    }
    _setValues(canToggleWordWrap, isWordWrap) {
        this._canToggleWordWrap.set(canToggleWordWrap);
        this._editorWordWrap.set(isWordWrap);
    }
};
EditorWordWrapContextKeyTracker = __decorate([
    __param(0, IEditorService),
    __param(1, ICodeEditorService),
    __param(2, IContextKeyService)
], EditorWordWrapContextKeyTracker);
const workbenchRegistry = Registry.as(Extensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(EditorWordWrapContextKeyTracker, 2 /* LifecyclePhase.Ready */);
registerEditorContribution(ToggleWordWrapController.ID, ToggleWordWrapController);
registerDiffEditorContribution(DiffToggleWordWrapController.ID, DiffToggleWordWrapController);
registerEditorAction(ToggleWordWrapAction);
MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
    command: {
        id: TOGGLE_WORD_WRAP_ID,
        title: nls.localize('unwrapMinified', "Disable wrapping for this file"),
        icon: Codicon.wordWrap
    },
    group: 'navigation',
    order: 1,
    when: ContextKeyExpr.and(ContextKeyExpr.has(isDominatedByLongLinesKey), ContextKeyExpr.has(isWordWrapMinifiedKey))
});
MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
    command: {
        id: TOGGLE_WORD_WRAP_ID,
        title: nls.localize('wrapMinified', "Enable wrapping for this file"),
        icon: Codicon.wordWrap
    },
    group: 'navigation',
    order: 1,
    when: ContextKeyExpr.and(EditorContextKeys.inDiffEditor.negate(), ContextKeyExpr.has(isDominatedByLongLinesKey), ContextKeyExpr.not(isWordWrapMinifiedKey))
});
// View menu
MenuRegistry.appendMenuItem(MenuId.MenubarViewMenu, {
    command: {
        id: TOGGLE_WORD_WRAP_ID,
        title: nls.localize({ key: 'miToggleWordWrap', comment: ['&& denotes a mnemonic'] }, "&&Word Wrap"),
        toggled: EDITOR_WORD_WRAP,
        precondition: CAN_TOGGLE_WORD_WRAP
    },
    order: 1,
    group: '5_editor'
});
