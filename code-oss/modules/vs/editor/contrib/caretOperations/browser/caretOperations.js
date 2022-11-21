/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { EditorAction, registerEditorAction } from 'vs/editor/browser/editorExtensions';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import { MoveCaretCommand } from 'vs/editor/contrib/caretOperations/browser/moveCaretCommand';
import * as nls from 'vs/nls';
class MoveCaretAction extends EditorAction {
    left;
    constructor(left, opts) {
        super(opts);
        this.left = left;
    }
    run(accessor, editor) {
        if (!editor.hasModel()) {
            return;
        }
        const commands = [];
        const selections = editor.getSelections();
        for (const selection of selections) {
            commands.push(new MoveCaretCommand(selection, this.left));
        }
        editor.pushUndoStop();
        editor.executeCommands(this.id, commands);
        editor.pushUndoStop();
    }
}
class MoveCaretLeftAction extends MoveCaretAction {
    constructor() {
        super(true, {
            id: 'editor.action.moveCarretLeftAction',
            label: nls.localize('caret.moveLeft', "Move Selected Text Left"),
            alias: 'Move Selected Text Left',
            precondition: EditorContextKeys.writable
        });
    }
}
class MoveCaretRightAction extends MoveCaretAction {
    constructor() {
        super(false, {
            id: 'editor.action.moveCarretRightAction',
            label: nls.localize('caret.moveRight', "Move Selected Text Right"),
            alias: 'Move Selected Text Right',
            precondition: EditorContextKeys.writable
        });
    }
}
registerEditorAction(MoveCaretLeftAction);
registerEditorAction(MoveCaretRightAction);
