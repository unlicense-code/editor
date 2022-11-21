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
import { alert } from 'vs/base/browser/ui/aria/aria';
import { MarkdownString } from 'vs/base/common/htmlContent';
import { KeyChord } from 'vs/base/common/keyCodes';
import 'vs/css!./anchorSelect';
import { EditorAction, registerEditorAction, registerEditorContribution } from 'vs/editor/browser/editorExtensions';
import { Selection } from 'vs/editor/common/core/selection';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import { localize } from 'vs/nls';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
export const SelectionAnchorSet = new RawContextKey('selectionAnchorSet', false);
let SelectionAnchorController = class SelectionAnchorController {
    editor;
    static ID = 'editor.contrib.selectionAnchorController';
    static get(editor) {
        return editor.getContribution(SelectionAnchorController.ID);
    }
    decorationId;
    selectionAnchorSetContextKey;
    modelChangeListener;
    constructor(editor, contextKeyService) {
        this.editor = editor;
        this.selectionAnchorSetContextKey = SelectionAnchorSet.bindTo(contextKeyService);
        this.modelChangeListener = editor.onDidChangeModel(() => this.selectionAnchorSetContextKey.reset());
    }
    setSelectionAnchor() {
        if (this.editor.hasModel()) {
            const position = this.editor.getPosition();
            this.editor.changeDecorations((accessor) => {
                if (this.decorationId) {
                    accessor.removeDecoration(this.decorationId);
                }
                this.decorationId = accessor.addDecoration(Selection.fromPositions(position, position), {
                    description: 'selection-anchor',
                    stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
                    hoverMessage: new MarkdownString().appendText(localize('selectionAnchor', "Selection Anchor")),
                    className: 'selection-anchor'
                });
            });
            this.selectionAnchorSetContextKey.set(!!this.decorationId);
            alert(localize('anchorSet', "Anchor set at {0}:{1}", position.lineNumber, position.column));
        }
    }
    goToSelectionAnchor() {
        if (this.editor.hasModel() && this.decorationId) {
            const anchorPosition = this.editor.getModel().getDecorationRange(this.decorationId);
            if (anchorPosition) {
                this.editor.setPosition(anchorPosition.getStartPosition());
            }
        }
    }
    selectFromAnchorToCursor() {
        if (this.editor.hasModel() && this.decorationId) {
            const start = this.editor.getModel().getDecorationRange(this.decorationId);
            if (start) {
                const end = this.editor.getPosition();
                this.editor.setSelection(Selection.fromPositions(start.getStartPosition(), end));
                this.cancelSelectionAnchor();
            }
        }
    }
    cancelSelectionAnchor() {
        if (this.decorationId) {
            const decorationId = this.decorationId;
            this.editor.changeDecorations((accessor) => {
                accessor.removeDecoration(decorationId);
                this.decorationId = undefined;
            });
            this.selectionAnchorSetContextKey.set(false);
        }
    }
    dispose() {
        this.cancelSelectionAnchor();
        this.modelChangeListener.dispose();
    }
};
SelectionAnchorController = __decorate([
    __param(1, IContextKeyService)
], SelectionAnchorController);
class SetSelectionAnchor extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.setSelectionAnchor',
            label: localize('setSelectionAnchor', "Set Selection Anchor"),
            alias: 'Set Selection Anchor',
            precondition: undefined,
            kbOpts: {
                kbExpr: EditorContextKeys.editorTextFocus,
                primary: KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */),
                weight: 100 /* KeybindingWeight.EditorContrib */
            }
        });
    }
    async run(_accessor, editor) {
        SelectionAnchorController.get(editor)?.setSelectionAnchor();
    }
}
class GoToSelectionAnchor extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.goToSelectionAnchor',
            label: localize('goToSelectionAnchor', "Go to Selection Anchor"),
            alias: 'Go to Selection Anchor',
            precondition: SelectionAnchorSet,
        });
    }
    async run(_accessor, editor) {
        SelectionAnchorController.get(editor)?.goToSelectionAnchor();
    }
}
class SelectFromAnchorToCursor extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.selectFromAnchorToCursor',
            label: localize('selectFromAnchorToCursor', "Select from Anchor to Cursor"),
            alias: 'Select from Anchor to Cursor',
            precondition: SelectionAnchorSet,
            kbOpts: {
                kbExpr: EditorContextKeys.editorTextFocus,
                primary: KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */),
                weight: 100 /* KeybindingWeight.EditorContrib */
            }
        });
    }
    async run(_accessor, editor) {
        SelectionAnchorController.get(editor)?.selectFromAnchorToCursor();
    }
}
class CancelSelectionAnchor extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.cancelSelectionAnchor',
            label: localize('cancelSelectionAnchor', "Cancel Selection Anchor"),
            alias: 'Cancel Selection Anchor',
            precondition: SelectionAnchorSet,
            kbOpts: {
                kbExpr: EditorContextKeys.editorTextFocus,
                primary: 9 /* KeyCode.Escape */,
                weight: 100 /* KeybindingWeight.EditorContrib */
            }
        });
    }
    async run(_accessor, editor) {
        SelectionAnchorController.get(editor)?.cancelSelectionAnchor();
    }
}
registerEditorContribution(SelectionAnchorController.ID, SelectionAnchorController);
registerEditorAction(SetSelectionAnchor);
registerEditorAction(GoToSelectionAnchor);
registerEditorAction(SelectFromAnchorToCursor);
registerEditorAction(CancelSelectionAnchor);
