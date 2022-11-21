/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { timeout } from 'vs/base/common/async';
import { Disposable } from 'vs/base/common/lifecycle';
import { CoreEditingCommands, CoreNavigationCommands } from 'vs/editor/browser/coreCommands';
export class MockInlineCompletionsProvider {
    returnValue = [];
    delayMs = 0;
    callHistory = new Array();
    calledTwiceIn50Ms = false;
    setReturnValue(value, delayMs = 0) {
        this.returnValue = value ? [value] : [];
        this.delayMs = delayMs;
    }
    setReturnValues(values, delayMs = 0) {
        this.returnValue = values;
        this.delayMs = delayMs;
    }
    getAndClearCallHistory() {
        const history = [...this.callHistory];
        this.callHistory = [];
        return history;
    }
    assertNotCalledTwiceWithin50ms() {
        if (this.calledTwiceIn50Ms) {
            throw new Error('provideInlineCompletions has been called at least twice within 50ms. This should not happen.');
        }
    }
    lastTimeMs = undefined;
    async provideInlineCompletions(model, position, context, token) {
        const currentTimeMs = new Date().getTime();
        if (this.lastTimeMs && currentTimeMs - this.lastTimeMs < 50) {
            this.calledTwiceIn50Ms = true;
        }
        this.lastTimeMs = currentTimeMs;
        this.callHistory.push({
            position: position.toString(),
            triggerKind: context.triggerKind,
            text: model.getValue()
        });
        const result = new Array();
        result.push(...this.returnValue);
        if (this.delayMs > 0) {
            await timeout(this.delayMs);
        }
        return { items: result };
    }
    freeInlineCompletions() { }
    handleItemDidShow() { }
}
export class GhostTextContext extends Disposable {
    model;
    editor;
    prettyViewStates = new Array();
    _currentPrettyViewState;
    get currentPrettyViewState() {
        return this._currentPrettyViewState;
    }
    constructor(model, editor) {
        super();
        this.model = model;
        this.editor = editor;
        this._register(model.onDidChange(() => {
            this.update();
        }));
        this.update();
    }
    update() {
        const ghostText = this.model?.ghostText;
        let view;
        if (ghostText) {
            view = ghostText.render(this.editor.getValue(), true);
        }
        else {
            view = this.editor.getValue();
        }
        if (this._currentPrettyViewState !== view) {
            this.prettyViewStates.push(view);
        }
        this._currentPrettyViewState = view;
    }
    getAndClearViewStates() {
        const arr = [...this.prettyViewStates];
        this.prettyViewStates.length = 0;
        return arr;
    }
    keyboardType(text) {
        this.editor.trigger('keyboard', 'type', { text });
    }
    cursorUp() {
        CoreNavigationCommands.CursorUp.runEditorCommand(null, this.editor, null);
    }
    cursorRight() {
        CoreNavigationCommands.CursorRight.runEditorCommand(null, this.editor, null);
    }
    cursorLeft() {
        CoreNavigationCommands.CursorLeft.runEditorCommand(null, this.editor, null);
    }
    cursorDown() {
        CoreNavigationCommands.CursorDown.runEditorCommand(null, this.editor, null);
    }
    cursorLineEnd() {
        CoreNavigationCommands.CursorLineEnd.runEditorCommand(null, this.editor, null);
    }
    leftDelete() {
        CoreEditingCommands.DeleteLeft.runEditorCommand(null, this.editor, null);
    }
}
